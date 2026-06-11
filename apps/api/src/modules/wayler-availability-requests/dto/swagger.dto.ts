import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WaylerAvailabilityRequestSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  availabilityId!: string;

  @ApiProperty({ format: 'uuid' })
  senderId!: string;

  @ApiProperty({ format: 'uuid' })
  waylerId!: string;

  @ApiProperty({
    enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED', 'EXPIRED'],
  })
  status!: string;

  @ApiProperty({ example: 'Documents to Madrid' })
  title!: string;

  @ApiProperty({ example: 'Sealed envelope with contracts.' })
  packageDescription!: string;

  @ApiProperty({ example: 'KG' })
  pickupCountry!: string;

  @ApiProperty({ example: 'Bishkek' })
  pickupCity!: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  pickupAddress!: string | null;

  @ApiProperty({ example: 'ES' })
  dropoffCountry!: string;

  @ApiProperty({ example: 'Madrid' })
  dropoffCity!: string;

  @ApiPropertyOptional({ example: '456 Gran Via' })
  dropoffAddress!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  desiredPickupFrom!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  desiredPickupTo!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  desiredDeliveryFrom!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  desiredDeliveryTo!: string | null;

  @ApiProperty({ example: 2500 })
  proposedRewardCents!: number;

  @ApiProperty({ example: 'EUR' })
  currency!: string;

  @ApiPropertyOptional({ example: 'Please handle with care.' })
  message!: string | null;

  @ApiPropertyOptional({ example: 'Happy to carry this.' })
  responseMessage!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  acceptedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  declinedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  cancelledAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  expiresAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class WaylerAvailabilityRequestDetailDto extends WaylerAvailabilityRequestSummaryDto {}

export class WaylerAvailabilityRequestListResponseDto {
  @ApiProperty({ type: [WaylerAvailabilityRequestSummaryDto] })
  items!: WaylerAvailabilityRequestSummaryDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;
}

export class CreateWaylerAvailabilityRequestBodyDto {
  @ApiProperty({ format: 'uuid' })
  availabilityId!: string;

  @ApiProperty({ example: 'Documents to Madrid' })
  title!: string;

  @ApiProperty({ example: 'Sealed envelope with contracts.' })
  packageDescription!: string;

  @ApiProperty({ example: 'KG' })
  pickupCountry!: string;

  @ApiProperty({ example: 'Bishkek' })
  pickupCity!: string;

  @ApiPropertyOptional({ example: '123 Main St' })
  pickupAddress?: string;

  @ApiProperty({ example: 'ES' })
  dropoffCountry!: string;

  @ApiProperty({ example: 'Madrid' })
  dropoffCity!: string;

  @ApiPropertyOptional({ example: '456 Gran Via' })
  dropoffAddress?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  desiredPickupFrom?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  desiredPickupTo?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  desiredDeliveryFrom?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  desiredDeliveryTo?: string;

  @ApiProperty({ example: 2500 })
  proposedRewardCents!: number;

  @ApiPropertyOptional({ example: 'EUR', default: 'EUR' })
  currency?: string;

  @ApiPropertyOptional({ example: 'Please handle with care.' })
  message?: string;
}

export class RespondWaylerAvailabilityRequestBodyDto {
  @ApiPropertyOptional({ example: 'Happy to carry this.' })
  responseMessage?: string;
}
