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
