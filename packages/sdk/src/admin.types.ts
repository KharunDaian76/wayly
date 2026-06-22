import type {
  AdminDisputeListResponse,
  AdminKycListResponse,
  AdminOrderListResponse,
  AdminUserListResponse,
} from '@wayly/types';

import type { DisputesListQuery } from './disputes.types';
import type { KycVerificationsListQuery } from './kyc-admin.types';
import type { AdminOrdersListQuery } from './orders-admin.types';
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
}

export type {
  AdminDisputeListResponse,
  AdminKycListResponse,
  AdminOrderListResponse,
  AdminUserListResponse,
};
