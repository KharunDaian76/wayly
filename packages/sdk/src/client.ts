import { createAuthApi } from './auth';
import type { AuthApi, UsersApi } from './auth.types';
import { ApiError } from './errors';
import { createHealthApi, type HealthApi } from './health';
import { createKycApi } from './kyc';
import type { KycApi } from './kyc.types';
import type { ApiClientOptions, RequestOptions } from './types';
import { createUsersApi } from './users';

const API_PREFIX = '/api/v1';

/**
 * Typed fetch wrapper. Centralizes base URL + versioning, auth-token injection,
 * JSON (de)serialization, and uniform error handling. Business resource groups
 * (auth, orders, payments, chat, ...) attach as additional namespaces later.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;
  private readonly getAuthToken?: ApiClientOptions['getAuthToken'];
  private readonly defaultHeaders: Record<string, string>;

  /** Health endpoint group. */
  readonly health: HealthApi;

  /** Auth endpoints (cookie + Bearer access token). */
  readonly auth: AuthApi;

  /** Current-user profile endpoints. */
  readonly users: UsersApi;

  /** KYC verification endpoints. */
  readonly kyc: KycApi;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getAuthToken = options.getAuthToken;
    this.defaultHeaders = options.defaultHeaders ?? {};

    // `fetch` must keep its original `this` (Window/global). Storing an unbound
    // reference and calling it as `this.fetchImpl(...)` throws "Illegal
    // invocation" in browsers, so bind it to its owning context.
    const baseFetch = options.fetch ?? globalThis.fetch;
    if (!baseFetch) {
      throw new Error('No fetch implementation available; pass `fetch` in ApiClientOptions.');
    }
    this.fetchImpl = options.fetch ? options.fetch : baseFetch.bind(globalThis);

    this.health = createHealthApi((path, opts) => this.request(path, opts));
    this.auth = createAuthApi((path, opts) => this.request(path, opts));
    this.users = createUsersApi((path, opts) => this.request(path, opts));
    this.kyc = createKycApi((path, opts) => this.request(path, opts));
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      body,
      headers,
      signal,
      query,
      acceptStatuses = [],
      credentials = 'include',
      accessToken: explicitToken,
    } = options;

    const url = new URL(`${this.baseUrl}${API_PREFIX}${path}`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }

    const finalHeaders: Record<string, string> = {
      accept: 'application/json',
      ...this.defaultHeaders,
      ...headers,
    };
    if (body !== undefined) {
      finalHeaders['content-type'] = 'application/json';
    }

    const token =
      explicitToken !== undefined
        ? explicitToken
        : this.getAuthToken
          ? await this.getAuthToken()
          : undefined;
    if (token) {
      finalHeaders.authorization = `Bearer ${token}`;
    }

    const response = await this.fetchImpl(url.toString(), {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
      credentials,
    });

    const isJson = response.headers.get('content-type')?.includes('application/json');
    const payload = isJson ? await response.json() : await response.text();

    if (!response.ok && !acceptStatuses.includes(response.status)) {
      throw ApiError.fromResponse(response.status, payload);
    }

    return payload as T;
  }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}
