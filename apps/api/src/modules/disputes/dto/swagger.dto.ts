import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DisputeSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiProperty({ format: 'uuid' })
  openedById!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  assignedArbitratorId!: string | null;

  @ApiProperty({
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CANCELLED'],
  })
  status!: string;

  @ApiProperty({
    enum: [
      'ITEM_NOT_DELIVERED',
      'ITEM_DAMAGED',
      'WRONG_ITEM',
      'PAYMENT_ISSUE',
      'SAFETY_CONCERN',
      'OTHER',
    ],
  })
  reason!: string;

  @ApiProperty({ example: 'Package arrived damaged and contents were missing.' })
  description!: string;

  @ApiPropertyOptional({
    enum: ['REFUND_SENDER', 'RELEASE_TO_WAYLER', 'PARTIAL_REFUND', 'NO_ACTION', 'OTHER'],
  })
  resolution!: string | null;

  @ApiPropertyOptional({ example: 'Partial refund approved after review.' })
  resolutionNote!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  resolvedAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class DisputeMessageSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  disputeId!: string;

  @ApiProperty({ format: 'uuid' })
  senderId!: string;

  @ApiProperty({ example: 'I have photos of the damage.' })
  body!: string;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class DisputeEvidenceSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  disputeId!: string;

  @ApiProperty({ format: 'uuid' })
  submittedById!: string;

  @ApiProperty({ example: 'Delivery photo' })
  title!: string;

  @ApiPropertyOptional({ example: 'Photo taken at drop-off showing package condition.' })
  description!: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/evidence/photo.jpg' })
  fileUrl!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class DisputeDetailDto extends DisputeSummaryDto {
  @ApiProperty({ type: [DisputeMessageSummaryDto] })
  messages!: DisputeMessageSummaryDto[];

  @ApiProperty({ type: [DisputeEvidenceSummaryDto] })
  evidence!: DisputeEvidenceSummaryDto[];
}

export class DisputeListResponseDto {
  @ApiProperty({ type: [DisputeSummaryDto] })
  items!: DisputeSummaryDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 1 })
  total!: number;
}

export class OpenDisputeBodyDto {
  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiProperty({
    enum: [
      'ITEM_NOT_DELIVERED',
      'ITEM_DAMAGED',
      'WRONG_ITEM',
      'PAYMENT_ISSUE',
      'SAFETY_CONCERN',
      'OTHER',
    ],
  })
  reason!: string;

  @ApiProperty({
    example: 'Package arrived damaged and contents were missing.',
    minLength: 10,
    maxLength: 3000,
  })
  description!: string;
}

export class AddDisputeMessageBodyDto {
  @ApiProperty({ example: 'I have photos of the damage.', maxLength: 3000 })
  body!: string;
}

export class AddDisputeEvidenceBodyDto {
  @ApiProperty({ example: 'Delivery photo', maxLength: 200 })
  title!: string;

  @ApiPropertyOptional({
    example: 'Photo taken at drop-off showing package condition.',
    maxLength: 2000,
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'https://example.com/evidence/photo.jpg',
    maxLength: 1000,
  })
  fileUrl?: string;
}
