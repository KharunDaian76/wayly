import type { ISODateString } from './common';
import type { KycStatus, UserRole } from './enums';

/**
 * Safe, serializable user shape returned by the API (e.g. GET /users/me).
 * Never includes `passwordHash` or other internal/sensitive fields.
 */
export interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  displayName: string;
  avatarUrl: string | null;
  roles: UserRole[];
  verified: boolean;
  kycStatus: KycStatus;
  phoneVerified: boolean;
  connectOnboarded: boolean;
  locale: string;
  country: string | null;
  createdAt: ISODateString;
}

/** Result of register/login/refresh: a short-lived access token + the profile. */
export interface AuthResult {
  accessToken: string;
  user: UserProfile;
}

/** Compact user row for admin/arbitrator trust & safety queue (read-only). */
export interface AdminUserQueueItem {
  id: string;
  displayName: string;
  email: string;
  roles: UserRole[];
  kycStatus: KycStatus;
  verified: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  postedOrdersCount: number;
  acceptedOrdersCount: number;
  disputesCount: number;
  latestActivityAt: ISODateString;
}

/** Paginated admin users queue (GET /admin/users). */
export interface AdminUserListResponse {
  items: AdminUserQueueItem[];
  page: number;
  limit: number;
  total: number;
}
