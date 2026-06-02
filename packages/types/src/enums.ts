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

/** Contextual user roles (a user may act as both sender and wayler). */
export const UserRole = {
  SENDER: 'SENDER',
  WAYLER: 'WAYLER',
  ADMIN: 'ADMIN',
  ARBITRATOR: 'ARBITRATOR',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Notification categories routed across push / in-app / email. */
export const NotificationType = {
  ORDER_UPDATE: 'ORDER_UPDATE',
  OFFER_RECEIVED: 'OFFER_RECEIVED',
  PAYMENT_UPDATE: 'PAYMENT_UPDATE',
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  DISPUTE_UPDATE: 'DISPUTE_UPDATE',
  KYC_UPDATE: 'KYC_UPDATE',
  SYSTEM: 'SYSTEM',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
