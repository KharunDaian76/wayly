import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { KycVerification, User } from '@prisma/client';
import { KycStatus as PrismaKycStatus } from '@prisma/client';
import type { KycVerificationSummary } from '@wayly/types';
import { KycStatus } from '@wayly/types';
import type { KycStartInput } from '@wayly/validation';

import { AppConfigService } from '../../config/config.service';
import { PrismaService } from '../../infra/prisma/prisma.service';

import { toKycVerificationSummary } from './kyc.mapper';

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
