import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { User } from '@prisma/client';
import type { UpdateProfileInput } from '@wayly/validation';

import { PrismaService } from '../../infra/prisma/prisma.service';

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
