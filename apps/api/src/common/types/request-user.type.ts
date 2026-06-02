import type { KycStatus, UserRole } from '@wayly/types';

/** Authenticated user attached to the request after JWT validation. */
export interface RequestUser {
  id: string;
  email: string;
  roles: UserRole[];
  verified: boolean;
  kycStatus: KycStatus;
  phoneVerified: boolean;
}
