import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import {
  KycStatus as PrismaKycStatus,
  UserAccountStatus as PrismaUserAccountStatus,
  UserRole as PrismaUserRole,
} from '@prisma/client';
import type { AdminUserListResponse, AdminUserQueueItem } from '@wayly/types';
import { AdminAuditLogAction, AdminAuditLogTargetType, UserAccountStatus } from '@wayly/types';
import type {
  AdminUserSuspendInput,
  AdminUsersListQueryInput,
  AdminUserUnsuspendInput,
  UpdateProfileInput,
} from '@wayly/validation';

import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';
import type { AdminAuditRequestContext } from '../admin-audit/admin-audit.service';
import { AdminAuditLogService } from '../admin-audit/admin-audit.service';

import { toAdminUserQueueItem } from './user.mapper';

const ADMIN_USER_QUEUE_SELECT = {
  id: true,
  email: true,
  displayName: true,
  roles: true,
  kycStatus: true,
  verified: true,
  accountStatus: true,
  suspendedAt: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      sentDeliveryOrders: true,
      acceptedDeliveryOrders: true,
      disputesOpened: true,
    },
  },
} as const;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly adminAuditLog: AdminAuditLogService,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    displayName: string;
    locale?: string;
    country?: string;
  }): Promise<User> {
    const email = data.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
        locale: data.locale ?? 'en',
        country: data.country,
      },
    });
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const phoneChanged = input.phone !== undefined && input.phone !== user.phone;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...input,
        ...(phoneChanged ? { phoneVerified: false } : {}),
      },
    });
  }

  async listForOperations(query: AdminUsersListQueryInput): Promise<AdminUserListResponse> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.role ? { roles: { has: query.role as PrismaUserRole } } : {}),
      ...(query.kycStatus ? { kycStatus: query.kycStatus as PrismaKycStatus } : {}),
      ...(query.accountStatus
        ? { accountStatus: query.accountStatus as PrismaUserAccountStatus }
        : {}),
    };

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { displayName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        select: ADMIN_USER_QUEUE_SELECT,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: records.map(toAdminUserQueueItem),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async suspendForOperations(
    actor: RequestUser,
    userId: string,
    body: AdminUserSuspendInput,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminUserQueueItem> {
    const target = await this.findModerationTarget(userId);
    this.assertModerationTargetAllowed(actor, target);

    if (target.accountStatus === PrismaUserAccountStatus.SUSPENDED) {
      throw new ConflictException('User is already suspended');
    }

    const now = new Date();
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: PrismaUserAccountStatus.SUSPENDED,
        suspendedAt: now,
        suspensionReason: body.reason,
      },
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.USER_SUSPENDED,
      targetType: AdminAuditLogTargetType.USER,
      targetId: target.id,
      targetUserId: target.id,
      summary: `Suspended user ${target.displayName} (${target.email})`,
      metadata: {
        previousAccountStatus: UserAccountStatus.ACTIVE,
        newAccountStatus: UserAccountStatus.SUSPENDED,
        reasonLength: body.reason.length,
      },
      requestContext,
    });

    return this.getAdminQueueItem(userId);
  }

  async unsuspendForOperations(
    actor: RequestUser,
    userId: string,
    body: AdminUserUnsuspendInput | undefined,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminUserQueueItem> {
    const target = await this.findModerationTarget(userId);

    if (target.accountStatus !== PrismaUserAccountStatus.SUSPENDED) {
      throw new ConflictException('User is not suspended');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: PrismaUserAccountStatus.ACTIVE,
        suspendedAt: null,
        suspensionReason: null,
      },
    });

    const note = body?.note?.trim();
    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.USER_UNSUSPENDED,
      targetType: AdminAuditLogTargetType.USER,
      targetId: target.id,
      targetUserId: target.id,
      summary: `Unsuspended user ${target.displayName} (${target.email})`,
      metadata: {
        previousAccountStatus: UserAccountStatus.SUSPENDED,
        newAccountStatus: UserAccountStatus.ACTIVE,
        ...(note ? { noteLength: note.length } : {}),
      },
      requestContext,
    });

    return this.getAdminQueueItem(userId);
  }

  /** Marks a GDPR deletion request (endpoint deferred to a later milestone). */
  async requestGdprDeletion(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { gdprDeletionRequestedAt: new Date() },
    });
  }

  private async findModerationTarget(userId: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private assertModerationTargetAllowed(actor: RequestUser, target: User): void {
    if (actor.id === target.id) {
      throw new ForbiddenException('You cannot moderate your own account');
    }
    if (
      target.roles.includes(PrismaUserRole.ADMIN) ||
      target.roles.includes(PrismaUserRole.ARBITRATOR)
    ) {
      throw new ForbiddenException('Admin and arbitrator accounts cannot be moderated');
    }
  }

  private async getAdminQueueItem(userId: string): Promise<AdminUserQueueItem> {
    const record = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: ADMIN_USER_QUEUE_SELECT,
    });
    if (!record) {
      throw new NotFoundException('User not found');
    }
    return toAdminUserQueueItem(record);
  }
}
