import type {
  AdminDisputeListResponse,
  AdminKycListResponse,
  AdminOrderListResponse,
  AdminPaymentListResponse,
  AdminSystemHealthResponse,
  AdminUserListResponse,
} from '@wayly/types';

import type { DisputesListQuery } from './disputes.types';
import type { KycVerificationsListQuery } from './kyc-admin.types';
import type { AdminOrdersListQuery } from './orders-admin.types';
import type { AdminPaymentsListQuery } from './payments-admin.types';
import type { AdminUsersListQuery } from './users-admin.types';

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
  listUsers(
    query?: AdminUsersListQuery,
    accessToken?: string | null,
  ): Promise<AdminUserListResponse>;
  listPayments(
    query?: AdminPaymentsListQuery,
    accessToken?: string | null,
  ): Promise<AdminPaymentListResponse>;
  getSystemHealth(accessToken?: string | null): Promise<AdminSystemHealthResponse>;
}

export type {
  AdminDisputeListResponse,
  AdminKycListResponse,
  AdminOrderListResponse,
  AdminPaymentListResponse,
  AdminSystemHealthResponse,
  AdminUserListResponse,
};
