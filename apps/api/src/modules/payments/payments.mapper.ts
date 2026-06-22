import type { PaymentIntent } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';
import type { AdminPaymentQueueItem, PaymentIntentSummary } from '@wayly/types';
import { DisputeStatus, PaymentProvider, PaymentStatus } from '@wayly/types';

function decimalToString(value: Decimal | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  return value.toString();
}

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/** Maps a Prisma PaymentIntent with parties and order to the admin queue shape. */
export function toAdminPaymentQueueItem(
  record: PaymentIntent & {
    payer: { displayName: string; email: string };
    payee: { displayName: string; email: string } | null;
    order: {
      title: string;
      disputes: { status: string }[];
    };
  },
): AdminPaymentQueueItem {
  return {
    id: record.id,
    orderId: record.orderId,
    orderTitle: record.order.title,
    status: record.status as PaymentStatus,
    currency: record.currency,
    amount: decimalToString(record.amount)!,
    platformFeeAmount: decimalToString(record.platformFeeAmount),
    escrowAmount: decimalToString(record.escrowAmount),
    senderDisplayName: record.payer.displayName,
    senderEmail: record.payer.email,
    waylerDisplayName: record.payee?.displayName ?? null,
    waylerEmail: record.payee?.email ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    escrowedAt: toIso(record.escrowedAt),
    releasedAt: toIso(record.releasedAt),
    latestDisputeStatus: record.order.disputes[0]
      ? (record.order.disputes[0].status as DisputeStatus)
      : null,
  };
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
