import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AdminOrderListResponse } from '@wayly/types';
import { UserRole } from '@wayly/types';
import { adminOrdersListQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodQuery } from '../../common/pipes/zod-validation.pipe';

import { AdminOrderListResponseDto } from './dto/swagger.dto';
import { OrdersService } from './orders.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/orders', version: '1' })
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
export class AdminOrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
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
}
