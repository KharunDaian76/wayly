import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { KycVerificationSummary } from '@wayly/types';
import { kycStartSchema } from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodBody } from '../../common/pipes/zod-validation.pipe';
import { UserWriteRateLimit } from '../../common/rate-limit/rate-limit.decorators';
import type { RequestUser } from '../../common/types/request-user.type';

import {
  KycMockRejectBodyDto,
  KycStartBodyDto,
  KycStatusDto,
  KycVerificationSummaryDto,
} from './dto/swagger.dto';
import { KycService, type KycStatusView } from './kyc.service';

const kycMockRejectBodySchema = z.object({
  rejectionReason: z.string().trim().max(500).optional(),
});

@ApiTags('kyc')
@ApiBearerAuth('access-token')
@Controller({ path: 'kyc', version: '1' })
@UseGuards(JwtAuthGuard)
export class KycController {
  constructor(private readonly kyc: KycService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get KYC status and feature access flags for the current user' })
  @ApiOkResponse({ type: KycStatusDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  getStatus(@CurrentUser() user: RequestUser): Promise<KycStatusView> {
    return this.kyc.getStatus(user.id);
  }

  @Post('start')
  @UserWriteRateLimit()
  @ApiOperation({ summary: 'Start or resume a mock KYC verification flow' })
  @ApiBody({ type: KycStartBodyDto })
  @ApiOkResponse({ type: KycVerificationSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  start(
    @CurrentUser() user: RequestUser,
    @Body(zodBody(kycStartSchema)) body: ReturnType<typeof kycStartSchema.parse>,
  ): Promise<KycVerificationSummary> {
    return this.kyc.start(user.id, body);
  }

  @Post('mock/approve')
  @UserWriteRateLimit()
  @ApiOperation({
    summary: 'Mock-approve pending KYC (development only — hidden in production)',
  })
  @ApiOkResponse({ type: KycStatusDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiNotFoundResponse({ description: 'Not available in production' })
  mockApprove(@CurrentUser() user: RequestUser): Promise<KycStatusView> {
    return this.kyc.mockApprove(user.id);
  }

  @Post('mock/reject')
  @UserWriteRateLimit()
  @ApiOperation({
    summary: 'Mock-reject pending KYC (development only — hidden in production)',
  })
  @ApiBody({ type: KycMockRejectBodyDto })
  @ApiOkResponse({ type: KycStatusDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiNotFoundResponse({ description: 'Not available in production' })
  mockReject(
    @CurrentUser() user: RequestUser,
    @Body(zodBody(kycMockRejectBodySchema))
    body: ReturnType<typeof kycMockRejectBodySchema.parse>,
  ): Promise<KycStatusView> {
    return this.kyc.mockReject(user.id, body.rejectionReason);
  }
}
