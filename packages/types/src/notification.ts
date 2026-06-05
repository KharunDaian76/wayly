import type { ISODateString } from './common';
import type { NotificationType } from './enums';

/** Compact notification for lists and feeds. */
export interface NotificationSummary {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  relatedOrderId: string | null;
  readAt: ISODateString | null;
  createdAt: ISODateString;
}

/** Paginated notification list (API not implemented yet). */
export interface NotificationListResponse {
  items: NotificationSummary[];
  page: number;
  limit: number;
  total: number;
  unreadTotal: number;
}
