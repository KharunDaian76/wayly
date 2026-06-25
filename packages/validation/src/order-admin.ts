import { OrderAdminReviewDecision } from '@wayly/types';
import { z } from 'zod';

import { nonEmptyStringSchema } from './schemas';

/** POST /admin/orders/:id/mark-manual-review body. */
export const adminOrderManualReviewSchema = z.object({
  note: nonEmptyStringSchema.max(500),
});
export type AdminOrderManualReviewInput = z.infer<typeof adminOrderManualReviewSchema>;

/** POST /admin/orders/:id/clear-manual-review body. */
export const adminOrderClearManualReviewSchema = z.object({
  note: z.string().trim().max(500).optional(),
});
export type AdminOrderClearManualReviewInput = z.infer<typeof adminOrderClearManualReviewSchema>;

const orderDecisionValues = [
  OrderAdminReviewDecision.MONITOR,
  OrderAdminReviewDecision.ESCALATE_PAYMENT,
  OrderAdminReviewDecision.ESCALATE_DISPUTE,
  OrderAdminReviewDecision.NO_ACTION,
  OrderAdminReviewDecision.OTHER,
] as const;

/** POST /admin/orders/:id/record-decision body. */
export const adminOrderDecisionSchema = z.object({
  decision: z.enum(orderDecisionValues),
  note: nonEmptyStringSchema.max(500),
});
export type AdminOrderDecisionInput = z.infer<typeof adminOrderDecisionSchema>;

/** POST /admin/orders/:id/flag-risk body. */
export const adminOrderRiskFlagSchema = z.object({
  note: nonEmptyStringSchema.max(500),
});
export type AdminOrderRiskFlagInput = z.infer<typeof adminOrderRiskFlagSchema>;

/** POST /admin/orders/:id/clear-risk body. */
export const adminOrderClearRiskSchema = z.object({
  note: z.string().trim().max(500).optional(),
});
export type AdminOrderClearRiskInput = z.infer<typeof adminOrderClearRiskSchema>;
