import type { WaylerAvailability } from '@prisma/client';
import type { Decimal } from '@prisma/client/runtime/library';
import type { WaylerAvailabilityDetail, WaylerAvailabilitySummary } from '@wayly/types';
import { TripDirection, WaylerAvailabilityStatus, WaylerAvailabilityType } from '@wayly/types';

function decimalToString(value: Decimal | null | undefined): string | null {
  if (value == null) {
    return null;
  }
  return value.toString();
}

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/** Maps a Prisma WaylerAvailability to the safe API summary shape. */
export function toWaylerAvailabilitySummary(record: WaylerAvailability): WaylerAvailabilitySummary {
  return {
    id: record.id,
    waylerId: record.waylerId,
    type: record.type as WaylerAvailabilityType,
    status: record.status as WaylerAvailabilityStatus,
    originCountry: record.originCountry,
    originCity: record.originCity,
    originRegion: record.originRegion,
    destinationCountry: record.destinationCountry,
    destinationCity: record.destinationCity,
    destinationRegion: record.destinationRegion,
    availableFrom: record.availableFrom.toISOString(),
    availableTo: toIso(record.availableTo),
    departureDate: toIso(record.departureDate),
    returnDate: toIso(record.returnDate),
    tripDirection: (record.tripDirection as TripDirection | null) ?? null,
    maxPackages: record.maxPackages,
    maxWeightKg: decimalToString(record.maxWeightKg),
    notes: record.notes,
    isPublic: record.isPublic,
    publishedAt: toIso(record.publishedAt),
    pausedAt: toIso(record.pausedAt),
    cancelledAt: toIso(record.cancelledAt),
    expiresAt: toIso(record.expiresAt),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/** Maps a Prisma WaylerAvailability to the safe API detail shape. */
export function toWaylerAvailabilityDetail(record: WaylerAvailability): WaylerAvailabilityDetail {
  return toWaylerAvailabilitySummary(record);
}
