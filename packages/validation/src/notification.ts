import { z } from 'zod';

/** GET /notifications query parameters. */
export const notificationsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  unreadOnly: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === 'true')),
});

export type NotificationsListQueryInput = z.infer<typeof notificationsListQuerySchema>;
