import { PaymentStatus } from '@wayly/types';
import { z } from 'zod';

import { enumSchema } from './helpers';
import { currencySchema } from './schemas';

/** GET /admin/payments query parameters (operations read-only list). */
export const adminPaymentsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: enumSchema(PaymentStatus).optional(),
  currency: currencySchema.optional(),
});

export type AdminPaymentsListQueryInput = z.infer<typeof adminPaymentsListQuerySchema>;
