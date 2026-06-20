import { NotificationType, type NotificationType as NotificationTypeValue } from '@wayly/types';

export type AcceptedOrdersPanel = 'sender' | 'wayler';

export function acceptedOrderElementId(orderId: string): string {
  return `accepted-order-${orderId}`;
}

export function acceptedPanelElementId(panel: AcceptedOrdersPanel): string {
  return panel === 'sender' ? 'sender-accepted-panel' : 'wayler-accepted-panel';
}

/** Preferred Accepted panel for order-linked notifications (fallback tries the other panel). */
export function getAcceptedPanelForNotification(type: NotificationTypeValue): AcceptedOrdersPanel {
  switch (type) {
    case NotificationType.ORDER_ACCEPTED:
    case NotificationType.ORDER_IN_TRANSIT:
    case NotificationType.ORDER_DELIVERED:
    case NotificationType.PROOF_SUBMITTED:
      return 'sender';
    default:
      return 'wayler';
  }
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
