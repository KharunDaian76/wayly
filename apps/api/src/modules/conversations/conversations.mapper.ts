import type { ChatMessage, Conversation } from '@prisma/client';
import type {
  ChatMessagePreview,
  ChatMessageSummary,
  ConversationDetail,
  ConversationSummary,
} from '@wayly/types';

function toIso(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

/** Maps a Prisma ChatMessage to the safe API summary shape. */
export function toChatMessageSummary(record: ChatMessage): ChatMessageSummary {
  return {
    id: record.id,
    conversationId: record.conversationId,
    senderId: record.senderId,
    body: record.body,
    readAt: toIso(record.readAt),
    createdAt: record.createdAt.toISOString(),
  };
}

function toChatMessagePreview(record: ChatMessage): ChatMessagePreview {
  return {
    id: record.id,
    senderId: record.senderId,
    body: record.body,
    createdAt: record.createdAt.toISOString(),
  };
}

/** Maps a Prisma Conversation to the safe API list summary shape. */
export function toConversationSummary(
  record: Conversation,
  lastMessage?: ChatMessage | null,
): ConversationSummary {
  return {
    id: record.id,
    orderId: record.orderId,
    senderId: record.senderId,
    waylerId: record.waylerId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    lastMessage: lastMessage ? toChatMessagePreview(lastMessage) : null,
  };
}

/** Maps a Prisma Conversation and messages to the safe API detail shape. */
export function toConversationDetail(
  record: Conversation,
  messages: ChatMessage[],
): ConversationDetail {
  return {
    id: record.id,
    orderId: record.orderId,
    senderId: record.senderId,
    waylerId: record.waylerId,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    messages: messages.map(toChatMessageSummary),
  };
}
