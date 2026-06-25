import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliveryOrderSource as PrismaDeliveryOrderSource,
  DeliveryOrderStatus as PrismaDeliveryOrderStatus,
  DeliveryOrderType as PrismaDeliveryOrderType,
  OrderAdminReviewStatus as PrismaOrderAdminReviewStatus,
  Prisma,
} from '@prisma/client';
import type {
  AdminOrderListResponse,
  AdminOrderQueueItem,
  DeliveryOrderDetail,
  DeliveryOrderSummary,
} from '@wayly/types';
import {
  AdminAuditLogAction,
  AdminAuditLogTargetType,
  DeliveryOrderStatus,
  NotificationType,
  OrderAdminReviewStatus,
} from '@wayly/types';
import type {
  AdminOrderClearManualReviewInput,
  AdminOrderClearRiskInput,
  AdminOrderDecisionInput,
  AdminOrderManualReviewInput,
  AdminOrderRiskFlagInput,
  AdminOrdersListQueryInput,
  CreateDeliveryOrderInput,
  DeliveryOrderQueryInput,
  SubmitDeliveryProofInput,
} from '@wayly/validation';

import { requireKycApproved } from '../../common/helpers/kyc-access.helper';
import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';
import {
  AdminAuditLogService,
  type AdminAuditRequestContext,
} from '../admin-audit/admin-audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { WaylerAccessService } from '../wayler-access/wayler-access.service';

import {
  toAdminOrderQueueItem,
  toDeliveryOrderDetail,
  toDeliveryOrderSummary,
} from './orders.mapper';

export interface OrdersListQuery extends DeliveryOrderQueryInput {
  page: number;
}

export interface OrdersMineQuery {
  status?: DeliveryOrderStatus;
  type?: DeliveryOrderQueryInput['type'];
  page: number;
  limit: number;
}

export interface DeliveryOrderListResult {
  items: DeliveryOrderSummary[];
  page: number;
  limit: number;
  total: number;
}

/** Accepted order row for Wayler tracking (includes acceptedAt). */
export interface AcceptedOrderSummary extends DeliveryOrderSummary {
  acceptedAt: string | null;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly waylerAccess: WaylerAccessService,
    private readonly adminAuditLog: AdminAuditLogService,
  ) {}

  private readonly adminOrderInclude = {
    sender: { select: { displayName: true, email: true } },
    acceptedWayler: { select: { displayName: true, email: true } },
    paymentIntent: { select: { id: true, status: true } },
    disputes: {
      select: { id: true, status: true },
      orderBy: { createdAt: 'desc' as const },
      take: 1,
    },
  } satisfies Prisma.DeliveryOrderInclude;

  async create(user: RequestUser, input: CreateDeliveryOrderInput): Promise<DeliveryOrderDetail> {
    requireKycApproved(user);

    const record = await this.prisma.deliveryOrder.create({
      data: this.toCreateData(user.id, input),
    });

    return toDeliveryOrderDetail(record);
  }

  async list(user: RequestUser, query: OrdersListQuery): Promise<DeliveryOrderListResult> {
    requireKycApproved(user);

    const status = query.status ?? DeliveryOrderStatus.OPEN;
    const where = this.buildListWhere(query, status, user.id);
    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.deliveryOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.deliveryOrder.count({ where }),
    ]);

    return {
      items: records.map(toDeliveryOrderSummary),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async listForOperations(query: AdminOrdersListQueryInput): Promise<AdminOrderListResponse> {
    const where: Prisma.DeliveryOrderWhereInput = {
      ...(query.status ? { status: query.status as PrismaDeliveryOrderStatus } : {}),
      ...(query.adminReviewStatus
        ? { adminReviewStatus: query.adminReviewStatus as PrismaOrderAdminReviewStatus }
        : {}),
      ...(query.sourceType ? { sourceType: query.sourceType as PrismaDeliveryOrderSource } : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.deliveryOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        include: this.adminOrderInclude,
      }),
      this.prisma.deliveryOrder.count({ where }),
    ]);

    return {
      items: records.map(toAdminOrderQueueItem),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  /** List delivery orders sent by the authenticated user (Sender dashboard). */
  async listMine(user: RequestUser, query: OrdersMineQuery): Promise<DeliveryOrderListResult> {
    requireKycApproved(user);

    const where: Prisma.DeliveryOrderWhereInput = {
      senderId: user.id,
      ...(query.status ? { status: query.status as PrismaDeliveryOrderStatus } : {}),
      ...(query.type ? { type: query.type as PrismaDeliveryOrderType } : {}),
    };
    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.deliveryOrder.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.deliveryOrder.count({ where }),
    ]);

    return {
      items: records.map(toDeliveryOrderSummary),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async getById(user: RequestUser, id: string): Promise<DeliveryOrderDetail> {
    requireKycApproved(user);

    const record = await this.prisma.deliveryOrder.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Delivery order not found');
    }

    if (record.status === PrismaDeliveryOrderStatus.DRAFT && record.senderId !== user.id) {
      throw new NotFoundException('Delivery order not found');
    }

    return toDeliveryOrderDetail(record);
  }

  async publish(user: RequestUser, id: string): Promise<DeliveryOrderDetail> {
    requireKycApproved(user);

    const record = await this.prisma.deliveryOrder.findUnique({ where: { id } });
    if (!record || record.senderId !== user.id) {
      throw new NotFoundException('Delivery order not found');
    }

    if (record.status !== PrismaDeliveryOrderStatus.DRAFT) {
      throw new ConflictException('Only draft delivery orders can be published');
    }

    const updated = await this.prisma.deliveryOrder.update({
      where: { id },
      data: {
        status: PrismaDeliveryOrderStatus.OPEN,
        publishedAt: new Date(),
      },
    });

    return toDeliveryOrderDetail(updated);
  }

  async accept(user: RequestUser, id: string): Promise<DeliveryOrderDetail> {
    requireKycApproved(user);

    const record = await this.prisma.deliveryOrder.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Delivery order not found');
    }

    if (record.status === PrismaDeliveryOrderStatus.DRAFT && record.senderId !== user.id) {
      throw new NotFoundException('Delivery order not found');
    }

    if (record.senderId === user.id) {
      throw new ConflictException('Sender cannot accept their own delivery order');
    }

    if (record.status === PrismaDeliveryOrderStatus.ACCEPTED) {
      throw new ConflictException('Delivery order has already been accepted');
    }

    if (record.status !== PrismaDeliveryOrderStatus.OPEN) {
      throw new ConflictException('Only open delivery orders can be accepted');
    }

    await this.waylerAccess.requireActiveAccess(user);

    const acceptedAt = new Date();
    const updated = await this.prisma.deliveryOrder.update({
      where: { id },
      data: {
        status: PrismaDeliveryOrderStatus.ACCEPTED,
        acceptedWaylerId: user.id,
        acceptedAt,
      },
    });

    await this.notifications.createForUser({
      userId: updated.senderId,
      type: NotificationType.ORDER_ACCEPTED,
      title: 'Your delivery request was accepted',
      body: `Your delivery request "${updated.title}" was accepted.`,
      relatedOrderId: updated.id,
    });

    return toDeliveryOrderDetail(updated);
  }

  async startTransit(user: RequestUser, id: string): Promise<DeliveryOrderDetail> {
    requireKycApproved(user);

    const record = await this.prisma.deliveryOrder.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Delivery order not found');
    }

    if (record.acceptedWaylerId !== user.id) {
      throw new ForbiddenException(
        'Only the accepted Wayler can start transit for this delivery order',
      );
    }

    if (record.status !== PrismaDeliveryOrderStatus.ACCEPTED) {
      throw new ConflictException('Only accepted delivery orders can be moved to in transit');
    }

    const updated = await this.prisma.deliveryOrder.update({
      where: { id },
      data: {
        status: PrismaDeliveryOrderStatus.IN_TRANSIT,
      },
    });

    await this.notifications.createForUser({
      userId: updated.senderId,
      type: NotificationType.ORDER_IN_TRANSIT,
      title: 'Your delivery is in transit',
      body: `Your delivery "${updated.title}" is now in transit.`,
      relatedOrderId: updated.id,
    });

    return toDeliveryOrderDetail(updated);
  }

  async cancel(user: RequestUser, id: string): Promise<DeliveryOrderDetail> {
    requireKycApproved(user);

    const record = await this.prisma.deliveryOrder.findUnique({ where: { id } });
    if (!record || record.senderId !== user.id) {
      throw new NotFoundException('Delivery order not found');
    }

    if (record.status === PrismaDeliveryOrderStatus.CANCELLED) {
      throw new ConflictException('Delivery order is already cancelled');
    }

    if (
      record.status !== PrismaDeliveryOrderStatus.DRAFT &&
      record.status !== PrismaDeliveryOrderStatus.OPEN
    ) {
      throw new ConflictException('Only draft or open delivery orders can be cancelled');
    }

    const cancelledAt = new Date();
    const updated = await this.prisma.deliveryOrder.update({
      where: { id },
      data: {
        status: PrismaDeliveryOrderStatus.CANCELLED,
        cancelledAt,
      },
    });

    return toDeliveryOrderDetail(updated);
  }

  async submitProof(
    user: RequestUser,
    id: string,
    input: SubmitDeliveryProofInput,
  ): Promise<DeliveryOrderDetail> {
    requireKycApproved(user);

    const record = await this.prisma.deliveryOrder.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Delivery order not found');
    }

    if (record.acceptedWaylerId !== user.id) {
      throw new ForbiddenException(
        'Only the accepted Wayler can submit proof for this delivery order',
      );
    }

    if (record.status === PrismaDeliveryOrderStatus.ACCEPTED) {
      throw new ConflictException('Delivery must be in transit before proof can be submitted');
    }

    if (
      record.status !== PrismaDeliveryOrderStatus.IN_TRANSIT &&
      record.status !== PrismaDeliveryOrderStatus.DELIVERED
    ) {
      throw new ConflictException('Proof can only be submitted for in-transit or delivered orders');
    }

    const proofSubmittedAt = new Date();
    const updated = await this.prisma.deliveryOrder.update({
      where: { id },
      data: {
        proofNote: input.note ?? record.proofNote,
        proofConfirmationCode: input.confirmationCode ?? record.proofConfirmationCode,
        proofSubmittedAt,
        proofSubmittedById: user.id,
      },
    });

    await this.notifications.createForUser({
      userId: updated.senderId,
      type: NotificationType.PROOF_SUBMITTED,
      title: 'Proof of delivery was submitted',
      body: `Proof of delivery was submitted for "${updated.title}".`,
      relatedOrderId: updated.id,
    });

    return toDeliveryOrderDetail(updated);
  }

  async markDelivered(user: RequestUser, id: string): Promise<DeliveryOrderDetail> {
    requireKycApproved(user);

    const record = await this.prisma.deliveryOrder.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException('Delivery order not found');
    }

    if (record.acceptedWaylerId !== user.id) {
      throw new ForbiddenException(
        'Only the accepted Wayler can mark this delivery order as delivered',
      );
    }

    if (record.status !== PrismaDeliveryOrderStatus.IN_TRANSIT) {
      throw new ConflictException('Only in-transit delivery orders can be marked as delivered');
    }

    const deliveredAt = new Date();
    const updated = await this.prisma.deliveryOrder.update({
      where: { id },
      data: {
        status: PrismaDeliveryOrderStatus.DELIVERED,
        deliveredAt,
      },
    });

    await this.notifications.createForUser({
      userId: updated.senderId,
      type: NotificationType.ORDER_DELIVERED,
      title: 'Your delivery was marked delivered',
      body: `Your delivery "${updated.title}" was marked as delivered.`,
      relatedOrderId: updated.id,
    });

    return toDeliveryOrderDetail(updated);
  }

  /** Orders accepted by the given Wayler (current user only at the API boundary). */
  async acceptedOrdersLog(userId: string): Promise<AcceptedOrderSummary[]> {
    const records = await this.prisma.deliveryOrder.findMany({
      where: { acceptedWaylerId: userId },
      orderBy: { acceptedAt: 'desc' },
    });

    return records.map((record) => ({
      ...toDeliveryOrderSummary(record),
      acceptedAt: record.acceptedAt?.toISOString() ?? null,
    }));
  }

  async listAcceptedByWayler(user: RequestUser): Promise<AcceptedOrderSummary[]> {
    requireKycApproved(user);
    return this.acceptedOrdersLog(user.id);
  }

  private buildListWhere(
    query: OrdersListQuery,
    status: DeliveryOrderStatus,
    currentUserId: string,
  ): Prisma.DeliveryOrderWhereInput {
    return {
      status: status as PrismaDeliveryOrderStatus,
      ...(status === DeliveryOrderStatus.DRAFT ? { senderId: currentUserId } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.pickupCountry ? { pickupCountry: query.pickupCountry } : {}),
      ...(query.pickupCity ? { pickupCity: query.pickupCity } : {}),
      ...(query.dropoffCountry ? { dropoffCountry: query.dropoffCountry } : {}),
      ...(query.dropoffCity ? { dropoffCity: query.dropoffCity } : {}),
    };
  }

  private toCreateData(
    senderId: string,
    input: CreateDeliveryOrderInput,
  ): Prisma.DeliveryOrderUncheckedCreateInput {
    const data: Prisma.DeliveryOrderUncheckedCreateInput = {
      senderId,
      status: PrismaDeliveryOrderStatus.DRAFT,
      type: input.type as PrismaDeliveryOrderType,
      title: input.title,
    };

    if (input.description !== undefined) data.description = input.description;
    if (input.packageSize !== undefined) data.packageSize = input.packageSize;
    if (input.packageWeightKg !== undefined) {
      data.packageWeightKg = new Prisma.Decimal(input.packageWeightKg);
    }
    if (input.pickupCountry !== undefined) data.pickupCountry = input.pickupCountry;
    if (input.pickupCity !== undefined) data.pickupCity = input.pickupCity;
    if (input.pickupAddressText !== undefined) data.pickupAddressText = input.pickupAddressText;
    if (input.pickupLat !== undefined) data.pickupLat = new Prisma.Decimal(input.pickupLat);
    if (input.pickupLng !== undefined) data.pickupLng = new Prisma.Decimal(input.pickupLng);
    if (input.dropoffCountry !== undefined) data.dropoffCountry = input.dropoffCountry;
    if (input.dropoffCity !== undefined) data.dropoffCity = input.dropoffCity;
    if (input.dropoffAddressText !== undefined) data.dropoffAddressText = input.dropoffAddressText;
    if (input.dropoffLat !== undefined) data.dropoffLat = new Prisma.Decimal(input.dropoffLat);
    if (input.dropoffLng !== undefined) data.dropoffLng = new Prisma.Decimal(input.dropoffLng);
    if (input.pickupDateFrom !== undefined) data.pickupDateFrom = new Date(input.pickupDateFrom);
    if (input.pickupDateTo !== undefined) data.pickupDateTo = new Date(input.pickupDateTo);
    if (input.deliveryDeadline !== undefined) {
      data.deliveryDeadline = new Date(input.deliveryDeadline);
    }
    if (input.currency !== undefined) data.currency = input.currency;
    if (input.offeredRewardAmount !== undefined) {
      data.offeredRewardAmount = new Prisma.Decimal(input.offeredRewardAmount);
    }
    if (input.escrowRequired !== undefined) data.escrowRequired = input.escrowRequired;
    if (input.notes !== undefined) data.notes = input.notes;

    return data;
  }

  async markManualReviewForOperations(
    actor: RequestUser,
    orderId: string,
    body: AdminOrderManualReviewInput,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminOrderQueueItem> {
    const order = await this.findOrderForOperations(orderId);
    const previousReviewStatus = order.adminReviewStatus as OrderAdminReviewStatus;

    if (previousReviewStatus === OrderAdminReviewStatus.MANUAL_REVIEW) {
      throw new ConflictException('Order is already marked for manual review');
    }

    const note = body.note.trim();
    const now = new Date();

    await this.prisma.deliveryOrder.update({
      where: { id: orderId },
      data: {
        adminReviewStatus: PrismaOrderAdminReviewStatus.MANUAL_REVIEW,
        adminReviewDecision: null,
        adminReviewNote: note,
        adminReviewAt: now,
        adminReviewByUserId: actor.id,
      },
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.ORDER_MANUAL_REVIEW_MARKED,
      targetType: AdminAuditLogTargetType.DELIVERY_ORDER,
      targetId: order.id,
      targetUserId: order.senderId,
      summary: `Marked order ${order.id} for manual review`,
      metadata: this.buildOrderReviewAuditMetadata(order, {
        previousReviewStatus,
        newReviewStatus: OrderAdminReviewStatus.MANUAL_REVIEW,
        reasonLength: note.length,
      }),
      requestContext,
    });

    return this.getAdminQueueItem(orderId);
  }

  async clearManualReviewForOperations(
    actor: RequestUser,
    orderId: string,
    body: AdminOrderClearManualReviewInput | undefined,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminOrderQueueItem> {
    const order = await this.findOrderForOperations(orderId);
    const previousReviewStatus = order.adminReviewStatus as OrderAdminReviewStatus;

    if (previousReviewStatus !== OrderAdminReviewStatus.MANUAL_REVIEW) {
      throw new ConflictException('Order is not marked for manual review');
    }

    const note = body?.note?.trim();

    await this.prisma.deliveryOrder.update({
      where: { id: orderId },
      data: this.clearReviewFields(),
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.ORDER_MANUAL_REVIEW_CLEARED,
      targetType: AdminAuditLogTargetType.DELIVERY_ORDER,
      targetId: order.id,
      targetUserId: order.senderId,
      summary: `Cleared manual review flag on order ${order.id}`,
      metadata: this.buildOrderReviewAuditMetadata(order, {
        previousReviewStatus,
        newReviewStatus: OrderAdminReviewStatus.NONE,
        ...(note ? { noteLength: note.length } : {}),
      }),
      requestContext,
    });

    return this.getAdminQueueItem(orderId);
  }

  async recordDecisionForOperations(
    actor: RequestUser,
    orderId: string,
    body: AdminOrderDecisionInput,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminOrderQueueItem> {
    const order = await this.findOrderForOperations(orderId);
    const previousReviewStatus = order.adminReviewStatus as OrderAdminReviewStatus;
    const note = body.note.trim();
    const now = new Date();

    await this.prisma.deliveryOrder.update({
      where: { id: orderId },
      data: {
        adminReviewStatus: PrismaOrderAdminReviewStatus.DECISION_RECORDED,
        adminReviewDecision: body.decision,
        adminReviewNote: note,
        adminReviewAt: now,
        adminReviewByUserId: actor.id,
      },
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.ORDER_DECISION_RECORDED,
      targetType: AdminAuditLogTargetType.DELIVERY_ORDER,
      targetId: order.id,
      targetUserId: order.senderId,
      summary: `Recorded decision on order ${order.id}`,
      metadata: this.buildOrderReviewAuditMetadata(order, {
        previousReviewStatus,
        newReviewStatus: OrderAdminReviewStatus.DECISION_RECORDED,
        decision: body.decision,
        noteLength: note.length,
      }),
      requestContext,
    });

    return this.getAdminQueueItem(orderId);
  }

  async flagRiskForOperations(
    actor: RequestUser,
    orderId: string,
    body: AdminOrderRiskFlagInput,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminOrderQueueItem> {
    const order = await this.findOrderForOperations(orderId);
    const previousReviewStatus = order.adminReviewStatus as OrderAdminReviewStatus;

    if (previousReviewStatus === OrderAdminReviewStatus.RISK_FLAGGED) {
      throw new ConflictException('Order is already flagged for risk');
    }

    const note = body.note.trim();
    const now = new Date();

    await this.prisma.deliveryOrder.update({
      where: { id: orderId },
      data: {
        adminReviewStatus: PrismaOrderAdminReviewStatus.RISK_FLAGGED,
        adminReviewDecision: null,
        adminReviewNote: note,
        adminReviewAt: now,
        adminReviewByUserId: actor.id,
      },
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.ORDER_RISK_FLAGGED,
      targetType: AdminAuditLogTargetType.DELIVERY_ORDER,
      targetId: order.id,
      targetUserId: order.senderId,
      summary: `Flagged order ${order.id} for risk review`,
      metadata: this.buildOrderReviewAuditMetadata(order, {
        previousReviewStatus,
        newReviewStatus: OrderAdminReviewStatus.RISK_FLAGGED,
        reasonLength: note.length,
      }),
      requestContext,
    });

    return this.getAdminQueueItem(orderId);
  }

  async clearRiskForOperations(
    actor: RequestUser,
    orderId: string,
    body: AdminOrderClearRiskInput | undefined,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminOrderQueueItem> {
    const order = await this.findOrderForOperations(orderId);
    const previousReviewStatus = order.adminReviewStatus as OrderAdminReviewStatus;

    if (previousReviewStatus !== OrderAdminReviewStatus.RISK_FLAGGED) {
      throw new ConflictException('Order is not flagged for risk');
    }

    const note = body?.note?.trim();

    await this.prisma.deliveryOrder.update({
      where: { id: orderId },
      data: this.clearReviewFields(),
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.ORDER_RISK_CLEARED,
      targetType: AdminAuditLogTargetType.DELIVERY_ORDER,
      targetId: order.id,
      targetUserId: order.senderId,
      summary: `Cleared risk flag on order ${order.id}`,
      metadata: this.buildOrderReviewAuditMetadata(order, {
        previousReviewStatus,
        newReviewStatus: OrderAdminReviewStatus.NONE,
        ...(note ? { noteLength: note.length } : {}),
      }),
      requestContext,
    });

    return this.getAdminQueueItem(orderId);
  }

  private clearReviewFields(): Prisma.DeliveryOrderUncheckedUpdateInput {
    return {
      adminReviewStatus: PrismaOrderAdminReviewStatus.NONE,
      adminReviewDecision: null,
      adminReviewNote: null,
      adminReviewAt: null,
      adminReviewByUserId: null,
    };
  }

  private async findOrderForOperations(orderId: string) {
    const order = await this.prisma.deliveryOrder.findUnique({
      where: { id: orderId },
      include: this.adminOrderInclude,
    });
    if (!order) {
      throw new NotFoundException('Delivery order not found');
    }
    return order;
  }

  private async getAdminQueueItem(orderId: string): Promise<AdminOrderQueueItem> {
    const order = await this.findOrderForOperations(orderId);
    return toAdminOrderQueueItem(order);
  }

  private buildOrderReviewAuditMetadata(
    order: Awaited<ReturnType<OrdersService['findOrderForOperations']>>,
    extra: Record<string, unknown>,
  ): Record<string, unknown> {
    const latestDispute = order.disputes[0];
    return {
      orderStatus: order.status,
      senderId: order.senderId,
      ...(order.acceptedWaylerId ? { waylerId: order.acceptedWaylerId } : {}),
      ...(order.paymentIntent ? { paymentIntentId: order.paymentIntent.id } : {}),
      ...(latestDispute ? { disputeId: latestDispute.id } : {}),
      ...extra,
    };
  }
}
