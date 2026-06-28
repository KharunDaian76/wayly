import { SetMetadata } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';

import { RATE_LIMIT_POLICY_KEY, type RateLimitPolicyName } from './rate-limit.constants';

/** Strict limits for auth and password endpoints (per IP / email where applicable). */
export const AuthStrictRateLimit = () =>
  SetMetadata(RATE_LIMIT_POLICY_KEY, 'authStrict' satisfies RateLimitPolicyName);

/** Moderate limits for user-generated writes (tickets, chat, reviews, disputes, orders). */
export const UserWriteRateLimit = () =>
  SetMetadata(RATE_LIMIT_POLICY_KEY, 'userWrite' satisfies RateLimitPolicyName);

/** Sane limits for admin/arbitrator API routes — avoids accidental script floods. */
export const AdminModerateRateLimit = () =>
  SetMetadata(RATE_LIMIT_POLICY_KEY, 'adminModerate' satisfies RateLimitPolicyName);

/** Skip all rate-limit policies (health probes, etc.). */
export const SkipAllRateLimits = () =>
  SkipThrottle({
    authStrict: true,
    userWrite: true,
    adminModerate: true,
    publicLight: true,
  });
