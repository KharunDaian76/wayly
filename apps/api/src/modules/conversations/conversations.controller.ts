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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type {
  ChatMessageSummary,
  ConversationDetail,
  ConversationListResponse,
} from '@wayly/types';
import { conversationsListQuerySchema, sendChatMessageSchema } from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresActiveAccount } from '../../common/decorators/requires-active-account.decorator';
import { RequiresVerification } from '../../common/decorators/requires-verification.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';

import { ConversationsService, type MarkConversationReadResult } from './conversations.service';
import {
  ChatMessageSummaryDto,
  ConversationDetailDto,
  ConversationListResponseDto,
  MarkConversationReadResponseDto,
  SendChatMessageBodyDto,
} from './dto/swagger.dto';

@ApiTags('conversations')
@ApiBearerAuth('access-token')
@Controller({ path: 'conversations', version: '1' })
@UseGuards(JwtAuthGuard, VerificationGuard)
@RequiresVerification()
export class ConversationsController {
  constructor(private readonly conversations: ConversationsService) {}

  @Post('order/:orderId')
  @RequiresActiveAccount()
  @ApiOperation({ summary: 'Create or fetch the conversation for an accepted delivery order' })
  @ApiCreatedResponse({ type: ConversationDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({
    description:
      'KYC approval required (code: KYC_REQUIRED) or active Wayler work access required for Wayler contact (code: WAYLER_ACCESS_REQUIRED)',
  })
  @ApiNotFoundResponse({ description: 'Delivery order not found' })
  @ApiConflictResponse({
    description: 'Order has no accepted Wayler or status is not eligible for chat',
  })
  forOrder(
    @CurrentUser() user: RequestUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<ConversationDetail> {
    return this.conversations.forOrder(user, orderId);
  }

  @Get()
  @ApiOperation({ summary: 'List conversations for the current user' })
  @ApiOkResponse({ type: ConversationListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  list(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(conversationsListQuerySchema))
    query: z.infer<typeof conversationsListQuerySchema>,
  ): Promise<ConversationListResponse> {
    return this.conversations.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a conversation with message history' })
  @ApiOkResponse({ type: ConversationDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  detail(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ConversationDetail> {
    return this.conversations.getDetail(user, id);
  }

  @Post(':id/messages')
  @RequiresActiveAccount()
  @ApiOperation({ summary: 'Send a message in a conversation' })
  @ApiBody({ type: SendChatMessageBodyDto })
  @ApiCreatedResponse({ type: ChatMessageSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({
    description:
      'KYC approval required (code: KYC_REQUIRED) or active Wayler work access required for Wayler messages (code: WAYLER_ACCESS_REQUIRED)',
  })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  sendMessage(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(sendChatMessageSchema))
    body: z.infer<typeof sendChatMessageSchema>,
  ): Promise<ChatMessageSummary> {
    return this.conversations.sendMessage(user, id, body);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark unread messages from the other participant as read' })
  @ApiOkResponse({ type: MarkConversationReadResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Conversation not found' })
  markRead(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MarkConversationReadResult> {
    return this.conversations.markRead(user, id);
  }
}
