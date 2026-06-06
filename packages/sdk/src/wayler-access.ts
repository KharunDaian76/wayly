import type {
  WaylerAccessPassListResponse,
  WaylerAccessPassSummary,
  WaylerAccessState,
} from '@wayly/types';

import type { RequestOptions } from './types';
import type { WaylerAccessApi, WaylerAccessPassesListQuery } from './wayler-access.types';

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

export function createWaylerAccessApi(request: Requester): WaylerAccessApi {
  return {
    today: (accessToken?: string | null) =>
      request<WaylerAccessState>('/wayler-access/today', {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),

    mine: (query?: WaylerAccessPassesListQuery, accessToken?: string | null) =>
      request<WaylerAccessPassListResponse>('/wayler-access/mine', {
        method: 'GET',
        query: query ? omitUndefined(query) : undefined,
        ...withCookies,
        accessToken,
      }),

    mockActivateToday: (accessToken?: string | null) =>
      request<WaylerAccessPassSummary>('/wayler-access/mock-activate-today', {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),

    cancel: (id: string, accessToken?: string | null) =>
      request<WaylerAccessPassSummary>(`/wayler-access/${id}/cancel`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),
  };
}

export type { WaylerAccessApi } from './wayler-access.types';
