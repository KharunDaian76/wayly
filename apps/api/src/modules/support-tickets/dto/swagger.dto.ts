import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SupportTicketCategory, SupportTicketPriority, SupportTicketStatus } from '@wayly/types';

export class SupportTicketSummaryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional({ nullable: true })
  orderId!: string | null;

  @ApiProperty()
  subject!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty({ enum: SupportTicketCategory })
  category!: SupportTicketCategory;

  @ApiProperty({ enum: SupportTicketStatus })
  status!: SupportTicketStatus;

  @ApiProperty({ enum: SupportTicketPriority })
  priority!: SupportTicketPriority;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiPropertyOptional({ nullable: true })
  closedAt!: string | null;
}

export class SupportTicketListResponseDto {
  @ApiProperty({ type: [SupportTicketSummaryDto] })
  items!: SupportTicketSummaryDto[];
}

export class CreateSupportTicketBodyDto {
  @ApiProperty()
  subject!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty({ enum: SupportTicketCategory })
  category!: SupportTicketCategory;

  @ApiPropertyOptional()
  orderId?: string;
}

export class AdminSupportTicketQueueItemDto extends SupportTicketSummaryDto {
  @ApiPropertyOptional({ nullable: true })
  adminNote!: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastAdminActionAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastAdminActionById!: string | null;

  @ApiPropertyOptional({ nullable: true })
  userDisplayName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  userEmail!: string | null;
}

export class AdminSupportTicketListResponseDto {
  @ApiProperty({ type: [AdminSupportTicketQueueItemDto] })
  items!: AdminSupportTicketQueueItemDto[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;
}

export class AdminUpdateSupportTicketBodyDto {
  @ApiPropertyOptional({ enum: SupportTicketStatus })
  status?: SupportTicketStatus;

  @ApiPropertyOptional({ enum: SupportTicketPriority })
  priority?: SupportTicketPriority;

  @ApiPropertyOptional()
  adminNote?: string;
}
