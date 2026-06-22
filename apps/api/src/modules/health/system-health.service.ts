import { Injectable } from '@nestjs/common';
import {
  DeliveryOrderStatus as PrismaDeliveryOrderStatus,
  DisputeStatus as PrismaDisputeStatus,
  KycStatus as PrismaKycStatus,
  PaymentStatus as PrismaPaymentStatus,
} from '@prisma/client';
import type {
  AdminPaymentStatusCount,
  AdminSystemHealthResponse,
  PaymentStatus,
} from '@wayly/types';

import { AppConfigService } from '../../config/config.service';
import { PrismaService } from '../../infra/prisma/prisma.service';

const OPEN_ORDER_STATUSES: PrismaDeliveryOrderStatus[] = [
  PrismaDeliveryOrderStatus.OPEN,
  PrismaDeliveryOrderStatus.ACCEPTED,
  PrismaDeliveryOrderStatus.IN_TRANSIT,
  PrismaDeliveryOrderStatus.DISPUTED,
];

const OPEN_DISPUTE_STATUSES: PrismaDisputeStatus[] = [
  PrismaDisputeStatus.OPEN,
  PrismaDisputeStatus.UNDER_REVIEW,
];

@Injectable()
export class SystemHealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async getForOperations(): Promise<AdminSystemHealthResponse> {
    const checkedAt = new Date().toISOString();
    const environment = this.config.core.nodeEnv;
    const appVersion: string | null = null;

    let databaseStatus: 'ok' | 'error' = 'ok';
    try {
      await this.prisma.isHealthy();
    } catch {
      databaseStatus = 'error';
    }

    const apiStatus = databaseStatus === 'ok' ? 'ok' : 'degraded';
    const overallStatus =
      databaseStatus === 'ok' ? 'healthy' : databaseStatus === 'error' ? 'degraded' : 'unknown';

    if (databaseStatus === 'error') {
      return {
        checkedAt,
        overallStatus,
        apiStatus,
        databaseStatus,
        environment,
        appVersion,
        operationalCounts: null,
        recentActivity: null,
      };
    }

    const [
      usersCount,
      pendingKycCount,
      openOrdersCount,
      openDisputesCount,
      paymentStatusGroups,
      latestUser,
      latestOrder,
      latestDispute,
      latestPayment,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.kycVerification.count({ where: { status: PrismaKycStatus.PENDING } }),
      this.prisma.deliveryOrder.count({
        where: { status: { in: OPEN_ORDER_STATUSES } },
      }),
      this.prisma.dispute.count({
        where: { status: { in: OPEN_DISPUTE_STATUSES } },
      }),
      this.prisma.paymentIntent.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.deliveryOrder.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.dispute.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.paymentIntent.findFirst({
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    const paymentIntentsByStatus: AdminPaymentStatusCount[] = paymentStatusGroups.map((row) => ({
      status: row.status as PaymentStatus,
      count: row._count.status,
    }));

    for (const status of Object.values(PrismaPaymentStatus)) {
      if (!paymentIntentsByStatus.some((row) => row.status === status)) {
        paymentIntentsByStatus.push({ status: status as PaymentStatus, count: 0 });
      }
    }

    paymentIntentsByStatus.sort((a, b) => a.status.localeCompare(b.status));

    return {
      checkedAt,
      overallStatus,
      apiStatus,
      databaseStatus,
      environment,
      appVersion,
      operationalCounts: {
        usersCount,
        pendingKycCount,
        openOrdersCount,
        openDisputesCount,
        paymentIntentsByStatus,
      },
      recentActivity: {
        latestUserCreatedAt: latestUser?.createdAt.toISOString() ?? null,
        latestOrderCreatedAt: latestOrder?.createdAt.toISOString() ?? null,
        latestDisputeCreatedAt: latestDispute?.createdAt.toISOString() ?? null,
        latestPaymentCreatedAt: latestPayment?.createdAt.toISOString() ?? null,
      },
    };
  }
}
