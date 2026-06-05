import type {
  DisputeDetail,
  DisputeEvidenceSummary,
  DisputeListResponse,
  DisputeMessageSummary,
} from '@wayly/types';
import type {
  AddDisputeEvidenceInput,
  AddDisputeMessageInput,
  OpenDisputeInput,
} from '@wayly/validation';

import type { DisputesApi, DisputesListQuery } from './disputes.types';
import type { RequestOptions } from './types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

export function createDisputesApi(request: Requester): DisputesApi {
  return {
    open: (body: OpenDisputeInput, accessToken?: string | null) =>
      request<DisputeDetail>('/disputes', {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),

    list: (query?: DisputesListQuery, accessToken?: string | null) =>
      request<DisputeListResponse>('/disputes', {
        method: 'GET',
        query: query
          ? {
              ...(query.page !== undefined ? { page: query.page } : {}),
              ...(query.limit !== undefined ? { limit: query.limit } : {}),
              ...(query.status !== undefined ? { status: query.status } : {}),
            }
          : undefined,
        ...withCookies,
        accessToken,
      }),

    detail: (id: string, accessToken?: string | null) =>
      request<DisputeDetail>(`/disputes/${id}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),

    addMessage: (id: string, body: AddDisputeMessageInput, accessToken?: string | null) =>
      request<DisputeMessageSummary>(`/disputes/${id}/messages`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),

    addEvidence: (id: string, body: AddDisputeEvidenceInput, accessToken?: string | null) =>
      request<DisputeEvidenceSummary>(`/disputes/${id}/evidence`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
  };
}

export type { DisputesApi } from './disputes.types';
