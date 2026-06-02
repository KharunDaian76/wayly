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
