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
  WaylerAvailabilityRequestDetail,
  WaylerAvailabilityRequestListResponse,
} from '@wayly/types';
import {
  createWaylerAvailabilityRequestSchema,
  respondWaylerAvailabilityRequestSchema,
  waylerAvailabilityRequestsListQuerySchema,
} from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresVerification } from '../../common/decorators/requires-verification.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';

import {
  CreateWaylerAvailabilityRequestBodyDto,
  RespondWaylerAvailabilityRequestBodyDto,
  WaylerAvailabilityRequestDetailDto,
  WaylerAvailabilityRequestListResponseDto,
} from './dto/swagger.dto';
import { WaylerAvailabilityRequestsService } from './wayler-availability-requests.service';

@ApiTags('wayler-availability-requests')
@ApiBearerAuth('access-token')
@Controller({ path: 'wayler-availability-requests', version: '1' })
@UseGuards(JwtAuthGuard, VerificationGuard)
@RequiresVerification()
export class WaylerAvailabilityRequestsController {
  constructor(private readonly requests: WaylerAvailabilityRequestsService) {}

  @Post()
  @ApiOperation({
    summary: 'Sender creates a delivery request for a published Wayler availability',
  })
  @ApiBody({ type: CreateWaylerAvailabilityRequestBodyDto })
  @ApiCreatedResponse({ type: WaylerAvailabilityRequestDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({
    description:
      'KYC required or cannot request own availability (code: CANNOT_REQUEST_OWN_AVAILABILITY)',
  })
  @ApiNotFoundResponse({ description: 'Availability not found (code: AVAILABILITY_NOT_FOUND)' })
  @ApiConflictResponse({
    description: 'Availability not requestable (code: AVAILABILITY_NOT_REQUESTABLE)',
  })
  create(
    @CurrentUser() user: RequestUser,
    @Body(zodBody(createWaylerAvailabilityRequestSchema))
    body: z.infer<typeof createWaylerAvailabilityRequestSchema>,
  ): Promise<WaylerAvailabilityRequestDetail> {
    return this.requests.create(user, body);
  }

  @Get('mine/sender')
  @ApiOperation({ summary: 'Sender lists their availability requests' })
  @ApiOkResponse({ type: WaylerAvailabilityRequestListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  mineAsSender(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(waylerAvailabilityRequestsListQuerySchema))
    query: z.infer<typeof waylerAvailabilityRequestsListQuerySchema>,
  ): Promise<WaylerAvailabilityRequestListResponse> {
    return this.requests.listMineAsSender(user, query);
  }

  @Get('mine/wayler')
  @ApiOperation({ summary: 'Wayler lists incoming availability requests' })
  @ApiOkResponse({ type: WaylerAvailabilityRequestListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  mineAsWayler(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(waylerAvailabilityRequestsListQuerySchema))
    query: z.infer<typeof waylerAvailabilityRequestsListQuerySchema>,
  ): Promise<WaylerAvailabilityRequestListResponse> {
    return this.requests.listMineAsWayler(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get availability request detail (participants only)' })
  @ApiOkResponse({ type: WaylerAvailabilityRequestDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'Not a participant (code: AVAILABILITY_REQUEST_FORBIDDEN)' })
  @ApiNotFoundResponse({ description: 'Request not found (code: AVAILABILITY_REQUEST_NOT_FOUND)' })
  detail(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WaylerAvailabilityRequestDetail> {
    return this.requests.getDetail(user, id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Wayler accepts a pending availability request' })
  @ApiBody({ type: RespondWaylerAvailabilityRequestBodyDto, required: false })
  @ApiOkResponse({ type: WaylerAvailabilityRequestDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'Not the Wayler (code: AVAILABILITY_REQUEST_FORBIDDEN)' })
  @ApiNotFoundResponse({ description: 'Request not found (code: AVAILABILITY_REQUEST_NOT_FOUND)' })
  @ApiConflictResponse({
    description: 'Request not pending (code: AVAILABILITY_REQUEST_NOT_PENDING)',
  })
  accept(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(respondWaylerAvailabilityRequestSchema))
    body: z.infer<typeof respondWaylerAvailabilityRequestSchema>,
  ): Promise<WaylerAvailabilityRequestDetail> {
    return this.requests.accept(user, id, body);
  }

  @Post(':id/decline')
  @ApiOperation({ summary: 'Wayler declines a pending availability request' })
  @ApiBody({ type: RespondWaylerAvailabilityRequestBodyDto, required: false })
  @ApiOkResponse({ type: WaylerAvailabilityRequestDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'Not the Wayler (code: AVAILABILITY_REQUEST_FORBIDDEN)' })
  @ApiNotFoundResponse({ description: 'Request not found (code: AVAILABILITY_REQUEST_NOT_FOUND)' })
  @ApiConflictResponse({
    description: 'Request not pending (code: AVAILABILITY_REQUEST_NOT_PENDING)',
  })
  decline(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(respondWaylerAvailabilityRequestSchema))
    body: z.infer<typeof respondWaylerAvailabilityRequestSchema>,
  ): Promise<WaylerAvailabilityRequestDetail> {
    return this.requests.decline(user, id, body);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Sender cancels their pending availability request' })
  @ApiOkResponse({ type: WaylerAvailabilityRequestDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'Not the Sender (code: AVAILABILITY_REQUEST_FORBIDDEN)' })
  @ApiNotFoundResponse({ description: 'Request not found (code: AVAILABILITY_REQUEST_NOT_FOUND)' })
  @ApiConflictResponse({
    description: 'Request not pending (code: AVAILABILITY_REQUEST_NOT_PENDING)',
  })
  cancel(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WaylerAvailabilityRequestDetail> {
    return this.requests.cancel(user, id);
  }
}
