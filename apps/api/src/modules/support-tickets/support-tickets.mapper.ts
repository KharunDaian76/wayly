import type { SupportTicket } from '@prisma/client';
import type { AdminSupportTicketQueueItem, SupportTicketSummary } from '@wayly/types';
import { SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from '@wayly/types';

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

export function toSupportTicketSummary(record: SupportTicket): SupportTicketSummary {
  return {
    id: record.id,
    userId: record.userId,
    orderId: record.orderId,
    subject: record.subject,
    message: record.message,
    category: record.category as SupportTicketCategory,
    status: record.status as SupportTicketStatus,
    priority: record.priority as SupportTicketPriority,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    closedAt: toIso(record.closedAt),
  };
}

export function toAdminSupportTicketQueueItem(
  record: SupportTicket & {
    user: { displayName: string; email: string };
  },
): AdminSupportTicketQueueItem {
  return {
    ...toSupportTicketSummary(record),
    adminNote: record.adminNote,
    lastAdminActionAt: toIso(record.lastAdminActionAt),
    lastAdminActionById: record.lastAdminActionById,
    userDisplayName: record.user.displayName,
    userEmail: record.user.email,
  };
}
