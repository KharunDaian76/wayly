import { KycStatus, UserAccountStatus, UserRole } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';
import { nonEmptyStringSchema } from './schemas';

/** GET /admin/users query parameters (operations read-only list). */
export const adminUsersListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: enumSchema(UserRole).optional(),
  kycStatus: enumSchema(KycStatus).optional(),
  accountStatus: enumSchema(UserAccountStatus).optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

export type AdminUsersListQueryInput = z.infer<typeof adminUsersListQuerySchema>;

/** POST /admin/users/:id/suspend body. */
export const adminUserSuspendSchema = z.object({
  reason: nonEmptyStringSchema.max(500),
});
export type AdminUserSuspendInput = z.infer<typeof adminUserSuspendSchema>;

/** POST /admin/users/:id/unsuspend body. */
export const adminUserUnsuspendSchema = z.object({
  note: z.string().trim().max(500).optional(),
});
export type AdminUserUnsuspendInput = z.infer<typeof adminUserUnsuspendSchema>;
