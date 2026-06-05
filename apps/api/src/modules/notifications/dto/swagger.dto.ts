import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({
    enum: [
      'ORDER_PUBLISHED',
      'ORDER_ACCEPTED',
      'ORDER_IN_TRANSIT',
      'ORDER_DELIVERED',
      'ORDER_CANCELLED',
      'PROOF_SUBMITTED',
      'KYC_APPROVED',
      'KYC_REJECTED',
      'SYSTEM',
    ],
  })
  type!: string;

  @ApiProperty({ example: 'Delivery accepted' })
  title!: string;

  @ApiPropertyOptional({ example: 'Your delivery request was accepted by a Wayler.' })
  body!: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  relatedOrderId!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  readAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class NotificationListResponseDto {
  @ApiProperty({ type: [NotificationSummaryDto] })
  items!: NotificationSummaryDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 3 })
  total!: number;

  @ApiProperty({ example: 1 })
  unreadTotal!: number;
}

export class NotificationsUnreadCountResponseDto {
  @ApiProperty({ example: 2 })
  unreadTotal!: number;
}

export class NotificationsMarkAllReadResponseDto {
  @ApiProperty({ example: 2 })
  updatedCount!: number;

  @ApiProperty({ example: 0 })
  unreadTotal!: number;
}
