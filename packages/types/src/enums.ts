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

/** Account moderation status (admin suspend/unsuspend v1). */
export const UserAccountStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;
export type UserAccountStatus = (typeof UserAccountStatus)[keyof typeof UserAccountStatus];

/** Admin metadata-only payment review status (does not change PaymentStatus). */
export const PaymentAdminReviewStatus = {
  NONE: 'NONE',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  REFUND_DECISION_RECORDED: 'REFUND_DECISION_RECORDED',
  RELEASE_DECISION_RECORDED: 'RELEASE_DECISION_RECORDED',
} as const;
export type PaymentAdminReviewStatus =
  (typeof PaymentAdminReviewStatus)[keyof typeof PaymentAdminReviewStatus];

/** Admin metadata-only payment review decision (recommendation only; no money movement). */
export const PaymentAdminReviewDecision = {
  RECOMMEND_FULL_REFUND: 'RECOMMEND_FULL_REFUND',
  RECOMMEND_PARTIAL_REFUND: 'RECOMMEND_PARTIAL_REFUND',
  RECOMMEND_RELEASE: 'RECOMMEND_RELEASE',
  NO_ACTION: 'NO_ACTION',
  OTHER: 'OTHER',
} as const;
export type PaymentAdminReviewDecision =
  (typeof PaymentAdminReviewDecision)[keyof typeof PaymentAdminReviewDecision];

/** Admin metadata-only order review status (does not change DeliveryOrder.status). */
export const OrderAdminReviewStatus = {
  NONE: 'NONE',
  MANUAL_REVIEW: 'MANUAL_REVIEW',
  DECISION_RECORDED: 'DECISION_RECORDED',
  RISK_FLAGGED: 'RISK_FLAGGED',
} as const;
export type OrderAdminReviewStatus =
  (typeof OrderAdminReviewStatus)[keyof typeof OrderAdminReviewStatus];

/** Admin metadata-only order review decision (ops recommendation only). */
export const OrderAdminReviewDecision = {
  MONITOR: 'MONITOR',
  ESCALATE_PAYMENT: 'ESCALATE_PAYMENT',
  ESCALATE_DISPUTE: 'ESCALATE_DISPUTE',
  NO_ACTION: 'NO_ACTION',
  OTHER: 'OTHER',
} as const;
export type OrderAdminReviewDecision =
  (typeof OrderAdminReviewDecision)[keyof typeof OrderAdminReviewDecision];

/** In-app notification severity (foundation v1 — not push/email/SMS). */
export const NotificationType = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ACTION_REQUIRED: 'ACTION_REQUIRED',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

/** Linked entity for in-app notifications. */
export const NotificationEntityType = {
  SUPPORT_TICKET: 'SUPPORT_TICKET',
  DELIVERY_ORDER: 'DELIVERY_ORDER',
  WAYLER_AVAILABILITY_REQUEST: 'WAYLER_AVAILABILITY_REQUEST',
  PAYMENT: 'PAYMENT',
  DISPUTE: 'DISPUTE',
  SYSTEM: 'SYSTEM',
} as const;
export type NotificationEntityType =
  (typeof NotificationEntityType)[keyof typeof NotificationEntityType];

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

/** How a delivery order was created (Sender-posted vs availability-request conversion). */
export const DeliveryOrderSource = {
  SENDER_POSTED_ORDER: 'SENDER_POSTED_ORDER',
  WAYLER_AVAILABILITY_REQUEST: 'WAYLER_AVAILABILITY_REQUEST',
} as const;
export type DeliveryOrderSource = (typeof DeliveryOrderSource)[keyof typeof DeliveryOrderSource];

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

/** Sender request to a published Wayler availability/trip lifecycle (API/UI land in a later batch). */
export const WaylerAvailabilityRequestStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;
export type WaylerAvailabilityRequestStatus =
  (typeof WaylerAvailabilityRequestStatus)[keyof typeof WaylerAvailabilityRequestStatus];

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

/** User support ticket category (Support Ticket foundation v1). */
export const SupportTicketCategory = {
  GENERAL: 'GENERAL',
  ACCOUNT: 'ACCOUNT',
  SAFETY: 'SAFETY',
  PAYMENT_STATUS: 'PAYMENT_STATUS',
  ORDER_ISSUE: 'ORDER_ISSUE',
  BUG_REPORT: 'BUG_REPORT',
  OTHER: 'OTHER',
} as const;
export type SupportTicketCategory =
  (typeof SupportTicketCategory)[keyof typeof SupportTicketCategory];

/** User support ticket lifecycle status. */
export const SupportTicketStatus = {
  OPEN: 'OPEN',
  UNDER_REVIEW: 'UNDER_REVIEW',
  WAITING_FOR_USER: 'WAITING_FOR_USER',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
export type SupportTicketStatus = (typeof SupportTicketStatus)[keyof typeof SupportTicketStatus];

/** User support ticket priority. */
export const SupportTicketPriority = {
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;
export type SupportTicketPriority =
  (typeof SupportTicketPriority)[keyof typeof SupportTicketPriority];

/** Author role for threaded support ticket messages. */
export const SupportTicketMessageAuthorRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type SupportTicketMessageAuthorRole =
  (typeof SupportTicketMessageAuthorRole)[keyof typeof SupportTicketMessageAuthorRole];

/** Party role context for post-delivery reviews. */
export const ReviewPartyRole = {
  SENDER: 'SENDER',
  WAYLER: 'WAYLER',
} as const;
export type ReviewPartyRole = (typeof ReviewPartyRole)[keyof typeof ReviewPartyRole];
