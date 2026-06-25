import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { KycVerification, Prisma, User } from '@prisma/client';
import { KycStatus as PrismaKycStatus } from '@prisma/client';
import type { AdminKycListResponse, AdminKycQueueItem, KycVerificationSummary } from '@wayly/types';
import { AdminAuditLogAction, AdminAuditLogTargetType, KycStatus } from '@wayly/types';
import type { KycStartInput, KycVerificationsListQueryInput } from '@wayly/validation';

import type { RequestUser } from '../../common/types/request-user.type';
import { AppConfigService } from '../../config/config.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import {
  AdminAuditLogService,
  type AdminAuditRequestContext,
} from '../admin-audit/admin-audit.service';

import { toAdminKycQueueItem, toKycVerificationSummary } from './kyc.mapper';

/** Full KYC status payload returned by GET /kyc/status and mock routes. */
export interface KycStatusView {
  verified: boolean;
  kycStatus: KycStatus;
  latestVerification: KycVerificationSummary | null;
  canCreateOrder: boolean;
  canBrowseOrders: boolean;
  canAcceptOrder: boolean;
  canChat: boolean;
  canContact: boolean;
  canReceivePayout: boolean;
}

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
    private readonly adminAuditLog: AdminAuditLogService,
  ) {}

  async getStatus(userId: string): Promise<KycStatusView> {
    const user = await this.requireUser(userId);
    const latest = await this.findLatestVerification(userId);
    return this.buildStatusView(user, latest);
  }

  async start(userId: string, input: KycStartInput): Promise<KycVerificationSummary> {
    await this.requireUser(userId);

    const pending = await this.findActivePendingVerification(userId);
    if (pending) {
      return toKycVerificationSummary(pending);
    }

    const now = new Date();
    const verification = await this.prisma.$transaction(async (tx) => {
      const created = await tx.kycVerification.create({
        data: {
          userId,
          status: PrismaKycStatus.PENDING,
          provider: 'mock',
          country: input.country,
          levelName: input.levelName,
          submittedAt: now,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          kycStatus: PrismaKycStatus.PENDING,
          verified: false,
        },
      });

      return created;
    });

    return toKycVerificationSummary(verification);
  }

  async mockApprove(userId: string): Promise<KycStatusView> {
    this.assertMockRoutesAllowed();

    const pending = await this.findActivePendingVerification(userId);
    if (!pending) {
      throw new BadRequestException('No pending KYC verification to approve');
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.kycVerification.update({
        where: { id: pending.id },
        data: {
          status: PrismaKycStatus.APPROVED,
          reviewedAt: now,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          kycStatus: PrismaKycStatus.APPROVED,
          verified: true,
        },
      });
    });

    return this.getStatus(userId);
  }

  async mockReject(userId: string, rejectionReason?: string): Promise<KycStatusView> {
    this.assertMockRoutesAllowed();

    const pending = await this.findActivePendingVerification(userId);
    if (!pending) {
      throw new BadRequestException('No pending KYC verification to reject');
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      await tx.kycVerification.update({
        where: { id: pending.id },
        data: {
          status: PrismaKycStatus.REJECTED,
          reviewedAt: now,
          rejectionReason: rejectionReason ?? 'Rejected by mock flow',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          kycStatus: PrismaKycStatus.REJECTED,
          verified: false,
        },
      });
    });

    return this.getStatus(userId);
  }

  async listForOperations(query: KycVerificationsListQueryInput): Promise<AdminKycListResponse> {
    const where: Prisma.KycVerificationWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.country
        ? { country: { equals: query.country, mode: 'insensitive' as const } }
        : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.kycVerification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        include: {
          user: {
            select: { displayName: true, email: true },
          },
        },
      }),
      this.prisma.kycVerification.count({ where }),
    ]);

    return {
      items: records.map(toAdminKycQueueItem),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async approveForOperations(
    actor: RequestUser,
    verificationId: string,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminKycQueueItem> {
    const record = await this.findVerificationForOperations(verificationId);
    const previousStatus = record.status;
    if (record.status === PrismaKycStatus.APPROVED) {
      throw new BadRequestException('KYC verification is already approved');
    }
    if (record.status !== PrismaKycStatus.PENDING && record.status !== PrismaKycStatus.REJECTED) {
      throw new BadRequestException('KYC verification cannot be approved');
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const verification = await tx.kycVerification.update({
        where: { id: verificationId },
        data: {
          status: PrismaKycStatus.APPROVED,
          reviewedAt: now,
          rejectionReason: null,
        },
        include: {
          user: { select: { displayName: true, email: true } },
        },
      });

      await tx.user.update({
        where: { id: record.userId },
        data: {
          kycStatus: PrismaKycStatus.APPROVED,
          verified: true,
        },
      });

      return verification;
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.KYC_APPROVED,
      targetType: AdminAuditLogTargetType.KYC_VERIFICATION,
      targetId: updated.id,
      targetUserId: updated.userId,
      summary: `Approved KYC verification for ${updated.user.displayName} (${updated.user.email})`,
      metadata: {
        previousStatus,
        newStatus: PrismaKycStatus.APPROVED,
        verificationId: updated.id,
        ...(updated.country ? { country: updated.country } : {}),
      },
      requestContext,
    });

    return toAdminKycQueueItem(updated);
  }

  async rejectForOperations(
    actor: RequestUser,
    verificationId: string,
    rejectionReason: string,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminKycQueueItem> {
    const record = await this.findVerificationForOperations(verificationId);
    const previousStatus = record.status;
    if (record.status === PrismaKycStatus.APPROVED) {
      throw new BadRequestException('Approved KYC verifications cannot be rejected');
    }
    if (record.status !== PrismaKycStatus.PENDING && record.status !== PrismaKycStatus.REJECTED) {
      throw new BadRequestException('KYC verification cannot be rejected');
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const verification = await tx.kycVerification.update({
        where: { id: verificationId },
        data: {
          status: PrismaKycStatus.REJECTED,
          reviewedAt: now,
          rejectionReason,
        },
        include: {
          user: { select: { displayName: true, email: true } },
        },
      });

      await tx.user.update({
        where: { id: record.userId },
        data: {
          kycStatus: PrismaKycStatus.REJECTED,
          verified: false,
        },
      });

      return verification;
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.KYC_REJECTED,
      targetType: AdminAuditLogTargetType.KYC_VERIFICATION,
      targetId: updated.id,
      targetUserId: updated.userId,
      summary: `Rejected KYC verification for ${updated.user.displayName} (${updated.user.email})`,
      metadata: {
        previousStatus,
        newStatus: PrismaKycStatus.REJECTED,
        verificationId: updated.id,
        rejectionReasonLength: rejectionReason.trim().length,
        ...(updated.country ? { country: updated.country } : {}),
      },
      requestContext,
    });

    return toAdminKycQueueItem(updated);
  }

  private async findVerificationForOperations(verificationId: string) {
    const record = await this.prisma.kycVerification.findUnique({
      where: { id: verificationId },
      include: {
        user: { select: { displayName: true, email: true, deletedAt: true } },
      },
    });
    if (!record || record.user.deletedAt) {
      throw new NotFoundException('KYC verification not found');
    }
    return record;
  }

  private assertMockRoutesAllowed(): void {
    if (this.config.isProduction) {
      throw new NotFoundException();
    }
  }

  private async requireUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async findLatestVerification(userId: string): Promise<KycVerification | null> {
    return this.prisma.kycVerification.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async findActivePendingVerification(userId: string): Promise<KycVerification | null> {
    return this.prisma.kycVerification.findFirst({
      where: { userId, status: PrismaKycStatus.PENDING },
      orderBy: { createdAt: 'desc' },
    });
  }

  private buildStatusView(user: User, latest: KycVerification | null): KycStatusView {
    const kycStatus = user.kycStatus as KycStatus;
    const canAccess = user.verified && kycStatus === KycStatus.APPROVED;

    return {
      verified: user.verified,
      kycStatus,
      latestVerification: latest ? toKycVerificationSummary(latest) : null,
      canCreateOrder: canAccess,
      canBrowseOrders: canAccess,
      canAcceptOrder: canAccess,
      canChat: canAccess,
      canContact: canAccess,
      canReceivePayout: canAccess,
    };
  }
}
