import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { KycStatus } from '@wayly/types';

import { REQUIRES_VERIFICATION_KEY } from '../constants/auth.constants';
import type { RequestUser } from '../types/request-user.type';

/**
 * Blocks unverified users on routes decorated with @RequiresVerification().
 * Must run after JwtAuthGuard (route-level or global) so `request.user` is set.
 * If user is not attached yet, this guard defers (returns true) so JwtAuthGuard can run first.
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

    const { user } = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    if (!user) {
      return true;
    }

    if (!user.verified || user.kycStatus !== KycStatus.APPROVED) {
      throw new ForbiddenException({
        code: 'KYC_REQUIRED',
        message: 'Identity verification is required to access this resource',
      });
    }
    return true;
  }
}
