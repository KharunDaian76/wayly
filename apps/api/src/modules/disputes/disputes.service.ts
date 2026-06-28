import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliveryOrderStatus as PrismaDeliveryOrderStatus,
  DisputeResolution as PrismaDisputeResolution,
  DisputeStatus as PrismaDisputeStatus,
  type DeliveryOrder,
  type Dispute,
  type Prisma,
} from '@prisma/client';
import type {
  AdminDisputeListResponse,
  AdminDisputeQueueItem,
  DisputeDetail,
  DisputeEvidenceSummary,
  DisputeListResponse,
  DisputeMessageSummary,
} from '@wayly/types';
import {
  AdminAuditLogAction,
  AdminAuditLogTargetType,
  NotificationEntityType,
  NotificationType,
} from '@wayly/types';
import type {
  AddDisputeEvidenceInput,
  AddDisputeMessageInput,
  AdminDisputeResolveInput,
  DisputesListQueryInput,
  OpenDisputeInput,
} from '@wayly/validation';
import { AdminDisputeResolutionOutcome } from '@wayly/validation';

import { requireKycApproved } from '../../common/helpers/kyc-access.helper';
import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';
import {
  AdminAuditLogService,
  type AdminAuditRequestContext,
} from '../admin-audit/admin-audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { orderNotificationLink } from '../notifications/notification.helpers';

import {
  toAdminDisputeQueueItem,
  toDisputeDetail,
  toDisputeEvidenceSummary,
  toDisputeMessageSummary,
  toDisputeSummary,
} from './disputes.mapper';

const DISPUTE_ELIGIBLE_ORDER_STATUSES: PrismaDeliveryOrderStatus[] = [
  PrismaDeliveryOrderStatus.ACCEPTED,
  PrismaDeliveryOrderStatus.IN_TRANSIT,
  PrismaDeliveryOrderStatus.DELIVERED,
];

const ACTIVE_DISPUTE_STATUSES: PrismaDisputeStatus[] = [
  PrismaDisputeStatus.OPEN,
  PrismaDisputeStatus.UNDER_REVIEW,
];

const DISPUTE_MESSAGE_PREVIEW_MAX = 80;

@Injectable()
export class DisputesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly adminAuditLog: AdminAuditLogService,
  ) {}

  async open(user: RequestUser, body: OpenDisputeInput): Promise<DisputeDetail> {
    requireKycApproved(user);

    const order = await this.findOrderForParticipantOrThrow(user.id, body.orderId);
    this.assertOrderDisputeEligible(order);

    const existingActive = await this.prisma.dispute.findFirst({
      where: {
        orderId: order.id,
        status: { in: ACTIVE_DISPUTE_STATUSES },
      },
    });
    if (existingActive) {
      throw new ConflictException('An active dispute already exists for this delivery order');
    }

    const dispute = await this.prisma.dispute.create({
      data: {
        orderId: order.id,
        openedById: user.id,
        status: PrismaDisputeStatus.OPEN,
        reason: body.reason,
        description: body.description,
      },
    });

    const recipientId = this.getOtherOrderParticipant(order, user.id);
    if (recipientId) {
      await this.notifications.createForUser({
        userId: recipientId,
        type: NotificationType.ACTION_REQUIRED,
        title: 'Dispute opened',
        body: 'A dispute was opened for one of your deliveries.',
        entityType: NotificationEntityType.DISPUTE,
        entityId: dispute.id,
        linkHref: orderNotificationLink(order.id),
      });
    }

    return toDisputeDetail(dispute, [], []);
  }

  async list(user: RequestUser, query: DisputesListQueryInput): Promise<DisputeListResponse> {
    requireKycApproved(user);

    const participantFilter: Prisma.DisputeWhereInput = {
      OR: [
        { openedById: user.id },
        { order: { senderId: user.id } },
        { order: { acceptedWaylerId: user.id } },
      ],
    };

    const where: Prisma.DisputeWhereInput = query.status
      ? { AND: [participantFilter, { status: query.status }] }
      : participantFilter;

    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return {
      items: records.map(toDisputeSummary),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async listForOperations(query: DisputesListQueryInput): Promise<AdminDisputeListResponse> {
    const where: Prisma.DisputeWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.orderId ? { orderId: query.orderId } : {}),
      ...(query.openedById ? { openedById: query.openedById } : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        include: {
          order: {
            select: {
              title: true,
              pickupCity: true,
              pickupCountry: true,
              dropoffCity: true,
              dropoffCountry: true,
              sender: { select: { displayName: true, email: true } },
              acceptedWayler: { select: { displayName: true, email: true } },
            },
          },
        },
      }),
      this.prisma.dispute.count({ where }),
    ]);

    return {
      items: records.map(toAdminDisputeQueueItem),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async resolveForOperations(
    actor: RequestUser,
    disputeId: string,
    body: AdminDisputeResolveInput,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminDisputeQueueItem> {
    const dispute = await this.findDisputeForOperations(disputeId);
    const previousStatus = dispute.status;

    if (dispute.status === PrismaDisputeStatus.RESOLVED) {
      throw new BadRequestException('Dispute is already resolved');
    }
    if (!ACTIVE_DISPUTE_STATUSES.includes(dispute.status)) {
      throw new BadRequestException('Dispute cannot be resolved');
    }

    const resolution = this.mapAdminOutcomeToResolution(body.outcome);
    const now = new Date();
    const updated = await this.prisma.dispute.update({
      where: { id: disputeId },
      data: {
        status: PrismaDisputeStatus.RESOLVED,
        resolution,
        resolutionNote: body.resolutionNote,
        resolvedAt: now,
      },
      include: {
        order: {
          select: {
            title: true,
            pickupCity: true,
            pickupCountry: true,
            dropoffCity: true,
            dropoffCountry: true,
            sender: { select: { displayName: true, email: true } },
            acceptedWayler: { select: { displayName: true, email: true } },
          },
        },
      },
    });

    const orderLabel = updated.order.title?.trim() || updated.orderId;
    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.DISPUTE_RESOLVED,
      targetType: AdminAuditLogTargetType.DISPUTE,
      targetId: updated.id,
      summary: `Resolved dispute for order ${orderLabel}`,
      metadata: {
        previousStatus,
        newStatus: PrismaDisputeStatus.RESOLVED,
        orderId: updated.orderId,
        resolution,
        ...(body.outcome ? { outcome: body.outcome } : {}),
      },
      requestContext,
    });

    return toAdminDisputeQueueItem(updated);
  }

  private async findDisputeForOperations(disputeId: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: {
            title: true,
            pickupCity: true,
            pickupCountry: true,
            dropoffCity: true,
            dropoffCountry: true,
            sender: { select: { displayName: true, email: true } },
            acceptedWayler: { select: { displayName: true, email: true } },
          },
        },
      },
    });
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    return dispute;
  }

  private mapAdminOutcomeToResolution(
    outcome: AdminDisputeResolveInput['outcome'],
  ): PrismaDisputeResolution {
    switch (outcome) {
      case AdminDisputeResolutionOutcome.SENDER_FAVORED:
        return PrismaDisputeResolution.REFUND_SENDER;
      case AdminDisputeResolutionOutcome.WAYLER_FAVORED:
        return PrismaDisputeResolution.RELEASE_TO_WAYLER;
      case AdminDisputeResolutionOutcome.INFORMATION_ONLY:
        return PrismaDisputeResolution.OTHER;
      case AdminDisputeResolutionOutcome.NO_FAULT:
      default:
        return PrismaDisputeResolution.NO_ACTION;
    }
  }

  async getDetail(user: RequestUser, id: string): Promise<DisputeDetail> {
    requireKycApproved(user);

    const dispute = await this.findDisputeWithOrderOrThrow(id);
    this.assertDisputeAccess(dispute, user.id);

    const [messages, evidence] = await Promise.all([
      this.prisma.disputeMessage.findMany({
        where: { disputeId: dispute.id },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.disputeEvidence.findMany({
        where: { disputeId: dispute.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return toDisputeDetail(dispute, messages, evidence);
  }

  async addMessage(
    user: RequestUser,
    id: string,
    body: AddDisputeMessageInput,
  ): Promise<DisputeMessageSummary> {
    requireKycApproved(user);

    const dispute = await this.findDisputeWithOrderOrThrow(id);
    this.assertDisputeAccess(dispute, user.id);
    this.assertDisputeAcceptsUpdates(dispute);

    const message = await this.prisma.disputeMessage.create({
      data: {
        disputeId: dispute.id,
        senderId: user.id,
        body: body.body,
      },
    });

    const recipientId = this.getOtherOrderParticipant(dispute.order, user.id);
    if (recipientId) {
      await this.notifications.createForUser({
        userId: recipientId,
        type: NotificationType.INFO,
        title: 'New dispute message',
        body: this.buildDisputeMessageNotificationBody(body.body),
        entityType: NotificationEntityType.DISPUTE,
        entityId: dispute.id,
        linkHref: orderNotificationLink(dispute.orderId),
      });
    }

    return toDisputeMessageSummary(message);
  }

  async addEvidence(
    user: RequestUser,
    id: string,
    body: AddDisputeEvidenceInput,
  ): Promise<DisputeEvidenceSummary> {
    requireKycApproved(user);

    const dispute = await this.findDisputeWithOrderOrThrow(id);
    this.assertDisputeAccess(dispute, user.id);
    this.assertDisputeAcceptsUpdates(dispute);

    const evidence = await this.prisma.disputeEvidence.create({
      data: {
        disputeId: dispute.id,
        submittedById: user.id,
        title: body.title,
        description: body.description ?? null,
        fileUrl: body.fileUrl ?? null,
      },
    });

    const recipientId = this.getOtherOrderParticipant(dispute.order, user.id);
    if (recipientId) {
      await this.notifications.createForUser({
        userId: recipientId,
        type: NotificationType.INFO,
        title: 'New dispute evidence',
        body: 'New evidence was added to a dispute.',
        entityType: NotificationEntityType.DISPUTE,
        entityId: dispute.id,
        linkHref: orderNotificationLink(dispute.orderId),
      });
    }

    return toDisputeEvidenceSummary(evidence);
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

  private assertOrderDisputeEligible(order: DeliveryOrder): void {
    if (!DISPUTE_ELIGIBLE_ORDER_STATUSES.includes(order.status)) {
      throw new ConflictException(
        'Disputes can only be opened for accepted, in-transit, or delivered orders',
      );
    }
  }

  private isOrderParticipant(order: DeliveryOrder, userId: string): boolean {
    return order.senderId === userId || order.acceptedWaylerId === userId;
  }

  private async findDisputeWithOrderOrThrow(
    disputeId: string,
  ): Promise<Dispute & { order: Pick<DeliveryOrder, 'senderId' | 'acceptedWaylerId'> }> {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id: disputeId },
      include: {
        order: {
          select: { senderId: true, acceptedWaylerId: true },
        },
      },
    });
    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }
    return dispute;
  }

  private assertDisputeAccess(
    dispute: Dispute & { order: Pick<DeliveryOrder, 'senderId' | 'acceptedWaylerId'> },
    userId: string,
  ): void {
    const isParticipant =
      dispute.openedById === userId ||
      dispute.order.senderId === userId ||
      dispute.order.acceptedWaylerId === userId ||
      dispute.assignedArbitratorId === userId;

    if (!isParticipant) {
      throw new NotFoundException('Dispute not found');
    }
  }

  private assertDisputeAcceptsUpdates(dispute: Dispute): void {
    if (!ACTIVE_DISPUTE_STATUSES.includes(dispute.status)) {
      throw new ConflictException('Dispute is not open for new messages or evidence');
    }
  }

  private getOtherOrderParticipant(
    order: Pick<DeliveryOrder, 'senderId' | 'acceptedWaylerId'>,
    actorId: string,
  ): string | null {
    if (order.senderId === actorId && order.acceptedWaylerId) {
      return order.acceptedWaylerId;
    }
    if (order.acceptedWaylerId === actorId) {
      return order.senderId;
    }
    return null;
  }

  private buildDisputeMessageNotificationBody(messageBody: string): string {
    const trimmed = messageBody.trim();
    if (!trimmed) {
      return 'A new message was added to a dispute.';
    }

    const preview =
      trimmed.length > DISPUTE_MESSAGE_PREVIEW_MAX
        ? `${trimmed.slice(0, DISPUTE_MESSAGE_PREVIEW_MAX)}…`
        : trimmed;

    return `A new message was added to a dispute: "${preview}"`;
  }
}
