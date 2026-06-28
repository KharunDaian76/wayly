import type {
  NotificationListResponse,
  NotificationMarkAllReadResponse,
  NotificationSummary,
  NotificationUnreadCountResponse,
} from '@wayly/types';

import type { NotificationsApi, NotificationsListQuery } from './notifications.types';
import type { RequestOptions } from './types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

function buildNotificationsQuery(
  query?: NotificationsListQuery,
): Record<string, string> | undefined {
  if (!query) {
    return undefined;
  }
  return {
    ...(query.page !== undefined ? { page: String(query.page) } : {}),
    ...(query.limit !== undefined ? { limit: String(query.limit) } : {}),
    ...(query.unreadOnly !== undefined ? { unreadOnly: query.unreadOnly ? 'true' : 'false' } : {}),
  };
}

export function createNotificationsApi(request: Requester): NotificationsApi {
  const listMine = (query?: NotificationsListQuery, accessToken?: string | null) =>
    request<NotificationListResponse>('/notifications/me', {
      method: 'GET',
      query: buildNotificationsQuery(query),
      ...withCookies,
      accessToken,
    });

  return {
    listMine,
    list: listMine,
    unreadCount: (accessToken?: string | null) =>
      request<NotificationUnreadCountResponse>('/notifications/me/unread-count', {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),
    markRead: (id: string, accessToken?: string | null) =>
      request<NotificationSummary>(`/notifications/${id}/read`, {
        method: 'PATCH',
        ...withCookies,
        accessToken,
      }),
    markAllRead: (accessToken?: string | null) =>
      request<NotificationMarkAllReadResponse>('/notifications/read-all', {
        method: 'PATCH',
        ...withCookies,
        accessToken,
      }),
  };
}

export type { NotificationsApi } from './notifications.types';
