import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import {
  AdminAuditLogAction as PrismaAdminAuditLogAction,
  AdminAuditLogStatus as PrismaAdminAuditLogStatus,
  AdminAuditLogTargetType as PrismaAdminAuditLogTargetType,
  UserRole as PrismaUserRole,
} from '@prisma/client';
import type { AdminAuditLogListResponse } from '@wayly/types';
import { AdminAuditLogAction, AdminAuditLogStatus, AdminAuditLogTargetType } from '@wayly/types';
import type { AdminAuditLogsListQueryInput } from '@wayly/validation';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';

import { toAdminAuditLogItem } from './admin-audit.mapper';

const MAX_SUMMARY_LENGTH = 500;
const MAX_USER_AGENT_LENGTH = 500;

export interface AdminAuditRequestContext {
  requestId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AdminAuditRecordInput {
  actor: RequestUser;
  action: AdminAuditLogAction;
  targetType: AdminAuditLogTargetType;
  targetId: string;
  targetUserId?: string | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
  requestContext?: AdminAuditRequestContext;
  status?: AdminAuditLogStatus;
}

@Injectable()
export class AdminAuditLogService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectPinoLogger(AdminAuditLogService.name)
    private readonly logger: PinoLogger,
  ) {}

  async record(input: AdminAuditRecordInput): Promise<void> {
    const actorProfile = await this.prisma.user.findUnique({
      where: { id: input.actor.id },
      select: { displayName: true },
    });

    const summary = truncate(input.summary, MAX_SUMMARY_LENGTH);
    const userAgent = input.requestContext?.userAgent
      ? truncate(input.requestContext.userAgent, MAX_USER_AGENT_LENGTH)
      : undefined;

    await this.prisma.adminAuditLog.create({
      data: {
        actorUserId: input.actor.id,
        actorEmailSnapshot: input.actor.email,
        actorDisplaySnapshot: truncate(actorProfile?.displayName ?? input.actor.email, 200),
        actorRolesSnapshot: input.actor.roles as PrismaUserRole[],
        action: input.action as PrismaAdminAuditLogAction,
        targetType: input.targetType as PrismaAdminAuditLogTargetType,
        targetId: input.targetId,
        targetUserId: input.targetUserId ?? null,
        status: (input.status ?? AdminAuditLogStatus.SUCCESS) as PrismaAdminAuditLogStatus,
        summary,
        metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        requestId: input.requestContext?.requestId,
        ipAddress: input.requestContext?.ipAddress,
        userAgent,
      },
    });
  }

  recordBestEffort(input: AdminAuditRecordInput): void {
    void this.record(input).catch((err: unknown) => {
      this.logger.error(
        {
          err,
          action: input.action,
          targetType: input.targetType,
          targetId: input.targetId,
          actorUserId: input.actor.id,
        },
        'Admin audit log write failed',
      );
    });
  }

  async listForOperations(query: AdminAuditLogsListQueryInput): Promise<AdminAuditLogListResponse> {
    const where: Prisma.AdminAuditLogWhereInput = {
      ...(query.action ? { action: query.action as PrismaAdminAuditLogAction } : {}),
      ...(query.actorUserId ? { actorUserId: query.actorUserId } : {}),
      ...(query.targetType
        ? { targetType: query.targetType as PrismaAdminAuditLogTargetType }
        : {}),
      ...(query.targetUserId ? { targetUserId: query.targetUserId } : {}),
      ...(query.targetId ? { targetId: query.targetId } : {}),
      ...(query.status ? { status: query.status as PrismaAdminAuditLogStatus } : {}),
    };

    if (query.from || query.to) {
      where.createdAt = {
        ...(query.from ? { gte: query.from } : {}),
        ...(query.to ? { lte: query.to } : {}),
      };
    }

    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);

    return {
      items: records.map(toAdminAuditLogItem),
      page: query.page,
      limit: query.limit,
      total,
    };
  }
}

function truncate(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1)}…`;
}
