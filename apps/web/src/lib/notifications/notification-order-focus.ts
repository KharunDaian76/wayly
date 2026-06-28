import {
  NotificationEntityType,
  type NotificationEntityType as NotificationEntityTypeValue,
} from '@wayly/types';

export type AcceptedOrdersPanel = 'sender' | 'wayler';

export function acceptedOrderElementId(orderId: string): string {
  return `accepted-order-${orderId}`;
}

export function acceptedPanelElementId(panel: AcceptedOrdersPanel): string {
  return panel === 'sender' ? 'sender-accepted-panel' : 'wayler-accepted-panel';
}

/** Preferred Accepted panel for order-linked notifications. */
export function getAcceptedPanelForNotification(
  entityType: NotificationEntityTypeValue | null,
): AcceptedOrdersPanel {
  if (entityType === NotificationEntityType.DELIVERY_ORDER) {
    return 'sender';
  }
  return 'wayler';
}

export function scrollToAcceptedOrder(orderId: string): void {
  document.getElementById(acceptedOrderElementId(orderId))?.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

export function scrollToAcceptedPanel(panel: AcceptedOrdersPanel): void {
  document.getElementById(acceptedPanelElementId(panel))?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
}

export function resolveOrderIdFromNotification(item: {
  entityType: NotificationEntityTypeValue | null;
  entityId: string | null;
}): string | null {
  if (item.entityType === NotificationEntityType.DELIVERY_ORDER && item.entityId) {
    return item.entityId;
  }
  return null;
}
