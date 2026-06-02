export type TokenProvider = () => string | null | undefined | Promise<string | null | undefined>;

export interface ApiClientOptions {
  /** API origin, e.g. http://localhost:4000 (the /api/v1 prefix is added). */
  baseUrl: string;
  /** Optional bearer-token provider for authenticated requests (M1+). */
  getAuthToken?: TokenProvider;
  /** Injectable fetch (tests, SSR, native). Defaults to global fetch. */
  fetch?: typeof fetch;
  /** Default headers merged into every request. */
  defaultHeaders?: Record<string, string>;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** JSON-serializable request body. */
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  query?: Record<string, string | number | boolean | undefined>;
  /** Non-2xx statuses to treat as success (e.g. 503 for health checks). */
  acceptStatuses?: number[];
  /** Send cookies (required for httpOnly refresh token). Defaults to `include`. */
  credentials?: RequestCredentials;
  /** Explicit Bearer token; overrides `getAuthToken` when set (including `null`). */
  accessToken?: string | null;
}

/** Shape returned by the backend health endpoints (Terminus). */
export interface HealthResult {
  status: 'ok' | 'error' | 'shutting_down' | string;
  info?: Record<string, { status: string }>;
  error?: Record<string, { status: string; message?: string }>;
  details?: Record<string, { status: string; message?: string }>;
}
