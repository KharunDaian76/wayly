import type { ISODateString } from './common';
import type { WaylerAvailabilityRequestStatus } from './enums';

/** Compact Sender request to a published Wayler availability/trip. */
export interface WaylerAvailabilityRequestSummary {
  id: string;
  availabilityId: string;
  senderId: string;
  waylerId: string;
  status: WaylerAvailabilityRequestStatus;
  title: string;
  packageDescription: string;
  pickupCountry: string;
  pickupCity: string;
  pickupAddress: string | null;
  dropoffCountry: string;
  dropoffCity: string;
  dropoffAddress: string | null;
  desiredPickupFrom: ISODateString | null;
  desiredPickupTo: ISODateString | null;
  desiredDeliveryFrom: ISODateString | null;
  desiredDeliveryTo: ISODateString | null;
  proposedRewardCents: number;
  currency: string;
  message: string | null;
  responseMessage: string | null;
  acceptedAt: ISODateString | null;
  declinedAt: ISODateString | null;
  cancelledAt: ISODateString | null;
  expiresAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Full Sender availability request payload. */
export type WaylerAvailabilityRequestDetail = WaylerAvailabilityRequestSummary;

/** Paginated Wayler availability request list. */
export interface WaylerAvailabilityRequestListResponse {
  items: WaylerAvailabilityRequestSummary[];
  page: number;
  limit: number;
  total: number;
}
