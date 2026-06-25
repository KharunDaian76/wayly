import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentIntentSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiProperty({ format: 'uuid' })
  payerId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  payeeId!: string | null;

  @ApiProperty({ enum: ['MANUAL', 'STRIPE', 'OTHER'], example: 'MANUAL' })
  provider!: string;

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

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ example: '100.00' })
  amount!: string;

  @ApiPropertyOptional({ example: '10.00' })
  platformFeeAmount!: string | null;

  @ApiPropertyOptional({ example: '90.00' })
  escrowAmount!: string | null;

  @ApiPropertyOptional()
  providerPaymentId!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  authorizedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  escrowedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  releasedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  refundedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  failedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  cancelledAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class AdminPaymentQueueItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  orderId!: string;

  @ApiPropertyOptional({ example: 'Documents to Berlin' })
  orderTitle!: string | null;

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

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ example: '100.00' })
  amount!: string;

  @ApiPropertyOptional({ example: '10.00' })
  platformFeeAmount!: string | null;

  @ApiPropertyOptional({ example: '90.00' })
  escrowAmount!: string | null;

  @ApiPropertyOptional({ example: 'Sender Demo' })
  senderDisplayName!: string | null;

  @ApiPropertyOptional({ example: 'sender@example.com' })
  senderEmail!: string | null;

  @ApiPropertyOptional({ example: 'Wayler Demo' })
  waylerDisplayName!: string | null;

  @ApiPropertyOptional({ example: 'wayler@example.com' })
  waylerEmail!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;

  @ApiPropertyOptional({ format: 'date-time' })
  escrowedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  releasedAt!: string | null;

  @ApiPropertyOptional({
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CANCELLED'],
  })
  latestDisputeStatus!: string | null;

  @ApiProperty({
    enum: ['NONE', 'MANUAL_REVIEW', 'REFUND_DECISION_RECORDED', 'RELEASE_DECISION_RECORDED'],
    example: 'NONE',
  })
  adminReviewStatus!: string;

  @ApiPropertyOptional({
    enum: [
      'RECOMMEND_FULL_REFUND',
      'RECOMMEND_PARTIAL_REFUND',
      'RECOMMEND_RELEASE',
      'NO_ACTION',
      'OTHER',
    ],
  })
  adminReviewDecision!: string | null;

  @ApiPropertyOptional({ example: 'Internal ops note' })
  adminReviewNote!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  adminReviewAt!: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  adminReviewByUserId!: string | null;
}

export class AdminPaymentManualReviewBodyDto {
  @ApiProperty({ example: 'Escrow hold requires manual review', maxLength: 500 })
  note!: string;
}

export class AdminPaymentClearManualReviewBodyDto {
  @ApiPropertyOptional({ example: 'Review completed', maxLength: 500 })
  note?: string;
}

export class AdminPaymentRefundDecisionBodyDto {
  @ApiProperty({
    enum: ['RECOMMEND_FULL_REFUND', 'RECOMMEND_PARTIAL_REFUND', 'NO_ACTION', 'OTHER'],
  })
  decision!: string;

  @ApiProperty({ example: 'Recommend full refund pending provider integration', maxLength: 500 })
  note!: string;
}

export class AdminPaymentReleaseDecisionBodyDto {
  @ApiProperty({ enum: ['RECOMMEND_RELEASE', 'NO_ACTION', 'OTHER'] })
  decision!: string;

  @ApiProperty({ example: 'Recommend release after proof verified', maxLength: 500 })
  note!: string;
}

export class AdminPaymentListResponseDto {
  @ApiProperty({ type: [AdminPaymentQueueItemDto] })
  items!: AdminPaymentQueueItemDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  total!: number;
}
