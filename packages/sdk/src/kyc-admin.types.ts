import type { KycStatus } from '@wayly/types';

/** Query parameters for GET /admin/kyc-verifications. */
export interface KycVerificationsListQuery {
  page?: number;
  limit?: number;
  status?: KycStatus;
}
