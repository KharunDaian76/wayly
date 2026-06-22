import type { KycStatus, UserRole } from '@wayly/types';

/** Query parameters for GET /admin/users. */
export interface AdminUsersListQuery {
  page?: number;
  limit?: number;
  role?: UserRole;
  kycStatus?: KycStatus;
  search?: string;
}
