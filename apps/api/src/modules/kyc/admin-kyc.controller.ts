import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AdminKycListResponse } from '@wayly/types';
import { UserRole } from '@wayly/types';
import { kycVerificationsListQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodQuery } from '../../common/pipes/zod-validation.pipe';

import { AdminKycListResponseDto } from './dto/swagger.dto';
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
    summary: 'List KYC verifications for admin/arbitrator operations (read-only)',
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
}
