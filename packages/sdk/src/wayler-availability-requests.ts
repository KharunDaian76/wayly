import type {
  WaylerAvailabilityRequestDetail,
  WaylerAvailabilityRequestListResponse,
} from '@wayly/types';
import type {
  CreateWaylerAvailabilityRequestInput,
  RespondWaylerAvailabilityRequestInput,
} from '@wayly/validation';

import type { RequestOptions } from './types';
import type {
  WaylerAvailabilityRequestsApi,
  WaylerAvailabilityRequestsListQuery,
} from './wayler-availability-requests.types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

function omitUndefined<T extends Record<string, unknown>>(obj: T): RequestOptions['query'] {
  const query: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      query[key] = value as string | number | boolean;
    }
  }
  return query;
}

export function createWaylerAvailabilityRequestsApi(
  request: Requester,
): WaylerAvailabilityRequestsApi {
  return {
    create: (input: CreateWaylerAvailabilityRequestInput, accessToken?: string | null) =>
      request<WaylerAvailabilityRequestDetail>('/wayler-availability-requests', {
        method: 'POST',
        body: input,
        ...withCookies,
        accessToken,
      }),

    mineAsSender: (query?: WaylerAvailabilityRequestsListQuery, accessToken?: string | null) =>
      request<WaylerAvailabilityRequestListResponse>('/wayler-availability-requests/mine/sender', {
        method: 'GET',
        query: query ? omitUndefined(query) : undefined,
        ...withCookies,
        accessToken,
      }),

    mineAsWayler: (query?: WaylerAvailabilityRequestsListQuery, accessToken?: string | null) =>
      request<WaylerAvailabilityRequestListResponse>('/wayler-availability-requests/mine/wayler', {
        method: 'GET',
        query: query ? omitUndefined(query) : undefined,
        ...withCookies,
        accessToken,
      }),

    get: (id: string, accessToken?: string | null) =>
      request<WaylerAvailabilityRequestDetail>(`/wayler-availability-requests/${id}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),

    accept: (
      id: string,
      input?: RespondWaylerAvailabilityRequestInput,
      accessToken?: string | null,
    ) =>
      request<WaylerAvailabilityRequestDetail>(`/wayler-availability-requests/${id}/accept`, {
        method: 'POST',
        body: input ?? {},
        ...withCookies,
        accessToken,
      }),

    decline: (
      id: string,
      input?: RespondWaylerAvailabilityRequestInput,
      accessToken?: string | null,
    ) =>
      request<WaylerAvailabilityRequestDetail>(`/wayler-availability-requests/${id}/decline`, {
        method: 'POST',
        body: input ?? {},
        ...withCookies,
        accessToken,
      }),

    cancel: (id: string, accessToken?: string | null) =>
      request<WaylerAvailabilityRequestDetail>(`/wayler-availability-requests/${id}/cancel`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),
  };
}

export type { WaylerAvailabilityRequestsApi } from './wayler-availability-requests.types';
