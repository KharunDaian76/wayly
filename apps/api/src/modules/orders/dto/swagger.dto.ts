import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Swagger-only schema for POST /orders (validated by Zod at runtime). */
export class CreateDeliveryOrderBodyDto {
  @ApiProperty({ enum: ['LOCAL', 'INTERNATIONAL'] })
  type!: string;

  @ApiProperty({ example: 'Documents to Berlin' })
  title!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ enum: ['SMALL', 'MEDIUM', 'LARGE', 'OVERSIZED'] })
  packageSize?: string;

  @ApiPropertyOptional({ example: 2.5 })
  packageWeightKg?: number;

  @ApiPropertyOptional({ example: 'US' })
  pickupCountry?: string;

  @ApiPropertyOptional({ example: 'New York' })
  pickupCity?: string;

  @ApiPropertyOptional()
  pickupAddressText?: string;

  @ApiPropertyOptional({ example: 40.7128 })
  pickupLat?: number;

  @ApiPropertyOptional({ example: -74.006 })
  pickupLng?: number;

  @ApiPropertyOptional({ example: 'DE' })
  dropoffCountry?: string;

  @ApiPropertyOptional({ example: 'Berlin' })
  dropoffCity?: string;

  @ApiPropertyOptional()
  dropoffAddressText?: string;

  @ApiPropertyOptional()
  dropoffLat?: number;

  @ApiPropertyOptional()
  dropoffLng?: number;

  @ApiPropertyOptional({ format: 'date-time' })
  pickupDateFrom?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  pickupDateTo?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  deliveryDeadline?: string;

  @ApiPropertyOptional({ example: 'USD' })
  currency?: string;

  @ApiPropertyOptional({ example: 50 })
  offeredRewardAmount?: number;

  @ApiPropertyOptional({ default: true })
  escrowRequired?: boolean;

  @ApiPropertyOptional()
  notes?: string;
}

export class DeliveryOrderSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  senderId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  acceptedWaylerId!: string | null;

  @ApiProperty({
    enum: ['DRAFT', 'OPEN', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'DISPUTED'],
  })
  status!: string;

  @ApiProperty({ enum: ['LOCAL', 'INTERNATIONAL'] })
  type!: string;

  @ApiProperty()
  title!: string;

  @ApiPropertyOptional()
  pickupCountry!: string | null;

  @ApiPropertyOptional()
  pickupCity!: string | null;

  @ApiPropertyOptional()
  dropoffCountry!: string | null;

  @ApiPropertyOptional()
  dropoffCity!: string | null;

  @ApiProperty()
  currency!: string;

  @ApiPropertyOptional()
  offeredRewardAmount!: string | null;

  @ApiProperty()
  escrowRequired!: boolean;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  publishedAt!: string | null;
}

export class DeliveryOrderDetailDto extends DeliveryOrderSummaryDto {
  @ApiPropertyOptional()
  description!: string | null;

  @ApiPropertyOptional({ enum: ['SMALL', 'MEDIUM', 'LARGE', 'OVERSIZED'] })
  packageSize!: string | null;

  @ApiPropertyOptional()
  packageWeightKg!: string | null;

  @ApiPropertyOptional()
  pickupAddressText!: string | null;

  @ApiPropertyOptional()
  pickupLat!: string | null;

  @ApiPropertyOptional()
  pickupLng!: string | null;

  @ApiPropertyOptional()
  dropoffAddressText!: string | null;

  @ApiPropertyOptional()
  dropoffLat!: string | null;

  @ApiPropertyOptional()
  dropoffLng!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  pickupDateFrom!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  pickupDateTo!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  deliveryDeadline!: string | null;

  @ApiPropertyOptional()
  notes!: string | null;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  acceptedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  cancelledAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  deliveredAt!: string | null;
}

export class DeliveryOrderListResponseDto {
  @ApiProperty({ type: [DeliveryOrderSummaryDto] })
  items!: DeliveryOrderSummaryDto[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;
}
