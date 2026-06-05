import type { ISODateString } from './common';
import type { DecimalString } from './delivery-order';
import type { LedgerEntryType, PaymentProvider, PaymentStatus, PayoutStatus } from './enums';

/** Per-order payment intent (API routes land in a later batch). */
export interface PaymentIntentSummary {
  id: string;
  orderId: string;
  payerId: string;
  payeeId: string | null;
  provider: PaymentProvider;
  status: PaymentStatus;
  currency: string;
  amount: DecimalString;
  platformFeeAmount: DecimalString | null;
  escrowAmount: DecimalString | null;
  providerPaymentId: string | null;
  authorizedAt: ISODateString | null;
  escrowedAt: ISODateString | null;
  releasedAt: ISODateString | null;
  refundedAt: ISODateString | null;
  failedAt: ISODateString | null;
  cancelledAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Wayler payout linked to a payment intent. */
export interface PayoutSummary {
  id: string;
  paymentIntentId: string | null;
  userId: string;
  status: PayoutStatus;
  currency: string;
  amount: DecimalString;
  provider: PaymentProvider;
  providerPayoutId: string | null;
  processedAt: ISODateString | null;
  paidAt: ISODateString | null;
  failedAt: ISODateString | null;
  cancelledAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Immutable ledger line for payment/escrow audit trail. */
export interface LedgerEntrySummary {
  id: string;
  paymentIntentId: string | null;
  payoutId: string | null;
  orderId: string | null;
  userId: string | null;
  type: LedgerEntryType;
  currency: string;
  amount: DecimalString;
  description: string | null;
  createdAt: ISODateString;
}
