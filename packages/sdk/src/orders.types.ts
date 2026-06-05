import type {
  CreateDeliveryOrderInput,
  DeliveryOrderDetail,
  DeliveryOrderStatus,
  DeliveryOrderSummary,
  DeliveryOrderType,
} from '@wayly/types';
import type { SubmitDeliveryProofInput } from '@wayly/validation';

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

/** GET /orders/mine query parameters (Sender's own sent orders). */
export interface OrdersMineQuery {
  status?: DeliveryOrderStatus;
  type?: DeliveryOrderType;
  page?: number;
  limit?: number;
}

export interface DeliveryOrderListResult {
  items: DeliveryOrderSummary[];
  page: number;
  limit: number;
  total: number;
}

/** Delivery order accepted by the current Wayler (includes acceptedAt). */
export interface AcceptedDeliveryOrderSummary extends DeliveryOrderSummary {
  acceptedAt: string | null;
}

export interface OrdersApi {
  create(body: CreateDeliveryOrderInput, accessToken?: string | null): Promise<DeliveryOrderDetail>;
  list(query?: OrdersListQuery, accessToken?: string | null): Promise<DeliveryOrderListResult>;
  /** List delivery orders sent by the authenticated user (Sender dashboard). */
  mine(query?: OrdersMineQuery, accessToken?: string | null): Promise<DeliveryOrderListResult>;
  detail(id: string, accessToken?: string | null): Promise<DeliveryOrderDetail>;
  publish(id: string, accessToken?: string | null): Promise<DeliveryOrderDetail>;
  /** Accept an OPEN delivery order as the current Wayler. Returns updated order detail. */
  accept(id: string, accessToken?: string | null): Promise<DeliveryOrderDetail>;
  /** Move an ACCEPTED delivery order to IN_TRANSIT (accepted Wayler only). */
  startTransit(id: string, accessToken?: string | null): Promise<DeliveryOrderDetail>;
  /** Mark an IN_TRANSIT delivery order as DELIVERED (accepted Wayler only). */
  markDelivered(id: string, accessToken?: string | null): Promise<DeliveryOrderDetail>;
  /** Cancel a DRAFT or OPEN delivery order (Sender only). */
  cancel(id: string, accessToken?: string | null): Promise<DeliveryOrderDetail>;
  /** Submit proof-of-delivery metadata (accepted Wayler, IN_TRANSIT or DELIVERED). */
  submitProof(
    id: string,
    body: SubmitDeliveryProofInput,
    accessToken?: string | null,
  ): Promise<DeliveryOrderDetail>;
  /** List delivery orders accepted by the authenticated Wayler. */
  accepted(accessToken?: string | null): Promise<AcceptedDeliveryOrderSummary[]>;
}

export type {
  CreateDeliveryOrderInput,
  DeliveryOrderDetail,
  DeliveryOrderSummary,
  SubmitDeliveryProofInput,
};
