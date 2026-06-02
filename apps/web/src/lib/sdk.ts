import { createApiClient } from '@wayly/sdk';

import { getAccessToken } from '@/lib/auth/token-store';

import { clientEnv } from './env';

/** Configured Wayly API client (singleton for the browser). */
export const api = createApiClient({
  baseUrl: clientEnv.apiUrl,
  getAuthToken: () => getAccessToken(),
});
