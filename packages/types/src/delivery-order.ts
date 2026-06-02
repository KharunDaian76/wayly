import type { ISODateString } from './common';
import type { DeliveryOrderStatus, DeliveryOrderType, PackageSize } from './enums';

/**
 * Decimal amounts serialized as strings in JSON (matches Prisma Decimal mapping).
 */
export type DecimalString = string;

/** Compact delivery order for lists and feeds. */
export interface DeliveryOrderSummary {
  id: string;
  senderId: string;
  acceptedWaylerId: string | null;
  status: DeliveryOrderStatus;
  type: DeliveryOrderType;
  title: string;
  pickupCountry: string | null;
  pickupCity: string | null;
  dropoffCountry: string | null;
  dropoffCity: string | null;
  currency: string;
  offeredRewardAmount: DecimalString | null;
  escrowRequired: boolean;
  createdAt: ISODateString;
  publishedAt: ISODateString | null;
}

/** Full safe delivery order payload (no internal payment/escrow ledger fields). */
export interface DeliveryOrderDetail {
  id: string;
  senderId: string;
  acceptedWaylerId: string | null;
  status: DeliveryOrderStatus;
  type: DeliveryOrderType;
  title: string;
  description: string | null;
  packageSize: PackageSize | null;
  packageWeightKg: DecimalString | null;
  pickupCountry: string | null;
  pickupCity: string | null;
  pickupAddressText: string | null;
  pickupLat: DecimalString | null;
  pickupLng: DecimalString | null;
  dropoffCountry: string | null;
  dropoffCity: string | null;
  dropoffAddressText: string | null;
  dropoffLat: DecimalString | null;
  dropoffLng: DecimalString | null;
  pickupDateFrom: ISODateString | null;
  pickupDateTo: ISODateString | null;
  deliveryDeadline: ISODateString | null;
  currency: string;
  offeredRewardAmount: DecimalString | null;
  escrowRequired: boolean;
  notes: string | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  publishedAt: ISODateString | null;
  acceptedAt: ISODateString | null;
  cancelledAt: ISODateString | null;
  deliveredAt: ISODateString | null;
}

/** Payload to create a delivery request (draft or publish in later batches). */
export interface CreateDeliveryOrderInput {
  type: DeliveryOrderType;
  title: string;
  description?: string;
  packageSize?: PackageSize;
  packageWeightKg?: number;
  pickupCountry?: string;
  pickupCity?: string;
  pickupAddressText?: string;
  pickupLat?: number;
  pickupLng?: number;
  dropoffCountry?: string;
  dropoffCity?: string;
  dropoffAddressText?: string;
  dropoffLat?: number;
  dropoffLng?: number;
  pickupDateFrom?: ISODateString;
  pickupDateTo?: ISODateString;
  deliveryDeadline?: ISODateString;
  currency?: string;
  offeredRewardAmount?: number;
  escrowRequired?: boolean;
  notes?: string;
}

/** Partial update for an existing delivery request (draft edits in later batches). */
export type UpdateDeliveryOrderInput = Partial<CreateDeliveryOrderInput>;
