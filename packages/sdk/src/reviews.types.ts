import type {
  OrderReviewMineResponse,
  ReviewListResponse,
  ReviewSummary,
  UserReviewSummary,
} from '@wayly/types';
import type { CreateReviewInput, ReviewsListForUserQueryInput } from '@wayly/validation';

export interface ReviewsApi {
  createForOrder(
    orderId: string,
    body: CreateReviewInput,
    accessToken?: string | null,
  ): Promise<ReviewSummary>;
  getUserSummary(userId: string, accessToken?: string | null): Promise<UserReviewSummary>;
  listForUser(
    userId: string,
    query?: ReviewsListForUserQueryInput,
    accessToken?: string | null,
  ): Promise<ReviewListResponse>;
  getMineForOrder(orderId: string, accessToken?: string | null): Promise<OrderReviewMineResponse>;
}

export type { CreateReviewInput, ReviewsListForUserQueryInput };
