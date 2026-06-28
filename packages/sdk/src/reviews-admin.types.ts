import type { AdminModerateReviewInput, AdminReviewsListQueryInput } from '@wayly/validation';

/** GET /admin/reviews query. */
export type AdminReviewsListQuery = AdminReviewsListQueryInput;

/** PATCH /admin/reviews/:id/moderation body. */
export type AdminModerateReviewBody = AdminModerateReviewInput;
