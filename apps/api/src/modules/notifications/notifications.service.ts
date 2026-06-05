import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType as PrismaNotificationType, type Prisma } from '@prisma/client';
import type { NotificationListResponse, NotificationSummary, NotificationType } from '@wayly/types';
import type { NotificationsListQueryInput } from '@wayly/validation';

import { PrismaService } from '../../infra/prisma/prisma.service';

import { toNotificationSummary } from './notifications.mapper';

export interface NotificationsUnreadCountResult {
  unreadTotal: number;
}

export interface NotificationsMarkAllReadResult {
  updatedCount: number;
  unreadTotal: number;
}

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  relatedOrderId?: string | null;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Internal helper for dispatching notifications; failures are logged, not thrown. */
  async createForUser(input: CreateNotificationInput): Promise<void> {
    try {
      await this.prisma.notification.create({
        data: {
          userId: input.userId,
          type: input.type as PrismaNotificationType,
          title: input.title,
          body: input.body ?? null,
          relatedOrderId: input.relatedOrderId ?? null,
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

  async list(
    userId: string,
    query: NotificationsListQueryInput,
  ): Promise<NotificationListResponse> {
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(query.unreadOnly ? { readAt: null } : {}),
    };
    const skip = (query.page - 1) * query.limit;

    const [records, total, unreadTotal] = await Promise.all([
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
      unreadTotal,
    };
  }

  async unreadCount(userId: string): Promise<NotificationsUnreadCountResult> {
    const unreadTotal = await this.prisma.notification.count({
      where: { userId, readAt: null },
    });
    return { unreadTotal };
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

  async markAllRead(userId: string): Promise<NotificationsMarkAllReadResult> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return {
      updatedCount: result.count,
      unreadTotal: 0,
    };
  }
}
