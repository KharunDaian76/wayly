import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AdminPaymentListResponse } from '@wayly/types';
import { UserRole } from '@wayly/types';
import { adminPaymentsListQuerySchema } from '@wayly/validation';
import { z } from 'zod';

import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { zodQuery } from '../../common/pipes/zod-validation.pipe';

import { AdminPaymentListResponseDto } from './dto/swagger.dto';
import { PaymentsService } from './payments.service';

@ApiTags('admin')
@ApiBearerAuth('access-token')
@Controller({ path: 'admin/payments', version: '1' })
@UseGuards(JwtAuthGuard)
@Roles(UserRole.ADMIN, UserRole.ARBITRATOR)
export class AdminPaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List payment intents for admin/arbitrator operations (read-only)',
  })
  @ApiOkResponse({ type: AdminPaymentListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'ADMIN or ARBITRATOR role required' })
  list(
    @Query(zodQuery(adminPaymentsListQuerySchema))
    query: z.infer<typeof adminPaymentsListQuerySchema>,
  ): Promise<AdminPaymentListResponse> {
    return this.payments.listForOperations(query);
  }
}
