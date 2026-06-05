import type { NotificationListResponse, NotificationSummary } from '@wayly/types';

import type {
  NotificationsApi,
  NotificationsListQuery,
  NotificationsMarkAllReadResponse,
  NotificationsUnreadCountResponse,
} from './notifications.types';
import type { RequestOptions } from './types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

export function createNotificationsApi(request: Requester): NotificationsApi {
  return {
    list: (query?: NotificationsListQuery, accessToken?: string | null) =>
      request<NotificationListResponse>('/notifications', {
        method: 'GET',
        query: query
          ? {
              ...(query.page !== undefined ? { page: query.page } : {}),
              ...(query.limit !== undefined ? { limit: query.limit } : {}),
              ...(query.unreadOnly !== undefined
                ? { unreadOnly: query.unreadOnly ? 'true' : 'false' }
                : {}),
            }
          : undefined,
        ...withCookies,
        accessToken,
      }),

    unreadCount: (accessToken?: string | null) =>
      request<NotificationsUnreadCountResponse>('/notifications/unread-count', {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),

    markRead: (id: string, accessToken?: string | null) =>
      request<NotificationSummary>(`/notifications/${id}/read`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),

    markAllRead: (accessToken?: string | null) =>
      request<NotificationsMarkAllReadResponse>('/notifications/read-all', {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),
  };
}

export type { NotificationsApi } from './notifications.types';
