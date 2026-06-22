import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Swagger-only schema for POST /kyc/start (validated by Zod at runtime). */
export class KycStartBodyDto {
  @ApiPropertyOptional({ example: 'US' })
  country?: string;

  @ApiPropertyOptional({ example: 'basic-kyc' })
  levelName?: string;
}

/** Swagger-only schema for POST /kyc/mock/reject (validated by Zod at runtime). */
export class KycMockRejectBodyDto {
  @ApiPropertyOptional({ example: 'Document image was unreadable' })
  rejectionReason?: string;
}

export class KycVerificationSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'] })
  status!: string;

  @ApiPropertyOptional({ example: 'mock' })
  provider!: string | null;

  @ApiPropertyOptional()
  levelName!: string | null;

  @ApiPropertyOptional()
  country!: string | null;

  @ApiPropertyOptional()
  documentType!: string | null;

  @ApiPropertyOptional()
  rejectionReason!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  submittedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  reviewedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  expiresAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class KycStatusDto {
  @ApiProperty()
  verified!: boolean;

  @ApiProperty({ enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'] })
  kycStatus!: string;

  @ApiPropertyOptional({ type: KycVerificationSummaryDto })
  latestVerification!: KycVerificationSummaryDto | null;

  @ApiProperty({ description: 'True when user may create delivery orders' })
  canCreateOrder!: boolean;

  @ApiProperty()
  canBrowseOrders!: boolean;

  @ApiProperty()
  canAcceptOrder!: boolean;

  @ApiProperty()
  canChat!: boolean;

  @ApiProperty()
  canContact!: boolean;

  @ApiProperty()
  canReceivePayout!: boolean;
}

export class AdminKycQueueItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiPropertyOptional({ example: 'Sender Demo' })
  userDisplayName!: string | null;

  @ApiPropertyOptional({ example: 'sender@example.com' })
  userEmail!: string | null;

  @ApiProperty({ enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'] })
  status!: string;

  @ApiPropertyOptional({ example: 'US' })
  country!: string | null;

  @ApiPropertyOptional({ example: 'Document image was unreadable' })
  rejectionReason!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  submittedAt!: string | null;

  @ApiPropertyOptional({ format: 'date-time' })
  reviewedAt!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ format: 'date-time' })
  updatedAt!: string;
}

export class AdminKycListResponseDto {
  @ApiProperty({ type: [AdminKycQueueItemDto] })
  items!: AdminKycQueueItemDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 0 })
  total!: number;
}
