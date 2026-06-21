import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AdminDisputeListResponse } from '@wayly/types';
import { UserRole } from '@wayly/types';
import { disputesListQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodQuery } from '../../common/pipes/zod-validation.pipe';

import { DisputesService } from './disputes.service';
import { AdminDisputeListResponseDto } from './dto/swagger.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/disputes', version: '1' })
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
export class AdminDisputesController {
  constructor(private readonly disputes: DisputesService) {}

  @Get()
  @ApiOperation({ summary: 'List all disputes for admin/arbitrator operations (read-only)' })
  @ApiOkResponse({ type: AdminDisputeListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  list(
    @Query(zodQuery(disputesListQuerySchema))
    query: z.infer<typeof disputesListQuerySchema>,
  ): Promise<AdminDisputeListResponse> {
    return this.disputes.listForOperations(query);
  }
}
