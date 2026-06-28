import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AdminAuditLogListResponse } from '@wayly/types';
import { UserRole } from '@wayly/types';
import { adminAuditLogsListQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminModerateRateLimit } from '../../common/rate-limit/rate-limit.decorators';
import { zodQuery } from '../../common/pipes/zod-validation.pipe';

import { AdminAuditLogService } from './admin-audit.service';
import { AdminAuditLogListResponseDto } from './dto/swagger.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/audit-logs', version: '1' })
@AdminModerateRateLimit()
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
export class AdminAuditLogController {
  constructor(private readonly adminAuditLog: AdminAuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'List admin/arbitrator audit log entries (read-only)' })
  @ApiOkResponse({ type: AdminAuditLogListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  list(
    @Query(zodQuery(adminAuditLogsListQuerySchema))
    query: z.infer<typeof adminAuditLogsListQuerySchema>,
  ): Promise<AdminAuditLogListResponse> {
    return this.adminAuditLog.listForOperations(query);
  }
}
