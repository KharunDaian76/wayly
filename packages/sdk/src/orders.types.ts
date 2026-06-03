import type {
  CreateDeliveryOrderInput,
  DeliveryOrderDetail,
  DeliveryOrderStatus,
  DeliveryOrderSummary,
  DeliveryOrderType,
} from '@wayly/types';

/** GET /orders query parameters. */
export interface OrdersListQuery {
  status?: DeliveryOrderStatus;
  type?: DeliveryOrderType;
  pickupCountry?: string;
  pickupCity?: string;
  dropoffCountry?: string;
  dropoffCity?: string;
  page?: number;
  limit?: number;
}

export interface DeliveryOrderListResult {
  items: DeliveryOrderSummary[];
  page: number;
  limit: number;
  total: number;
}

export interface OrdersApi {
  create(body: CreateDeliveryOrderInput, accessToken?: string | null): Promise<DeliveryOrderDetail>;
  list(query?: OrdersListQuery, accessToken?: string | null): Promise<DeliveryOrderListResult>;
  detail(id: string, accessToken?: string | null): Promise<DeliveryOrderDetail>;
}

export type { CreateDeliveryOrderInput, DeliveryOrderDetail, DeliveryOrderSummary };
