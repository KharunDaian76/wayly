import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WaylerAccessPassSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  waylerId!: string;

  @ApiProperty({
    enum: ['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'FAILED'],
  })
  status!: string;

  @ApiProperty({ enum: ['MANUAL', 'STRIPE', 'OTHER'] })
  provider!: string;

  @ApiProperty({ example: 'EUR' })
  currency!: string;

  @ApiProperty({ example: '1.00' })
  amount!: string;

  @ApiPropertyOptional({ nullable: true })
  providerPaymentId!: string | null;

  @ApiProperty({ format: 'date-time' })
  accessDate!: string;

  @ApiProperty({ format: 'date-time' })
  startsAt!: string;

  @ApiProperty({ format: 'date-time' })
  expiresAt!: string;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  activatedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  cancelledAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  refundedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  failedAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class WaylerAccessPassListResponseDto {
  @ApiProperty({ type: [WaylerAccessPassSummaryDto] })
  items!: WaylerAccessPassSummaryDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 1 })
  total!: number;
}

export class WaylerAccessStateDto {
  @ApiProperty()
  hasActiveAccess!: boolean;

  @ApiPropertyOptional({ type: WaylerAccessPassSummaryDto, nullable: true })
  activePass!: WaylerAccessPassSummaryDto | null;

  @ApiProperty({ format: 'date-time' })
  checkedAt!: string;
}
