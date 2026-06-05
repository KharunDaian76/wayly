import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  LedgerEntryType as PrismaLedgerEntryType,
  PaymentProvider as PrismaPaymentProvider,
  PaymentStatus as PrismaPaymentStatus,
  PayoutStatus as PrismaPayoutStatus,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { PaymentIntentSummary } from '@wayly/types';
import { DeliveryOrderStatus } from '@wayly/types';

import { requireKycApproved } from '../../common/helpers/kyc-access.helper';
import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';

import { toPaymentIntentSummary } from './payments.mapper';

const MOCK_PLATFORM_FEE_RATE = new Decimal('0.1');

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

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
}
