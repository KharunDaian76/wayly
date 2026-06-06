import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WaylerAvailabilitySummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  waylerId!: string;

  @ApiProperty({ enum: ['LOCAL_AVAILABILITY', 'TRIP_ROUTE'] })
  type!: string;

  @ApiProperty({
    enum: ['DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED'],
  })
  status!: string;

  @ApiPropertyOptional({ example: 'KG' })
  originCountry!: string | null;

  @ApiPropertyOptional({ example: 'Bishkek' })
  originCity!: string | null;

  @ApiPropertyOptional({ example: 'Chuy Region' })
  originRegion!: string | null;

  @ApiPropertyOptional({ example: 'ES' })
  destinationCountry!: string | null;

  @ApiPropertyOptional({ example: 'Madrid' })
  destinationCity!: string | null;

  @ApiPropertyOptional({ example: 'Community of Madrid' })
  destinationRegion!: string | null;

  @ApiProperty({ format: 'date-time' })
  availableFrom!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  availableTo!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  departureDate!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  returnDate!: string | null;

  @ApiPropertyOptional({ enum: ['ONE_WAY', 'RETURN', 'FLEXIBLE'] })
  tripDirection!: string | null;

  @ApiPropertyOptional({ example: 3 })
  maxPackages!: number | null;

  @ApiPropertyOptional({ example: '12.50' })
  maxWeightKg!: string | null;

  @ApiPropertyOptional({ example: 'Can carry small parcels.' })
  notes!: string | null;

  @ApiProperty()
  isPublic!: boolean;

  @ApiPropertyOptional({ format: 'date-time' })
  publishedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  pausedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  cancelledAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  expiresAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class WaylerAvailabilityDetailDto extends WaylerAvailabilitySummaryDto {}

export class WaylerAvailabilityListResponseDto {
  @ApiProperty({ type: [WaylerAvailabilitySummaryDto] })
  items!: WaylerAvailabilitySummaryDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;
}

export class ActiveWaylerCountSummaryDto {
  @ApiPropertyOptional({ example: 'KG' })
  country!: string | null;

  @ApiPropertyOptional({ example: 'Bishkek' })
  city!: string | null;

  @ApiPropertyOptional({ example: 'Chuy Region' })
  region!: string | null;

  @ApiProperty({ example: 20 })
  activeCount!: number;
}

export class CreateWaylerAvailabilityBodyDto {
  @ApiProperty({ enum: ['LOCAL_AVAILABILITY', 'TRIP_ROUTE'] })
  type!: string;

  @ApiPropertyOptional({ example: 'KG' })
  originCountry?: string;

  @ApiPropertyOptional({ example: 'Bishkek' })
  originCity?: string;

  @ApiPropertyOptional({ example: 'Chuy Region' })
  originRegion?: string;

  @ApiPropertyOptional({ example: 'ID' })
  destinationCountry?: string;

  @ApiPropertyOptional({ example: 'Jakarta' })
  destinationCity?: string;

  @ApiPropertyOptional()
  destinationRegion?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  availableFrom?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  availableTo?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  departureDate?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  returnDate?: string;

  @ApiPropertyOptional({ enum: ['ONE_WAY', 'RETURN', 'FLEXIBLE'] })
  tripDirection?: string;

  @ApiPropertyOptional({ example: 2 })
  maxPackages?: number;

  @ApiPropertyOptional({ example: 15 })
  maxWeightKg?: number;

  @ApiPropertyOptional({ example: 'Available for local deliveries today.' })
  notes?: string;
}
