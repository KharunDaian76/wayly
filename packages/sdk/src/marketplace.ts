import type { ActiveWaylerMarketplaceResponse } from '@wayly/types';

import type { RequestOptions } from './types';

export type ActiveWaylerMarketplaceQuery = {
  country?: string;
  city?: string;
  fromCountry?: string;
  fromCity?: string;
  toCountry?: string;
  toCity?: string;
  limit?: number;
};

export type MarketplaceApi = {
  getActiveWaylerCounts: (
    query?: ActiveWaylerMarketplaceQuery,
    accessToken?: string | null,
  ) => Promise<ActiveWaylerMarketplaceResponse>;
};

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

export function createMarketplaceApi(request: Requester): MarketplaceApi {
  return {
    getActiveWaylerCounts: (query?: ActiveWaylerMarketplaceQuery, accessToken?: string | null) =>
      request<ActiveWaylerMarketplaceResponse>('/marketplace/active-waylers', {
        method: 'GET',
        query: query ? omitUndefined(query) : undefined,
        ...withCookies,
        accessToken,
      }),
  };
}
