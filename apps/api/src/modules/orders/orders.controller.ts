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
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { DeliveryOrderDetail } from '@wayly/types';
import { createDeliveryOrderSchema, deliveryOrderQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresVerification } from '../../common/decorators/requires-verification.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';

import {
  CreateDeliveryOrderBodyDto,
  DeliveryOrderDetailDto,
  DeliveryOrderListResponseDto,
} from './dto/swagger.dto';
import { OrdersService, type DeliveryOrderListResult } from './orders.service';

const ordersListQuerySchema = deliveryOrderQuerySchema
  .extend({
    page: z.coerce.number().int().min(1).default(1),
  })
  .omit({ cursor: true });

@ApiTags('orders')
@ApiBearerAuth('access-token')
@Controller({ path: 'orders', version: '1' })
@UseGuards(JwtAuthGuard, VerificationGuard)
@RequiresVerification()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a delivery order as the current user (Sender)' })
  @ApiBody({ type: CreateDeliveryOrderBodyDto })
  @ApiCreatedResponse({ type: DeliveryOrderDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  create(
    @CurrentUser() user: RequestUser,
    @Body(zodBody(createDeliveryOrderSchema))
    body: ReturnType<typeof createDeliveryOrderSchema.parse>,
  ): Promise<DeliveryOrderDetail> {
    return this.orders.create(user, body);
  }

  @Get()
  @ApiOperation({ summary: 'List delivery orders (defaults to OPEN status)' })
  @ApiOkResponse({ type: DeliveryOrderListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  list(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(ordersListQuerySchema)) query: z.infer<typeof ordersListQuerySchema>,
  ): Promise<DeliveryOrderListResult> {
    return this.orders.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a delivery order by id' })
  @ApiOkResponse({ type: DeliveryOrderDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Delivery order not found' })
  getById(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeliveryOrderDetail> {
    return this.orders.getById(user, id);
  }
}
