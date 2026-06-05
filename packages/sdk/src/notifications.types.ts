import type { NotificationListResponse, NotificationSummary } from '@wayly/types';

/** GET /notifications query parameters. */
export interface NotificationsListQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationsUnreadCountResponse {
  unreadTotal: number;
}

export interface NotificationsMarkAllReadResponse {
  updatedCount: number;
  unreadTotal: number;
}

export interface NotificationsApi {
  list(
    query?: NotificationsListQuery,
    accessToken?: string | null,
  ): Promise<NotificationListResponse>;
  unreadCount(accessToken?: string | null): Promise<NotificationsUnreadCountResponse>;
  markRead(id: string, accessToken?: string | null): Promise<NotificationSummary>;
  markAllRead(accessToken?: string | null): Promise<NotificationsMarkAllReadResponse>;
}

export type { NotificationListResponse, NotificationSummary };
