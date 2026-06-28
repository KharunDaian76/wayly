import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AdminSystemHealthResponse } from '@wayly/types';
import { UserRole } from '@wayly/types';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AdminModerateRateLimit } from '../../common/rate-limit/rate-limit.decorators';

import { AdminSystemHealthResponseDto } from './dto/swagger.dto';
import { SystemHealthService } from './system-health.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/system-health', version: '1' })
@AdminModerateRateLimit()
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
export class AdminSystemHealthController {
  constructor(private readonly systemHealth: SystemHealthService) {}

  @Get()
  @ApiOperation({
    summary: 'Read-only system health snapshot for admin/arbitrator operations',
  })
  @ApiOkResponse({ type: AdminSystemHealthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  getSnapshot(): Promise<AdminSystemHealthResponse> {
    return this.systemHealth.getForOperations();
  }
}
