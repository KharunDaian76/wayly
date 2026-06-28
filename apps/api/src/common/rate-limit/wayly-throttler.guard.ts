import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerGuard,
  type ThrottlerLimitDetail,
  type ThrottlerModuleOptions,
  type ThrottlerStorage,
} from '@nestjs/throttler';
import type { Request } from 'express';

import { AppConfigService } from '../../config/config.service';

import { RATE_LIMIT_ERROR_MESSAGE } from './rate-limit.constants';
import { getClientIp, normalizeAuthEmail } from './rate-limit.util';

/**
 * Global rate-limit guard backed by @nestjs/throttler in-memory storage.
 *
 * MVP note: counters live in process memory — effective on a single API instance only.
 * Use Redis-backed storage before horizontal scale or serious abuse scenarios.
 */
@Injectable()
export class WaylyThrottlerGuard extends ThrottlerGuard {
  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storageService: ThrottlerStorage,
    reflector: Reflector,
    private readonly config: AppConfigService,
  ) {
    super(options, storageService, reflector);
  }

  protected override async shouldSkip(context: ExecutionContext): Promise<boolean> {
    if (!this.config.rateLimit.enabled) {
      return true;
    }
    return super.shouldSkip(context);
  }

  protected override async getTracker(req: Record<string, unknown>): Promise<string> {
    const request = req as unknown as Request;
    const routePath = request.route?.path ?? request.url ?? '';
    const email = normalizeAuthEmail(request.body?.email);

    if (routePath.includes('/login') && email) {
      return `${getClientIp(request)}:login:${email}`;
    }
    if (routePath.includes('/register') && email) {
      return `${getClientIp(request)}:register:${email}`;
    }
    if (routePath.includes('/password/forgot') && email) {
      return `${getClientIp(request)}:forgot:${email}`;
    }

    const user = request.user as { id?: string } | undefined;
    if (user?.id) {
      return `user:${user.id}`;
    }

    return getClientIp(request);
  }

  protected override async throwThrottlingException(
    _context: ExecutionContext,
    _detail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new HttpException(RATE_LIMIT_ERROR_MESSAGE, HttpStatus.TOO_MANY_REQUESTS);
  }
}
