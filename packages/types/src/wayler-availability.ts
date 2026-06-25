import type { ISODateString } from './common';
import type { DecimalString } from './delivery-order';
import type { TripDirection, WaylerAvailabilityStatus, WaylerAvailabilityType } from './enums';

/** Compact Wayler availability / trip listing for lists and discovery feeds. */
export interface WaylerAvailabilitySummary {
  id: string;
  waylerId: string;
  type: WaylerAvailabilityType;
  status: WaylerAvailabilityStatus;
  originCountry: string | null;
  originCity: string | null;
  originRegion: string | null;
  destinationCountry: string | null;
  destinationCity: string | null;
  destinationRegion: string | null;
  availableFrom: ISODateString;
  availableTo: ISODateString | null;
  departureDate: ISODateString | null;
  returnDate: ISODateString | null;
  tripDirection: TripDirection | null;
  maxPackages: number | null;
  maxWeightKg: DecimalString | null;
  notes: string | null;
  isPublic: boolean;
  publishedAt: ISODateString | null;
  pausedAt: ISODateString | null;
  cancelledAt: ISODateString | null;
  expiresAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  /** Public trust signal: true when Wayler identity is verified (KYC approved). */
  isWaylerVerified: boolean;
}

/** Full Wayler availability payload (API routes land in a later batch). */
export type WaylerAvailabilityDetail = WaylerAvailabilitySummary;

/** Paginated Wayler availability list (API not implemented yet). */
export interface WaylerAvailabilityListResponse {
  items: WaylerAvailabilitySummary[];
  page: number;
  limit: number;
  total: number;
}

/** Active Wayler count for a location (discovery endpoint lands in a later batch). */
export interface ActiveWaylerCountSummary {
  country: string | null;
  city: string | null;
  region: string | null;
  activeCount: number;
}
