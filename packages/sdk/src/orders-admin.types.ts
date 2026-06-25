import type { DeliveryOrderStatus, OrderAdminReviewStatus } from '@wayly/types';

/** Query parameters for GET /admin/orders. */
export interface AdminOrdersListQuery {
  page?: number;
  limit?: number;
  status?: DeliveryOrderStatus;
  adminReviewStatus?: OrderAdminReviewStatus;
}

/** POST /admin/orders/:id/mark-manual-review body. */
export interface AdminOrderManualReviewBody {
  note: string;
}

/** POST /admin/orders/:id/clear-manual-review body. */
export interface AdminOrderClearManualReviewBody {
  note?: string;
}

/** POST /admin/orders/:id/record-decision body. */
export interface AdminOrderDecisionBody {
  decision: 'MONITOR' | 'ESCALATE_PAYMENT' | 'ESCALATE_DISPUTE' | 'NO_ACTION' | 'OTHER';
  note: string;
}

/** POST /admin/orders/:id/flag-risk body. */
export interface AdminOrderRiskFlagBody {
  note: string;
}

/** POST /admin/orders/:id/clear-risk body. */
export interface AdminOrderClearRiskBody {
  note?: string;
}
