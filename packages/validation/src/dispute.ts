import { DisputeReason, DisputeStatus } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';
import { idSchema } from './schemas';

/** POST /disputes body. */
export const openDisputeSchema = z.object({
  orderId: idSchema,
  reason: enumSchema(DisputeReason),
  description: z.string().trim().min(10).max(3000),
});

export type OpenDisputeInput = z.infer<typeof openDisputeSchema>;

/** GET /disputes query parameters. */
export const disputesListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: enumSchema(DisputeStatus).optional(),
});

export type DisputesListQueryInput = z.infer<typeof disputesListQuerySchema>;

/** POST /disputes/:id/messages body. */
export const addDisputeMessageSchema = z.object({
  body: z.string().trim().min(1).max(3000),
});

export type AddDisputeMessageInput = z.infer<typeof addDisputeMessageSchema>;

/** POST /disputes/:id/evidence body. */
export const addDisputeEvidenceSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  fileUrl: z.string().trim().url().max(1000).optional(),
});

export type AddDisputeEvidenceInput = z.infer<typeof addDisputeEvidenceSchema>;

/** Admin dispute resolution outcome (maps to DisputeResolution metadata — no payment execution). */
export const AdminDisputeResolutionOutcome = {
  SENDER_FAVORED: 'SENDER_FAVORED',
  WAYLER_FAVORED: 'WAYLER_FAVORED',
  NO_FAULT: 'NO_FAULT',
  INFORMATION_ONLY: 'INFORMATION_ONLY',
} as const;

export type AdminDisputeResolutionOutcome =
  (typeof AdminDisputeResolutionOutcome)[keyof typeof AdminDisputeResolutionOutcome];

/** POST /admin/disputes/:id/resolve body. */
export const adminDisputeResolveSchema = z.object({
  resolutionNote: z.string().trim().min(1).max(2000),
  outcome: enumSchema(AdminDisputeResolutionOutcome).optional(),
});

export type AdminDisputeResolveInput = z.infer<typeof adminDisputeResolveSchema>;
