import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {
  WaylerAvailabilityStatus as PrismaWaylerAvailabilityStatus,
  WaylerAvailabilityType as PrismaWaylerAvailabilityType,
  Prisma,
  type WaylerAvailability,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type {
  ActiveWaylerCountSummary,
  WaylerAvailabilityDetail,
  WaylerAvailabilityListResponse,
} from '@wayly/types';
import { WaylerAvailabilityType } from '@wayly/types';
import type {
  ActiveWaylerCountsQueryInput,
  CreateWaylerAvailabilityInput,
  WaylerAvailabilitiesMineQueryInput,
  WaylerAvailabilitiesPublicQueryInput,
} from '@wayly/validation';

import { requireKycApproved } from '../../common/helpers/kyc-access.helper';
import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';

import {
  toWaylerAvailabilityDetail,
  toWaylerAvailabilitySummary,
} from './wayler-availabilities.mapper';

type ParsedQueryDate = {
  start: Date;
  end: Date;
};

@Injectable()
export class WaylerAvailabilitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    user: RequestUser,
    body: CreateWaylerAvailabilityInput,
  ): Promise<WaylerAvailabilityDetail> {
    requireKycApproved(user);

    const data = this.buildCreateData(user.id, body);
    const record = await this.prisma.waylerAvailability.create({ data });
    return toWaylerAvailabilityDetail(record, user);
  }

  async listMine(
    user: RequestUser,
    query: WaylerAvailabilitiesMineQueryInput,
  ): Promise<WaylerAvailabilityListResponse> {
    requireKycApproved(user);

    const where: Prisma.WaylerAvailabilityWhereInput = {
      waylerId: user.id,
      ...(query.status ? { status: query.status } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.waylerAvailability.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.waylerAvailability.count({ where }),
    ]);

    return {
      items: records.map((record) => toWaylerAvailabilitySummary(record, user)),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async listPublic(
    user: RequestUser,
    query: WaylerAvailabilitiesPublicQueryInput,
  ): Promise<WaylerAvailabilityListResponse> {
    requireKycApproved(user);

    const where = this.buildPublicWhere(query);
    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.waylerAvailability.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        include: {
          wayler: {
            select: { verified: true, kycStatus: true },
          },
        },
      }),
      this.prisma.waylerAvailability.count({ where }),
    ]);

    return {
      items: records.map((record) => toWaylerAvailabilitySummary(record, record.wayler)),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  async activeCounts(
    user: RequestUser,
    query: ActiveWaylerCountsQueryInput,
  ): Promise<ActiveWaylerCountSummary[]> {
    requireKycApproved(user);

    const now = new Date();
    const where: Prisma.WaylerAvailabilityWhereInput = {
      type: PrismaWaylerAvailabilityType.LOCAL_AVAILABILITY,
      status: PrismaWaylerAvailabilityStatus.ACTIVE,
      isPublic: true,
      AND: [this.buildNotExpiredFilter(now)],
    };

    if (query.country) {
      where.originCountry = query.country;
    }
    if (query.city) {
      where.originCity = query.city;
    }
    if (query.region) {
      where.originRegion = query.region;
    }

    if (query.date) {
      const parsed = this.parseQueryDate(query.date);
      where.AND = [
        ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
        { availableFrom: { lte: parsed.end } },
        {
          OR: [{ availableTo: null }, { availableTo: { gte: parsed.start } }],
        },
      ];
    }

    const groups = await this.prisma.waylerAvailability.groupBy({
      by: ['originCountry', 'originCity', 'originRegion'],
      where,
      _count: { _all: true },
    });

    return groups.map((group) => ({
      country: group.originCountry,
      city: group.originCity,
      region: group.originRegion,
      activeCount: group._count._all,
    }));
  }

  async getDetail(user: RequestUser, id: string): Promise<WaylerAvailabilityDetail> {
    requireKycApproved(user);

    const record = await this.prisma.waylerAvailability.findUnique({
      where: { id },
      include: {
        wayler: {
          select: { verified: true, kycStatus: true },
        },
      },
    });
    if (!record) {
      throw new NotFoundException('Wayler availability not found');
    }

    if (record.waylerId === user.id) {
      return toWaylerAvailabilityDetail(record, user);
    }

    if (!this.isPubliclyVisible(record)) {
      throw new NotFoundException('Wayler availability not found');
    }

    return toWaylerAvailabilityDetail(record, record.wayler);
  }

  async publish(user: RequestUser, id: string): Promise<WaylerAvailabilityDetail> {
    requireKycApproved(user);

    const record = await this.findOwnedOrThrow(user.id, id);
    if (
      record.status !== PrismaWaylerAvailabilityStatus.DRAFT &&
      record.status !== PrismaWaylerAvailabilityStatus.PAUSED
    ) {
      throw new ConflictException('Only DRAFT or PAUSED availabilities can be published');
    }

    const now = new Date();
    const updated = await this.prisma.waylerAvailability.update({
      where: { id },
      data: {
        status: PrismaWaylerAvailabilityStatus.ACTIVE,
        isPublic: true,
        publishedAt: record.publishedAt ?? now,
        expiresAt: this.computeExpiresAt(record),
        pausedAt: null,
      },
    });

    return toWaylerAvailabilityDetail(updated, user);
  }

  async pause(user: RequestUser, id: string): Promise<WaylerAvailabilityDetail> {
    requireKycApproved(user);

    const record = await this.findOwnedOrThrow(user.id, id);
    if (record.status !== PrismaWaylerAvailabilityStatus.ACTIVE) {
      throw new ConflictException('Only ACTIVE availabilities can be paused');
    }

    const updated = await this.prisma.waylerAvailability.update({
      where: { id },
      data: {
        status: PrismaWaylerAvailabilityStatus.PAUSED,
        isPublic: false,
        pausedAt: new Date(),
      },
    });

    return toWaylerAvailabilityDetail(updated, user);
  }

  async cancel(user: RequestUser, id: string): Promise<WaylerAvailabilityDetail> {
    requireKycApproved(user);

    const record = await this.findOwnedOrThrow(user.id, id);
    if (record.status === PrismaWaylerAvailabilityStatus.CANCELLED) {
      throw new ConflictException('Availability is already cancelled');
    }

    const updated = await this.prisma.waylerAvailability.update({
      where: { id },
      data: {
        status: PrismaWaylerAvailabilityStatus.CANCELLED,
        isPublic: false,
        cancelledAt: new Date(),
      },
    });

    return toWaylerAvailabilityDetail(updated, user);
  }

  private buildCreateData(
    waylerId: string,
    body: CreateWaylerAvailabilityInput,
  ): Prisma.WaylerAvailabilityCreateInput {
    const availableFrom =
      body.type === WaylerAvailabilityType.TRIP_ROUTE
        ? new Date(body.departureDate!)
        : new Date(body.availableFrom!);

    const base: Prisma.WaylerAvailabilityCreateInput = {
      wayler: { connect: { id: waylerId } },
      type: body.type,
      status: PrismaWaylerAvailabilityStatus.DRAFT,
      isPublic: false,
      availableFrom,
      originCountry: body.originCountry ?? null,
      originCity: body.originCity ?? null,
      originRegion: body.originRegion ?? null,
      availableTo: body.availableTo ? new Date(body.availableTo) : null,
      maxPackages: body.maxPackages ?? null,
      maxWeightKg: body.maxWeightKg !== undefined ? new Decimal(body.maxWeightKg) : null,
      notes: body.notes ?? null,
    };

    if (body.type === WaylerAvailabilityType.LOCAL_AVAILABILITY) {
      return {
        ...base,
        destinationCountry: null,
        destinationCity: null,
        destinationRegion: null,
        departureDate: null,
        returnDate: null,
        tripDirection: null,
      };
    }

    return {
      ...base,
      destinationCountry: body.destinationCountry ?? null,
      destinationCity: body.destinationCity ?? null,
      destinationRegion: body.destinationRegion ?? null,
      departureDate: body.departureDate ? new Date(body.departureDate) : null,
      returnDate: body.returnDate ? new Date(body.returnDate) : null,
      tripDirection: body.tripDirection ?? null,
    };
  }

  private buildPublicWhere(
    query: WaylerAvailabilitiesPublicQueryInput,
  ): Prisma.WaylerAvailabilityWhereInput {
    const now = new Date();
    const filters: Prisma.WaylerAvailabilityWhereInput[] = [
      {
        status: PrismaWaylerAvailabilityStatus.ACTIVE,
        isPublic: true,
      },
      this.buildNotExpiredFilter(now),
    ];

    if (query.type) {
      filters.push({ type: query.type });
    }
    if (query.originCountry) {
      filters.push({ originCountry: query.originCountry });
    }
    if (query.originCity) {
      filters.push({ originCity: query.originCity });
    }
    if (query.originRegion) {
      filters.push({ originRegion: query.originRegion });
    }
    if (query.destinationCountry) {
      filters.push({ destinationCountry: query.destinationCountry });
    }
    if (query.destinationCity) {
      filters.push({ destinationCity: query.destinationCity });
    }
    if (query.destinationRegion) {
      filters.push({ destinationRegion: query.destinationRegion });
    }

    if (query.date) {
      const parsed = this.parseQueryDate(query.date);
      if (query.type === WaylerAvailabilityType.LOCAL_AVAILABILITY) {
        filters.push(
          { availableFrom: { lte: parsed.end } },
          {
            OR: [{ availableTo: null }, { availableTo: { gte: parsed.start } }],
          },
        );
      } else if (query.type === WaylerAvailabilityType.TRIP_ROUTE) {
        filters.push({ departureDate: { gte: parsed.start } });
      } else {
        filters.push({
          OR: [
            {
              type: PrismaWaylerAvailabilityType.LOCAL_AVAILABILITY,
              AND: [
                { availableFrom: { lte: parsed.end } },
                {
                  OR: [{ availableTo: null }, { availableTo: { gte: parsed.start } }],
                },
              ],
            },
            {
              type: PrismaWaylerAvailabilityType.TRIP_ROUTE,
              departureDate: { gte: parsed.start },
            },
          ],
        });
      }
    }

    return { AND: filters };
  }

  private buildNotExpiredFilter(now: Date): Prisma.WaylerAvailabilityWhereInput {
    return {
      OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
    };
  }

  private isPubliclyVisible(record: WaylerAvailability): boolean {
    if (record.status !== PrismaWaylerAvailabilityStatus.ACTIVE || !record.isPublic) {
      return false;
    }
    if (record.expiresAt && record.expiresAt < new Date()) {
      return false;
    }
    return true;
  }

  private computeExpiresAt(record: WaylerAvailability): Date | null {
    if (record.availableTo) {
      return record.availableTo;
    }
    if (record.returnDate) {
      return record.returnDate;
    }
    if (record.departureDate) {
      const expires = new Date(record.departureDate);
      expires.setUTCDate(expires.getUTCDate() + 1);
      return expires;
    }
    return null;
  }

  private parseQueryDate(value: string): ParsedQueryDate {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const start = new Date(`${value}T00:00:00.000Z`);
      const end = new Date(`${value}T23:59:59.999Z`);
      return { start, end };
    }

    const parsed = new Date(value);
    return { start: parsed, end: parsed };
  }

  private async findOwnedOrThrow(waylerId: string, id: string): Promise<WaylerAvailability> {
    const record = await this.prisma.waylerAvailability.findUnique({ where: { id } });
    if (!record || record.waylerId !== waylerId) {
      throw new NotFoundException('Wayler availability not found');
    }
    return record;
  }
}
