import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const ADMIN_AUDIT_LOG_ACTIONS = [
  'KYC_APPROVED',
  'KYC_REJECTED',
  'DISPUTE_RESOLVED',
  'USER_SUSPENDED',
  'USER_UNSUSPENDED',
  'PAYMENT_MANUAL_REVIEW_MARKED',
  'PAYMENT_MANUAL_REVIEW_CLEARED',
  'PAYMENT_REFUND_DECISION_RECORDED',
  'PAYMENT_RELEASE_DECISION_RECORDED',
  'ORDER_MANUAL_REVIEW_MARKED',
  'ORDER_MANUAL_REVIEW_CLEARED',
  'ORDER_DECISION_RECORDED',
  'ORDER_RISK_FLAGGED',
  'ORDER_RISK_CLEARED',
] as const;

const ADMIN_AUDIT_LOG_TARGET_TYPES = [
  'KYC_VERIFICATION',
  'DISPUTE',
  'USER',
  'PAYMENT_INTENT',
  'DELIVERY_ORDER',
] as const;

/** Query parameters for GET /admin/audit-logs. */
export class AdminAuditLogsListQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20, minimum: 1, maximum: 100 })
  limit?: number;

  @ApiPropertyOptional({ enum: ADMIN_AUDIT_LOG_ACTIONS })
  action?: string;

  @ApiPropertyOptional({ enum: ADMIN_AUDIT_LOG_TARGET_TYPES })
  targetType?: string;

  @ApiPropertyOptional({ enum: ['SUCCESS', 'FAILED'] })
  status?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  actorUserId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  targetUserId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  targetId?: string;

  @ApiPropertyOptional({ format: 'date-time', description: 'Inclusive lower bound on createdAt' })
  from?: string;

  @ApiPropertyOptional({ format: 'date-time', description: 'Inclusive upper bound on createdAt' })
  to?: string;
}

export class AdminAuditLogItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  actorUserId!: string;

  @ApiProperty({ example: 'admin@wayly.dev' })
  actorEmailSnapshot!: string;

  @ApiProperty({ example: 'Admin User' })
  actorDisplaySnapshot!: string;

  @ApiProperty({ type: [String], example: ['ADMIN'] })
  actorRolesSnapshot!: string[];

  @ApiProperty({ enum: ADMIN_AUDIT_LOG_ACTIONS })
  action!: string;

  @ApiProperty({ enum: ADMIN_AUDIT_LOG_TARGET_TYPES })
  targetType!: string;

  @ApiProperty({ format: 'uuid' })
  targetId!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  targetUserId!: string | null;

  @ApiProperty({ enum: ['SUCCESS', 'FAILED'] })
  status!: string;

  @ApiProperty({ example: 'Approved KYC verification for user Jane Sender' })
  summary!: string;

  @ApiPropertyOptional({ type: 'object', additionalProperties: true, nullable: true })
  metadata!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  requestId!: string | null;

  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
}

export class AdminAuditLogListResponseDto {
  @ApiProperty({ type: [AdminAuditLogItemDto] })
  items!: AdminAuditLogItemDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 42 })
  total!: number;
}
