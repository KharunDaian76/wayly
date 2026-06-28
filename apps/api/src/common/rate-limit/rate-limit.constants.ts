/** Client-safe 429 message — no counters, IPs, or internal details. */
export const RATE_LIMIT_ERROR_MESSAGE = 'Too many requests. Please wait and try again.';

export const RATE_LIMIT_POLICY_KEY = 'wayly:rateLimitPolicy';

export const RATE_LIMIT_POLICIES = [
  'authStrict',
  'userWrite',
  'adminModerate',
  'publicLight',
] as const;

export type RateLimitPolicyName = (typeof RATE_LIMIT_POLICIES)[number];
