import type { AuthResult } from '@wayly/types';

import type { AuthApi, LoginBody, RegisterBody } from './auth.types';
import type { RequestOptions } from './types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

export function createAuthApi(request: Requester): AuthApi {
  return {
    register: (body: RegisterBody) =>
      request<AuthResult>('/auth/register', { method: 'POST', body, ...withCookies }),

    login: (body: LoginBody) =>
      request<AuthResult>('/auth/login', { method: 'POST', body, ...withCookies }),

    refresh: () => request<AuthResult>('/auth/refresh', { method: 'POST', ...withCookies }),

    logout: (accessToken?: string | null) =>
      request<{ ok: true }>('/auth/logout', {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),
  };
}
