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
  DisputeDetail,
  DisputeEvidenceSummary,
  DisputeListResponse,
  DisputeMessageSummary,
} from '@wayly/types';
import {
  addDisputeEvidenceSchema,
  addDisputeMessageSchema,
  disputesListQuerySchema,
  openDisputeSchema,
} from '@wayly/validation';
import { z } from 'zod';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresActiveAccount } from '../../common/decorators/requires-active-account.decorator';
import { RequiresVerification } from '../../common/decorators/requires-verification.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import { zodBody, zodQuery } from '../../common/pipes/zod-validation.pipe';
import { UserWriteRateLimit } from '../../common/rate-limit/rate-limit.decorators';
import type { RequestUser } from '../../common/types/request-user.type';

import { DisputesService } from './disputes.service';
import {
  AddDisputeEvidenceBodyDto,
  AddDisputeMessageBodyDto,
  DisputeDetailDto,
  DisputeEvidenceSummaryDto,
  DisputeListResponseDto,
  DisputeMessageSummaryDto,
  OpenDisputeBodyDto,
} from './dto/swagger.dto';

@ApiTags('disputes')
@ApiBearerAuth('access-token')
@Controller({ path: 'disputes', version: '1' })
@UseGuards(JwtAuthGuard, VerificationGuard)
@RequiresVerification()
export class DisputesController {
  constructor(private readonly disputes: DisputesService) {}

  @Post()
  @RequiresActiveAccount()
  @UserWriteRateLimit()
  @ApiOperation({ summary: 'Open a dispute on an eligible delivery order' })
  @ApiBody({ type: OpenDisputeBodyDto })
  @ApiCreatedResponse({ type: DisputeDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Delivery order not found' })
  @ApiConflictResponse({
    description:
      'Order status not eligible for dispute, or an active dispute already exists for the order',
  })
  open(
    @CurrentUser() user: RequestUser,
    @Body(zodBody(openDisputeSchema)) body: z.infer<typeof openDisputeSchema>,
  ): Promise<DisputeDetail> {
    return this.disputes.open(user, body);
  }

  @Get()
  @ApiOperation({ summary: 'List disputes for the current user' })
  @ApiOkResponse({ type: DisputeListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  list(
    @CurrentUser() user: RequestUser,
    @Query(zodQuery(disputesListQuerySchema))
    query: z.infer<typeof disputesListQuerySchema>,
  ): Promise<DisputeListResponse> {
    return this.disputes.list(user, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute detail with messages and evidence' })
  @ApiOkResponse({ type: DisputeDetailDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Dispute not found' })
  detail(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DisputeDetail> {
    return this.disputes.getDetail(user, id);
  }

  @Post(':id/messages')
  @RequiresActiveAccount()
  @UserWriteRateLimit()
  @ApiOperation({ summary: 'Add a message to an open dispute thread' })
  @ApiBody({ type: AddDisputeMessageBodyDto })
  @ApiCreatedResponse({ type: DisputeMessageSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Dispute not found' })
  @ApiConflictResponse({ description: 'Dispute is not open for new messages' })
  addMessage(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(addDisputeMessageSchema))
    body: z.infer<typeof addDisputeMessageSchema>,
  ): Promise<DisputeMessageSummary> {
    return this.disputes.addMessage(user, id, body);
  }

  @Post(':id/evidence')
  @RequiresActiveAccount()
  @UserWriteRateLimit()
  @ApiOperation({ summary: 'Add evidence metadata to an open dispute' })
  @ApiBody({ type: AddDisputeEvidenceBodyDto })
  @ApiCreatedResponse({ type: DisputeEvidenceSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC approval required (code: KYC_REQUIRED)' })
  @ApiNotFoundResponse({ description: 'Dispute not found' })
  @ApiConflictResponse({ description: 'Dispute is not open for new evidence' })
  addEvidence(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(zodBody(addDisputeEvidenceSchema))
    body: z.infer<typeof addDisputeEvidenceSchema>,
  ): Promise<DisputeEvidenceSummary> {
    return this.disputes.addEvidence(user, id, body);
  }
}
