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
