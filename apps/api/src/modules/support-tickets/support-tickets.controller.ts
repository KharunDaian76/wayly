import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { SupportTicketListResponse, SupportTicketSummary } from '@wayly/types';
import { createSupportTicketSchema } from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresVerification } from '../../common/decorators/requires-verification.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import { zodBody } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';

import {
  SupportTicketListResponseDto,
  SupportTicketSummaryDto,
  CreateSupportTicketBodyDto,
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
}
