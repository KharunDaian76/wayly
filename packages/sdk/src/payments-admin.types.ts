import type { PaymentStatus } from '@wayly/types';

/** Query parameters for GET /admin/payments. */
export interface AdminPaymentsListQuery {
  page?: number;
  limit?: number;
  status?: PaymentStatus;
  currency?: string;
}
