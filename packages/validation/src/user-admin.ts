import { KycStatus, UserRole } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';

/** GET /admin/users query parameters (operations read-only list). */
export const adminUsersListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: enumSchema(UserRole).optional(),
  kycStatus: enumSchema(KycStatus).optional(),
  search: z.string().trim().min(1).max(120).optional(),
});

export type AdminUsersListQueryInput = z.infer<typeof adminUsersListQuerySchema>;
