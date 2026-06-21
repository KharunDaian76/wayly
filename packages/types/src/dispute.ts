import type { ISODateString } from './common';
import type { DisputeReason, DisputeResolution, DisputeStatus } from './enums';

/** Compact dispute for lists and feeds (API routes land in a later batch). */
export interface DisputeSummary {
  id: string;
  orderId: string;
  openedById: string;
  assignedArbitratorId: string | null;
  status: DisputeStatus;
  reason: DisputeReason;
  description: string;
  resolution: DisputeResolution | null;
  resolutionNote: string | null;
  resolvedAt: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** Message on a dispute thread (API routes land in a later batch). */
export interface DisputeMessageSummary {
  id: string;
  disputeId: string;
  senderId: string;
  body: string;
  createdAt: ISODateString;
}

/** Evidence item attached to a dispute (file upload lands in a later batch). */
export interface DisputeEvidenceSummary {
  id: string;
  disputeId: string;
  submittedById: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  createdAt: ISODateString;
}

/** Dispute with messages and evidence (API not implemented yet). */
export interface DisputeDetail extends DisputeSummary {
  messages: DisputeMessageSummary[];
  evidence: DisputeEvidenceSummary[];
}

/** Paginated dispute list (API not implemented yet). */
export interface DisputeListResponse {
  items: DisputeSummary[];
  page: number;
  limit: number;
  total: number;
}

/** Compact dispute row for admin/arbitrator operations queue (read-only). */
export interface AdminDisputeQueueItem {
  id: string;
  orderId: string;
  orderTitle: string | null;
  pickupCity: string | null;
  pickupCountry: string | null;
  dropoffCity: string | null;
  dropoffCountry: string | null;
  status: DisputeStatus;
  reason: DisputeReason;
  openedAt: ISODateString;
  senderDisplayName: string | null;
  senderEmail: string | null;
  waylerDisplayName: string | null;
  waylerEmail: string | null;
}

/** Paginated admin dispute queue (GET /admin/disputes). */
export interface AdminDisputeListResponse {
  items: AdminDisputeQueueItem[];
  page: number;
  limit: number;
  total: number;
}
