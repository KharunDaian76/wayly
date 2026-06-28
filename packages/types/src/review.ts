import type { ISODateString } from './common';
import type { ReviewPartyRole } from './enums';

/** Allowed review tag values (v1). */
export const REVIEW_TAG_VALUES = ['communicative', 'careful', 'on_time', 'clear_details'] as const;

export type ReviewTag = (typeof REVIEW_TAG_VALUES)[number];

/** Public review row for lists (hidden reviews omitted for normal users). */
export interface ReviewSummary {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  reviewerRole: ReviewPartyRole;
  revieweeRole: ReviewPartyRole;
  rating: number;
  comment: string | null;
  tags: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Aggregated trust summary for a user profile/marketplace display. */
export interface UserReviewSummary {
  userId: string;
  averageRating: number | null;
  reviewCount: number;
  visibleReviewCount: number;
  ratingBreakdown: Record<'1' | '2' | '3' | '4' | '5', number>;
  recentTags: string[];
}

/** Paginated visible reviews for a user. */
export interface ReviewListResponse {
  items: ReviewSummary[];
  limit: number;
  total: number;
}

/** GET /reviews/orders/:orderId/mine — whether the current user reviewed the counterparty. */
export interface OrderReviewMineResponse {
  hasReviewed: boolean;
  review: ReviewSummary | null;
}

/** Admin moderation queue row. */
export interface AdminReviewQueueItem extends ReviewSummary {
  isHidden: boolean;
  hiddenAt: ISODateString | null;
  hiddenById: string | null;
  adminNote: string | null;
}

/** Paginated admin review list. */
export interface AdminReviewListResponse {
  items: AdminReviewQueueItem[];
  page: number;
  limit: number;
  total: number;
}
