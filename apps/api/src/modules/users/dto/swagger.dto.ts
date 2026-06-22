import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Swagger-only schema for PATCH /users/me (validated by Zod at runtime). */
export class UpdateProfileBodyDto {
  @ApiPropertyOptional({ example: 'Alex Sender' })
  displayName?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatar.png' })
  avatarUrl?: string;

  @ApiPropertyOptional({ example: 'en' })
  locale?: string;

  @ApiPropertyOptional({ example: 'US' })
  country?: string;

  @ApiPropertyOptional({ example: '+14155552671' })
  phone?: string;
}

export class AdminUserQueueItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Sender Demo' })
  displayName!: string;

  @ApiProperty({ example: 'sender@example.com' })
  email!: string;

  @ApiProperty({ enum: ['USER', 'ADMIN', 'ARBITRATOR'], isArray: true })
  roles!: string[];

  @ApiProperty({ enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'] })
  kycStatus!: string;

  @ApiProperty()
  verified!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiProperty({ example: 3 })
  postedOrdersCount!: number;

  @ApiProperty({ example: 1 })
  acceptedOrdersCount!: number;

  @ApiProperty({ example: 0 })
  disputesCount!: number;

  @ApiProperty({ format: 'date-time' })
  latestActivityAt!: string;
}

export class AdminUserListResponseDto {
  @ApiProperty({ type: [AdminUserQueueItemDto] })
  items!: AdminUserQueueItemDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  total!: number;
}
