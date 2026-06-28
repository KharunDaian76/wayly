import type { ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { RATE_LIMIT_POLICY_KEY, type RateLimitPolicyName } from './rate-limit.constants';

/** Best-effort client IP for MVP in-memory throttling (single instance). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || req.ip || 'unknown';
  }
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

export function getRateLimitPolicy(context: ExecutionContext): RateLimitPolicyName | undefined {
  const handler = context.getHandler();
  const classRef = context.getClass();
  return (
    Reflect.getMetadata(RATE_LIMIT_POLICY_KEY, handler) ??
    Reflect.getMetadata(RATE_LIMIT_POLICY_KEY, classRef)
  );
}

export function shouldApplyThrottler(
  context: ExecutionContext,
  throttlerName: RateLimitPolicyName,
): boolean {
  const policy = getRateLimitPolicy(context);
  if (throttlerName === 'publicLight') {
    return policy === undefined || policy === 'publicLight';
  }
  return policy === throttlerName;
}

export function normalizeAuthEmail(email: unknown): string | undefined {
  if (typeof email !== 'string' || email.trim().length === 0) {
    return undefined;
  }
  return email.trim().toLowerCase();
}
