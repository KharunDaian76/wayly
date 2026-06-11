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
  ApiBadRequestResponse,
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
import type { DeliveryOrderDetail } from '@wayly/types';
import { DeliveryOrderStatus, DeliveryOrderType } from '@wayly/types';
import {
  createDeliveryOrderSchema,
  deliveryOrderQuerySchema,
  enumSchema,
  submitDeliveryProofSchema,
} from '@wayly/validation';
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
  SubmitDeliveryProofBodyDto,
} from './dto/swagger.dto';
import { OrdersService, type DeliveryOrderListResult } from './orders.service';

const ordersListQuerySchema = deliveryOrderQuerySchema
  .extend({
    page: z.coerce.number().int().min(1).default(1),
  })
  .omit({ cursor: true });

const ordersMineQuerySchema = z.object({
  status: enumSchema(DeliveryOrderStatus).optional(),
  type: enumSchema(DeliveryOrderType).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

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

  @Get('accepted')
  @ApiOperation({ summary: 'List delivery orders accepted by the current Wayler' })
  @ApiOkResponse({ type: DeliveryOrderDetailDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  listAccepted(@CurrentUser() user: RequestUser) {
    return this.orders.listAcceptedByWayler(user);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List delivery orders sent by the current user (Sender)' })
  @ApiOkResponse({ type: DeliveryOrderListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  listMine(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(ordersMineQuerySchema)) query: z.infer<typeof ordersMineQuerySchema>,
  ): Promise<DeliveryOrderListResult> {
    return this.orders.listMine(user, query);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish a draft delivery order (Sender only)' })
  @ApiOkResponse({ type: DeliveryOrderDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Delivery order not found' })
  @ApiConflictResponse({ description: 'Order is not in DRAFT status' })
  publish(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeliveryOrderDetail> {
    return this.orders.publish(user, id);
  }

  @Post(':id/accept')
  @ApiOperation({ summary: 'Accept an open delivery order (Wayler)' })
  @ApiOkResponse({ type: DeliveryOrderDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({
    description:
      'KYC approval required (code: KYC_REQUIRED) or active Wayler work access required (code: WAYLER_ACCESS_REQUIRED)',
  })
  @ApiNotFoundResponse({ description: 'Delivery order not found' })
  @ApiConflictResponse({
    description: 'Order is not OPEN, already accepted, or sender cannot accept their own order',
  })
  accept(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeliveryOrderDetail> {
    return this.orders.accept(user, id);
  }

  @Post(':id/start-transit')
  @ApiOperation({ summary: 'Move an accepted delivery order to in transit (accepted Wayler)' })
  @ApiOkResponse({ type: DeliveryOrderDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({
    description: 'KYC approval required, or caller is not the accepted Wayler',
  })
  @ApiNotFoundResponse({ description: 'Delivery order not found' })
  @ApiConflictResponse({ description: 'Order is not in ACCEPTED status' })
  startTransit(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeliveryOrderDetail> {
    return this.orders.startTransit(user, id);
  }

  @Post(':id/mark-delivered')
  @ApiOperation({ summary: 'Mark an in-transit delivery order as delivered (accepted Wayler)' })
  @ApiOkResponse({ type: DeliveryOrderDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({
    description: 'KYC approval required, or caller is not the accepted Wayler',
  })
  @ApiNotFoundResponse({ description: 'Delivery order not found' })
  @ApiConflictResponse({ description: 'Order is not in IN_TRANSIT status' })
  markDelivered(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeliveryOrderDetail> {
    return this.orders.markDelivered(user, id);
  }

  @Post(':id/proof')
  @ApiOperation({ summary: 'Submit proof-of-delivery metadata (accepted Wayler)' })
  @ApiBody({ type: SubmitDeliveryProofBodyDto })
  @ApiOkResponse({ type: DeliveryOrderDetailDto })
  @ApiBadRequestResponse({
    description: 'Invalid body (empty note/confirmationCode, or neither field provided)',
  })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({
    description: 'KYC approval required, or caller is not the accepted Wayler',
  })
  @ApiNotFoundResponse({ description: 'Delivery order not found' })
  @ApiConflictResponse({
    description: 'Order is not IN_TRANSIT or DELIVERED (e.g. ACCEPTED, DRAFT, OPEN, or CANCELLED)',
  })
  submitProof(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(submitDeliveryProofSchema))
    body: ReturnType<typeof submitDeliveryProofSchema.parse>,
  ): Promise<DeliveryOrderDetail> {
    return this.orders.submitProof(user, id, body);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel a draft or open delivery order (Sender only)' })
  @ApiOkResponse({ type: DeliveryOrderDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Delivery order not found' })
  @ApiConflictResponse({
    description:
      'Order is already cancelled, or not in DRAFT/OPEN status (accepted/in-transit/delivered cannot be cancelled)',
  })
  cancel(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeliveryOrderDetail> {
    return this.orders.cancel(user, id);
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
