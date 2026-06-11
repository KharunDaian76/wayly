import type { WaylerAvailabilityRequest } from '@prisma/client';
import type {
  WaylerAvailabilityRequestDetail,
  WaylerAvailabilityRequestSummary,
} from '@wayly/types';
import { WaylerAvailabilityRequestStatus } from '@wayly/types';

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/** Maps a Prisma WaylerAvailabilityRequest to the safe API summary shape. */
export function toWaylerAvailabilityRequestSummary(
  record: WaylerAvailabilityRequest,
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
  };
}

/** Maps a Prisma WaylerAvailabilityRequest to the safe API detail shape. */
export function toWaylerAvailabilityRequestDetail(
  record: WaylerAvailabilityRequest,
): WaylerAvailabilityRequestDetail {
  return toWaylerAvailabilityRequestSummary(record);
}
