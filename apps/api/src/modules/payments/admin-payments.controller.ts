import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AdminPaymentListResponse, AdminPaymentQueueItem } from '@wayly/types';
import { UserRole } from '@wayly/types';
import {
  adminPaymentClearManualReviewSchema,
  adminPaymentManualReviewSchema,
  adminPaymentRefundDecisionSchema,
  adminPaymentReleaseDecisionSchema,
  adminPaymentsListQuerySchema,
} from '@wayly/validation';
import type { Request } from 'express';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminModerateRateLimit } from '../../common/rate-limit/rate-limit.decorators';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';
import { adminAuditRequestContext } from '../admin-audit/admin-audit.util';

import {
  AdminPaymentClearManualReviewBodyDto,
  AdminPaymentListResponseDto,
  AdminPaymentManualReviewBodyDto,
  AdminPaymentQueueItemDto,
  AdminPaymentRefundDecisionBodyDto,
  AdminPaymentReleaseDecisionBodyDto,
} from './dto/swagger.dto';
import { PaymentsService } from './payments.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/payments', version: '1' })
@AdminModerateRateLimit()
@UseGuards(JwtAuthGuard)
export class AdminPaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
  @ApiOperation({
    summary: 'List payment intents for admin/arbitrator operations (read-only)',
  })
  @ApiOkResponse({ type: AdminPaymentListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  list(
    @Query(zodQuery(adminPaymentsListQuerySchema))
    query: z.infer<typeof adminPaymentsListQuerySchema>,
  ): Promise<AdminPaymentListResponse> {
    return this.payments.listForOperations(query);
  }

  @Post(':id/mark-manual-review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark a payment for manual review (ADMIN only, metadata-only)' })
  @ApiBody({ type: AdminPaymentManualReviewBodyDto })
  @ApiOkResponse({ type: AdminPaymentQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  @ApiConflictResponse({ description: 'Payment is already marked for manual review' })
  markManualReview(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminPaymentManualReviewSchema))
    body: z.infer<typeof adminPaymentManualReviewSchema>,
    @Req() req: Request,
  ): Promise<AdminPaymentQueueItem> {
    return this.payments.markManualReviewForOperations(
      actor,
      id,
      body,
      adminAuditRequestContext(req),
    );
  }

  @Post(':id/clear-manual-review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Clear manual review flag on a payment (ADMIN only, metadata-only)' })
  @ApiBody({ type: AdminPaymentClearManualReviewBodyDto })
  @ApiOkResponse({ type: AdminPaymentQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  @ApiConflictResponse({ description: 'Payment is not marked for manual review' })
  clearManualReview(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminPaymentClearManualReviewSchema))
    body: z.infer<typeof adminPaymentClearManualReviewSchema>,
    @Req() req: Request,
  ): Promise<AdminPaymentQueueItem> {
    return this.payments.clearManualReviewForOperations(
      actor,
      id,
      body,
      adminAuditRequestContext(req),
    );
  }

  @Post(':id/record-refund-decision')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Record a refund decision on a payment (ADMIN only, metadata-only)',
  })
  @ApiBody({ type: AdminPaymentRefundDecisionBodyDto })
  @ApiOkResponse({ type: AdminPaymentQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  recordRefundDecision(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminPaymentRefundDecisionSchema))
    body: z.infer<typeof adminPaymentRefundDecisionSchema>,
    @Req() req: Request,
  ): Promise<AdminPaymentQueueItem> {
    return this.payments.recordRefundDecisionForOperations(
      actor,
      id,
      body,
      adminAuditRequestContext(req),
    );
  }

  @Post(':id/record-release-decision')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Record a release decision on a payment (ADMIN only, metadata-only)',
  })
  @ApiBody({ type: AdminPaymentReleaseDecisionBodyDto })
  @ApiOkResponse({ type: AdminPaymentQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  recordReleaseDecision(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminPaymentReleaseDecisionSchema))
    body: z.infer<typeof adminPaymentReleaseDecisionSchema>,
    @Req() req: Request,
  ): Promise<AdminPaymentQueueItem> {
    return this.payments.recordReleaseDecisionForOperations(
      actor,
      id,
      body,
      adminAuditRequestContext(req),
    );
  }
}
