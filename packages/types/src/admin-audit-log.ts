import type { ISODateString } from './common';

/** Admin operator audit action (append-only log). */
export const AdminAuditLogAction = {
  KYC_APPROVED: 'KYC_APPROVED',
  KYC_REJECTED: 'KYC_REJECTED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
  USER_SUSPENDED: 'USER_SUSPENDED',
  USER_UNSUSPENDED: 'USER_UNSUSPENDED',
  PAYMENT_MANUAL_REVIEW_MARKED: 'PAYMENT_MANUAL_REVIEW_MARKED',
  PAYMENT_MANUAL_REVIEW_CLEARED: 'PAYMENT_MANUAL_REVIEW_CLEARED',
  PAYMENT_REFUND_DECISION_RECORDED: 'PAYMENT_REFUND_DECISION_RECORDED',
  PAYMENT_RELEASE_DECISION_RECORDED: 'PAYMENT_RELEASE_DECISION_RECORDED',
} as const;
export type AdminAuditLogAction = (typeof AdminAuditLogAction)[keyof typeof AdminAuditLogAction];

/** Target entity type for an admin audit log entry. */
export const AdminAuditLogTargetType = {
  KYC_VERIFICATION: 'KYC_VERIFICATION',
  DISPUTE: 'DISPUTE',
  USER: 'USER',
  PAYMENT_INTENT: 'PAYMENT_INTENT',
} as const;
export type AdminAuditLogTargetType =
  (typeof AdminAuditLogTargetType)[keyof typeof AdminAuditLogTargetType];

/** Outcome of the audit write (v1 uses SUCCESS only). */
export const AdminAuditLogStatus = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
} as const;
export type AdminAuditLogStatus = (typeof AdminAuditLogStatus)[keyof typeof AdminAuditLogStatus];

/** Safe admin audit log row for read-only operations API. */
export interface AdminAuditLogItem {
  id: string;
  actorUserId: string;
  actorEmailSnapshot: string;
  actorDisplaySnapshot: string;
  actorRolesSnapshot: string[];
  action: AdminAuditLogAction;
  targetType: AdminAuditLogTargetType;
  targetId: string;
  targetUserId: string | null;
  status: AdminAuditLogStatus;
  summary: string;
  metadata: Record<string, unknown> | null;
  requestId: string | null;
  createdAt: ISODateString;
}

/** Paginated admin audit log list (GET /admin/audit-logs). */
export interface AdminAuditLogListResponse {
  items: AdminAuditLogItem[];
  page: number;
  limit: number;
  total: number;
}
