import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { ActiveWaylerMarketplaceResponse } from '@wayly/types';
import { activeWaylerMarketplaceQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresVerification } from '../../common/decorators/requires-verification.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import { zodQuery } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';

import { ActiveWaylerMarketplaceResponseDto } from './dto/swagger.dto';
import { MarketplaceService } from './marketplace.service';

@ApiTags('marketplace')
@ApiBearerAuth('access-token')
@Controller({ path: 'marketplace', version: '1' })
@UseGuards(JwtAuthGuard, VerificationGuard)
@RequiresVerification()
export class MarketplaceController {
  constructor(private readonly marketplace: MarketplaceService) {}

  @Get('active-waylers')
  @ApiOperation({
    summary: 'Aggregate active Wayler counts by location (privacy-safe marketplace signal)',
  })
  @ApiOkResponse({ type: ActiveWaylerMarketplaceResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  getActiveWaylerCounts(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(activeWaylerMarketplaceQuerySchema))
    query: z.infer<typeof activeWaylerMarketplaceQuerySchema>,
  ): Promise<ActiveWaylerMarketplaceResponse> {
    return this.marketplace.getActiveWaylerCounts(user, query);
  }
}
