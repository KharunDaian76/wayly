import type {
  AdminDisputeListResponse,
  AdminKycListResponse,
  AdminOrderListResponse,
} from '@wayly/types';

import type { DisputesListQuery } from './disputes.types';
import type { KycVerificationsListQuery } from './kyc-admin.types';
import type { AdminOrdersListQuery } from './orders-admin.types';

/** Admin / operations endpoints (read-only in current batches). */
export interface AdminApi {
  listDisputes(
    query?: DisputesListQuery,
    accessToken?: string | null,
  ): Promise<AdminDisputeListResponse>;
  listKycVerifications(
    query?: KycVerificationsListQuery,
    accessToken?: string | null,
  ): Promise<AdminKycListResponse>;
  listOrders(
    query?: AdminOrdersListQuery,
    accessToken?: string | null,
  ): Promise<AdminOrderListResponse>;
}

export type { AdminDisputeListResponse, AdminKycListResponse, AdminOrderListResponse };
