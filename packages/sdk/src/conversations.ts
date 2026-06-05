import type {
  ChatMessageSummary,
  ConversationDetail,
  ConversationListResponse,
} from '@wayly/types';
import type { SendChatMessageInput } from '@wayly/validation';

import type {
  ConversationsApi,
  ConversationsListQuery,
  MarkConversationReadResponse,
} from './conversations.types';
import type { RequestOptions } from './types';

type Requester = <T>(path: string, options?: RequestOptions) => Promise<T>;

const withCookies = { credentials: 'include' as const };

export function createConversationsApi(request: Requester): ConversationsApi {
  return {
    forOrder: (orderId: string, accessToken?: string | null) =>
      request<ConversationDetail>(`/conversations/order/${orderId}`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),

    list: (query?: ConversationsListQuery, accessToken?: string | null) =>
      request<ConversationListResponse>('/conversations', {
        method: 'GET',
        query: query
          ? {
              ...(query.page !== undefined ? { page: query.page } : {}),
              ...(query.limit !== undefined ? { limit: query.limit } : {}),
            }
          : undefined,
        ...withCookies,
        accessToken,
      }),

    detail: (id: string, accessToken?: string | null) =>
      request<ConversationDetail>(`/conversations/${id}`, {
        method: 'GET',
        ...withCookies,
        accessToken,
      }),

    sendMessage: (id: string, body: SendChatMessageInput, accessToken?: string | null) =>
      request<ChatMessageSummary>(`/conversations/${id}/messages`, {
        method: 'POST',
        body,
        ...withCookies,
        accessToken,
      }),

    markRead: (id: string, accessToken?: string | null) =>
      request<MarkConversationReadResponse>(`/conversations/${id}/read`, {
        method: 'POST',
        ...withCookies,
        accessToken,
      }),
  };
}

export type { ConversationsApi } from './conversations.types';
