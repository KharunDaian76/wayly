import type { AdminDisputeListResponse, AdminKycListResponse } from '@wayly/types';

import type { DisputesListQuery } from './disputes.types';
import type { KycVerificationsListQuery } from './kyc-admin.types';

/** Admin / operations endpoints (read-only in current batches). */
export interface AdminApi {
  listDisputes(
    query?: DisputesListQuery,
    accessToken?: string | null,
  ): Promise<AdminDisputeListResponse>;
  listKycVerifications(
    query?: KycVerificationsListQuery,
    accessToken?: string | null,
  ): Promise<AdminKycListResponse>;
}

export type { AdminDisputeListResponse, AdminKycListResponse };
