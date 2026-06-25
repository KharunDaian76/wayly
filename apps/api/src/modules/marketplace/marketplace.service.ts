import { Injectable } from '@nestjs/common';
import {
  UserAccountStatus as PrismaUserAccountStatus,
  WaylerAvailabilityStatus as PrismaWaylerAvailabilityStatus,
  WaylerAvailabilityType as PrismaWaylerAvailabilityType,
  Prisma,
} from '@prisma/client';
import type { ActiveWaylerMarketplaceResponse } from '@wayly/types';
import type { ActiveWaylerMarketplaceQueryInput } from '@wayly/validation';

import { requireKycApproved } from '../../common/helpers/kyc-access.helper';
import type { RequestUser } from '../../common/types/request-user.type';
import { PrismaService } from '../../infra/prisma/prisma.service';

type LocationAggregate = {
  country: string;
  city: string | null;
  waylerIds: Set<string>;
  tripCount: number;
};

@Injectable()
export class MarketplaceService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveWaylerCounts(
    user: RequestUser,
    query: ActiveWaylerMarketplaceQueryInput,
  ): Promise<ActiveWaylerMarketplaceResponse> {
    requireKycApproved(user);

    const now = new Date();
    const filters: Prisma.WaylerAvailabilityWhereInput[] = [
      {
        status: PrismaWaylerAvailabilityStatus.ACTIVE,
        isPublic: true,
      },
      {
        OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
      },
      {
        wayler: {
          deletedAt: null,
          accountStatus: PrismaUserAccountStatus.ACTIVE,
        },
      },
    ];

    const originCountry = query.fromCountry ?? query.country;
    const originCity = query.fromCity ?? query.city;

    if (originCountry) {
      filters.push({ originCountry });
    }
    if (originCity) {
      filters.push({ originCity });
    }
    if (query.toCountry) {
      filters.push({ destinationCountry: query.toCountry });
    }
    if (query.toCity) {
      filters.push({ destinationCity: query.toCity });
    }

    const records = await this.prisma.waylerAvailability.findMany({
      where: { AND: filters },
      select: {
        waylerId: true,
        type: true,
        originCountry: true,
        originCity: true,
      },
    });

    const locationMap = new Map<string, LocationAggregate>();
    const allWaylerIds = new Set<string>();

    for (const record of records) {
      if (!record.originCountry) {
        continue;
      }

      allWaylerIds.add(record.waylerId);

      const key = `${record.originCountry}\0${record.originCity ?? ''}`;
      let aggregate = locationMap.get(key);
      if (!aggregate) {
        aggregate = {
          country: record.originCountry,
          city: record.originCity,
          waylerIds: new Set<string>(),
          tripCount: 0,
        };
        locationMap.set(key, aggregate);
      }

      aggregate.waylerIds.add(record.waylerId);
      if (record.type === PrismaWaylerAvailabilityType.TRIP_ROUTE) {
        aggregate.tripCount += 1;
      }
    }

    const locations = Array.from(locationMap.values())
      .map((entry) => ({
        country: entry.country,
        city: entry.city,
        activeWaylerCount: entry.waylerIds.size,
        availableTripCount: entry.tripCount > 0 ? entry.tripCount : undefined,
      }))
      .sort((a, b) => {
        if (b.activeWaylerCount !== a.activeWaylerCount) {
          return b.activeWaylerCount - a.activeWaylerCount;
        }
        const cityA = a.city ?? '';
        const cityB = b.city ?? '';
        return cityA.localeCompare(cityB);
      })
      .slice(0, query.limit);

    return {
      totalActiveWaylers: allWaylerIds.size,
      locations,
    };
  }
}
