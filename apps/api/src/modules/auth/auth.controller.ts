import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { AuthResult } from '@wayly/types';
import {
  loginSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
  registerSchema,
} from '@wayly/validation';
import type { Request, Response } from 'express';

import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodBody } from '../../common/pipes/zod-validation.pipe';
import { AppConfigService } from '../../config/config.service';

import { AuthService } from './auth.service';
import {
  AuthResultDto,
  LoginBodyDto,
  LogoutResponseDto,
  MessageResponseDto,
  PasswordResetConfirmBodyDto,
  PasswordResetRequestBodyDto,
  RegisterBodyDto,
} from './dto/swagger.dto';
import { RefreshTokenService } from './refresh-token.service';

@ApiTags('auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly refreshTokens: RefreshTokenService,
    private readonly config: AppConfigService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: RegisterBodyDto })
  @ApiCreatedResponse({
    type: AuthResultDto,
    description: 'User created. Refresh token is set as an httpOnly cookie (not in the body).',
  })
  async register(
    @Body(zodBody(registerSchema)) body: ReturnType<typeof registerSchema.parse>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResult> {
    const result = await this.auth.register(body, this.requestMeta(req));
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiBody({ type: LoginBodyDto })
  @ApiOkResponse({
    type: AuthResultDto,
    description: 'Login successful. Refresh token is set as an httpOnly cookie (not in the body).',
  })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(
    @Body(zodBody(loginSchema)) body: ReturnType<typeof loginSchema.parse>,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResult> {
    const result = await this.auth.login(body, this.requestMeta(req));
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate refresh token and issue a new access token',
    description:
      'Cookie-based refresh. Send the httpOnly `wayly_refresh` cookie set by login/register. ' +
      'No request body. The rotated refresh token is returned as an updated httpOnly cookie.',
  })
  @ApiCookieAuth('refresh-token')
  @ApiOkResponse({
    type: AuthResultDto,
    description: 'New access token issued. Refresh cookie is rotated.',
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token missing, expired, or reused' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResult> {
    const rawToken = req.cookies?.[this.config.auth.cookieName] as string | undefined;
    if (!rawToken) {
      throw new UnauthorizedException('Refresh token missing');
    }
    const result = await this.auth.refresh(rawToken, this.requestMeta(req));
    this.setRefreshCookie(res, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Log out and revoke the refresh token',
    description: 'Requires Bearer access token. Clears the httpOnly refresh cookie if present.',
  })
  @ApiOkResponse({ type: LogoutResponseDto })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const rawToken = req.cookies?.[this.config.auth.cookieName] as string | undefined;
    await this.auth.logout(rawToken);
    this.clearRefreshCookie(res);
    return { ok: true };
  }

  @Post('password/forgot')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({
    summary: 'Request a password reset email',
    description: 'Always returns success to prevent email enumeration.',
  })
  @ApiBody({ type: PasswordResetRequestBodyDto })
  @ApiOkResponse({ type: MessageResponseDto })
  async forgotPassword(
    @Body(zodBody(passwordResetRequestSchema))
    body: ReturnType<typeof passwordResetRequestSchema.parse>,
  ): Promise<{ message: string }> {
    await this.auth.requestPasswordReset(body);
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Reset password with a token' })
  @ApiBody({ type: PasswordResetConfirmBodyDto })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired reset token' })
  async resetPassword(
    @Body(zodBody(passwordResetConfirmSchema))
    body: ReturnType<typeof passwordResetConfirmSchema.parse>,
  ): Promise<{ message: string }> {
    await this.auth.confirmPasswordReset(body);
    return { message: 'Password has been reset successfully.' };
  }

  private setRefreshCookie(res: Response, token: string): void {
    res.cookie(this.config.auth.cookieName, token, {
      ...this.config.auth.refreshCookie,
      maxAge: this.refreshTokens.refreshMaxAgeMs,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(this.config.auth.cookieName, this.config.auth.refreshCookie);
  }

  private requestMeta(req: Request): { userAgent?: string; ip?: string } {
    return {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };
  }
}
