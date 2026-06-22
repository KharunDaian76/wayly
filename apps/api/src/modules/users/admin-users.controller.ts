import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AdminUserListResponse } from '@wayly/types';
import { UserRole } from '@wayly/types';
import { adminUsersListQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodQuery } from '../../common/pipes/zod-validation.pipe';

import { AdminUserListResponseDto } from './dto/swagger.dto';
import { UsersService } from './users.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/users', version: '1' })
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
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
}
