import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LedgerEntryType as PrismaLedgerEntryType,
  PaymentAdminReviewStatus as PrismaPaymentAdminReviewStatus,
  PaymentProvider as PrismaPaymentProvider,
  PaymentStatus as PrismaPaymentStatus,
  PayoutStatus as PrismaPayoutStatus,
  Prisma,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type {
  AdminPaymentListResponse,
  AdminPaymentQueueItem,
  PaymentIntentSummary,
} from '@wayly/types';
import {
  AdminAuditLogAction,
  AdminAuditLogTargetType,
  DeliveryOrderStatus,
  NotificationType,
  PaymentAdminReviewStatus,
} from '@wayly/types';
import type {
  AdminPaymentClearManualReviewInput,
  AdminPaymentManualReviewInput,
  AdminPaymentRefundDecisionInput,
  AdminPaymentReleaseDecisionInput,
  AdminPaymentsListQueryInput,
} from '@wayly/validation';

import { requireKycApproved } from '../../common/helpers/kyc-access.helper';
import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';
import {
  AdminAuditLogService,
  type AdminAuditRequestContext,
} from '../admin-audit/admin-audit.service';
import { NotificationsService } from '../notifications/notifications.service';

import { toAdminPaymentQueueItem, toPaymentIntentSummary } from './payments.mapper';

const MOCK_PLATFORM_FEE_RATE = new Decimal('0.1');

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
    private readonly adminAuditLog: AdminAuditLogService,
  ) {}

  private readonly adminPaymentInclude = {
    payer: { select: { displayName: true, email: true } },
    payee: { select: { displayName: true, email: true } },
    order: {
      select: {
        title: true,
        disputes: {
          select: { id: true, status: true },
          orderBy: { createdAt: 'desc' as const },
          take: 1,
        },
      },
    },
  } satisfies Prisma.PaymentIntentInclude;

  async listForOperations(query: AdminPaymentsListQueryInput): Promise<AdminPaymentListResponse> {
    const where: Prisma.PaymentIntentWhereInput = {
      ...(query.status ? { status: query.status as PrismaPaymentStatus } : {}),
      ...(query.currency ? { currency: query.currency } : {}),
      ...(query.adminReviewStatus
        ? { adminReviewStatus: query.adminReviewStatus as PrismaPaymentAdminReviewStatus }
        : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.paymentIntent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        include: this.adminPaymentInclude,
      }),
      this.prisma.paymentIntent.count({ where }),
    ]);

    return {
      items: records.map(toAdminPaymentQueueItem),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async mockAuthorizeOrder(user: RequestUser, orderId: string): Promise<PaymentIntentSummary> {
    requireKycApproved(user);

    const order = await this.prisma.deliveryOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.senderId !== user.id) {
      throw new ForbiddenException('Only the Sender can authorize payment for this order');
    }
    if (
      order.status !== DeliveryOrderStatus.ACCEPTED &&
      order.status !== DeliveryOrderStatus.IN_TRANSIT
    ) {
      throw new ConflictException(
        'Payment can only be authorized for accepted or in-transit orders',
      );
    }
    if (!order.acceptedWaylerId) {
      throw new ConflictException('Order has no accepted Wayler');
    }
    if (order.offeredRewardAmount == null || !order.currency.trim()) {
      throw new ConflictException(
        'Order must have offered reward amount and currency before payment',
      );
    }

    const amount = order.offeredRewardAmount;
    const platformFeeAmount = amount.mul(MOCK_PLATFORM_FEE_RATE);
    const escrowAmount = amount.sub(platformFeeAmount);

    const existing = await this.prisma.paymentIntent.findUnique({ where: { orderId } });
    if (existing) {
      if (
        existing.status === PrismaPaymentStatus.RELEASED ||
        existing.status === PrismaPaymentStatus.REFUNDED
      ) {
        throw new ConflictException(
          'Payment intent cannot be re-authorized after release or refund',
        );
      }
      if (
        existing.status === PrismaPaymentStatus.AUTHORIZED ||
        existing.status === PrismaPaymentStatus.HELD_IN_ESCROW
      ) {
        return toPaymentIntentSummary(existing);
      }

      const updated = await this.prisma.$transaction(async (tx) => {
        const intent = await tx.paymentIntent.update({
          where: { id: existing.id },
          data: {
            payerId: order.senderId,
            payeeId: order.acceptedWaylerId,
            provider: PrismaPaymentProvider.MANUAL,
            status: PrismaPaymentStatus.AUTHORIZED,
            currency: order.currency,
            amount,
            platformFeeAmount,
            escrowAmount,
            authorizedAt: new Date(),
            failedAt: null,
            cancelledAt: null,
          },
        });
        await tx.ledgerEntry.create({
          data: {
            paymentIntentId: intent.id,
            orderId: order.id,
            userId: order.senderId,
            type: PrismaLedgerEntryType.PAYMENT_AUTHORIZED,
            currency: order.currency,
            amount,
            description: 'Mock payment authorized',
          },
        });
        return intent;
      });

      await this.notifications.createForUser({
        userId: order.acceptedWaylerId,
        type: NotificationType.SYSTEM,
        title: 'Payment was authorized',
        body: 'The Sender authorized payment for your delivery.',
        relatedOrderId: order.id,
      });

      return toPaymentIntentSummary(updated);
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const intent = await tx.paymentIntent.create({
        data: {
          orderId: order.id,
          payerId: order.senderId,
          payeeId: order.acceptedWaylerId,
          provider: PrismaPaymentProvider.MANUAL,
          status: PrismaPaymentStatus.AUTHORIZED,
          currency: order.currency,
          amount,
          platformFeeAmount,
          escrowAmount,
          authorizedAt: new Date(),
        },
      });
      await tx.ledgerEntry.create({
        data: {
          paymentIntentId: intent.id,
          orderId: order.id,
          userId: order.senderId,
          type: PrismaLedgerEntryType.PAYMENT_AUTHORIZED,
          currency: order.currency,
          amount,
          description: 'Mock payment authorized',
        },
      });
      return intent;
    });

    await this.notifications.createForUser({
      userId: order.acceptedWaylerId,
      type: NotificationType.SYSTEM,
      title: 'Payment was authorized',
      body: 'The Sender authorized payment for your delivery.',
      relatedOrderId: order.id,
    });

    return toPaymentIntentSummary(created);
  }

  async mockHoldEscrow(user: RequestUser, paymentIntentId: string): Promise<PaymentIntentSummary> {
    requireKycApproved(user);

    const intent = await this.prisma.paymentIntent.findUnique({
      where: { id: paymentIntentId },
    });
    if (!intent) {
      throw new NotFoundException('Payment intent not found');
    }
    if (intent.payerId !== user.id) {
      throw new ForbiddenException('Only the payer can hold escrow for this payment');
    }
    if (intent.status !== PrismaPaymentStatus.AUTHORIZED) {
      throw new ConflictException('Payment intent must be authorized before holding escrow');
    }
    if (intent.escrowAmount == null) {
      throw new ConflictException('Payment intent has no escrow amount');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const record = await tx.paymentIntent.update({
        where: { id: intent.id },
        data: {
          status: PrismaPaymentStatus.HELD_IN_ESCROW,
          escrowedAt: new Date(),
        },
      });

      await tx.ledgerEntry.create({
        data: {
          paymentIntentId: record.id,
          orderId: record.orderId,
          userId: record.payerId,
          type: PrismaLedgerEntryType.ESCROW_HELD,
          currency: record.currency,
          amount: intent.escrowAmount!,
          description: 'Mock escrow held',
        },
      });

      if (intent.platformFeeAmount != null) {
        await tx.ledgerEntry.create({
          data: {
            paymentIntentId: record.id,
            orderId: record.orderId,
            userId: record.payerId,
            type: PrismaLedgerEntryType.PLATFORM_FEE_CHARGED,
            currency: record.currency,
            amount: intent.platformFeeAmount,
            description: 'Mock platform fee charged',
          },
        });
      }

      return record;
    });

    if (intent.payeeId) {
      await this.notifications.createForUser({
        userId: intent.payeeId,
        type: NotificationType.SYSTEM,
        title: 'Escrow is held',
        body: 'Payment is now held in escrow for your delivery.',
        relatedOrderId: intent.orderId,
      });
    }

    return toPaymentIntentSummary(updated);
  }

  async mockRelease(user: RequestUser, paymentIntentId: string): Promise<PaymentIntentSummary> {
    requireKycApproved(user);

    const intent = await this.prisma.paymentIntent.findUnique({
      where: { id: paymentIntentId },
      include: { order: true },
    });
    if (!intent) {
      throw new NotFoundException('Payment intent not found');
    }
    if (intent.payerId !== user.id && intent.order.senderId !== user.id) {
      throw new ForbiddenException('Only the payer or Sender can release escrow for this payment');
    }
    if (intent.status !== PrismaPaymentStatus.HELD_IN_ESCROW) {
      throw new ConflictException('Payment intent must be held in escrow before release');
    }
    if (intent.order.status !== DeliveryOrderStatus.DELIVERED) {
      throw new ConflictException('Order must be delivered before escrow release');
    }
    if (!intent.order.proofSubmittedAt) {
      throw new ConflictException('Proof of delivery is required before escrow release');
    }
    if (!intent.payeeId || intent.escrowAmount == null) {
      throw new ConflictException('Payment intent is missing payee or escrow amount');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const record = await tx.paymentIntent.update({
        where: { id: intent.id },
        data: {
          status: PrismaPaymentStatus.RELEASED,
          releasedAt: new Date(),
        },
      });

      const payout = await tx.payout.create({
        data: {
          paymentIntentId: record.id,
          userId: intent.payeeId!,
          status: PrismaPayoutStatus.PENDING,
          currency: record.currency,
          amount: intent.escrowAmount!,
          provider: PrismaPaymentProvider.MANUAL,
        },
      });

      await tx.ledgerEntry.create({
        data: {
          paymentIntentId: record.id,
          payoutId: payout.id,
          orderId: record.orderId,
          userId: intent.payeeId,
          type: PrismaLedgerEntryType.PAYOUT_CREATED,
          currency: record.currency,
          amount: intent.escrowAmount!,
          description: 'Mock payout created on escrow release',
        },
      });

      return record;
    });

    await this.notifications.createForUser({
      userId: intent.payeeId,
      type: NotificationType.SYSTEM,
      title: 'Mock payout created',
      body: 'A mock/manual payout was created for your delivery.',
      relatedOrderId: intent.orderId,
    });

    return toPaymentIntentSummary(updated);
  }

  async forOrder(user: RequestUser, orderId: string): Promise<PaymentIntentSummary> {
    requireKycApproved(user);

    const order = await this.prisma.deliveryOrder.findUnique({ where: { id: orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.senderId !== user.id && order.acceptedWaylerId !== user.id) {
      throw new ForbiddenException('Only the Sender or accepted Wayler can view this payment');
    }

    const intent = await this.prisma.paymentIntent.findUnique({ where: { orderId } });
    if (!intent) {
      throw new NotFoundException('Payment intent not found for this order');
    }

    return toPaymentIntentSummary(intent);
  }

  async markManualReviewForOperations(
    actor: RequestUser,
    paymentId: string,
    body: AdminPaymentManualReviewInput,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminPaymentQueueItem> {
    const payment = await this.findPaymentForOperations(paymentId);
    const previousReviewStatus = payment.adminReviewStatus as PaymentAdminReviewStatus;

    if (previousReviewStatus === PaymentAdminReviewStatus.MANUAL_REVIEW) {
      throw new ConflictException('Payment is already marked for manual review');
    }

    const note = body.note.trim();
    const now = new Date();

    await this.prisma.paymentIntent.update({
      where: { id: paymentId },
      data: {
        adminReviewStatus: PrismaPaymentAdminReviewStatus.MANUAL_REVIEW,
        adminReviewDecision: null,
        adminReviewNote: note,
        adminReviewAt: now,
        adminReviewByUserId: actor.id,
      },
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.PAYMENT_MANUAL_REVIEW_MARKED,
      targetType: AdminAuditLogTargetType.PAYMENT_INTENT,
      targetId: payment.id,
      targetUserId: payment.payerId,
      summary: `Marked payment ${payment.id} for manual review`,
      metadata: this.buildPaymentReviewAuditMetadata(payment, {
        previousReviewStatus,
        newReviewStatus: PaymentAdminReviewStatus.MANUAL_REVIEW,
        reasonLength: note.length,
      }),
      requestContext,
    });

    return this.getAdminQueueItem(paymentId);
  }

  async clearManualReviewForOperations(
    actor: RequestUser,
    paymentId: string,
    body: AdminPaymentClearManualReviewInput | undefined,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminPaymentQueueItem> {
    const payment = await this.findPaymentForOperations(paymentId);
    const previousReviewStatus = payment.adminReviewStatus as PaymentAdminReviewStatus;

    if (previousReviewStatus !== PaymentAdminReviewStatus.MANUAL_REVIEW) {
      throw new ConflictException('Payment is not marked for manual review');
    }

    const note = body?.note?.trim();

    await this.prisma.paymentIntent.update({
      where: { id: paymentId },
      data: {
        adminReviewStatus: PrismaPaymentAdminReviewStatus.NONE,
        adminReviewDecision: null,
        adminReviewNote: null,
        adminReviewAt: null,
        adminReviewByUserId: null,
      },
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.PAYMENT_MANUAL_REVIEW_CLEARED,
      targetType: AdminAuditLogTargetType.PAYMENT_INTENT,
      targetId: payment.id,
      targetUserId: payment.payerId,
      summary: `Cleared manual review flag on payment ${payment.id}`,
      metadata: this.buildPaymentReviewAuditMetadata(payment, {
        previousReviewStatus,
        newReviewStatus: PaymentAdminReviewStatus.NONE,
        ...(note ? { noteLength: note.length } : {}),
      }),
      requestContext,
    });

    return this.getAdminQueueItem(paymentId);
  }

  async recordRefundDecisionForOperations(
    actor: RequestUser,
    paymentId: string,
    body: AdminPaymentRefundDecisionInput,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminPaymentQueueItem> {
    const payment = await this.findPaymentForOperations(paymentId);
    const previousReviewStatus = payment.adminReviewStatus as PaymentAdminReviewStatus;
    const note = body.note.trim();
    const now = new Date();

    await this.prisma.paymentIntent.update({
      where: { id: paymentId },
      data: {
        adminReviewStatus: PrismaPaymentAdminReviewStatus.REFUND_DECISION_RECORDED,
        adminReviewDecision: body.decision,
        adminReviewNote: note,
        adminReviewAt: now,
        adminReviewByUserId: actor.id,
      },
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.PAYMENT_REFUND_DECISION_RECORDED,
      targetType: AdminAuditLogTargetType.PAYMENT_INTENT,
      targetId: payment.id,
      targetUserId: payment.payerId,
      summary: `Recorded refund decision on payment ${payment.id}`,
      metadata: this.buildPaymentReviewAuditMetadata(payment, {
        previousReviewStatus,
        newReviewStatus: PaymentAdminReviewStatus.REFUND_DECISION_RECORDED,
        decision: body.decision,
        noteLength: note.length,
      }),
      requestContext,
    });

    return this.getAdminQueueItem(paymentId);
  }

  async recordReleaseDecisionForOperations(
    actor: RequestUser,
    paymentId: string,
    body: AdminPaymentReleaseDecisionInput,
    requestContext?: AdminAuditRequestContext,
  ): Promise<AdminPaymentQueueItem> {
    const payment = await this.findPaymentForOperations(paymentId);
    const previousReviewStatus = payment.adminReviewStatus as PaymentAdminReviewStatus;
    const note = body.note.trim();
    const now = new Date();

    await this.prisma.paymentIntent.update({
      where: { id: paymentId },
      data: {
        adminReviewStatus: PrismaPaymentAdminReviewStatus.RELEASE_DECISION_RECORDED,
        adminReviewDecision: body.decision,
        adminReviewNote: note,
        adminReviewAt: now,
        adminReviewByUserId: actor.id,
      },
    });

    this.adminAuditLog.recordBestEffort({
      actor,
      action: AdminAuditLogAction.PAYMENT_RELEASE_DECISION_RECORDED,
      targetType: AdminAuditLogTargetType.PAYMENT_INTENT,
      targetId: payment.id,
      targetUserId: payment.payerId,
      summary: `Recorded release decision on payment ${payment.id}`,
      metadata: this.buildPaymentReviewAuditMetadata(payment, {
        previousReviewStatus,
        newReviewStatus: PaymentAdminReviewStatus.RELEASE_DECISION_RECORDED,
        decision: body.decision,
        noteLength: note.length,
      }),
      requestContext,
    });

    return this.getAdminQueueItem(paymentId);
  }

  private async findPaymentForOperations(paymentId: string) {
    const payment = await this.prisma.paymentIntent.findUnique({
      where: { id: paymentId },
      include: this.adminPaymentInclude,
    });
    if (!payment) {
      throw new NotFoundException('Payment intent not found');
    }
    return payment;
  }

  private async getAdminQueueItem(paymentId: string): Promise<AdminPaymentQueueItem> {
    const payment = await this.findPaymentForOperations(paymentId);
    return toAdminPaymentQueueItem(payment);
  }

  private buildPaymentReviewAuditMetadata(
    payment: Awaited<ReturnType<PaymentsService['findPaymentForOperations']>>,
    extra: Record<string, unknown>,
  ): Record<string, unknown> {
    const latestDispute = payment.order.disputes[0];
    return {
      amount: payment.amount.toString(),
      currency: payment.currency,
      orderId: payment.orderId,
      ...(latestDispute ? { disputeId: latestDispute.id } : {}),
      ...extra,
    };
  }
}
