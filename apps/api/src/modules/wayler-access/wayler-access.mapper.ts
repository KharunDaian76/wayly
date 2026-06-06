import type { WaylerAccessPass } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';
import type { WaylerAccessPassSummary, WaylerAccessState } from '@wayly/types';
import { WaylerAccessPassProvider, WaylerAccessPassStatus } from '@wayly/types';

function decimalToString(value: Decimal): string {
  return value.toString();
}

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/** Maps a Prisma WaylerAccessPass to the safe API summary shape. */
export function toWaylerAccessPassSummary(record: WaylerAccessPass): WaylerAccessPassSummary {
  return {
    id: record.id,
    waylerId: record.waylerId,
    status: record.status as WaylerAccessPassStatus,
    provider: record.provider as WaylerAccessPassProvider,
    currency: record.currency,
    amount: decimalToString(record.amount),
    providerPaymentId: record.providerPaymentId,
    accessDate: record.accessDate.toISOString(),
    startsAt: record.startsAt.toISOString(),
    expiresAt: record.expiresAt.toISOString(),
    activatedAt: toIso(record.activatedAt),
    cancelledAt: toIso(record.cancelledAt),
    refundedAt: toIso(record.refundedAt),
    failedAt: toIso(record.failedAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/** Builds current Wayler work access state for paywall checks. */
export function toWaylerAccessState(
  activePass: WaylerAccessPass | null,
  checkedAt: Date,
): WaylerAccessState {
  return {
    hasActiveAccess: activePass !== null,
    activePass: activePass ? toWaylerAccessPassSummary(activePass) : null,
    checkedAt: checkedAt.toISOString(),
  };
}
