import { AdminAuditLogAction, AdminAuditLogStatus, AdminAuditLogTargetType } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';
import { idSchema } from './schemas';

/** GET /admin/audit-logs query parameters. */
export const adminAuditLogsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  action: enumSchema(AdminAuditLogAction).optional(),
  actorUserId: idSchema.optional(),
  targetType: enumSchema(AdminAuditLogTargetType).optional(),
  targetUserId: idSchema.optional(),
  targetId: idSchema.optional(),
  status: enumSchema(AdminAuditLogStatus).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export type AdminAuditLogsListQueryInput = z.infer<typeof adminAuditLogsListQuerySchema>;
