import type { PaymentAdminReviewStatus, PaymentStatus } from '@wayly/types';

/** Query parameters for GET /admin/payments. */
export interface AdminPaymentsListQuery {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  currency?: string;
  adminReviewStatus?: PaymentAdminReviewStatus;
  orderId?: string;
}

/** POST /admin/payments/:id/mark-manual-review body. */
export interface AdminPaymentManualReviewBody {
  note: string;
}

/** POST /admin/payments/:id/clear-manual-review body. */
export interface AdminPaymentClearManualReviewBody {
  note?: string;
}

/** POST /admin/payments/:id/record-refund-decision body. */
export interface AdminPaymentRefundDecisionBody {
  decision: 'RECOMMEND_FULL_REFUND' | 'RECOMMEND_PARTIAL_REFUND' | 'NO_ACTION' | 'OTHER';
  note: string;
}

/** POST /admin/payments/:id/record-release-decision body. */
export interface AdminPaymentReleaseDecisionBody {
  decision: 'RECOMMEND_RELEASE' | 'NO_ACTION' | 'OTHER';
  note: string;
}
