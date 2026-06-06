import type { ISODateString } from './common';
import type { DecimalString } from './delivery-order';
import type { WaylerAccessPassProvider, WaylerAccessPassStatus } from './enums';

/** Daily Wayler work access pass (API/paywall land in a later batch). */
export interface WaylerAccessPassSummary {
  id: string;
  waylerId: string;
  status: WaylerAccessPassStatus;
  provider: WaylerAccessPassProvider;
  currency: string;
  amount: DecimalString;
  providerPaymentId: string | null;
  accessDate: ISODateString;
  startsAt: ISODateString;
  expiresAt: ISODateString;
  activatedAt: ISODateString | null;
  cancelledAt: ISODateString | null;
  refundedAt: ISODateString | null;
  failedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Paginated Wayler access pass list (API not implemented yet). */
export interface WaylerAccessPassListResponse {
  items: WaylerAccessPassSummary[];
  page: number;
  limit: number;
  total: number;
}

/** Current Wayler work access state for paywall gating (API not implemented yet). */
export interface WaylerAccessState {
  hasActiveAccess: boolean;
  activePass: WaylerAccessPassSummary | null;
  checkedAt: ISODateString;
}
