/**
 * Shared enums for Wayly.
 *
 * Implemented as `const` objects + matching union types: each name is BOTH a
 * runtime value (iterable, usable in validation/DB mapping) AND a type. String
 * values are stable and database-friendly. This is the single source of truth —
 * the API, the web app, and future Prisma mappers all reference these.
 */

/** International/intercity vs local same-city delivery. */
export const DeliveryMode = {
  INTERNATIONAL: 'INTERNATIONAL',
  LOCAL: 'LOCAL',
} as const;
export type DeliveryMode = (typeof DeliveryMode)[keyof typeof DeliveryMode];

/** Order lifecycle (state machine; transitions enforced server-side). */
export const OrderStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  ACCEPTED: 'ACCEPTED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELED: 'CANCELED',
  DISPUTED: 'DISPUTED',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

/** How an order is settled: external/offline vs secure escrow. */
export const PaymentType = {
  OFFLINE: 'OFFLINE',
  ESCROW: 'ESCROW',
} as const;
export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];

/** KYC verification status; gates all core activity until APPROVED. */
export const KycStatus = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type KycStatus = (typeof KycStatus)[keyof typeof KycStatus];

/** Wayler access package durations. */
export const SubscriptionType = {
  DAY_24H: 'DAY_24H',
  MONTH_30D: 'MONTH_30D',
  YEAR: 'YEAR',
} as const;
export type SubscriptionType = (typeof SubscriptionType)[keyof typeof SubscriptionType];

/**
 * Authorization roles. "Sender" and "Wayler" are contextual MODES every user
 * can switch between (not security roles), so they are intentionally absent.
 */
export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  ARBITRATOR: 'ARBITRATOR',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** In-app notification categories (dispatch routes land in a later batch). */
export const NotificationType = {
  ORDER_PUBLISHED: 'ORDER_PUBLISHED',
  ORDER_ACCEPTED: 'ORDER_ACCEPTED',
  ORDER_IN_TRANSIT: 'ORDER_IN_TRANSIT',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  PROOF_SUBMITTED: 'PROOF_SUBMITTED',
  KYC_APPROVED: 'KYC_APPROVED',
  KYC_REJECTED: 'KYC_REJECTED',
  SYSTEM: 'SYSTEM',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

/** Delivery request lifecycle (M4 foundation). */
export const DeliveryOrderStatus = {
  DRAFT: 'DRAFT',
  OPEN: 'OPEN',
  ACCEPTED: 'ACCEPTED',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
} as const;
export type DeliveryOrderStatus = (typeof DeliveryOrderStatus)[keyof typeof DeliveryOrderStatus];

/** Local same-city vs international/intercity delivery request. */
export const DeliveryOrderType = {
  LOCAL: 'LOCAL',
  INTERNATIONAL: 'INTERNATIONAL',
} as const;
export type DeliveryOrderType = (typeof DeliveryOrderType)[keyof typeof DeliveryOrderType];

/** Approximate package size category for a delivery request. */
export const PackageSize = {
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE',
  OVERSIZED: 'OVERSIZED',
} as const;
export type PackageSize = (typeof PackageSize)[keyof typeof PackageSize];

/** Payment intent lifecycle (escrow/Stripe processing lands in a later batch). */
export const PaymentStatus = {
  PENDING: 'PENDING',
  AUTHORIZED: 'AUTHORIZED',
  HELD_IN_ESCROW: 'HELD_IN_ESCROW',
  RELEASED: 'RELEASED',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/** Payment/payout provider (Stripe integration lands in a later batch). */
export const PaymentProvider = {
  MANUAL: 'MANUAL',
  STRIPE: 'STRIPE',
  OTHER: 'OTHER',
} as const;
export type PaymentProvider = (typeof PaymentProvider)[keyof typeof PaymentProvider];

/** Wayler payout lifecycle. */
export const PayoutStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
} as const;
export type PayoutStatus = (typeof PayoutStatus)[keyof typeof PayoutStatus];

/** Ledger line categories for payment/escrow audit trail. */
export const LedgerEntryType = {
  PAYMENT_AUTHORIZED: 'PAYMENT_AUTHORIZED',
  ESCROW_HELD: 'ESCROW_HELD',
  PLATFORM_FEE_CHARGED: 'PLATFORM_FEE_CHARGED',
  PAYOUT_CREATED: 'PAYOUT_CREATED',
  PAYOUT_PAID: 'PAYOUT_PAID',
  REFUND_CREATED: 'REFUND_CREATED',
  ADJUSTMENT: 'ADJUSTMENT',
} as const;
export type LedgerEntryType = (typeof LedgerEntryType)[keyof typeof LedgerEntryType];

/** Dispute lifecycle (API/arbitrator UI lands in a later batch). */
export const DisputeStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  RESOLVED: 'RESOLVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;
export type DisputeStatus = (typeof DisputeStatus)[keyof typeof DisputeStatus];

/** Why a dispute was opened. */
export const DisputeReason = {
  ITEM_NOT_DELIVERED: 'ITEM_NOT_DELIVERED',
  ITEM_DAMAGED: 'ITEM_DAMAGED',
  WRONG_ITEM: 'WRONG_ITEM',
  PAYMENT_ISSUE: 'PAYMENT_ISSUE',
  SAFETY_CONCERN: 'SAFETY_CONCERN',
  OTHER: 'OTHER',
} as const;
export type DisputeReason = (typeof DisputeReason)[keyof typeof DisputeReason];

/** Arbitrator outcome for a resolved dispute. */
export const DisputeResolution = {
  REFUND_SENDER: 'REFUND_SENDER',
  RELEASE_TO_WAYLER: 'RELEASE_TO_WAYLER',
  PARTIAL_REFUND: 'PARTIAL_REFUND',
  NO_ACTION: 'NO_ACTION',
  OTHER: 'OTHER',
} as const;
export type DisputeResolution = (typeof DisputeResolution)[keyof typeof DisputeResolution];

/** Wayler availability / trip listing lifecycle (API/discovery land in a later batch). */
export const WaylerAvailabilityStatus = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
} as const;
export type WaylerAvailabilityStatus =
  (typeof WaylerAvailabilityStatus)[keyof typeof WaylerAvailabilityStatus];

/** Local city availability vs published travel route. */
export const WaylerAvailabilityType = {
  LOCAL_AVAILABILITY: 'LOCAL_AVAILABILITY',
  TRIP_ROUTE: 'TRIP_ROUTE',
} as const;
export type WaylerAvailabilityType =
  (typeof WaylerAvailabilityType)[keyof typeof WaylerAvailabilityType];

/** Trip route direction for Wayler-published routes. */
export const TripDirection = {
  ONE_WAY: 'ONE_WAY',
  RETURN: 'RETURN',
  FLEXIBLE: 'FLEXIBLE',
} as const;
export type TripDirection = (typeof TripDirection)[keyof typeof TripDirection];

/** Daily Wayler work access pass lifecycle (paywall/API land in a later batch). */
export const WaylerAccessPassStatus = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  EXPIRED: 'EXPIRED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
  FAILED: 'FAILED',
} as const;
export type WaylerAccessPassStatus =
  (typeof WaylerAccessPassStatus)[keyof typeof WaylerAccessPassStatus];

/** Payment provider for daily Wayler work access passes. */
export const WaylerAccessPassProvider = {
  MANUAL: 'MANUAL',
  STRIPE: 'STRIPE',
  OTHER: 'OTHER',
} as const;
export type WaylerAccessPassProvider =
  (typeof WaylerAccessPassProvider)[keyof typeof WaylerAccessPassProvider];
