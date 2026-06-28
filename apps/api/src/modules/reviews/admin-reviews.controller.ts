import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AdminReviewListResponse, AdminReviewQueueItem } from '@wayly/types';
import { UserRole } from '@wayly/types';
import { adminModerateReviewSchema, adminReviewsListQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminModerateRateLimit } from '../../common/rate-limit/rate-limit.decorators';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';

import {
  AdminModerateReviewBodyDto,
  AdminReviewListResponseDto,
  AdminReviewQueueItemDto,
} from './dto/swagger.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/reviews', version: '1' })
@AdminModerateRateLimit()
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN)
export class AdminReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List reviews for admin moderation' })
  @ApiOkResponse({ type: AdminReviewListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  list(
    @Query(zodQuery(adminReviewsListQuerySchema))
    query: z.infer<typeof adminReviewsListQuerySchema>,
  ): Promise<AdminReviewListResponse> {
    return this.reviews.listForAdmin(query);
  }

  @Patch(':id/moderation')
  @ApiOperation({ summary: 'Hide or unhide a review with optional admin note' })
  @ApiBody({ type: AdminModerateReviewBodyDto })
  @ApiOkResponse({ type: AdminReviewQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  @ApiNotFoundResponse({ description: 'Review not found' })
  moderate(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminModerateReviewSchema))
    body: z.infer<typeof adminModerateReviewSchema>,
  ): Promise<AdminReviewQueueItem> {
    return this.reviews.moderateForAdmin(actor, id, body);
  }
}
