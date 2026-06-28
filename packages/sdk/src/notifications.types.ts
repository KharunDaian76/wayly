import type {
  NotificationListResponse,
  NotificationMarkAllReadResponse,
  NotificationSummary,
  NotificationUnreadCountResponse,
} from '@wayly/types';

/** GET /notifications/me query parameters. */
export interface NotificationsListQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationsApi {
  listMine(
    query?: NotificationsListQuery,
    accessToken?: string | null,
  ): Promise<NotificationListResponse>;
  /** @deprecated Use listMine */
  list(
    query?: NotificationsListQuery,
    accessToken?: string | null,
  ): Promise<NotificationListResponse>;
  unreadCount(accessToken?: string | null): Promise<NotificationUnreadCountResponse>;
  markRead(id: string, accessToken?: string | null): Promise<NotificationSummary>;
  markAllRead(accessToken?: string | null): Promise<NotificationMarkAllReadResponse>;
}

export type {
  NotificationListResponse,
  NotificationMarkAllReadResponse,
  NotificationSummary,
  NotificationUnreadCountResponse,
};
