import type {
  ChatMessageSummary,
  ConversationDetail,
  ConversationListResponse,
} from '@wayly/types';
import type { SendChatMessageInput } from '@wayly/validation';

/** GET /conversations query parameters. */
export interface ConversationsListQuery {
  page?: number;
  limit?: number;
}

export interface MarkConversationReadResponse {
  updatedCount: number;
}

export interface ConversationsApi {
  forOrder(orderId: string, accessToken?: string | null): Promise<ConversationDetail>;
  list(
    query?: ConversationsListQuery,
    accessToken?: string | null,
  ): Promise<ConversationListResponse>;
  detail(id: string, accessToken?: string | null): Promise<ConversationDetail>;
  sendMessage(
    id: string,
    body: SendChatMessageInput,
    accessToken?: string | null,
  ): Promise<ChatMessageSummary>;
  markRead(id: string, accessToken?: string | null): Promise<MarkConversationReadResponse>;
}

export type {
  ChatMessageSummary,
  ConversationDetail,
  ConversationListResponse,
  SendChatMessageInput,
};
