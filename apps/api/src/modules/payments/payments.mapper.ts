import type { PaymentIntent } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';
import type { PaymentIntentSummary } from '@wayly/types';
import { PaymentProvider, PaymentStatus } from '@wayly/types';

function decimalToString(value: Decimal | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  return value.toString();
}

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/** Maps a Prisma PaymentIntent to the safe API summary shape. */
export function toPaymentIntentSummary(record: PaymentIntent): PaymentIntentSummary {
  return {
    id: record.id,
    orderId: record.orderId,
    payerId: record.payerId,
    payeeId: record.payeeId,
    provider: record.provider as PaymentProvider,
    status: record.status as PaymentStatus,
    currency: record.currency,
    amount: decimalToString(record.amount)!,
    platformFeeAmount: decimalToString(record.platformFeeAmount),
    escrowAmount: decimalToString(record.escrowAmount),
    providerPaymentId: record.providerPaymentId,
    authorizedAt: toIso(record.authorizedAt),
    escrowedAt: toIso(record.escrowedAt),
    releasedAt: toIso(record.releasedAt),
    refundedAt: toIso(record.refundedAt),
    failedAt: toIso(record.failedAt),
    cancelledAt: toIso(record.cancelledAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
