import type { ISODateString } from './common';
import type { SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from './enums';

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
