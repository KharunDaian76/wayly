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
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type {
  OrderReviewMineResponse,
  ReviewListResponse,
  ReviewSummary,
  UserReviewSummary,
} from '@wayly/types';
import { createReviewSchema, reviewsListForUserQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresVerification } from '../../common/decorators/requires-verification.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';

import {
  CreateReviewBodyDto,
  OrderReviewMineResponseDto,
  ReviewListResponseDto,
  ReviewSummaryDto,
  UserReviewSummaryDto,
} from './dto/swagger.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiBearerAuth('access-token')
@Controller({ path: 'reviews', version: '1' })
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post('orders/:orderId')
  @UseGuards(VerificationGuard)
  @RequiresVerification()
  @ApiOperation({ summary: 'Create a post-delivery review for the other order party' })
  @ApiCreatedResponse({ type: ReviewSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'Not an order participant' })
  @ApiNotFoundResponse({ description: 'Delivery order not found' })
  createForOrder(
    @CurrentUser() user: RequestUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body(zodBody(createReviewSchema)) body: z.infer<typeof createReviewSchema>,
  ): Promise<ReviewSummary> {
    return this.reviews.createForOrder(user, orderId, body);
  }

  @Get('users/:userId/summary')
  @ApiOperation({ summary: 'Get aggregated review summary for a user' })
  @ApiOkResponse({ type: UserReviewSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  getUserSummary(@Param('userId', ParseUUIDPipe) userId: string): Promise<UserReviewSummary> {
    return this.reviews.getUserSummary(userId);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'List visible reviews for a user' })
  @ApiOkResponse({ type: ReviewListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  listForUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query(zodQuery(reviewsListForUserQuerySchema))
    query: z.infer<typeof reviewsListForUserQuerySchema>,
  ): Promise<ReviewListResponse> {
    return this.reviews.listForUser(userId, query);
  }

  @Get('orders/:orderId/mine')
  @ApiOperation({ summary: 'Check whether the current user reviewed this order' })
  @ApiOkResponse({ type: OrderReviewMineResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiNotFoundResponse({ description: 'Delivery order not found' })
  getMineForOrder(
    @CurrentUser() user: RequestUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<OrderReviewMineResponse> {
    return this.reviews.getMineForOrder(user.id, orderId);
  }
}
