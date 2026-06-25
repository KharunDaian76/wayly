import { PaymentAdminReviewDecision, PaymentAdminReviewStatus, PaymentStatus } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';
import { currencySchema, nonEmptyStringSchema } from './schemas';

/** GET /admin/payments query parameters (operations read-only list). */
export const adminPaymentsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: enumSchema(PaymentStatus).optional(),
  currency: currencySchema.optional(),
  adminReviewStatus: enumSchema(PaymentAdminReviewStatus).optional(),
});

export type AdminPaymentsListQueryInput = z.infer<typeof adminPaymentsListQuerySchema>;

/** POST /admin/payments/:id/mark-manual-review body. */
export const adminPaymentManualReviewSchema = z.object({
  note: nonEmptyStringSchema.max(500),
});
export type AdminPaymentManualReviewInput = z.infer<typeof adminPaymentManualReviewSchema>;

/** POST /admin/payments/:id/clear-manual-review body. */
export const adminPaymentClearManualReviewSchema = z.object({
  note: z.string().trim().max(500).optional(),
});
export type AdminPaymentClearManualReviewInput = z.infer<
  typeof adminPaymentClearManualReviewSchema
>;

const refundDecisionValues = [
  PaymentAdminReviewDecision.RECOMMEND_FULL_REFUND,
  PaymentAdminReviewDecision.RECOMMEND_PARTIAL_REFUND,
  PaymentAdminReviewDecision.NO_ACTION,
  PaymentAdminReviewDecision.OTHER,
] as const;

/** POST /admin/payments/:id/record-refund-decision body. */
export const adminPaymentRefundDecisionSchema = z.object({
  decision: z.enum(refundDecisionValues),
  note: nonEmptyStringSchema.max(500),
});
export type AdminPaymentRefundDecisionInput = z.infer<typeof adminPaymentRefundDecisionSchema>;

const releaseDecisionValues = [
  PaymentAdminReviewDecision.RECOMMEND_RELEASE,
  PaymentAdminReviewDecision.NO_ACTION,
  PaymentAdminReviewDecision.OTHER,
] as const;

/** POST /admin/payments/:id/record-release-decision body. */
export const adminPaymentReleaseDecisionSchema = z.object({
  decision: z.enum(releaseDecisionValues),
  note: nonEmptyStringSchema.max(500),
});
export type AdminPaymentReleaseDecisionInput = z.infer<typeof adminPaymentReleaseDecisionSchema>;
