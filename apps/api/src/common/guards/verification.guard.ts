import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { REQUIRES_VERIFICATION_KEY } from '../constants/auth.constants';
import type { RequestUser } from '../types/request-user.type';

/**
 * Blocks unverified users on routes decorated with @RequiresVerification().
 * Foundation for M2+ KYC gating — not applied to any route in M1.
 */
@Injectable()
export class VerificationGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<boolean>(REQUIRES_VERIFICATION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: RequestUser }>();
    if (!user.verified) {
      throw new ForbiddenException({
        code: 'KYC_REQUIRED',
        message: 'Identity verification is required to access this resource',
      });
    }
    return true;
  }
}
