import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminPaymentStatusCountDto {
  @ApiProperty({
    enum: [
      'PENDING',
      'AUTHORIZED',
      'HELD_IN_ESCROW',
      'RELEASED',
      'REFUNDED',
      'FAILED',
      'CANCELLED',
    ],
  })
  status!: string;

  @ApiProperty({ example: 3 })
  count!: number;
}

export class AdminSystemOperationalCountsDto {
  @ApiProperty({ example: 42 })
  usersCount!: number;

  @ApiProperty({ example: 2 })
  pendingKycCount!: number;

  @ApiProperty({ example: 5 })
  openOrdersCount!: number;

  @ApiProperty({ example: 1 })
  openDisputesCount!: number;

  @ApiProperty({ type: [AdminPaymentStatusCountDto] })
  paymentIntentsByStatus!: AdminPaymentStatusCountDto[];
}

export class AdminSystemRecentActivityDto {
  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  latestUserCreatedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  latestOrderCreatedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  latestDisputeCreatedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  latestPaymentCreatedAt!: string | null;
}

export class AdminSystemHealthResponseDto {
  @ApiProperty({ format: 'date-time' })
  checkedAt!: string;

  @ApiProperty({ enum: ['healthy', 'degraded', 'unknown'] })
  overallStatus!: string;

  @ApiProperty({ enum: ['ok', 'degraded', 'error'] })
  apiStatus!: string;

  @ApiProperty({ enum: ['ok', 'degraded', 'error'] })
  databaseStatus!: string;

  @ApiProperty({ example: 'development' })
  environment!: string;

  @ApiPropertyOptional({ example: '1.0.0', nullable: true })
  appVersion!: string | null;

  @ApiPropertyOptional({ type: AdminSystemOperationalCountsDto, nullable: true })
  operationalCounts!: AdminSystemOperationalCountsDto | null;

  @ApiPropertyOptional({ type: AdminSystemRecentActivityDto, nullable: true })
  recentActivity!: AdminSystemRecentActivityDto | null;
}
