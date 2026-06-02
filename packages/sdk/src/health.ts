import type { HealthResult, RequestOptions } from './types';

export interface HealthApi {
  /** Liveness probe — process is up. */
  live: () => Promise<HealthResult>;
  /** Readiness probe — critical dependencies (DB, Redis) reachable. */
  ready: () => Promise<HealthResult>;
}

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

/**
 * Health endpoints accept 503 as a valid (unhealthy) response so callers can
 * render dependency status instead of throwing.
 */
export function createHealthApi(request: Requester): HealthApi {
  return {
    live: () => request<HealthResult>('/health/live', { acceptStatuses: [503] }),
    ready: () => request<HealthResult>('/health/ready', { acceptStatuses: [503] }),
  };
}
