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

/** Swagger-only schema for POST /orders/:id/proof (validated by Zod at runtime). */
export class SubmitDeliveryProofBodyDto {
  @ApiPropertyOptional({ example: 'Package handed to recipient', maxLength: 1000 })
  note?: string;

  @ApiPropertyOptional({ example: '123456', maxLength: 64 })
  confirmationCode?: string;
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

  @ApiPropertyOptional()
  proofNote!: string | null;

  @ApiPropertyOptional()
  proofConfirmationCode!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  proofSubmittedAt!: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  proofSubmittedById!: string | null;
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

export class AdminOrderQueueItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: ['SENDER_POSTED_ORDER', 'WAYLER_AVAILABILITY_REQUEST'] })
  sourceType!: string;

  @ApiProperty({
    enum: ['DRAFT', 'OPEN', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'DISPUTED'],
  })
  status!: string;

  @ApiProperty({ example: 'Documents to Berlin' })
  title!: string;

  @ApiPropertyOptional({ example: 'Paris' })
  pickupCity!: string | null;

  @ApiPropertyOptional({ example: 'FR' })
  pickupCountry!: string | null;

  @ApiPropertyOptional({ example: 'Berlin' })
  dropoffCity!: string | null;

  @ApiPropertyOptional({ example: 'DE' })
  dropoffCountry!: string | null;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiPropertyOptional({ example: '50.00' })
  offeredRewardAmount!: string | null;

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

  @ApiPropertyOptional({
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
  paymentStatus!: string | null;

  @ApiPropertyOptional({
    enum: ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'CANCELLED'],
  })
  latestDisputeStatus!: string | null;

  @ApiProperty()
  proofSubmitted!: boolean;

  @ApiProperty({
    enum: ['NONE', 'MANUAL_REVIEW', 'DECISION_RECORDED', 'RISK_FLAGGED'],
    example: 'NONE',
  })
  adminReviewStatus!: string;

  @ApiPropertyOptional({
    enum: ['MONITOR', 'ESCALATE_PAYMENT', 'ESCALATE_DISPUTE', 'NO_ACTION', 'OTHER'],
  })
  adminReviewDecision!: string | null;

  @ApiPropertyOptional({ example: 'Internal ops note' })
  adminReviewNote!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  adminReviewAt!: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  adminReviewByUserId!: string | null;
}

export class AdminOrderManualReviewBodyDto {
  @ApiProperty({ example: 'Route mismatch requires manual review', maxLength: 500 })
  note!: string;
}

export class AdminOrderClearManualReviewBodyDto {
  @ApiPropertyOptional({ example: 'Review completed', maxLength: 500 })
  note?: string;
}

export class AdminOrderDecisionBodyDto {
  @ApiProperty({
    enum: ['MONITOR', 'ESCALATE_PAYMENT', 'ESCALATE_DISPUTE', 'NO_ACTION', 'OTHER'],
  })
  decision!: string;

  @ApiProperty({ example: 'Escalate to payment review queue', maxLength: 500 })
  note!: string;
}

export class AdminOrderRiskFlagBodyDto {
  @ApiProperty({ example: 'Suspicious activity reported', maxLength: 500 })
  note!: string;
}

export class AdminOrderClearRiskBodyDto {
  @ApiPropertyOptional({ example: 'Risk cleared after review', maxLength: 500 })
  note?: string;
}

/** Query parameters for GET /admin/orders. */
export class AdminOrdersListQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  limit?: number;

  @ApiPropertyOptional({
    enum: ['DRAFT', 'OPEN', 'ACCEPTED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED', 'DISPUTED'],
  })
  status?: string;

  @ApiPropertyOptional({
    enum: ['NONE', 'MANUAL_REVIEW', 'DECISION_RECORDED', 'RISK_FLAGGED'],
  })
  adminReviewStatus?: string;

  @ApiPropertyOptional({ enum: ['SENDER_POSTED_ORDER', 'WAYLER_AVAILABILITY_REQUEST'] })
  sourceType?: string;
}

export class AdminOrderListResponseDto {
  @ApiProperty({ type: [AdminOrderQueueItemDto] })
  items!: AdminOrderQueueItemDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  total!: number;
}
