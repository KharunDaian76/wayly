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
import type { AdminOrderListResponse, AdminOrderQueueItem } from '@wayly/types';
import { UserRole } from '@wayly/types';
import {
  adminOrderClearManualReviewSchema,
  adminOrderClearRiskSchema,
  adminOrderDecisionSchema,
  adminOrderManualReviewSchema,
  adminOrderRiskFlagSchema,
  adminOrdersListQuerySchema,
} from '@wayly/validation';
import type { Request } from 'express';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';
import { adminAuditRequestContext } from '../admin-audit/admin-audit.util';

import {
  AdminOrderClearManualReviewBodyDto,
  AdminOrderClearRiskBodyDto,
  AdminOrderDecisionBodyDto,
  AdminOrderListResponseDto,
  AdminOrderManualReviewBodyDto,
  AdminOrderQueueItemDto,
  AdminOrderRiskFlagBodyDto,
} from './dto/swagger.dto';
import { OrdersService } from './orders.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/orders', version: '1' })
@UseGuards(JwtAuthGuard)
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
  @ApiOperation({
    summary: 'List delivery orders for admin/arbitrator operations (read-only)',
  })
  @ApiOkResponse({ type: AdminOrderListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  list(
    @Query(zodQuery(adminOrdersListQuerySchema))
    query: z.infer<typeof adminOrdersListQuerySchema>,
  ): Promise<AdminOrderListResponse> {
    return this.orders.listForOperations(query);
  }

  @Post(':id/mark-manual-review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Mark an order for manual review (ADMIN only, metadata-only)' })
  @ApiBody({ type: AdminOrderManualReviewBodyDto })
  @ApiOkResponse({ type: AdminOrderQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  @ApiConflictResponse({ description: 'Order is already marked for manual review' })
  markManualReview(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminOrderManualReviewSchema)) body: z.infer<typeof adminOrderManualReviewSchema>,
    @Req() req: Request,
  ): Promise<AdminOrderQueueItem> {
    return this.orders.markManualReviewForOperations(
      actor,
      id,
      body,
      adminAuditRequestContext(req),
    );
  }

  @Post(':id/clear-manual-review')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Clear manual review flag on an order (ADMIN only, metadata-only)' })
  @ApiBody({ type: AdminOrderClearManualReviewBodyDto })
  @ApiOkResponse({ type: AdminOrderQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  @ApiConflictResponse({ description: 'Order is not marked for manual review' })
  clearManualReview(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminOrderClearManualReviewSchema))
    body: z.infer<typeof adminOrderClearManualReviewSchema>,
    @Req() req: Request,
  ): Promise<AdminOrderQueueItem> {
    return this.orders.clearManualReviewForOperations(
      actor,
      id,
      body,
      adminAuditRequestContext(req),
    );
  }

  @Post(':id/record-decision')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Record an admin decision on an order (ADMIN only, metadata-only)' })
  @ApiBody({ type: AdminOrderDecisionBodyDto })
  @ApiOkResponse({ type: AdminOrderQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  recordDecision(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminOrderDecisionSchema)) body: z.infer<typeof adminOrderDecisionSchema>,
    @Req() req: Request,
  ): Promise<AdminOrderQueueItem> {
    return this.orders.recordDecisionForOperations(actor, id, body, adminAuditRequestContext(req));
  }

  @Post(':id/flag-risk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Flag an order for risk review (ADMIN only, metadata-only)' })
  @ApiBody({ type: AdminOrderRiskFlagBodyDto })
  @ApiOkResponse({ type: AdminOrderQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  @ApiConflictResponse({ description: 'Order is already flagged for risk' })
  flagRisk(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminOrderRiskFlagSchema)) body: z.infer<typeof adminOrderRiskFlagSchema>,
    @Req() req: Request,
  ): Promise<AdminOrderQueueItem> {
    return this.orders.flagRiskForOperations(actor, id, body, adminAuditRequestContext(req));
  }

  @Post(':id/clear-risk')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Clear risk flag on an order (ADMIN only, metadata-only)' })
  @ApiBody({ type: AdminOrderClearRiskBodyDto })
  @ApiOkResponse({ type: AdminOrderQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  @ApiConflictResponse({ description: 'Order is not flagged for risk' })
  clearRisk(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminOrderClearRiskSchema)) body: z.infer<typeof adminOrderClearRiskSchema>,
    @Req() req: Request,
  ): Promise<AdminOrderQueueItem> {
    return this.orders.clearRiskForOperations(actor, id, body, adminAuditRequestContext(req));
  }
}
