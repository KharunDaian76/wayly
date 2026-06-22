import type {
  AdminDisputeListResponse,
  AdminKycListResponse,
  AdminOrderListResponse,
  AdminUserListResponse,
} from '@wayly/types';

import type { AdminApi } from './admin.types';
import type { DisputesListQuery } from './disputes.types';
import type { KycVerificationsListQuery } from './kyc-admin.types';
import type { AdminOrdersListQuery } from './orders-admin.types';
import type { RequestOptions } from './types';
import type { AdminUsersListQuery } from './users-admin.types';

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
  if (query.search !== undefined) {
    params.set('search', query.search);
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
    listKycVerifications: (query?: KycVerificationsListQuery, accessToken?: string | null) =>
      request<AdminKycListResponse>(
        `/admin/kyc-verifications${buildKycVerificationsQuery(query)}`,
        {
          method: 'GET',
          ...withCookies,
          accessToken,
        },
      ),
    listOrders: (query?: AdminOrdersListQuery, accessToken?: string | null) =>
      request<AdminOrderListResponse>(`/admin/orders${buildAdminOrdersQuery(query)}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
    listUsers: (query?: AdminUsersListQuery, accessToken?: string | null) =>
      request<AdminUserListResponse>(`/admin/users${buildAdminUsersQuery(query)}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
  };
}

export type { AdminApi } from './admin.types';
