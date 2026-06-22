import type { DeliveryOrderStatus } from '@wayly/types';

/** Query parameters for GET /admin/orders. */
export interface AdminOrdersListQuery {
  page?: number;
  limit?: number;
  status?: DeliveryOrderStatus;
}
