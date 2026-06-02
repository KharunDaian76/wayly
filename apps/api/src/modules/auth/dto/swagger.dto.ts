import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Swagger-only schema for POST /auth/register (validated by Zod at runtime). */
export class RegisterBodyDto {
  @ApiProperty({ example: 'sender@example.com' })
  email!: string;

  @ApiProperty({ minLength: 8, example: 'Str0ngPass!' })
  password!: string;

  @ApiProperty({ example: 'Alex Sender' })
  displayName!: string;

  @ApiPropertyOptional({ example: 'en' })
  locale?: string;

  @ApiPropertyOptional({ example: 'US' })
  country?: string;
}

/** Swagger-only schema for POST /auth/login. */
export class LoginBodyDto {
  @ApiProperty({ example: 'sender@example.com' })
  email!: string;

  @ApiProperty({ example: 'Str0ngPass!' })
  password!: string;
}

/** Swagger-only schema for POST /auth/password/forgot. */
export class PasswordResetRequestBodyDto {
  @ApiProperty({ example: 'sender@example.com' })
  email!: string;
}

/** Swagger-only schema for POST /auth/password/reset. */
export class PasswordResetConfirmBodyDto {
  @ApiProperty({ description: 'Token from the password reset email (mock-logged in dev)' })
  token!: string;

  @ApiProperty({ minLength: 8, example: 'NewStr0ngPass!' })
  password!: string;
}

/** Safe user profile returned by auth/user endpoints (no passwordHash). */
export class UserProfileDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'sender@example.com' })
  email!: string;

  @ApiProperty({ nullable: true, example: '+14155552671' })
  phone!: string | null;

  @ApiProperty({ example: 'Alex Sender' })
  displayName!: string;

  @ApiProperty({ nullable: true, example: null })
  avatarUrl!: string | null;

  @ApiProperty({ enum: ['USER', 'ADMIN', 'ARBITRATOR'], isArray: true })
  roles!: string[];

  @ApiProperty({ example: false })
  verified!: boolean;

  @ApiProperty({ enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'] })
  kycStatus!: string;

  @ApiProperty({ example: false })
  phoneVerified!: boolean;

  @ApiProperty({ example: false })
  connectOnboarded!: boolean;

  @ApiProperty({ example: 'en' })
  locale!: string;

  @ApiProperty({ nullable: true, example: 'US' })
  country!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

/** Response for register, login, and refresh. Refresh token is set via httpOnly cookie only. */
export class AuthResultDto {
  @ApiProperty({ description: 'Short-lived JWT access token (Bearer)' })
  accessToken!: string;

  @ApiProperty({ type: UserProfileDto })
  user!: UserProfileDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  ok!: true;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'If an account exists, a reset link has been sent.' })
  message!: string;
}
