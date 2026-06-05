import type { CreateDeliveryOrderInput, DeliveryOrderDetail } from '@wayly/types';

import type {
  AcceptedDeliveryOrderSummary,
  DeliveryOrderListResult,
  OrdersApi,
  OrdersListQuery,
  OrdersMineQuery,
} from './orders.types';
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

    mine: (query?: OrdersMineQuery, accessToken?: string | null) =>
      request<DeliveryOrderListResult>('/orders/mine', {
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

    publish: (id: string, accessToken?: string | null) =>
      request<DeliveryOrderDetail>(`/orders/${id}/publish`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),

    accept: (id: string, accessToken?: string | null) =>
      request<DeliveryOrderDetail>(`/orders/${id}/accept`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),

    accepted: (accessToken?: string | null) =>
      request<AcceptedDeliveryOrderSummary[]>('/orders/accepted', {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
  };
}

export type {
  OrdersApi,
  OrdersListQuery,
  OrdersMineQuery,
  DeliveryOrderListResult,
} from './orders.types';
