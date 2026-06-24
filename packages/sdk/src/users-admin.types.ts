import type { KycStatus, UserAccountStatus, UserRole } from '@wayly/types';

/** Query parameters for GET /admin/users. */
export interface AdminUsersListQuery {
  page?: number;
  limit?: number;
  role?: UserRole;
  kycStatus?: KycStatus;
  accountStatus?: UserAccountStatus;
  search?: string;
}

/** Body for POST /admin/users/:id/suspend. */
export interface AdminUserSuspendBody {
  reason: string;
}

/** Body for POST /admin/users/:id/unsuspend. */
export interface AdminUserUnsuspendBody {
  note?: string;
}
