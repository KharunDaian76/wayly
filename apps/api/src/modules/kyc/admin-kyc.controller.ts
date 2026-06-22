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
import type { AdminKycListResponse, AdminKycQueueItem } from '@wayly/types';
import { UserRole } from '@wayly/types';
import { adminKycRejectSchema, kycVerificationsListQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';

import {
  AdminKycListResponseDto,
  AdminKycQueueItemDto,
  AdminKycRejectBodyDto,
} from './dto/swagger.dto';
import { KycService } from './kyc.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/kyc-verifications', version: '1' })
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
export class AdminKycController {
  constructor(private readonly kyc: KycService) {}

  @Get()
  @ApiOperation({
    summary: 'List KYC verifications for admin/arbitrator operations',
  })
  @ApiOkResponse({ type: AdminKycListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  list(
    @Query(zodQuery(kycVerificationsListQuerySchema))
    query: z.infer<typeof kycVerificationsListQuerySchema>,
  ): Promise<AdminKycListResponse> {
    return this.kyc.listForOperations(query);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve a KYC verification (admin/arbitrator manual review)' })
  @ApiOkResponse({ type: AdminKycQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  approve(@Param('id', ParseUUIDPipe) id: string): Promise<AdminKycQueueItem> {
    return this.kyc.approveForOperations(id);
  }

  @Post(':id/reject')
  @ApiOperation({
    summary: 'Reject a KYC verification with reason (admin/arbitrator manual review)',
  })
  @ApiBody({ type: AdminKycRejectBodyDto })
  @ApiOkResponse({ type: AdminKycQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminKycRejectSchema)) body: z.infer<typeof adminKycRejectSchema>,
  ): Promise<AdminKycQueueItem> {
    return this.kyc.rejectForOperations(id, body.rejectionReason);
  }
}
