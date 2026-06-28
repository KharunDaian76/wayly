import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationEntityType, NotificationType } from '@wayly/types';

export class NotificationSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: NotificationType })
  type!: NotificationType;

  @ApiProperty({ example: 'Delivery accepted' })
  title!: string;

  @ApiProperty({ example: 'Your delivery request was accepted by a Wayler.' })
  body!: string;

  @ApiPropertyOptional({ example: '/app#accepted-order-…' })
  linkHref!: string | null;

  @ApiPropertyOptional({ enum: NotificationEntityType })
  entityType!: NotificationEntityType | null;

  @ApiPropertyOptional({ format: 'uuid' })
  entityId!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  readAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
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
  unreadCount!: number;
}

export class NotificationUnreadCountResponseDto {
  @ApiProperty({ example: 2 })
  unreadCount!: number;
}

export class NotificationMarkAllReadResponseDto {
  @ApiProperty({ example: 2 })
  updatedCount!: number;

  @ApiProperty({ example: 0 })
  unreadCount!: number;
}
