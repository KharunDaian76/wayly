import type { ISODateString } from './common';
import type { NotificationEntityType, NotificationType } from './enums';

/** Compact in-app notification for lists and feeds. */
export interface NotificationSummary {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  linkHref: string | null;
  entityType: NotificationEntityType | null;
  entityId: string | null;
  readAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Paginated notification list for the current user. */
export interface NotificationListResponse {
  items: NotificationSummary[];
  page: number;
  limit: number;
  total: number;
  unreadCount: number;
}

/** GET /notifications/me/unread-count response. */
export interface NotificationUnreadCountResponse {
  unreadCount: number;
}

/** PATCH /notifications/read-all response. */
export interface NotificationMarkAllReadResponse {
  updatedCount: number;
  unreadCount: number;
}
