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
import type { AdminUserListResponse, AdminUserQueueItem } from '@wayly/types';
import { UserRole } from '@wayly/types';
import {
  adminUserSuspendSchema,
  adminUsersListQuerySchema,
  adminUserUnsuspendSchema,
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
  AdminUserListResponseDto,
  AdminUserQueueItemDto,
  AdminUserSuspendBodyDto,
  AdminUserUnsuspendBodyDto,
} from './dto/swagger.dto';
import { UsersService } from './users.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/users', version: '1' })
@AdminModerateRateLimit()
@UseGuards(JwtAuthGuard)
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
  @ApiOperation({
    summary: 'List users for admin/arbitrator trust & safety operations (read-only)',
  })
  @ApiOkResponse({ type: AdminUserListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  list(
    @Query(zodQuery(adminUsersListQuerySchema))
    query: z.infer<typeof adminUsersListQuerySchema>,
  ): Promise<AdminUserListResponse> {
    return this.users.listForOperations(query);
  }

  @Post(':id/suspend')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Suspend a marketplace user account (ADMIN only)' })
  @ApiBody({ type: AdminUserSuspendBodyDto })
  @ApiOkResponse({ type: AdminUserQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  @ApiConflictResponse({ description: 'User is already suspended' })
  suspend(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminUserSuspendSchema)) body: z.infer<typeof adminUserSuspendSchema>,
    @Req() req: Request,
  ): Promise<AdminUserQueueItem> {
    return this.users.suspendForOperations(actor, id, body, adminAuditRequestContext(req));
  }

  @Post(':id/unsuspend')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Unsuspend a marketplace user account (ADMIN only)' })
  @ApiBody({ type: AdminUserUnsuspendBodyDto })
  @ApiOkResponse({ type: AdminUserQueueItemDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN role required' })
  @ApiConflictResponse({ description: 'User is not suspended' })
  unsuspend(
    @CurrentUser() actor: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(adminUserUnsuspendSchema)) body: z.infer<typeof adminUserUnsuspendSchema>,
    @Req() req: Request,
  ): Promise<AdminUserQueueItem> {
    return this.users.unsuspendForOperations(actor, id, body, adminAuditRequestContext(req));
  }
}
