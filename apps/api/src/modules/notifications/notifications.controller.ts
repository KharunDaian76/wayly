import { Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { NotificationListResponse, NotificationSummary } from '@wayly/types';
import { notificationsListQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodQuery } from '../../common/pipes/zod-validation.pipe';
import type { RequestUser } from '../../common/types/request-user.type';

import {
  NotificationListResponseDto,
  NotificationSummaryDto,
  NotificationsMarkAllReadResponseDto,
  NotificationsUnreadCountResponseDto,
} from './dto/swagger.dto';
import {
  NotificationsService,
  type NotificationsMarkAllReadResult,
  type NotificationsUnreadCountResult,
} from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Controller({ path: 'notifications', version: '1' })
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for the current user' })
  @ApiOkResponse({ type: NotificationListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  list(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(notificationsListQuerySchema))
    query: z.infer<typeof notificationsListQuerySchema>,
  ): Promise<NotificationListResponse> {
    return this.notifications.list(user.id, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count for the current user' })
  @ApiOkResponse({ type: NotificationsUnreadCountResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  unreadCount(@CurrentUser() user: RequestUser): Promise<NotificationsUnreadCountResult> {
    return this.notifications.unreadCount(user.id);
  }

  @Post('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for the current user' })
  @ApiOkResponse({ type: NotificationsMarkAllReadResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  markAllRead(@CurrentUser() user: RequestUser): Promise<NotificationsMarkAllReadResult> {
    return this.notifications.markAllRead(user.id);
  }

  @Post(':id/read')
  @ApiOperation({ summary: 'Mark a single notification as read' })
  @ApiOkResponse({ type: NotificationSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiNotFoundResponse({ description: 'Notification not found' })
  markRead(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationSummary> {
    return this.notifications.markRead(user.id, id);
  }
}
