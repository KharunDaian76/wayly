import { ForbiddenException } from '@nestjs/common';
import { KycStatus } from '@wayly/types';

import type { RequestUser } from '../types/request-user.type';

/** Matches KYC gating used by feature flags (`verified` + `kycStatus === APPROVED`). */
export function requireKycApproved(user: RequestUser): void {
  if (!user.verified || user.kycStatus !== KycStatus.APPROVED) {
    throw new ForbiddenException({
      code: 'KYC_REQUIRED',
      message: 'Identity verification is required to access this resource',
    });
  }
}
