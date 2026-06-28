import type { ISODateString } from './common';
import type {
  SupportTicketCategory,
  SupportTicketMessageAuthorRole,
  SupportTicketPriority,
  SupportTicketStatus,
} from './enums';

/** Safe support ticket shape for authenticated users (no admin-only fields). */
export interface SupportTicketSummary {
  id: string;
  userId: string;
  orderId: string | null;
  subject: string;
  message: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  closedAt: ISODateString | null;
}

/** User's own support ticket list (GET /support-tickets/me). */
export interface SupportTicketListResponse {
  items: SupportTicketSummary[];
}

/** Admin support ticket queue row (GET /admin/support-tickets). */
export interface AdminSupportTicketQueueItem extends SupportTicketSummary {
  adminNote: string | null;
  lastAdminActionAt: ISODateString | null;
  lastAdminActionById: string | null;
  userDisplayName: string | null;
  userEmail: string | null;
}

/** Paginated admin support ticket list. */
export interface AdminSupportTicketListResponse {
  items: AdminSupportTicketQueueItem[];
  page: number;
  limit: number;
  total: number;
}

/** Threaded support ticket message (user-visible rows omit internal admin notes). */
export interface SupportTicketMessageSummary {
  id: string;
  ticketId: string;
  authorId: string;
  authorRole: SupportTicketMessageAuthorRole;
  body: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  isInternal: boolean;
}

/** GET /support-tickets/:id/messages response. */
export interface SupportTicketMessageListResponse {
  items: SupportTicketMessageSummary[];
}
