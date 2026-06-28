import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
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
import type {
  AdminSupportTicketListResponse,
  AdminSupportTicketQueueItem,
  SupportTicketMessageListResponse,
  SupportTicketMessageSummary,
} from '@wayly/types';
import { UserRole } from '@wayly/types';
import {
  adminCreateSupportTicketMessageSchema,
  adminSupportTicketsListQuerySchema,
  adminUpdateSupportTicketSchema,
} from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminModerateRateLimit } from '../../common/rate-limit/rate-limit.decorators';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';

import {
  AdminSupportTicketListResponseDto,
  AdminSupportTicketQueueItemDto,
  AdminUpdateSupportTicketBodyDto,
  AdminCreateSupportTicketMessageBodyDto,
  SupportTicketMessageListResponseDto,
  SupportTicketMessageSummaryDto,
} from './dto/swagger.dto';
import { SupportTicketsService } from './support-tickets.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/support-tickets', version: '1' })
@AdminModerateRateLimit()
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN)
export class AdminSupportTicketsController {
  constructor(private readonly supportTickets: SupportTicketsService) {}

  @Get()
  @ApiOperation({ summary: 'List support tickets for admin operations' })
  @ApiOkResponse({ type: AdminSupportTicketListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  list(
    @Query(zodQuery(adminSupportTicketsListQuerySchema))
    query: z.infer<typeof adminSupportTicketsListQuerySchema>,
  ): Promise<AdminSupportTicketListResponse> {
    return this.supportTickets.listForAdmin(query);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update support ticket status, priority, or admin note' })
  @ApiBody({ type: AdminUpdateSupportTicketBodyDto })
  @ApiOkResponse({ type: AdminSupportTicketQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  update(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminUpdateSupportTicketSchema))
    body: z.infer<typeof adminUpdateSupportTicketSchema>,
  ): Promise<AdminSupportTicketQueueItem> {
    return this.supportTickets.updateForAdmin(actor, id, body);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'List all messages for a support ticket (including internal notes)' })
  @ApiOkResponse({ type: SupportTicketMessageListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  @ApiNotFoundResponse({ description: 'Support ticket not found' })
  listMessages(@Param('id', ParseUUIDPipe) id: string): Promise<SupportTicketMessageListResponse> {
    return this.supportTickets.listMessagesForAdmin(id);
  }

  @Post(':id/messages')
  @ApiOperation({ summary: 'Reply to a support ticket as admin' })
  @ApiBody({ type: AdminCreateSupportTicketMessageBodyDto })
  @ApiCreatedResponse({ type: SupportTicketMessageSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  @ApiNotFoundResponse({ description: 'Support ticket not found' })
  createMessage(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminCreateSupportTicketMessageSchema))
    body: z.infer<typeof adminCreateSupportTicketMessageSchema>,
  ): Promise<SupportTicketMessageSummary> {
    return this.supportTickets.createMessageForAdmin(actor, id, body);
  }
}
