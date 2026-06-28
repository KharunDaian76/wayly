import type {
  OrderReviewMineResponse,
  ReviewListResponse,
  ReviewSummary,
  UserReviewSummary,
} from '@wayly/types';
import type { CreateReviewInput, ReviewsListForUserQueryInput } from '@wayly/validation';

import type { RequestOptions } from './types';
import type { ReviewsApi } from './reviews.types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

function buildReviewsListQuery(query?: ReviewsListForUserQueryInput): string {
  if (!query?.limit) {
    return '';
  }
  return `?limit=${encodeURIComponent(String(query.limit))}`;
}

export function createReviewsApi(request: Requester): ReviewsApi {
  return {
    createForOrder: (orderId: string, body: CreateReviewInput, accessToken?: string | null) =>
      request<ReviewSummary>(`/reviews/orders/${orderId}`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),

    getUserSummary: (userId: string, accessToken?: string | null) =>
      request<UserReviewSummary>(`/reviews/users/${userId}/summary`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),

    listForUser: (
      userId: string,
      query?: ReviewsListForUserQueryInput,
      accessToken?: string | null,
    ) =>
      request<ReviewListResponse>(`/reviews/users/${userId}${buildReviewsListQuery(query)}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),

    getMineForOrder: (orderId: string, accessToken?: string | null) =>
      request<OrderReviewMineResponse>(`/reviews/orders/${orderId}/mine`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
  };
}

export type { ReviewsApi } from './reviews.types';
