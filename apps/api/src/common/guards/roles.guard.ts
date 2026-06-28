import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@wayly/types';

import { ROLES_KEY } from '../constants/auth.constants';
import type { RequestUser } from '../types/request-user.type';

/**
 * Enforces @Roles() on routes after JwtAuthGuard has attached `request.user`.
 * If user is not attached yet (JwtAuthGuard runs at controller level), defer.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    if (!user) {
      return true;
    }

    const hasRole = required.some((role) => user.roles.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }
    return true;
  }
}
