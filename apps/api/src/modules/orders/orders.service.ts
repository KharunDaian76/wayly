import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DeliveryOrderStatus as PrismaDeliveryOrderStatus,
  DeliveryOrderType as PrismaDeliveryOrderType,
  Prisma,
} from '@prisma/client';
import type { DeliveryOrderDetail, DeliveryOrderSummary } from '@wayly/types';
import { DeliveryOrderStatus } from '@wayly/types';
import type { CreateDeliveryOrderInput, DeliveryOrderQueryInput } from '@wayly/validation';

import { requireKycApproved } from '../../common/helpers/kyc-access.helper';
import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';

import { toDeliveryOrderDetail, toDeliveryOrderSummary } from './orders.mapper';

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
  constructor(private readonly prisma: PrismaService) {}

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

    const acceptedAt = new Date();
    const updated = await this.prisma.deliveryOrder.update({
      where: { id },
      data: {
        status: PrismaDeliveryOrderStatus.ACCEPTED,
        acceptedWaylerId: user.id,
        acceptedAt,
      },
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
}
