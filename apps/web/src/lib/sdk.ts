import { createApiClient } from '@wayly/sdk';

import { clientEnv } from './env';

/**
 * Configured Wayly API client (singleton for the browser).
 * Auth-token injection is added in M1 once sessions exist.
 */
export const api = createApiClient({
  baseUrl: clientEnv.apiUrl,
});
