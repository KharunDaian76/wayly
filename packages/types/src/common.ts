/**
 * Core domain primitives reused across features (NOT business DTOs).
 * Establishing these once avoids divergent money/geo representations later.
 */

/** Branded-ish identifier alias (UUID strings in practice). */
export type Id = string;

/** ISO-8601 timestamp string (e.g. "2026-01-01T12:00:00.000Z"). */
export type ISODateString = string;

/** Money is always integer minor units (cents) + ISO 4217 currency. Never floats. */
export interface Money {
  amountCents: number;
  currency: string;
}

/** WGS84 geographic point used for pickup/dropoff/route/tracking. */
export interface GeoPoint {
  lat: number;
  lng: number;
}
