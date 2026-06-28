import type {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
} from '@wayly/types';

/** GET /admin/support-tickets query. */
export type AdminSupportTicketsListQuery = {
  page?: number;
  limit?: number;
  status?: SupportTicketStatus;
  category?: SupportTicketCategory;
  priority?: SupportTicketPriority;
  userId?: string;
  orderId?: string;
};

/** PATCH /admin/support-tickets/:id body. */
export type AdminUpdateSupportTicketBody = {
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  adminNote?: string;
};
