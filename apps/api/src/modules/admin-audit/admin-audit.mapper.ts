import type { AdminAuditLog } from '@prisma/client';
import type {
  AdminAuditLogAction,
  AdminAuditLogItem,
  AdminAuditLogStatus,
  AdminAuditLogTargetType,
} from '@wayly/types';

function metadataToRecord(value: AdminAuditLog['metadata']): Record<string, unknown> | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

/** Maps a Prisma AdminAuditLog to the safe API list shape (no ip/userAgent). */
export function toAdminAuditLogItem(record: AdminAuditLog): AdminAuditLogItem {
  return {
    id: record.id,
    actorUserId: record.actorUserId,
    actorEmailSnapshot: record.actorEmailSnapshot,
    actorDisplaySnapshot: record.actorDisplaySnapshot,
    actorRolesSnapshot: [...record.actorRolesSnapshot],
    action: record.action as AdminAuditLogAction,
    targetType: record.targetType as AdminAuditLogTargetType,
    targetId: record.targetId,
    targetUserId: record.targetUserId,
    status: record.status as AdminAuditLogStatus,
    summary: record.summary,
    metadata: metadataToRecord(record.metadata),
    requestId: record.requestId,
    createdAt: record.createdAt.toISOString(),
  };
}
