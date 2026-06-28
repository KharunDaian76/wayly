import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type {
  SupportTicketListResponse,
  SupportTicketMessageListResponse,
  SupportTicketMessageSummary,
  SupportTicketSummary,
} from '@wayly/types';
import { createSupportTicketMessageSchema, createSupportTicketSchema } from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresVerification } from '../../common/decorators/requires-verification.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import { zodBody } from '../../common/pipes/zod-validation.pipe';
import { UserWriteRateLimit } from '../../common/rate-limit/rate-limit.decorators';
import type { RequestUser } from '../../common/types/request-user.type';

import {
  SupportTicketListResponseDto,
  SupportTicketMessageListResponseDto,
  SupportTicketMessageSummaryDto,
  SupportTicketSummaryDto,
  CreateSupportTicketBodyDto,
  CreateSupportTicketMessageBodyDto,
} from './dto/swagger.dto';
import { SupportTicketsService } from './support-tickets.service';

@ApiTags('support-tickets')
@ApiBearerAuth('access-token')
@Controller({ path: 'support-tickets', version: '1' })
@UseGuards(JwtAuthGuard, VerificationGuard)
@RequiresVerification()
export class SupportTicketsController {
  constructor(private readonly supportTickets: SupportTicketsService) {}

  @Post()
  @UserWriteRateLimit()
  @ApiOperation({ summary: 'Create a support ticket for the current user' })
  @ApiCreatedResponse({ type: SupportTicketSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  create(
    @CurrentUser() user: RequestUser,
    @Body(zodBody(createSupportTicketSchema)) body: z.infer<typeof createSupportTicketSchema>,
  ): Promise<SupportTicketSummary> {
    return this.supportTickets.create(user, body);
  }

  @Get('me')
  @ApiOperation({ summary: 'List support tickets for the current user' })
  @ApiOkResponse({ type: SupportTicketListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  listMine(@CurrentUser() user: RequestUser): Promise<SupportTicketListResponse> {
    return this.supportTickets.listMine(user.id);
  }

  @Get(':id/messages')
  @ApiOperation({ summary: 'List public messages for one of the current user support tickets' })
  @ApiOkResponse({ type: SupportTicketMessageListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiNotFoundResponse({ description: 'Support ticket not found' })
  listMessages(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SupportTicketMessageListResponse> {
    return this.supportTickets.listMessagesForUser(user.id, id);
  }

  @Post(':id/messages')
  @UserWriteRateLimit()
  @ApiOperation({ summary: 'Reply to one of the current user support tickets' })
  @ApiCreatedResponse({ type: SupportTicketMessageSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiNotFoundResponse({ description: 'Support ticket not found' })
  createMessage(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(createSupportTicketMessageSchema))
    body: z.infer<typeof createSupportTicketMessageSchema>,
  ): Promise<SupportTicketMessageSummary> {
    return this.supportTickets.createMessageForUser(user, id, body);
  }
}
