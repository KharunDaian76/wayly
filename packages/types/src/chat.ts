import type { ISODateString } from './common';

/** Compact message preview for conversation list enrichment (optional on summary). */
export interface ChatMessagePreview {
  id: string;
  senderId: string;
  body: string;
  createdAt: ISODateString;
}

/** Compact conversation for lists and feeds. */
export interface ConversationSummary {
  id: string;
  orderId: string;
  senderId: string;
  waylerId: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  lastMessage?: ChatMessagePreview | null;
}

/** Compact chat message for lists and detail views. */
export interface ChatMessageSummary {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  readAt: ISODateString | null;
  createdAt: ISODateString;
}

/** Conversation with message history (API not implemented yet). */
export interface ConversationDetail {
  id: string;
  orderId: string;
  senderId: string;
  waylerId: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  messages: ChatMessageSummary[];
}

/** Paginated conversation list (API not implemented yet). */
export interface ConversationListResponse {
  items: ConversationSummary[];
  page: number;
  limit: number;
  total: number;
}
