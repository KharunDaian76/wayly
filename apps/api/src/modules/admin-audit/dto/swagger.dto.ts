import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiProperty({ enum: ['KYC_APPROVED', 'KYC_REJECTED', 'DISPUTE_RESOLVED'] })
  action!: string;

  @ApiProperty({ enum: ['KYC_VERIFICATION', 'DISPUTE'] })
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
