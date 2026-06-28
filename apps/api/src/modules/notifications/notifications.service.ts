import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  NotificationEntityType as PrismaNotificationEntityType,
  NotificationType as PrismaNotificationType,
  type Prisma,
} from '@prisma/client';
import type {
  NotificationListResponse,
  NotificationMarkAllReadResponse,
  NotificationSummary,
  NotificationUnreadCountResponse,
} from '@wayly/types';
import type { NotificationsListQueryInput } from '@wayly/validation';

import { PrismaService } from '../../infra/prisma/prisma.service';

import type { CreateNotificationInput } from './notification.helpers';
import { toNotificationSummary } from './notifications.mapper';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Internal helper for dispatching one notification; failures are logged, not thrown. */
  async createForUser(input: CreateNotificationInput): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type as PrismaNotificationType,
          title: input.title,
          body: input.body,
          linkHref: input.linkHref ?? null,
          entityType: (input.entityType ?? null) as PrismaNotificationEntityType | null,
          entityId: input.entityId ?? null,
        },
      });
    } catch (error) {
      this.logger.warn(
        `Failed to create notification for user ${input.userId} (${input.type}): ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  /** Batch create helper; each item is best-effort. */
  async createManyForUsers(inputs: CreateNotificationInput[]): Promise<void> {
    for (const input of inputs) {
      await this.createForUser(input);
    }
  }

  async listForUser(
    userId: string,
    query: NotificationsListQueryInput,
  ): Promise<NotificationListResponse> {
    return this.list(userId, query);
  }

  async list(
    userId: string,
    query: NotificationsListQueryInput,
  ): Promise<NotificationListResponse> {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };
    const skip = (query.page - 1) * query.limit;

    const [records, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.notification.count({ where }),
      this.prisma.notification.count({ where: { userId, readAt: null } }),
    ]);

    return {
      items: records.map(toNotificationSummary),
      page: query.page,
      limit: query.limit,
      total,
      unreadCount,
    };
  }

  async getUnreadCount(userId: string): Promise<NotificationUnreadCountResponse> {
    const unreadCount = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { unreadCount };
  }

  async markRead(userId: string, id: string): Promise<NotificationSummary> {
    const record = await this.prisma.notification.findFirst({
      where: { id, userId },
    });
    if (!record) {
      throw new NotFoundException('Notification not found');
    }
    if (record.readAt) {
      return toNotificationSummary(record);
    }

    const updated = await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
    return toNotificationSummary(updated);
  }

  async markAllRead(userId: string): Promise<NotificationMarkAllReadResponse> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return {
      updatedCount: result.count,
      unreadCount: 0,
    };
  }
}
