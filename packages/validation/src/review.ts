import { REVIEW_TAG_VALUES } from '@wayly/types';
import { z } from 'zod';

import { idSchema } from './schemas';

const reviewTagSchema = z.enum(REVIEW_TAG_VALUES);

/** POST /reviews/orders/:orderId body. */
export const createReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
  tags: z.array(reviewTagSchema).max(5).optional().default([]),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

/** GET /reviews/users/:userId query. */
export const reviewsListForUserQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(30).default(10),
});

export type ReviewsListForUserQueryInput = z.infer<typeof reviewsListForUserQuerySchema>;

/** GET /admin/reviews query. */
export const adminReviewsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  isHidden: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  reviewerId: idSchema.optional(),
  revieweeId: idSchema.optional(),
  orderId: idSchema.optional(),
});

export type AdminReviewsListQueryInput = z.infer<typeof adminReviewsListQuerySchema>;

/** PATCH /admin/reviews/:id/moderation body. */
export const adminModerateReviewSchema = z.object({
  isHidden: z.boolean(),
  adminNote: z.string().trim().max(2000).optional(),
});

export type AdminModerateReviewInput = z.infer<typeof adminModerateReviewSchema>;
