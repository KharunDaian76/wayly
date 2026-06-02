import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@wayly/types';

import { ROLES_KEY } from '../constants/auth.constants';

/** Restrict a route to users with at least one of the given roles. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
