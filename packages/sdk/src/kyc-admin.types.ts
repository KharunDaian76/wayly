import type { KycStatus } from '@wayly/types';

/** Query parameters for GET /admin/kyc-verifications. */
export interface KycVerificationsListQuery {
  page?: number;
  limit?: number;
  status?: KycStatus;
  userId?: string;
  country?: string;
}

/** Body for POST /admin/kyc-verifications/:id/reject. */
export interface AdminKycRejectBody {
  rejectionReason: string;
}
