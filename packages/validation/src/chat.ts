import { z } from 'zod';

/** GET /conversations query parameters. */
export const conversationsListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ConversationsListQueryInput = z.infer<typeof conversationsListQuerySchema>;

/** POST /conversations/:id/messages body. */
export const sendChatMessageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>;
