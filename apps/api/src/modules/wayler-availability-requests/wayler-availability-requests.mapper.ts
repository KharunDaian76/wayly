import type { WaylerAvailabilityRequest } from '@prisma/client';
import type {
  WaylerAvailabilityRequestDetail,
  WaylerAvailabilityRequestSummary,
} from '@wayly/types';
import { WaylerAvailabilityRequestStatus } from '@wayly/types';

type AvailabilityRequestRecord = WaylerAvailabilityRequest & {
  deliveryOrder?: { id: string } | null;
};

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/** Maps a Prisma WaylerAvailabilityRequest to the safe API summary shape. */
export function toWaylerAvailabilityRequestSummary(
  record: AvailabilityRequestRecord,
): WaylerAvailabilityRequestSummary {
  return {
    id: record.id,
    availabilityId: record.availabilityId,
    senderId: record.senderId,
    waylerId: record.waylerId,
    status: record.status as WaylerAvailabilityRequestStatus,
    title: record.title,
    packageDescription: record.packageDescription,
    pickupCountry: record.pickupCountry,
    pickupCity: record.pickupCity,
    pickupAddress: record.pickupAddress,
    dropoffCountry: record.dropoffCountry,
    dropoffCity: record.dropoffCity,
    dropoffAddress: record.dropoffAddress,
    desiredPickupFrom: toIso(record.desiredPickupFrom),
    desiredPickupTo: toIso(record.desiredPickupTo),
    desiredDeliveryFrom: toIso(record.desiredDeliveryFrom),
    desiredDeliveryTo: toIso(record.desiredDeliveryTo),
    proposedRewardCents: record.proposedRewardCents,
    currency: record.currency,
    message: record.message,
    responseMessage: record.responseMessage,
    acceptedAt: toIso(record.acceptedAt),
    declinedAt: toIso(record.declinedAt),
    cancelledAt: toIso(record.cancelledAt),
    expiresAt: toIso(record.expiresAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    deliveryOrderId: record.deliveryOrder?.id ?? null,
  };
}

/** Maps a Prisma WaylerAvailabilityRequest to the safe API detail shape. */
export function toWaylerAvailabilityRequestDetail(
  record: AvailabilityRequestRecord,
): WaylerAvailabilityRequestDetail {
  return toWaylerAvailabilityRequestSummary(record);
}
