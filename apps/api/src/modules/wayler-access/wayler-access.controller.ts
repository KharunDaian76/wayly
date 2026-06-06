import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type {
  WaylerAccessPassListResponse,
  WaylerAccessPassSummary,
  WaylerAccessState,
} from '@wayly/types';
import { waylerAccessPassesListQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresVerification } from '../../common/decorators/requires-verification.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import { zodQuery } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';

import {
  WaylerAccessPassListResponseDto,
  WaylerAccessPassSummaryDto,
  WaylerAccessStateDto,
} from './dto/swagger.dto';
import { WaylerAccessService } from './wayler-access.service';

@ApiTags('wayler-access')
@ApiBearerAuth('access-token')
@Controller({ path: 'wayler-access', version: '1' })
@UseGuards(JwtAuthGuard, VerificationGuard)
@RequiresVerification()
export class WaylerAccessController {
  constructor(private readonly waylerAccess: WaylerAccessService) {}

  @Get('today')
  @ApiOperation({ summary: "Get current user's daily work access state for today" })
  @ApiOkResponse({ type: WaylerAccessStateDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  today(@CurrentUser() user: RequestUser): Promise<WaylerAccessState> {
    return this.waylerAccess.getTodayState(user);
  }

  @Get('mine')
  @ApiOperation({ summary: "List current user's Wayler access passes" })
  @ApiOkResponse({ type: WaylerAccessPassListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  mine(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(waylerAccessPassesListQuerySchema))
    query: z.infer<typeof waylerAccessPassesListQuerySchema>,
  ): Promise<WaylerAccessPassListResponse> {
    return this.waylerAccess.listMine(user, query);
  }

  @Post('mock-activate-today')
  @ApiOperation({
    summary: "Mock/manual activate today's Wayler work access pass (no real payment)",
  })
  @ApiOkResponse({ type: WaylerAccessPassSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  mockActivateToday(@CurrentUser() user: RequestUser): Promise<WaylerAccessPassSummary> {
    return this.waylerAccess.mockActivateToday(user);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: "Cancel current user's own non-expired access pass" })
  @ApiOkResponse({ type: WaylerAccessPassSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Wayler access pass not found' })
  @ApiConflictResponse({ description: 'Access pass cannot be cancelled' })
  cancel(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WaylerAccessPassSummary> {
    return this.waylerAccess.cancel(user, id);
  }
}
