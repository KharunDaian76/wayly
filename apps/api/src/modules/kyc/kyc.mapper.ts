import type { KycVerification } from '@prisma/client';
import type { AdminKycQueueItem, KycVerificationSummary } from '@wayly/types';
import { KycStatus } from '@wayly/types';

/** Maps a Prisma KycVerification with user to the admin operations queue shape. */
export function toAdminKycQueueItem(
  record: KycVerification & {
    user: { displayName: string; email: string };
  },
): AdminKycQueueItem {
  return {
    id: record.id,
    userId: record.userId,
    userDisplayName: record.user.displayName,
    userEmail: record.user.email,
    status: record.status as KycStatus,
    country: record.country,
    rejectionReason: record.rejectionReason,
    submittedAt: record.submittedAt?.toISOString() ?? null,
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

/** Maps a Prisma KycVerification to the safe API summary (no provider internals). */
export function toKycVerificationSummary(record: KycVerification): KycVerificationSummary {
  return {
    id: record.id,
    status: record.status as KycStatus,
    provider: record.provider,
    levelName: record.levelName,
    country: record.country,
    documentType: record.documentType,
    rejectionReason: record.rejectionReason,
    submittedAt: record.submittedAt?.toISOString() ?? null,
    reviewedAt: record.reviewedAt?.toISOString() ?? null,
    expiresAt: record.expiresAt?.toISOString() ?? null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
