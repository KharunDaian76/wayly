import { SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';
import { idSchema } from './schemas';

/** POST /support-tickets body. */
export const createSupportTicketSchema = z.object({
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(10).max(5000),
  category: enumSchema(SupportTicketCategory),
  orderId: idSchema.optional(),
});

export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;

/** GET /admin/support-tickets query. */
export const adminSupportTicketsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: enumSchema(SupportTicketStatus).optional(),
  category: enumSchema(SupportTicketCategory).optional(),
  priority: enumSchema(SupportTicketPriority).optional(),
  userId: idSchema.optional(),
  orderId: idSchema.optional(),
});

export type AdminSupportTicketsListQueryInput = z.infer<typeof adminSupportTicketsListQuerySchema>;

/** PATCH /admin/support-tickets/:id body. */
export const adminUpdateSupportTicketSchema = z
  .object({
    status: enumSchema(SupportTicketStatus).optional(),
    priority: enumSchema(SupportTicketPriority).optional(),
    adminNote: z.string().trim().max(5000).optional(),
  })
  .refine(
    (body) =>
      body.status !== undefined || body.priority !== undefined || body.adminNote !== undefined,
    {
      message: 'At least one field must be provided',
    },
  );

export type AdminUpdateSupportTicketInput = z.infer<typeof adminUpdateSupportTicketSchema>;
