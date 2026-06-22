import { KycStatus } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';
import { countryCodeSchema, nonEmptyStringSchema } from './schemas';

/**
 * KYC request schemas (shared by backend validation and frontend forms).
 * Provider integration and admin review endpoints land in later M2 batches.
 */

/** Start or resume a KYC flow (provider TBD — Sumsub in a future batch). */
export const kycStartSchema = z.object({
  country: countryCodeSchema.optional(),
  levelName: nonEmptyStringSchema.max(80).optional(),
});
export type KycStartInput = z.infer<typeof kycStartSchema>;

/** Manual admin review payload (admin API not implemented yet). */
export const kycManualReviewSchema = z
  .object({
    status: z.enum(['APPROVED', 'REJECTED']),
    rejectionReason: nonEmptyStringSchema.max(500).optional(),
  })
  .refine((value) => value.status !== 'REJECTED' || Boolean(value.rejectionReason?.trim()), {
    message: 'rejectionReason is required when status is REJECTED',
    path: ['rejectionReason'],
  });
export type KycManualReviewInput = z.infer<typeof kycManualReviewSchema>;

/** GET /admin/kyc-verifications query parameters. */
export const kycVerificationsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: enumSchema(KycStatus).optional(),
});

export type KycVerificationsListQueryInput = z.infer<typeof kycVerificationsListQuerySchema>;
