import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserAccountStatus } from '@wayly/types';

import { REQUIRES_ACTIVE_ACCOUNT_KEY } from '../constants/auth.constants';
import type { RequestUser } from '../types/request-user.type';

/**
 * Blocks suspended users on routes decorated with @RequiresActiveAccount().
 * Must run after JwtAuthGuard (route-level or global) so `request.user` is set.
 */
@Injectable()
export class AccountModerationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<boolean>(REQUIRES_ACTIVE_ACCOUNT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    if (!user) {
      return true;
    }

    if (user.accountStatus === UserAccountStatus.SUSPENDED) {
      throw new ForbiddenException({
        code: 'ACCOUNT_SUSPENDED',
        message: 'Your account is suspended. Marketplace actions are unavailable.',
      });
    }
    return true;
  }
}
