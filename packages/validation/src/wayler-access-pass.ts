import { WaylerAccessPassStatus } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';

/** GET /wayler-access/mine query parameters. */
export const waylerAccessPassesListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: enumSchema(WaylerAccessPassStatus).optional(),
});

export type WaylerAccessPassesListQueryInput = z.infer<typeof waylerAccessPassesListQuerySchema>;
