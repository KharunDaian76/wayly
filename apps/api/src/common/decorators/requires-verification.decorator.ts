import { SetMetadata } from '@nestjs/common';

import { REQUIRES_VERIFICATION_KEY } from '../constants/auth.constants';

/**
 * Marks a route as requiring KYC approval (`user.verified === true`).
 * Enforced by VerificationGuard — not applied to any route in M1.
 */
export const RequiresVerification = () => SetMetadata(REQUIRES_VERIFICATION_KEY, true);
