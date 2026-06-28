import type { Review } from '@prisma/client';
import type { AdminReviewQueueItem, ReviewSummary } from '@wayly/types';
import { ReviewPartyRole } from '@wayly/types';

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

export function toReviewSummary(record: Review): ReviewSummary {
  return {
    id: record.id,
    orderId: record.orderId,
    reviewerId: record.reviewerId,
    revieweeId: record.revieweeId,
    reviewerRole: record.reviewerRole as ReviewPartyRole,
    revieweeRole: record.revieweeRole as ReviewPartyRole,
    rating: record.rating,
    comment: record.comment,
    tags: record.tags,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function toAdminReviewQueueItem(record: Review): AdminReviewQueueItem {
  return {
    ...toReviewSummary(record),
    isHidden: record.isHidden,
    hiddenAt: toIso(record.hiddenAt),
    hiddenById: record.hiddenById,
    adminNote: record.adminNote,
  };
}

export function emptyRatingBreakdown(): Record<'1' | '2' | '3' | '4' | '5', number> {
  return { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
}
