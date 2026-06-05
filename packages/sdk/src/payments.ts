import type { PaymentIntentSummary } from '@wayly/types';

import type { PaymentsApi } from './payments.types';
import type { RequestOptions } from './types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

export function createPaymentsApi(request: Requester): PaymentsApi {
  return {
    mockAuthorizeOrder: (orderId, accessToken) =>
      request<PaymentIntentSummary>(`/payments/orders/${orderId}/mock-authorize`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),

    mockHoldEscrow: (paymentIntentId, accessToken) =>
      request<PaymentIntentSummary>(`/payments/${paymentIntentId}/mock-hold-escrow`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),

    mockRelease: (paymentIntentId, accessToken) =>
      request<PaymentIntentSummary>(`/payments/${paymentIntentId}/mock-release`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),

    forOrder: (orderId, accessToken) =>
      request<PaymentIntentSummary>(`/payments/orders/${orderId}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
  };
}

export type { PaymentsApi } from './payments.types';
