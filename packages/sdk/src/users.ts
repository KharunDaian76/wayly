import type { UserProfile } from '@wayly/types';

import type { UpdateProfileBody, UsersApi } from './auth.types';
import type { RequestOptions } from './types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

export function createUsersApi(request: Requester): UsersApi {
  return {
    me: (accessToken?: string | null) =>
      request<UserProfile>('/users/me', { method: 'GET', ...withCookies, accessToken }),

    updateMe: (body: UpdateProfileBody, accessToken?: string | null) =>
      request<UserProfile>('/users/me', {
        method: 'PATCH',
        body,
        ...withCookies,
        accessToken,
      }),
  };
}
