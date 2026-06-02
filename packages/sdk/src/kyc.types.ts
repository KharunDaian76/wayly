import type { KycStatusView, KycVerificationSummary } from '@wayly/types';

/** POST /kyc/start */
export interface KycStartBody {
  country?: string;
  levelName?: string;
}

/** POST /kyc/mock/reject */
export interface KycMockRejectBody {
  rejectionReason?: string;
}

export interface KycApi {
  status(accessToken?: string | null): Promise<KycStatusView>;
  start(body: KycStartBody, accessToken?: string | null): Promise<KycVerificationSummary>;
  mockApprove(accessToken?: string | null): Promise<KycStatusView>;
  mockReject(body: KycMockRejectBody, accessToken?: string | null): Promise<KycStatusView>;
}

export type { KycStatusView, KycVerificationSummary };
