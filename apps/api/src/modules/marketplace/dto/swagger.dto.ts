import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActiveWaylerLocationCountDto {
  @ApiProperty({ example: 'TR' })
  country!: string;

  @ApiPropertyOptional({ example: 'Istanbul', nullable: true })
  city!: string | null;

  @ApiProperty({ example: 12 })
  activeWaylerCount!: number;

  @ApiPropertyOptional({ example: 4 })
  availableTripCount?: number;
}

export class ActiveWaylerMarketplaceResponseDto {
  @ApiProperty({ example: 42 })
  totalActiveWaylers!: number;

  @ApiProperty({ type: [ActiveWaylerLocationCountDto] })
  locations!: ActiveWaylerLocationCountDto[];
}
