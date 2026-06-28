import type {
  AdminAuditLogListResponse,
  AdminDisputeListResponse,
  AdminDisputeQueueItem,
  AdminKycListResponse,
  AdminKycQueueItem,
  AdminOrderListResponse,
  AdminOrderQueueItem,
  AdminPaymentListResponse,
  AdminPaymentQueueItem,
  AdminSupportTicketListResponse,
  AdminSupportTicketQueueItem,
  AdminSystemHealthResponse,
  AdminUserListResponse,
  AdminUserQueueItem,
  SupportTicketMessageListResponse,
  SupportTicketMessageSummary,
} from '@wayly/types';

import type { AdminAuditLogsListQuery } from './admin-audit.types';
import type { AdminDisputeResolveBody } from './disputes-admin.types';
import type { DisputesListQuery } from './disputes.types';
import type { AdminKycRejectBody, KycVerificationsListQuery } from './kyc-admin.types';
import type {
  AdminOrderClearManualReviewBody,
  AdminOrderClearRiskBody,
  AdminOrderDecisionBody,
  AdminOrderManualReviewBody,
  AdminOrderRiskFlagBody,
  AdminOrdersListQuery,
} from './orders-admin.types';
import type {
  AdminPaymentClearManualReviewBody,
  AdminPaymentManualReviewBody,
  AdminPaymentRefundDecisionBody,
  AdminPaymentReleaseDecisionBody,
  AdminPaymentsListQuery,
} from './payments-admin.types';
import type {
  AdminSupportTicketsListQuery,
  AdminCreateSupportTicketMessageBody,
  AdminUpdateSupportTicketBody,
} from './support-tickets-admin.types';
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
  markOrderManualReview(
    id: string,
    body: AdminOrderManualReviewBody,
    accessToken?: string | null,
  ): Promise<AdminOrderQueueItem>;
  clearOrderManualReview(
    id: string,
    body?: AdminOrderClearManualReviewBody,
    accessToken?: string | null,
  ): Promise<AdminOrderQueueItem>;
  recordOrderDecision(
    id: string,
    body: AdminOrderDecisionBody,
    accessToken?: string | null,
  ): Promise<AdminOrderQueueItem>;
  flagOrderRisk(
    id: string,
    body: AdminOrderRiskFlagBody,
    accessToken?: string | null,
  ): Promise<AdminOrderQueueItem>;
  clearOrderRisk(
    id: string,
    body?: AdminOrderClearRiskBody,
    accessToken?: string | null,
  ): Promise<AdminOrderQueueItem>;
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
  markPaymentManualReview(
    id: string,
    body: AdminPaymentManualReviewBody,
    accessToken?: string | null,
  ): Promise<AdminPaymentQueueItem>;
  clearPaymentManualReview(
    id: string,
    body?: AdminPaymentClearManualReviewBody,
    accessToken?: string | null,
  ): Promise<AdminPaymentQueueItem>;
  recordPaymentRefundDecision(
    id: string,
    body: AdminPaymentRefundDecisionBody,
    accessToken?: string | null,
  ): Promise<AdminPaymentQueueItem>;
  recordPaymentReleaseDecision(
    id: string,
    body: AdminPaymentReleaseDecisionBody,
    accessToken?: string | null,
  ): Promise<AdminPaymentQueueItem>;
  getSystemHealth(accessToken?: string | null): Promise<AdminSystemHealthResponse>;
  listAuditLogs(
    query?: AdminAuditLogsListQuery,
    accessToken?: string | null,
  ): Promise<AdminAuditLogListResponse>;
  listSupportTickets(
    query?: AdminSupportTicketsListQuery,
    accessToken?: string | null,
  ): Promise<AdminSupportTicketListResponse>;
  updateSupportTicket(
    id: string,
    body: AdminUpdateSupportTicketBody,
    accessToken?: string | null,
  ): Promise<AdminSupportTicketQueueItem>;
  listSupportTicketMessages(
    ticketId: string,
    accessToken?: string | null,
  ): Promise<SupportTicketMessageListResponse>;
  createSupportTicketMessage(
    ticketId: string,
    body: AdminCreateSupportTicketMessageBody,
    accessToken?: string | null,
  ): Promise<SupportTicketMessageSummary>;
}

export type {
  AdminAuditLogListResponse,
  AdminDisputeListResponse,
  AdminDisputeQueueItem,
  AdminKycListResponse,
  AdminKycQueueItem,
  AdminOrderListResponse,
  AdminOrderQueueItem,
  AdminPaymentListResponse,
  AdminPaymentQueueItem,
  AdminSupportTicketListResponse,
  AdminSupportTicketQueueItem,
  AdminSystemHealthResponse,
  AdminUserListResponse,
  AdminUserQueueItem,
};
export type {
  AdminOrderClearManualReviewBody,
  AdminOrderClearRiskBody,
  AdminOrderDecisionBody,
  AdminOrderManualReviewBody,
  AdminOrderRiskFlagBody,
  AdminOrdersListQuery,
} from './orders-admin.types';
export type {
  AdminPaymentClearManualReviewBody,
  AdminPaymentManualReviewBody,
  AdminPaymentRefundDecisionBody,
  AdminPaymentReleaseDecisionBody,
  AdminPaymentsListQuery,
} from './payments-admin.types';
export type { AdminAuditLogsListQuery } from './admin-audit.types';
export type {
  AdminSupportTicketsListQuery,
  AdminCreateSupportTicketMessageBody,
  AdminUpdateSupportTicketBody,
} from './support-tickets-admin.types';
export type { AdminDisputeResolveBody } from './disputes-admin.types';
export type {
  AdminUsersListQuery,
  AdminUserSuspendBody,
  AdminUserUnsuspendBody,
} from './users-admin.types';
