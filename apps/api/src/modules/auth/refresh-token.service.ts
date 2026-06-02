import { createHmac, randomBytes, randomUUID } from 'node:crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';

import { AppConfigService } from '../../config/config.service';
import { PrismaService } from '../../infra/prisma/prisma.service';

import { expiresAtFromDuration, parseDurationMs } from './utils/duration.util';

export interface IssuedRefreshToken {
  rawToken: string;
  expiresAt: Date;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  /** Hash a raw refresh token for storage/lookup (never store the raw value). */
  hashToken(rawToken: string): string {
    return createHmac('sha256', this.config.jwt.refreshSecret).update(rawToken).digest('hex');
  }

  generateRawToken(): string {
    return randomBytes(32).toString('base64url');
  }

  get refreshMaxAgeMs(): number {
    return parseDurationMs(this.config.jwt.refreshTtl);
  }

  async issue(
    userId: string,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<IssuedRefreshToken> {
    const rawToken = this.generateRawToken();
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = expiresAtFromDuration(this.config.jwt.refreshTtl);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        familyId: randomUUID(),
        userAgent: meta?.userAgent,
        ip: meta?.ip,
        expiresAt,
      },
    });

    return { rawToken, expiresAt };
  }

  /** Rotate a valid refresh token; revokes the old one and issues a new one in the same family. */
  async rotate(
    rawToken: string,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<IssuedRefreshToken & { userId: string }> {
    const tokenHash = this.hashToken(rawToken);
    const existing = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!existing) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existing.revokedAt) {
      await this.revokeFamily(existing.familyId);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    if (existing.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    const newRaw = this.generateRawToken();
    const newHash = this.hashToken(newRaw);
    const expiresAt = expiresAtFromDuration(this.config.jwt.refreshTtl);

    await this.prisma.$transaction(async (tx) => {
      const created = await tx.refreshToken.create({
        data: {
          userId: existing.userId,
          tokenHash: newHash,
          familyId: existing.familyId,
          userAgent: meta?.userAgent,
          ip: meta?.ip,
          expiresAt,
        },
      });
      await tx.refreshToken.update({
        where: { id: existing.id },
        data: { revokedAt: new Date(), replacedByTokenId: created.id },
      });
    });

    return { rawToken: newRaw, expiresAt, userId: existing.userId };
  }

  async revoke(rawToken: string): Promise<void> {
    const tokenHash = this.hashToken(rawToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
