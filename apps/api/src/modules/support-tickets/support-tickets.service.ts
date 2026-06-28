import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { DeliveryOrder, SupportTicket } from '@prisma/client';
import type {
  AdminSupportTicketListResponse,
  AdminSupportTicketQueueItem,
  SupportTicketListResponse,
  SupportTicketMessageListResponse,
  SupportTicketMessageSummary,
  SupportTicketSummary,
} from '@wayly/types';
import {
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
  UserRole,
  NotificationEntityType,
  NotificationType,
} from '@wayly/types';
import type {
  AdminCreateSupportTicketMessageInput,
  AdminSupportTicketsListQueryInput,
  AdminUpdateSupportTicketInput,
  CreateSupportTicketInput,
  CreateSupportTicketMessageInput,
} from '@wayly/validation';

import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { supportTicketNotificationLink } from '../notifications/notification.helpers';

import {
  toAdminSupportTicketQueueItem,
  toSupportTicketMessageSummary,
  toSupportTicketSummary,
} from './support-tickets.mapper';

const CLOSED_STATUSES: SupportTicketStatus[] = [
  SupportTicketStatus.RESOLVED,
  SupportTicketStatus.CLOSED,
];

const REOPEN_STATUSES: SupportTicketStatus[] = [
  SupportTicketStatus.OPEN,
  SupportTicketStatus.UNDER_REVIEW,
  SupportTicketStatus.WAITING_FOR_USER,
];

const USER_REPLY_REOPEN_STATUSES: SupportTicketStatus[] = [
  SupportTicketStatus.WAITING_FOR_USER,
  SupportTicketStatus.RESOLVED,
];

@Injectable()
export class SupportTicketsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(user: RequestUser, body: CreateSupportTicketInput): Promise<SupportTicketSummary> {
    if (body.orderId) {
      await this.findOrderForParticipantOrThrow(user.id, body.orderId);
    }

    const priority =
      body.category === SupportTicketCategory.SAFETY
        ? SupportTicketPriority.HIGH
        : SupportTicketPriority.NORMAL;

    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId: user.id,
        orderId: body.orderId ?? null,
        subject: body.subject,
        message: body.message,
        category: body.category,
        status: SupportTicketStatus.OPEN,
        priority,
      },
    });

    await this.notifications.createForUser({
      userId: user.id,
      type: NotificationType.SUCCESS,
      title: 'Support ticket submitted',
      body: `Your support ticket "${ticket.subject}" was submitted for platform review (not emergency response).`,
      entityType: NotificationEntityType.SUPPORT_TICKET,
      entityId: ticket.id,
      linkHref: supportTicketNotificationLink(),
    });

    return toSupportTicketSummary(ticket);
  }

  async listMine(userId: string): Promise<SupportTicketListResponse> {
    const items = await this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      items: items.map(toSupportTicketSummary),
    };
  }

  async listForAdmin(
    query: AdminSupportTicketsListQueryInput,
  ): Promise<AdminSupportTicketListResponse> {
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.orderId ? { orderId: query.orderId } : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        include: {
          user: {
            select: { displayName: true, email: true },
          },
        },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return {
      items: items.map(toAdminSupportTicketQueueItem),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async updateForAdmin(
    actor: RequestUser,
    ticketId: string,
    body: AdminUpdateSupportTicketInput,
  ): Promise<AdminSupportTicketQueueItem> {
    this.assertAdmin(actor);

    const existing = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: { displayName: true, email: true },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Support ticket not found');
    }

    const nextStatus = body.status ?? (existing.status as SupportTicketStatus);
    const closedAt = this.resolveClosedAt(
      existing.closedAt,
      existing.status as SupportTicketStatus,
      nextStatus,
    );

    const updated = await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.priority !== undefined ? { priority: body.priority } : {}),
        ...(body.adminNote !== undefined ? { adminNote: body.adminNote } : {}),
        closedAt,
        lastAdminActionAt: new Date(),
        lastAdminActionById: actor.id,
      },
      include: {
        user: {
          select: { displayName: true, email: true },
        },
      },
    });

    await this.notifications.createForUser({
      userId: updated.userId,
      type: NotificationType.INFO,
      title: 'Support ticket updated',
      body: `Your support ticket "${updated.subject}" was updated by platform support review.`,
      entityType: NotificationEntityType.SUPPORT_TICKET,
      entityId: updated.id,
      linkHref: supportTicketNotificationLink(),
    });

    return toAdminSupportTicketQueueItem(updated);
  }

  async listMessagesForUser(
    userId: string,
    ticketId: string,
  ): Promise<SupportTicketMessageListResponse> {
    await this.findOwnedTicketOrThrow(userId, ticketId);

    const items = await this.prisma.supportTicketMessage.findMany({
      where: { ticketId, isInternal: false },
      orderBy: { createdAt: 'asc' },
    });

    return { items: items.map(toSupportTicketMessageSummary) };
  }

  async createMessageForUser(
    user: RequestUser,
    ticketId: string,
    body: CreateSupportTicketMessageInput,
  ): Promise<SupportTicketMessageSummary> {
    const ticket = await this.findOwnedTicketOrThrow(user.id, ticketId);

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.supportTicketMessage.create({
        data: {
          ticketId,
          authorId: user.id,
          authorRole: 'USER',
          body: body.body,
          isInternal: false,
        },
      });

      const currentStatus = ticket.status as SupportTicketStatus;
      if (USER_REPLY_REOPEN_STATUSES.includes(currentStatus)) {
        await tx.supportTicket.update({
          where: { id: ticketId },
          data: { status: SupportTicketStatus.UNDER_REVIEW },
        });
      }

      return created;
    });

    return toSupportTicketMessageSummary(message);
  }

  async listMessagesForAdmin(ticketId: string): Promise<SupportTicketMessageListResponse> {
    await this.findTicketOrThrow(ticketId);

    const items = await this.prisma.supportTicketMessage.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
    });

    return { items: items.map(toSupportTicketMessageSummary) };
  }

  async createMessageForAdmin(
    actor: RequestUser,
    ticketId: string,
    body: AdminCreateSupportTicketMessageInput,
  ): Promise<SupportTicketMessageSummary> {
    this.assertAdmin(actor);

    const ticket = await this.findTicketOrThrow(ticketId);
    const isInternal = body.isInternal ?? false;

    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.supportTicketMessage.create({
        data: {
          ticketId,
          authorId: actor.id,
          authorRole: 'ADMIN',
          body: body.body,
          isInternal,
        },
      });

      const ticketUpdate: {
        lastAdminActionAt: Date;
        lastAdminActionById: string;
        status?: SupportTicketStatus;
      } = {
        lastAdminActionAt: new Date(),
        lastAdminActionById: actor.id,
      };

      if (!isInternal && ticket.status === SupportTicketStatus.UNDER_REVIEW) {
        ticketUpdate.status = SupportTicketStatus.WAITING_FOR_USER;
      }

      await tx.supportTicket.update({
        where: { id: ticketId },
        data: ticketUpdate,
      });

      return created;
    });

    if (!isInternal) {
      await this.notifications.createForUser({
        userId: ticket.userId,
        type: NotificationType.INFO,
        title: 'Support reply received',
        body: `Platform support replied on your ticket "${ticket.subject}" (not emergency response).`,
        entityType: NotificationEntityType.SUPPORT_TICKET,
        entityId: ticket.id,
        linkHref: supportTicketNotificationLink(),
      });
    }

    return toSupportTicketMessageSummary(message);
  }

  private resolveClosedAt(
    currentClosedAt: Date | null,
    previousStatus: SupportTicketStatus,
    nextStatus: SupportTicketStatus,
  ): Date | null {
    if (CLOSED_STATUSES.includes(nextStatus)) {
      return currentClosedAt ?? new Date();
    }
    if (REOPEN_STATUSES.includes(nextStatus) && CLOSED_STATUSES.includes(previousStatus)) {
      return null;
    }
    return currentClosedAt;
  }

  private assertAdmin(user: RequestUser): void {
    if (!user.roles.includes(UserRole.ADMIN)) {
      throw new ForbiddenException('ADMIN role required');
    }
  }

  private async findOrderForParticipantOrThrow(
    userId: string,
    orderId: string,
  ): Promise<DeliveryOrder> {
    const order = await this.prisma.deliveryOrder.findUnique({ where: { id: orderId } });
    if (!order || !this.isOrderParticipant(order, userId)) {
      throw new NotFoundException('Delivery order not found');
    }
    return order;
  }

  private isOrderParticipant(order: DeliveryOrder, userId: string): boolean {
    return order.senderId === userId || order.acceptedWaylerId === userId;
  }

  private async findTicketOrThrow(ticketId: string): Promise<SupportTicket> {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
      throw new NotFoundException('Support ticket not found');
    }
    return ticket;
  }

  private async findOwnedTicketOrThrow(userId: string, ticketId: string): Promise<SupportTicket> {
    const ticket = await this.findTicketOrThrow(ticketId);
    if (ticket.userId !== userId) {
      throw new NotFoundException('Support ticket not found');
    }
    return ticket;
  }
}
