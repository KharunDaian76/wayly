import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  WaylerAvailabilityStatus as PrismaWaylerAvailabilityStatus,
  WaylerAvailabilityRequestStatus as PrismaWaylerAvailabilityRequestStatus,
  type Prisma,
  type WaylerAvailability,
  type WaylerAvailabilityRequest,
} from '@prisma/client';
import type {
  WaylerAvailabilityRequestDetail,
  WaylerAvailabilityRequestListResponse,
} from '@wayly/types';
import { NotificationType } from '@wayly/types';
import type {
  CreateWaylerAvailabilityRequestInput,
  RespondWaylerAvailabilityRequestInput,
  WaylerAvailabilityRequestsListQueryInput,
} from '@wayly/validation';

import { requireKycApproved } from '../../common/helpers/kyc-access.helper';
import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

import {
  toWaylerAvailabilityRequestDetail,
  toWaylerAvailabilityRequestSummary,
} from './wayler-availability-requests.mapper';

@Injectable()
export class WaylerAvailabilityRequestsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(
    user: RequestUser,
    body: CreateWaylerAvailabilityRequestInput,
  ): Promise<WaylerAvailabilityRequestDetail> {
    requireKycApproved(user);

    const availability = await this.prisma.waylerAvailability.findUnique({
      where: { id: body.availabilityId },
    });
    if (!availability) {
      throw new NotFoundException({
        code: 'AVAILABILITY_NOT_FOUND',
        message: 'Wayler availability not found',
      });
    }

    if (!this.isAvailabilityRequestable(availability)) {
      throw new ConflictException({
        code: 'AVAILABILITY_NOT_REQUESTABLE',
        message: 'This Wayler availability is not open for delivery requests',
      });
    }

    if (availability.waylerId === user.id) {
      throw new ForbiddenException({
        code: 'CANNOT_REQUEST_OWN_AVAILABILITY',
        message: 'You cannot request delivery on your own Wayler availability',
      });
    }

    const record = await this.prisma.waylerAvailabilityRequest.create({
      data: {
        availabilityId: availability.id,
        senderId: user.id,
        waylerId: availability.waylerId,
        status: PrismaWaylerAvailabilityRequestStatus.PENDING,
        title: body.title,
        packageDescription: body.packageDescription,
        pickupCountry: body.pickupCountry,
        pickupCity: body.pickupCity,
        pickupAddress: body.pickupAddress ?? null,
        dropoffCountry: body.dropoffCountry,
        dropoffCity: body.dropoffCity,
        dropoffAddress: body.dropoffAddress ?? null,
        desiredPickupFrom: body.desiredPickupFrom ? new Date(body.desiredPickupFrom) : null,
        desiredPickupTo: body.desiredPickupTo ? new Date(body.desiredPickupTo) : null,
        desiredDeliveryFrom: body.desiredDeliveryFrom ? new Date(body.desiredDeliveryFrom) : null,
        desiredDeliveryTo: body.desiredDeliveryTo ? new Date(body.desiredDeliveryTo) : null,
        proposedRewardCents: body.proposedRewardCents,
        currency: body.currency,
        message: body.message ?? null,
      },
    });

    await this.notifications.createForUser({
      userId: record.waylerId,
      type: NotificationType.SYSTEM,
      title: 'New delivery request',
      body: 'A Sender sent you a delivery request for your Wayler availability.',
    });

    return toWaylerAvailabilityRequestDetail(record);
  }

  async listMineAsSender(
    user: RequestUser,
    query: WaylerAvailabilityRequestsListQueryInput,
  ): Promise<WaylerAvailabilityRequestListResponse> {
    requireKycApproved(user);
    return this.listForFilter({ senderId: user.id }, query);
  }

  async listMineAsWayler(
    user: RequestUser,
    query: WaylerAvailabilityRequestsListQueryInput,
  ): Promise<WaylerAvailabilityRequestListResponse> {
    requireKycApproved(user);
    return this.listForFilter({ waylerId: user.id }, query);
  }

  async getDetail(user: RequestUser, id: string): Promise<WaylerAvailabilityRequestDetail> {
    requireKycApproved(user);

    const record = await this.findByIdOrThrow(id);
    this.assertParticipant(record, user.id);
    return toWaylerAvailabilityRequestDetail(record);
  }

  async accept(
    user: RequestUser,
    id: string,
    body: RespondWaylerAvailabilityRequestInput,
  ): Promise<WaylerAvailabilityRequestDetail> {
    requireKycApproved(user);

    const record = await this.findByIdOrThrow(id);
    this.assertWayler(record, user.id);
    this.assertPending(record);

    const updated = await this.prisma.waylerAvailabilityRequest.update({
      where: { id: record.id },
      data: {
        status: PrismaWaylerAvailabilityRequestStatus.ACCEPTED,
        acceptedAt: new Date(),
        responseMessage: body.responseMessage ?? null,
      },
    });

    await this.notifications.createForUser({
      userId: updated.senderId,
      type: NotificationType.SYSTEM,
      title: 'Delivery request accepted',
      body: 'Your delivery request was accepted by the Wayler.',
    });

    return toWaylerAvailabilityRequestDetail(updated);
  }

  async decline(
    user: RequestUser,
    id: string,
    body: RespondWaylerAvailabilityRequestInput,
  ): Promise<WaylerAvailabilityRequestDetail> {
    requireKycApproved(user);

    const record = await this.findByIdOrThrow(id);
    this.assertWayler(record, user.id);
    this.assertPending(record);

    const updated = await this.prisma.waylerAvailabilityRequest.update({
      where: { id: record.id },
      data: {
        status: PrismaWaylerAvailabilityRequestStatus.DECLINED,
        declinedAt: new Date(),
        responseMessage: body.responseMessage ?? null,
      },
    });

    await this.notifications.createForUser({
      userId: updated.senderId,
      type: NotificationType.SYSTEM,
      title: 'Delivery request declined',
      body: 'Your delivery request was declined by the Wayler.',
    });

    return toWaylerAvailabilityRequestDetail(updated);
  }

  async cancel(user: RequestUser, id: string): Promise<WaylerAvailabilityRequestDetail> {
    requireKycApproved(user);

    const record = await this.findByIdOrThrow(id);
    this.assertSender(record, user.id);
    this.assertPending(record);

    const updated = await this.prisma.waylerAvailabilityRequest.update({
      where: { id: record.id },
      data: {
        status: PrismaWaylerAvailabilityRequestStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    await this.notifications.createForUser({
      userId: updated.waylerId,
      type: NotificationType.SYSTEM,
      title: 'Delivery request cancelled',
      body: 'A Sender cancelled a delivery request.',
    });

    return toWaylerAvailabilityRequestDetail(updated);
  }

  private async listForFilter(
    participantFilter: Pick<Prisma.WaylerAvailabilityRequestWhereInput, 'senderId' | 'waylerId'>,
    query: WaylerAvailabilityRequestsListQueryInput,
  ): Promise<WaylerAvailabilityRequestListResponse> {
    const where: Prisma.WaylerAvailabilityRequestWhereInput = query.status
      ? { AND: [participantFilter, { status: query.status }] }
      : participantFilter;

    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.waylerAvailabilityRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.waylerAvailabilityRequest.count({ where }),
    ]);

    return {
      items: records.map(toWaylerAvailabilityRequestSummary),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  private async findByIdOrThrow(id: string): Promise<WaylerAvailabilityRequest> {
    const record = await this.prisma.waylerAvailabilityRequest.findUnique({ where: { id } });
    if (!record) {
      throw new NotFoundException({
        code: 'AVAILABILITY_REQUEST_NOT_FOUND',
        message: 'Wayler availability request not found',
      });
    }
    return record;
  }

  private assertParticipant(record: WaylerAvailabilityRequest, userId: string): void {
    if (record.senderId !== userId && record.waylerId !== userId) {
      throw new ForbiddenException({
        code: 'AVAILABILITY_REQUEST_FORBIDDEN',
        message: 'You do not have access to this availability request',
      });
    }
  }

  private assertWayler(record: WaylerAvailabilityRequest, userId: string): void {
    if (record.waylerId !== userId) {
      throw new ForbiddenException({
        code: 'AVAILABILITY_REQUEST_FORBIDDEN',
        message: 'Only the Wayler can respond to this availability request',
      });
    }
  }

  private assertSender(record: WaylerAvailabilityRequest, userId: string): void {
    if (record.senderId !== userId) {
      throw new ForbiddenException({
        code: 'AVAILABILITY_REQUEST_FORBIDDEN',
        message: 'Only the Sender can cancel this availability request',
      });
    }
  }

  private assertPending(record: WaylerAvailabilityRequest): void {
    if (record.status !== PrismaWaylerAvailabilityRequestStatus.PENDING) {
      throw new ConflictException({
        code: 'AVAILABILITY_REQUEST_NOT_PENDING',
        message: 'This availability request is no longer pending',
      });
    }
  }

  /** Matches public browse rules: ACTIVE, public, and not expired. */
  private isAvailabilityRequestable(record: WaylerAvailability): boolean {
    if (record.status !== PrismaWaylerAvailabilityStatus.ACTIVE || !record.isPublic) {
      return false;
    }
    if (record.expiresAt && record.expiresAt < new Date()) {
      return false;
    }
    return true;
  }
}
