import { createHmac, randomBytes } from 'node:crypto';

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthResult } from '@wayly/types';
import type {
  LoginInput,
  PasswordResetConfirmInput,
  PasswordResetRequestInput,
  RegisterInput,
} from '@wayly/validation';

import { AppConfigService } from '../../config/config.service';
import { PrismaService } from '../../infra/prisma/prisma.service';
import { toUserProfile } from '../users/user.mapper';
import { UsersService } from '../users/users.service';

import { PasswordService } from './password.service';
import { RefreshTokenService } from './refresh-token.service';
import { expiresAtFromDuration } from './utils/duration.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly users: UsersService,
    private readonly passwords: PasswordService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async register(
    input: RegisterInput,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthResult & { refreshToken: string }> {
    const passwordHash = await this.passwords.hash(input.password);
    const user = await this.users.create({
      email: input.email,
      passwordHash,
      displayName: input.displayName,
      locale: input.locale,
      country: input.country,
    });

    const accessToken = await this.signAccessToken(user.id, user.email, user.roles);
    const { rawToken: refreshToken } = await this.refreshTokens.issue(user.id, meta);

    return { accessToken, user: toUserProfile(user), refreshToken };
  }

  async login(
    input: LoginInput,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthResult & { refreshToken: string }> {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await this.passwords.verify(user.passwordHash, input.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.signAccessToken(user.id, user.email, user.roles);
    const { rawToken: refreshToken } = await this.refreshTokens.issue(user.id, meta);

    return { accessToken, user: toUserProfile(user), refreshToken };
  }

  async refresh(
    rawRefreshToken: string,
    meta?: { userAgent?: string; ip?: string },
  ): Promise<AuthResult & { refreshToken: string }> {
    const rotated = await this.refreshTokens.rotate(rawRefreshToken, meta);
    const user = await this.users.findById(rotated.userId);
    if (!user) {
      throw new UnauthorizedException('User not found or deactivated');
    }

    const accessToken = await this.signAccessToken(user.id, user.email, user.roles);
    return {
      accessToken,
      user: toUserProfile(user),
      refreshToken: rotated.rawToken,
    };
  }

  async logout(rawRefreshToken?: string): Promise<void> {
    if (rawRefreshToken) {
      await this.refreshTokens.revoke(rawRefreshToken);
    }
  }

  /** Always succeeds from the caller's perspective (no email enumeration). */
  async requestPasswordReset(input: PasswordResetRequestInput): Promise<void> {
    const user = await this.users.findByEmail(input.email);
    if (!user) {
      return;
    }

    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = this.hashPasswordResetToken(rawToken);
    const expiresAt = expiresAtFromDuration(this.config.auth.passwordResetTtl);

    await this.prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    // Mock email delivery until a notification provider is wired.
    this.logger.log(`[mock] Password reset token for ${user.id}: ${rawToken}`);
  }

  async confirmPasswordReset(input: PasswordResetConfirmInput): Promise<void> {
    const tokenHash = this.hashPasswordResetToken(input.token);
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await this.passwords.hash(input.password);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  private async signAccessToken(userId: string, email: string, roles: string[]): Promise<string> {
    return this.jwt.signAsync({ sub: userId, email, roles });
  }

  private hashPasswordResetToken(rawToken: string): string {
    return createHmac('sha256', this.config.jwt.refreshSecret).update(rawToken).digest('hex');
  }
}
