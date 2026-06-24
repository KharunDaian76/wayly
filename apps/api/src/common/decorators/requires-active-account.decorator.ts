import { SetMetadata } from '@nestjs/common';

import { REQUIRES_ACTIVE_ACCOUNT_KEY } from '../constants/auth.constants';

/**
 * Blocks suspended users on routes decorated with @RequiresActiveAccount().
 * Must run after JwtAuthGuard so `request.user` is set.
 */
export const RequiresActiveAccount = () => SetMetadata(REQUIRES_ACTIVE_ACCOUNT_KEY, true);
