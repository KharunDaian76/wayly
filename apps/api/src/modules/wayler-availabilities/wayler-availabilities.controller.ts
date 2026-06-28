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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type {
  ActiveWaylerCountSummary,
  WaylerAvailabilityDetail,
  WaylerAvailabilityListResponse,
} from '@wayly/types';
import {
  activeWaylerCountsQuerySchema,
  createWaylerAvailabilitySchema,
  waylerAvailabilitiesMineQuerySchema,
  waylerAvailabilitiesPublicQuerySchema,
} from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresActiveAccount } from '../../common/decorators/requires-active-account.decorator';
import { RequiresVerification } from '../../common/decorators/requires-verification.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';
import { UserWriteRateLimit } from '../../common/rate-limit/rate-limit.decorators';
import type { RequestUser } from '../../common/types/request-user.type';

import {
  ActiveWaylerCountSummaryDto,
  CreateWaylerAvailabilityBodyDto,
  WaylerAvailabilityDetailDto,
  WaylerAvailabilityListResponseDto,
} from './dto/swagger.dto';
import { WaylerAvailabilitiesService } from './wayler-availabilities.service';

@ApiTags('wayler-availabilities')
@ApiBearerAuth('access-token')
@Controller({ path: 'wayler-availabilities', version: '1' })
@UseGuards(JwtAuthGuard, VerificationGuard)
@RequiresVerification()
export class WaylerAvailabilitiesController {
  constructor(private readonly waylerAvailabilities: WaylerAvailabilitiesService) {}

  @Post()
  @RequiresActiveAccount()
  @UserWriteRateLimit()
  @ApiOperation({ summary: 'Create a DRAFT Wayler availability or trip listing' })
  @ApiBody({ type: CreateWaylerAvailabilityBodyDto })
  @ApiCreatedResponse({ type: WaylerAvailabilityDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  create(
    @CurrentUser() user: RequestUser,
    @Body(zodBody(createWaylerAvailabilitySchema))
    body: z.infer<typeof createWaylerAvailabilitySchema>,
  ): Promise<WaylerAvailabilityDetail> {
    return this.waylerAvailabilities.create(user, body);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List current Wayler availabilities' })
  @ApiOkResponse({ type: WaylerAvailabilityListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  mine(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(waylerAvailabilitiesMineQuerySchema))
    query: z.infer<typeof waylerAvailabilitiesMineQuerySchema>,
  ): Promise<WaylerAvailabilityListResponse> {
    return this.waylerAvailabilities.listMine(user, query);
  }

  @Get('public')
  @ApiOperation({ summary: 'List public active Wayler availabilities and trip routes' })
  @ApiOkResponse({ type: WaylerAvailabilityListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  publicList(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(waylerAvailabilitiesPublicQuerySchema))
    query: z.infer<typeof waylerAvailabilitiesPublicQuerySchema>,
  ): Promise<WaylerAvailabilityListResponse> {
    return this.waylerAvailabilities.listPublic(user, query);
  }

  @Get('active-counts')
  @ApiOperation({ summary: 'Active Wayler counts grouped by origin location' })
  @ApiOkResponse({ type: ActiveWaylerCountSummaryDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  activeCounts(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(activeWaylerCountsQuerySchema))
    query: z.infer<typeof activeWaylerCountsQuerySchema>,
  ): Promise<ActiveWaylerCountSummary[]> {
    return this.waylerAvailabilities.activeCounts(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Wayler availability detail' })
  @ApiOkResponse({ type: WaylerAvailabilityDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Wayler availability not found' })
  detail(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WaylerAvailabilityDetail> {
    return this.waylerAvailabilities.getDetail(user, id);
  }

  @Post(':id/publish')
  @RequiresActiveAccount()
  @UserWriteRateLimit()
  @ApiOperation({ summary: 'Publish a DRAFT or PAUSED Wayler availability' })
  @ApiOkResponse({ type: WaylerAvailabilityDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Wayler availability not found' })
  @ApiConflictResponse({ description: 'Availability status is not publishable' })
  publish(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WaylerAvailabilityDetail> {
    return this.waylerAvailabilities.publish(user, id);
  }

  @Post(':id/pause')
  @RequiresActiveAccount()
  @UserWriteRateLimit()
  @ApiOperation({ summary: 'Pause an ACTIVE Wayler availability' })
  @ApiOkResponse({ type: WaylerAvailabilityDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Wayler availability not found' })
  @ApiConflictResponse({ description: 'Availability status is not pausable' })
  pause(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WaylerAvailabilityDetail> {
    return this.waylerAvailabilities.pause(user, id);
  }

  @Post(':id/cancel')
  @RequiresActiveAccount()
  @UserWriteRateLimit()
  @ApiOperation({ summary: 'Cancel a Wayler availability' })
  @ApiOkResponse({ type: WaylerAvailabilityDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Wayler availability not found' })
  @ApiConflictResponse({ description: 'Availability is already cancelled' })
  cancel(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WaylerAvailabilityDetail> {
    return this.waylerAvailabilities.cancel(user, id);
  }
}
