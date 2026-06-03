import type { CreateDeliveryOrderInput, DeliveryOrderDetail } from '@wayly/types';

import type { DeliveryOrderListResult, OrdersApi, OrdersListQuery } from './orders.types';
import type { RequestOptions } from './types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

export function createOrdersApi(request: Requester): OrdersApi {
  return {
    create: (body: CreateDeliveryOrderInput, accessToken?: string | null) =>
      request<DeliveryOrderDetail>('/orders', {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),

    list: (query?: OrdersListQuery, accessToken?: string | null) =>
      request<DeliveryOrderListResult>('/orders', {
        method: 'GET',
        query: query as RequestOptions['query'],
        ...withCookies,
        accessToken,
      }),

    detail: (id: string, accessToken?: string | null) =>
      request<DeliveryOrderDetail>(`/orders/${id}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
  };
}

export type { OrdersApi, OrdersListQuery, DeliveryOrderListResult } from './orders.types';
