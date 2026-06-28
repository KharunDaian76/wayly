import type { NotificationEntityType, NotificationType } from '@wayly/types';
import { NotificationEntityType as NotificationEntityTypeEnum } from '@wayly/types';

/** Internal create payload for NotificationsService helpers. */
export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  linkHref?: string | null;
  entityType?: NotificationEntityType | null;
  entityId?: string | null;
}

export function buildOrderNotification(
  userId: string,
  orderId: string,
  type: NotificationType,
  title: string,
  body: string,
): CreateNotificationInput {
  return {
    userId,
    type,
    title,
    body,
    entityType: NotificationEntityTypeEnum.DELIVERY_ORDER,
    entityId: orderId,
    linkHref: orderNotificationLink(orderId),
  };
}

export function buildPaymentNotification(
  userId: string,
  paymentId: string,
  orderId: string,
  type: NotificationType,
  title: string,
  body: string,
): CreateNotificationInput {
  return {
    userId,
    type,
    title,
    body,
    entityType: NotificationEntityTypeEnum.PAYMENT,
    entityId: paymentId,
    linkHref: paymentNotificationLink(),
  };
}

export function appLinkHref(path = '/app'): string {
  return path;
}

export function orderNotificationLink(orderId: string): string {
  return `/app#accepted-order-${orderId}`;
}

export function supportTicketNotificationLink(): string {
  return '/app#support-tickets';
}

export function paymentNotificationLink(): string {
  return '/app#payments';
}

export function availabilityRequestNotificationLink(): string {
  return '/app#wayler-requests';
}
