import type {
  AdminAuditLogListResponse,
  AdminDisputeListResponse,
  AdminDisputeQueueItem,
  AdminKycListResponse,
  AdminKycQueueItem,
  AdminOrderListResponse,
  AdminPaymentListResponse,
  AdminSystemHealthResponse,
  AdminUserListResponse,
  AdminUserQueueItem,
} from '@wayly/types';

import type { AdminAuditLogsListQuery } from './admin-audit.types';
import type { AdminDisputeResolveBody } from './disputes-admin.types';
import type { DisputesListQuery } from './disputes.types';
import type { AdminKycRejectBody, KycVerificationsListQuery } from './kyc-admin.types';
import type { AdminOrdersListQuery } from './orders-admin.types';
import type { AdminPaymentsListQuery } from './payments-admin.types';
import type {
  AdminUsersListQuery,
  AdminUserSuspendBody,
  AdminUserUnsuspendBody,
} from './users-admin.types';

/** Admin / operations endpoints. KYC approve/reject are the first admin mutation workflows. */
export interface AdminApi {
  listDisputes(
    query?: DisputesListQuery,
    accessToken?: string | null,
  ): Promise<AdminDisputeListResponse>;
  resolveAdminDispute(
    id: string,
    body: AdminDisputeResolveBody,
    accessToken?: string | null,
  ): Promise<AdminDisputeQueueItem>;
  listKycVerifications(
    query?: KycVerificationsListQuery,
    accessToken?: string | null,
  ): Promise<AdminKycListResponse>;
  approveKycVerification(id: string, accessToken?: string | null): Promise<AdminKycQueueItem>;
  rejectKycVerification(
    id: string,
    body: AdminKycRejectBody,
    accessToken?: string | null,
  ): Promise<AdminKycQueueItem>;
  listOrders(
    query?: AdminOrdersListQuery,
    accessToken?: string | null,
  ): Promise<AdminOrderListResponse>;
  listUsers(
    query?: AdminUsersListQuery,
    accessToken?: string | null,
  ): Promise<AdminUserListResponse>;
  suspendAdminUser(
    id: string,
    body: AdminUserSuspendBody,
    accessToken?: string | null,
  ): Promise<AdminUserQueueItem>;
  unsuspendAdminUser(
    id: string,
    body?: AdminUserUnsuspendBody,
    accessToken?: string | null,
  ): Promise<AdminUserQueueItem>;
  listPayments(
    query?: AdminPaymentsListQuery,
    accessToken?: string | null,
  ): Promise<AdminPaymentListResponse>;
  getSystemHealth(accessToken?: string | null): Promise<AdminSystemHealthResponse>;
  listAuditLogs(
    query?: AdminAuditLogsListQuery,
    accessToken?: string | null,
  ): Promise<AdminAuditLogListResponse>;
}

export type {
  AdminAuditLogListResponse,
  AdminDisputeListResponse,
  AdminDisputeQueueItem,
  AdminKycListResponse,
  AdminKycQueueItem,
  AdminOrderListResponse,
  AdminPaymentListResponse,
  AdminSystemHealthResponse,
  AdminUserListResponse,
  AdminUserQueueItem,
};
export type { AdminAuditLogsListQuery } from './admin-audit.types';
export type { AdminDisputeResolveBody } from './disputes-admin.types';
export type {
  AdminUsersListQuery,
  AdminUserSuspendBody,
  AdminUserUnsuspendBody,
} from './users-admin.types';
