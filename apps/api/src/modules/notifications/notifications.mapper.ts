import type { Notification } from '@prisma/client';
import type { NotificationSummary } from '@wayly/types';
import { NotificationType } from '@wayly/types';

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/** Maps a Prisma Notification to the safe API summary shape. */
export function toNotificationSummary(record: Notification): NotificationSummary {
  return {
    id: record.id,
    type: record.type as NotificationType,
    title: record.title,
    body: record.body,
    relatedOrderId: record.relatedOrderId,
    readAt: toIso(record.readAt),
    createdAt: record.createdAt.toISOString(),
  };
}
