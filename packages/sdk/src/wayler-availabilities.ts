import type {
  ActiveWaylerCountSummary,
  WaylerAvailabilityDetail,
  WaylerAvailabilityListResponse,
} from '@wayly/types';
import type { CreateWaylerAvailabilityInput } from '@wayly/validation';

import type { RequestOptions } from './types';
import type {
  ActiveWaylerCountsQuery,
  WaylerAvailabilitiesApi,
  WaylerAvailabilitiesMineQuery,
  WaylerAvailabilitiesPublicQuery,
} from './wayler-availabilities.types';

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

export function createWaylerAvailabilitiesApi(request: Requester): WaylerAvailabilitiesApi {
  return {
    create: (body: CreateWaylerAvailabilityInput, accessToken?: string | null) =>
      request<WaylerAvailabilityDetail>('/wayler-availabilities', {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),

    mine: (query?: WaylerAvailabilitiesMineQuery, accessToken?: string | null) =>
      request<WaylerAvailabilityListResponse>('/wayler-availabilities/mine', {
        method: 'GET',
        query: query ? omitUndefined(query) : undefined,
        ...withCookies,
        accessToken,
      }),

    publicList: (query?: WaylerAvailabilitiesPublicQuery, accessToken?: string | null) =>
      request<WaylerAvailabilityListResponse>('/wayler-availabilities/public', {
        method: 'GET',
        query: query ? omitUndefined(query) : undefined,
        ...withCookies,
        accessToken,
      }),

    activeCounts: (query?: ActiveWaylerCountsQuery, accessToken?: string | null) =>
      request<ActiveWaylerCountSummary[]>('/wayler-availabilities/active-counts', {
        method: 'GET',
        query: query ? omitUndefined(query) : undefined,
        ...withCookies,
        accessToken,
      }),

    detail: (id: string, accessToken?: string | null) =>
      request<WaylerAvailabilityDetail>(`/wayler-availabilities/${id}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),

    publish: (id: string, accessToken?: string | null) =>
      request<WaylerAvailabilityDetail>(`/wayler-availabilities/${id}/publish`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),

    pause: (id: string, accessToken?: string | null) =>
      request<WaylerAvailabilityDetail>(`/wayler-availabilities/${id}/pause`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),

    cancel: (id: string, accessToken?: string | null) =>
      request<WaylerAvailabilityDetail>(`/wayler-availabilities/${id}/cancel`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),
  };
}

export type { WaylerAvailabilitiesApi } from './wayler-availabilities.types';
