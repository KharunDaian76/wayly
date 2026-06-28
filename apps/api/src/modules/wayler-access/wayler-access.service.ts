import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  WaylerAccessPassStatus as PrismaWaylerAccessPassStatus,
  WaylerAccessPassProvider as PrismaWaylerAccessPassProvider,
  Prisma,
  type WaylerAccessPass,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type {
  WaylerAccessPassListResponse,
  WaylerAccessPassSummary,
  WaylerAccessState,
} from '@wayly/types';
import { NotificationEntityType, NotificationType } from '@wayly/types';
import type { WaylerAccessPassesListQueryInput } from '@wayly/validation';

import { requireKycApproved } from '../../common/helpers/kyc-access.helper';
import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { appLinkHref } from '../notifications/notification.helpers';

import { toWaylerAccessPassSummary, toWaylerAccessState } from './wayler-access.mapper';

const DEFAULT_AMOUNT = new Decimal('1.00');
const DEFAULT_CURRENCY = 'EUR';

function utcDayStart(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function nextUtcDayStart(date: Date = new Date()): Date {
  const start = utcDayStart(date);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

@Injectable()
export class WaylerAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async getTodayState(user: RequestUser): Promise<WaylerAccessState> {
    requireKycApproved(user);

    const now = new Date();
    const accessDate = utcDayStart(now);
    const activePass = await this.findActivePass(user.id, now, accessDate);

    return toWaylerAccessState(activePass, now);
  }

  async listMine(
    user: RequestUser,
    query: WaylerAccessPassesListQueryInput,
  ): Promise<WaylerAccessPassListResponse> {
    requireKycApproved(user);

    const where: Prisma.WaylerAccessPassWhereInput = {
      waylerId: user.id,
      ...(query.status ? { status: query.status } : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.waylerAccessPass.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.waylerAccessPass.count({ where }),
    ]);

    return {
      items: records.map(toWaylerAccessPassSummary),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async mockActivateToday(user: RequestUser): Promise<WaylerAccessPassSummary> {
    requireKycApproved(user);

    const now = new Date();
    const accessDate = utcDayStart(now);
    const expiresAt = nextUtcDayStart(now);

    const existingActive = await this.findActivePass(user.id, now, accessDate);
    if (existingActive) {
      return toWaylerAccessPassSummary(existingActive);
    }

    const record = await this.prisma.waylerAccessPass.upsert({
      where: {
        waylerId_accessDate: {
          waylerId: user.id,
          accessDate,
        },
      },
      create: {
        waylerId: user.id,
        status: PrismaWaylerAccessPassStatus.ACTIVE,
        provider: PrismaWaylerAccessPassProvider.MANUAL,
        currency: DEFAULT_CURRENCY,
        amount: DEFAULT_AMOUNT,
        accessDate,
        startsAt: now,
        expiresAt,
        activatedAt: now,
      },
      update: {
        status: PrismaWaylerAccessPassStatus.ACTIVE,
        provider: PrismaWaylerAccessPassProvider.MANUAL,
        currency: DEFAULT_CURRENCY,
        amount: DEFAULT_AMOUNT,
        startsAt: now,
        expiresAt,
        activatedAt: now,
        cancelledAt: null,
        failedAt: null,
        refundedAt: null,
      },
    });

    await this.notifications.createForUser({
      userId: user.id,
      type: NotificationType.SUCCESS,
      title: 'Wayler work access active',
      body: 'Your Wayler work access is active for today (mock/manual).',
      entityType: NotificationEntityType.SYSTEM,
      linkHref: appLinkHref('/app#wayler-access'),
    });

    return toWaylerAccessPassSummary(record);
  }

  async cancel(user: RequestUser, id: string): Promise<WaylerAccessPassSummary> {
    requireKycApproved(user);

    const record = await this.prisma.waylerAccessPass.findUnique({ where: { id } });
    if (!record || record.waylerId !== user.id) {
      throw new NotFoundException('Wayler access pass not found');
    }

    const now = new Date();
    if (record.expiresAt <= now) {
      throw new ConflictException('Access pass is already expired');
    }

    if (
      record.status !== PrismaWaylerAccessPassStatus.ACTIVE &&
      record.status !== PrismaWaylerAccessPassStatus.PENDING
    ) {
      throw new ConflictException('Access pass cannot be cancelled in its current status');
    }

    const wasActive = record.status === PrismaWaylerAccessPassStatus.ACTIVE;

    const updated = await this.prisma.waylerAccessPass.update({
      where: { id },
      data: {
        status: PrismaWaylerAccessPassStatus.CANCELLED,
        cancelledAt: now,
      },
    });

    if (wasActive) {
      await this.notifications.createForUser({
        userId: user.id,
        type: NotificationType.INFO,
        title: 'Wayler work access cancelled',
        body: 'Your Wayler work access for today was cancelled.',
        entityType: NotificationEntityType.SYSTEM,
        linkHref: appLinkHref('/app#wayler-access'),
      });
    }

    return toWaylerAccessPassSummary(updated);
  }

  /** Throws when the Wayler has no valid active daily work access pass. */
  async requireActiveAccess(
    user: RequestUser,
    message = 'Active Wayler work access is required before accepting orders',
  ): Promise<void> {
    requireKycApproved(user);

    const now = new Date();
    const accessDate = utcDayStart(now);
    const activePass = await this.findActivePass(user.id, now, accessDate);

    if (!activePass) {
      throw new ForbiddenException({
        code: 'WAYLER_ACCESS_REQUIRED',
        message,
      });
    }
  }

  private async findActivePass(
    waylerId: string,
    now: Date,
    accessDate: Date,
  ): Promise<WaylerAccessPass | null> {
    return this.prisma.waylerAccessPass.findFirst({
      where: {
        waylerId,
        accessDate,
        status: PrismaWaylerAccessPassStatus.ACTIVE,
        startsAt: { lte: now },
        expiresAt: { gt: now },
      },
    });
  }
}
