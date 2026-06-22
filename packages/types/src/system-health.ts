import type { ISODateString } from './common';
import type { PaymentStatus } from './enums';

export type AdminHealthComponentStatus = 'ok' | 'degraded' | 'error';

export type AdminSystemOverallStatus = 'healthy' | 'degraded' | 'unknown';

/** Payment intent counts grouped by status for admin system health. */
export interface AdminPaymentStatusCount {
  status: PaymentStatus;
  count: number;
}

/** Operational counts for admin system health snapshot. */
export interface AdminSystemOperationalCounts {
  usersCount: number;
  pendingKycCount: number;
  openOrdersCount: number;
  openDisputesCount: number;
  paymentIntentsByStatus: AdminPaymentStatusCount[];
}

/** Recent marketplace activity timestamps for admin system health. */
export interface AdminSystemRecentActivity {
  latestUserCreatedAt: ISODateString | null;
  latestOrderCreatedAt: ISODateString | null;
  latestDisputeCreatedAt: ISODateString | null;
  latestPaymentCreatedAt: ISODateString | null;
}

/** Read-only admin system health snapshot (GET /admin/system-health). */
export interface AdminSystemHealthResponse {
  checkedAt: ISODateString;
  overallStatus: AdminSystemOverallStatus;
  apiStatus: AdminHealthComponentStatus;
  databaseStatus: AdminHealthComponentStatus;
  environment: string;
  appVersion: string | null;
  operationalCounts: AdminSystemOperationalCounts | null;
  recentActivity: AdminSystemRecentActivity | null;
}
