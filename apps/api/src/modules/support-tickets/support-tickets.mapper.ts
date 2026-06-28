import type { SupportTicket, SupportTicketMessage } from '@prisma/client';
import type {
  AdminSupportTicketQueueItem,
  SupportTicketMessageSummary,
  SupportTicketSummary,
} from '@wayly/types';
import {
  SupportTicketCategory,
  SupportTicketMessageAuthorRole,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@wayly/types';

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

export function toSupportTicketMessageSummary(
  record: SupportTicketMessage,
): SupportTicketMessageSummary {
  return {
    id: record.id,
    ticketId: record.ticketId,
    authorId: record.authorId,
    authorRole: record.authorRole as SupportTicketMessageAuthorRole,
    body: record.body,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    isInternal: record.isInternal,
  };
}
