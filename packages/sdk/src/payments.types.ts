import type { PaymentIntentSummary } from '@wayly/types';

export interface PaymentsApi {
  mockAuthorizeOrder: (
    orderId: string,
    accessToken?: string | null,
  ) => Promise<PaymentIntentSummary>;
  mockHoldEscrow: (
    paymentIntentId: string,
    accessToken?: string | null,
  ) => Promise<PaymentIntentSummary>;
  mockRelease: (
    paymentIntentId: string,
    accessToken?: string | null,
  ) => Promise<PaymentIntentSummary>;
  forOrder: (orderId: string, accessToken?: string | null) => Promise<PaymentIntentSummary>;
}
