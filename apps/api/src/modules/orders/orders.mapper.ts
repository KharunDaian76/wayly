import type { DeliveryOrder } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';
import type { DeliveryOrderDetail, DeliveryOrderSummary } from '@wayly/types';
import { DeliveryOrderStatus, DeliveryOrderType, PackageSize } from '@wayly/types';

function decimalToString(value: Decimal | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  return value.toString();
}

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/** Maps a Prisma DeliveryOrder to the compact public list shape. */
export function toDeliveryOrderSummary(record: DeliveryOrder): DeliveryOrderSummary {
  return {
    id: record.id,
    senderId: record.senderId,
    acceptedWaylerId: record.acceptedWaylerId,
    status: record.status as DeliveryOrderStatus,
    type: record.type as DeliveryOrderType,
    title: record.title,
    pickupCountry: record.pickupCountry,
    pickupCity: record.pickupCity,
    dropoffCountry: record.dropoffCountry,
    dropoffCity: record.dropoffCity,
    currency: record.currency,
    offeredRewardAmount: decimalToString(record.offeredRewardAmount),
    escrowRequired: record.escrowRequired,
    createdAt: record.createdAt.toISOString(),
    publishedAt: toIso(record.publishedAt),
  };
}

/** Maps a Prisma DeliveryOrder to the full safe public detail shape. */
export function toDeliveryOrderDetail(record: DeliveryOrder): DeliveryOrderDetail {
  return {
    ...toDeliveryOrderSummary(record),
    description: record.description,
    packageSize: record.packageSize as PackageSize | null,
    packageWeightKg: decimalToString(record.packageWeightKg),
    pickupAddressText: record.pickupAddressText,
    pickupLat: decimalToString(record.pickupLat),
    pickupLng: decimalToString(record.pickupLng),
    dropoffAddressText: record.dropoffAddressText,
    dropoffLat: decimalToString(record.dropoffLat),
    dropoffLng: decimalToString(record.dropoffLng),
    pickupDateFrom: toIso(record.pickupDateFrom),
    pickupDateTo: toIso(record.pickupDateTo),
    deliveryDeadline: toIso(record.deliveryDeadline),
    notes: record.notes,
    updatedAt: record.updatedAt.toISOString(),
    acceptedAt: toIso(record.acceptedAt),
    cancelledAt: toIso(record.cancelledAt),
    deliveredAt: toIso(record.deliveredAt),
    proofNote: record.proofNote,
    proofConfirmationCode: record.proofConfirmationCode,
    proofSubmittedAt: toIso(record.proofSubmittedAt),
    proofSubmittedById: record.proofSubmittedById,
  };
}
