import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AdminDisputeListResponse, AdminDisputeQueueItem } from '@wayly/types';
import { UserRole } from '@wayly/types';
import { adminDisputeResolveSchema, disputesListQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';

import { DisputesService } from './disputes.service';
import {
  AdminDisputeListResponseDto,
  AdminDisputeQueueItemDto,
  AdminDisputeResolveBodyDto,
} from './dto/swagger.dto';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/disputes', version: '1' })
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
export class AdminDisputesController {
  constructor(private readonly disputes: DisputesService) {}

  @Get()
  @ApiOperation({ summary: 'List all disputes for admin/arbitrator operations' })
  @ApiOkResponse({ type: AdminDisputeListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  list(
    @Query(zodQuery(disputesListQuerySchema))
    query: z.infer<typeof disputesListQuerySchema>,
  ): Promise<AdminDisputeListResponse> {
    return this.disputes.listForOperations(query);
  }

  @Post(':id/resolve')
  @ApiOperation({ summary: 'Resolve a dispute with note/outcome (admin/arbitrator manual review)' })
  @ApiBody({ type: AdminDisputeResolveBodyDto })
  @ApiOkResponse({ type: AdminDisputeQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminDisputeResolveSchema)) body: z.infer<typeof adminDisputeResolveSchema>,
  ): Promise<AdminDisputeQueueItem> {
    return this.disputes.resolveForOperations(id, body);
  }
}
