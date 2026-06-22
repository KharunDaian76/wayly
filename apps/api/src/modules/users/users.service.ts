import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma, User } from '@prisma/client';
import { KycStatus as PrismaKycStatus, UserRole as PrismaUserRole } from '@prisma/client';
import type { AdminUserListResponse } from '@wayly/types';
import type { AdminUsersListQueryInput, UpdateProfileInput } from '@wayly/validation';

import { PrismaService } from '../../infra/prisma/prisma.service';

import { toAdminUserQueueItem } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
    });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    displayName: string;
    locale?: string;
    country?: string;
  }): Promise<User> {
    const email = data.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    return this.prisma.user.create({
      data: {
        email,
        passwordHash: data.passwordHash,
        displayName: data.displayName,
        locale: data.locale ?? 'en',
        country: data.country,
      },
    });
  }

  async updateProfile(userId: string, input: UpdateProfileInput): Promise<User> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const phoneChanged = input.phone !== undefined && input.phone !== user.phone;

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...input,
        ...(phoneChanged ? { phoneVerified: false } : {}),
      },
    });
  }

  async listForOperations(query: AdminUsersListQueryInput): Promise<AdminUserListResponse> {
    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.role ? { roles: { has: query.role as PrismaUserRole } } : {}),
      ...(query.kycStatus ? { kycStatus: query.kycStatus as PrismaKycStatus } : {}),
    };

    if (query.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { displayName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    const [records, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
        select: {
          id: true,
          email: true,
          displayName: true,
          roles: true,
          kycStatus: true,
          verified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              sentDeliveryOrders: true,
              acceptedDeliveryOrders: true,
              disputesOpened: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: records.map(toAdminUserQueueItem),
      page: query.page,
      limit: query.limit,
      total,
    };
  }

  /** Marks a GDPR deletion request (endpoint deferred to a later milestone). */
  async requestGdprDeletion(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: { gdprDeletionRequestedAt: new Date() },
    });
  }
}
