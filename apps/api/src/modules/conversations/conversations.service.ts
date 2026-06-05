import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  DeliveryOrderStatus as PrismaDeliveryOrderStatus,
  type ChatMessage,
  type Conversation,
  type DeliveryOrder,
  type Prisma,
} from '@prisma/client';
import type {
  ChatMessageSummary,
  ConversationDetail,
  ConversationListResponse,
} from '@wayly/types';
import { NotificationType } from '@wayly/types';
import type { ConversationsListQueryInput, SendChatMessageInput } from '@wayly/validation';

import { requireKycApproved } from '../../common/helpers/kyc-access.helper';
import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

import {
  toChatMessageSummary,
  toConversationDetail,
  toConversationSummary,
} from './conversations.mapper';

const CHAT_ELIGIBLE_STATUSES: PrismaDeliveryOrderStatus[] = [
  PrismaDeliveryOrderStatus.ACCEPTED,
  PrismaDeliveryOrderStatus.IN_TRANSIT,
  PrismaDeliveryOrderStatus.DELIVERED,
];

const MESSAGE_HISTORY_LIMIT = 100;
const CHAT_NOTIFICATION_PREVIEW_MAX = 80;

export interface MarkConversationReadResult {
  updatedCount: number;
}

@Injectable()
export class ConversationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async forOrder(user: RequestUser, orderId: string): Promise<ConversationDetail> {
    requireKycApproved(user);

    const order = await this.findOrderOrThrow(user.id, orderId);
    this.assertOrderChatEligible(order);

    const existing = await this.prisma.conversation.findUnique({
      where: { orderId },
    });
    if (existing) {
      const messages = await this.loadMessagesAsc(existing.id);
      return toConversationDetail(existing, messages);
    }

    const created = await this.prisma.conversation.create({
      data: {
        orderId: order.id,
        senderId: order.senderId,
        waylerId: order.acceptedWaylerId!,
      },
    });

    return toConversationDetail(created, []);
  }

  async list(
    user: RequestUser,
    query: ConversationsListQueryInput,
  ): Promise<ConversationListResponse> {
    requireKycApproved(user);

    const where: Prisma.ConversationWhereInput = {
      OR: [{ senderId: user.id }, { waylerId: user.id }],
    };
    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.conversation.count({ where }),
    ]);

    const items = await Promise.all(
      records.map(async (record) => {
        const lastMessage = await this.prisma.chatMessage.findFirst({
          where: { conversationId: record.id },
          orderBy: { createdAt: 'desc' },
        });
        return toConversationSummary(record, lastMessage);
      }),
    );

    return {
      items,
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async getDetail(user: RequestUser, id: string): Promise<ConversationDetail> {
    requireKycApproved(user);

    const conversation = await this.findConversationForParticipantOrThrow(user.id, id);
    const messages = await this.loadMessagesAsc(conversation.id);
    return toConversationDetail(conversation, messages);
  }

  async sendMessage(
    user: RequestUser,
    id: string,
    body: SendChatMessageInput,
  ): Promise<ChatMessageSummary> {
    requireKycApproved(user);

    const conversation = await this.findConversationForParticipantOrThrow(user.id, id);
    const now = new Date();

    const [message] = await this.prisma.$transaction([
      this.prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: user.id,
          body: body.body,
        },
      }),
      this.prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: now },
      }),
    ]);

    const recipientId =
      user.id === conversation.senderId ? conversation.waylerId : conversation.senderId;

    await this.notifications.createForUser({
      userId: recipientId,
      type: NotificationType.SYSTEM,
      title: 'New chat message',
      body: this.buildChatNotificationBody(body.body),
      relatedOrderId: conversation.orderId,
    });

    return toChatMessageSummary(message);
  }

  async markRead(user: RequestUser, id: string): Promise<MarkConversationReadResult> {
    requireKycApproved(user);

    const conversation = await this.findConversationForParticipantOrThrow(user.id, id);
    const result = await this.prisma.chatMessage.updateMany({
      where: {
        conversationId: conversation.id,
        senderId: { not: user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return { updatedCount: result.count };
  }

  private async findOrderOrThrow(userId: string, orderId: string): Promise<DeliveryOrder> {
    const order = await this.prisma.deliveryOrder.findUnique({ where: { id: orderId } });
    if (!order || !this.isOrderParticipant(order, userId)) {
      throw new NotFoundException('Delivery order not found');
    }
    return order;
  }

  private assertOrderChatEligible(order: DeliveryOrder): void {
    if (!order.acceptedWaylerId) {
      throw new ConflictException(
        'Conversation is not available until a Wayler accepts the delivery order',
      );
    }

    if (!CHAT_ELIGIBLE_STATUSES.includes(order.status)) {
      throw new ConflictException(
        'Chat is only available for accepted, in-transit, or delivered orders',
      );
    }
  }

  private isOrderParticipant(order: DeliveryOrder, userId: string): boolean {
    return order.senderId === userId || order.acceptedWaylerId === userId;
  }

  private async findConversationForParticipantOrThrow(
    userId: string,
    conversationId: string,
  ): Promise<Conversation> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ senderId: userId }, { waylerId: userId }],
      },
    });
    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }
    return conversation;
  }

  private buildChatNotificationBody(messageBody: string): string {
    const trimmed = messageBody.trim();
    if (!trimmed) {
      return 'You received a new message about a delivery.';
    }

    const preview =
      trimmed.length > CHAT_NOTIFICATION_PREVIEW_MAX
        ? `${trimmed.slice(0, CHAT_NOTIFICATION_PREVIEW_MAX)}…`
        : trimmed;

    return `You received a new message about a delivery: "${preview}"`;
  }

  private async loadMessagesAsc(conversationId: string): Promise<ChatMessage[]> {
    const records = await this.prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: MESSAGE_HISTORY_LIMIT,
    });
    return records.reverse();
  }
}
