import type { KycStatusView, KycVerificationSummary } from '@wayly/types';

import type { KycApi, KycMockRejectBody, KycStartBody } from './kyc.types';
import type { RequestOptions } from './types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

export function createKycApi(request: Requester): KycApi {
  return {
    status: (accessToken?: string | null) =>
      request<KycStatusView>('/kyc/status', { method: 'GET', ...withCookies, accessToken }),

    start: (body: KycStartBody, accessToken?: string | null) =>
      request<KycVerificationSummary>('/kyc/start', {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),

    mockApprove: (accessToken?: string | null) =>
      request<KycStatusView>('/kyc/mock/approve', {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),

    mockReject: (body: KycMockRejectBody, accessToken?: string | null) =>
      request<KycStatusView>('/kyc/mock/reject', {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),
  };
}

export type { KycApi } from './kyc.types';
