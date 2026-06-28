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
} from '@wayly/types';

import type { AdminAuditLogsListQuery } from './admin-audit.types';
import type { AdminApi } from './admin.types';
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
import type { RequestOptions } from './types';
import type {
  AdminSupportTicketsListQuery,
  AdminUpdateSupportTicketBody,
} from './support-tickets-admin.types';
import type {
  AdminUsersListQuery,
  AdminUserSuspendBody,
  AdminUserUnsuspendBody,
} from './users-admin.types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

function buildDisputesQuery(query?: DisputesListQuery): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }
  if (query.status !== undefined) {
    params.set('status', query.status);
  }
  if (query.orderId !== undefined) {
    params.set('orderId', query.orderId);
  }
  if (query.openedById !== undefined) {
    params.set('openedById', query.openedById);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function buildKycVerificationsQuery(query?: KycVerificationsListQuery): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }
  if (query.status !== undefined) {
    params.set('status', query.status);
  }
  if (query.userId !== undefined) {
    params.set('userId', query.userId);
  }
  if (query.country !== undefined) {
    params.set('country', query.country);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function buildAdminOrdersQuery(query?: AdminOrdersListQuery): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }
  if (query.status !== undefined) {
    params.set('status', query.status);
  }
  if (query.adminReviewStatus !== undefined) {
    params.set('adminReviewStatus', query.adminReviewStatus);
  }
  if (query.sourceType !== undefined) {
    params.set('sourceType', query.sourceType);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function buildAdminUsersQuery(query?: AdminUsersListQuery): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }
  if (query.role !== undefined) {
    params.set('role', query.role);
  }
  if (query.kycStatus !== undefined) {
    params.set('kycStatus', query.kycStatus);
  }
  if (query.accountStatus !== undefined) {
    params.set('accountStatus', query.accountStatus);
  }
  if (query.search !== undefined) {
    params.set('search', query.search);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function buildAdminPaymentsQuery(query?: AdminPaymentsListQuery): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }
  if (query.status !== undefined) {
    params.set('status', query.status);
  }
  if (query.currency !== undefined) {
    params.set('currency', query.currency);
  }
  if (query.adminReviewStatus !== undefined) {
    params.set('adminReviewStatus', query.adminReviewStatus);
  }
  if (query.orderId !== undefined) {
    params.set('orderId', query.orderId);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function buildAdminAuditLogsQuery(query?: AdminAuditLogsListQuery): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }
  if (query.action !== undefined) {
    params.set('action', query.action);
  }
  if (query.actorUserId !== undefined) {
    params.set('actorUserId', query.actorUserId);
  }
  if (query.targetType !== undefined) {
    params.set('targetType', query.targetType);
  }
  if (query.targetId !== undefined) {
    params.set('targetId', query.targetId);
  }
  if (query.targetUserId !== undefined) {
    params.set('targetUserId', query.targetUserId);
  }
  if (query.status !== undefined) {
    params.set('status', query.status);
  }
  if (query.from !== undefined) {
    params.set('from', query.from instanceof Date ? query.from.toISOString() : String(query.from));
  }
  if (query.to !== undefined) {
    params.set('to', query.to instanceof Date ? query.to.toISOString() : String(query.to));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function buildAdminSupportTicketsQuery(query?: AdminSupportTicketsListQuery): string {
  if (!query) {
    return '';
  }
  const params = new URLSearchParams();
  if (query.page !== undefined) {
    params.set('page', String(query.page));
  }
  if (query.limit !== undefined) {
    params.set('limit', String(query.limit));
  }
  if (query.status !== undefined) {
    params.set('status', query.status);
  }
  if (query.category !== undefined) {
    params.set('category', query.category);
  }
  if (query.priority !== undefined) {
    params.set('priority', query.priority);
  }
  if (query.userId !== undefined) {
    params.set('userId', query.userId);
  }
  if (query.orderId !== undefined) {
    params.set('orderId', query.orderId);
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export function createAdminApi(request: Requester): AdminApi {
  return {
    listDisputes: (query?: DisputesListQuery, accessToken?: string | null) =>
      request<AdminDisputeListResponse>(`/admin/disputes${buildDisputesQuery(query)}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
    resolveAdminDispute: (id: string, body: AdminDisputeResolveBody, accessToken?: string | null) =>
      request<AdminDisputeQueueItem>(`/admin/disputes/${id}/resolve`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
    listKycVerifications: (query?: KycVerificationsListQuery, accessToken?: string | null) =>
      request<AdminKycListResponse>(
        `/admin/kyc-verifications${buildKycVerificationsQuery(query)}`,
        {
          method: 'GET',
          ...withCookies,
          accessToken,
        },
      ),
    approveKycVerification: (id: string, accessToken?: string | null) =>
      request<AdminKycQueueItem>(`/admin/kyc-verifications/${id}/approve`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),
    rejectKycVerification: (id: string, body: AdminKycRejectBody, accessToken?: string | null) =>
      request<AdminKycQueueItem>(`/admin/kyc-verifications/${id}/reject`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
    listOrders: (query?: AdminOrdersListQuery, accessToken?: string | null) =>
      request<AdminOrderListResponse>(`/admin/orders${buildAdminOrdersQuery(query)}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
    markOrderManualReview: (
      id: string,
      body: AdminOrderManualReviewBody,
      accessToken?: string | null,
    ) =>
      request<AdminOrderQueueItem>(`/admin/orders/${id}/mark-manual-review`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
    clearOrderManualReview: (
      id: string,
      body?: AdminOrderClearManualReviewBody,
      accessToken?: string | null,
    ) =>
      request<AdminOrderQueueItem>(`/admin/orders/${id}/clear-manual-review`, {
        method: 'POST',
        body: body ?? {},
        ...withCookies,
        accessToken,
      }),
    recordOrderDecision: (id: string, body: AdminOrderDecisionBody, accessToken?: string | null) =>
      request<AdminOrderQueueItem>(`/admin/orders/${id}/record-decision`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
    flagOrderRisk: (id: string, body: AdminOrderRiskFlagBody, accessToken?: string | null) =>
      request<AdminOrderQueueItem>(`/admin/orders/${id}/flag-risk`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
    clearOrderRisk: (id: string, body?: AdminOrderClearRiskBody, accessToken?: string | null) =>
      request<AdminOrderQueueItem>(`/admin/orders/${id}/clear-risk`, {
        method: 'POST',
        body: body ?? {},
        ...withCookies,
        accessToken,
      }),
    listUsers: (query?: AdminUsersListQuery, accessToken?: string | null) =>
      request<AdminUserListResponse>(`/admin/users${buildAdminUsersQuery(query)}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
    suspendAdminUser: (id: string, body: AdminUserSuspendBody, accessToken?: string | null) =>
      request<AdminUserQueueItem>(`/admin/users/${id}/suspend`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
    unsuspendAdminUser: (id: string, body?: AdminUserUnsuspendBody, accessToken?: string | null) =>
      request<AdminUserQueueItem>(`/admin/users/${id}/unsuspend`, {
        method: 'POST',
        body: body ?? {},
        ...withCookies,
        accessToken,
      }),
    listPayments: (query?: AdminPaymentsListQuery, accessToken?: string | null) =>
      request<AdminPaymentListResponse>(`/admin/payments${buildAdminPaymentsQuery(query)}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
    markPaymentManualReview: (
      id: string,
      body: AdminPaymentManualReviewBody,
      accessToken?: string | null,
    ) =>
      request<AdminPaymentQueueItem>(`/admin/payments/${id}/mark-manual-review`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
    clearPaymentManualReview: (
      id: string,
      body?: AdminPaymentClearManualReviewBody,
      accessToken?: string | null,
    ) =>
      request<AdminPaymentQueueItem>(`/admin/payments/${id}/clear-manual-review`, {
        method: 'POST',
        body: body ?? {},
        ...withCookies,
        accessToken,
      }),
    recordPaymentRefundDecision: (
      id: string,
      body: AdminPaymentRefundDecisionBody,
      accessToken?: string | null,
    ) =>
      request<AdminPaymentQueueItem>(`/admin/payments/${id}/record-refund-decision`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
    recordPaymentReleaseDecision: (
      id: string,
      body: AdminPaymentReleaseDecisionBody,
      accessToken?: string | null,
    ) =>
      request<AdminPaymentQueueItem>(`/admin/payments/${id}/record-release-decision`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
    getSystemHealth: (accessToken?: string | null) =>
      request<AdminSystemHealthResponse>('/admin/system-health', {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
    listAuditLogs: (query?: AdminAuditLogsListQuery, accessToken?: string | null) =>
      request<AdminAuditLogListResponse>(`/admin/audit-logs${buildAdminAuditLogsQuery(query)}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
    listSupportTickets: (query?: AdminSupportTicketsListQuery, accessToken?: string | null) =>
      request<AdminSupportTicketListResponse>(
        `/admin/support-tickets${buildAdminSupportTicketsQuery(query)}`,
        {
          method: 'GET',
          ...withCookies,
          accessToken,
        },
      ),
    updateSupportTicket: (
      id: string,
      body: AdminUpdateSupportTicketBody,
      accessToken?: string | null,
    ) =>
      request<AdminSupportTicketQueueItem>(`/admin/support-tickets/${id}`, {
        method: 'PATCH',
        body,
        ...withCookies,
        accessToken,
      }),
  };
}

export type { AdminApi } from './admin.types';
