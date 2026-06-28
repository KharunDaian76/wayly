import { Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { PaymentIntentSummary } from '@wayly/types';

import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequiresActiveAccount } from '../../common/decorators/requires-active-account.decorator';
import { RequiresVerification } from '../../common/decorators/requires-verification.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { VerificationGuard } from '../../common/guards/verification.guard';
import type { RequestUser } from '../../common/types/request-user.type';
import { UserWriteRateLimit } from '../../common/rate-limit/rate-limit.decorators';

import { PaymentIntentSummaryDto } from './dto/swagger.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@ApiBearerAuth('access-token')
@Controller({ path: 'payments', version: '1' })
@UseGuards(JwtAuthGuard, VerificationGuard)
@RequiresVerification()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('orders/:orderId/mock-authorize')
  @RequiresActiveAccount()
  @UserWriteRateLimit()
  @ApiOperation({
    summary: 'Mock-authorize payment for an accepted order (MANUAL provider, local testing only)',
  })
  @ApiOkResponse({ type: PaymentIntentSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC required or caller is not the Sender' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiConflictResponse({
    description:
      'Invalid order state, missing reward/currency, or payment already released/refunded',
  })
  mockAuthorizeOrder(
    @CurrentUser() user: RequestUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<PaymentIntentSummary> {
    return this.payments.mockAuthorizeOrder(user, orderId);
  }

  @Get('orders/:orderId')
  @ApiOperation({ summary: 'Get payment intent for an order (Sender or accepted Wayler)' })
  @ApiOkResponse({ type: PaymentIntentSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC required or caller is not a participant' })
  @ApiNotFoundResponse({ description: 'Order or payment intent not found' })
  forOrder(
    @CurrentUser() user: RequestUser,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<PaymentIntentSummary> {
    return this.payments.forOrder(user, orderId);
  }

  @Post(':id/mock-hold-escrow')
  @RequiresActiveAccount()
  @UserWriteRateLimit()
  @ApiOperation({
    summary: 'Mock hold escrow (AUTHORIZED → HELD_IN_ESCROW, MANUAL provider, local testing only)',
  })
  @ApiOkResponse({ type: PaymentIntentSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC required or caller is not the payer' })
  @ApiNotFoundResponse({ description: 'Payment intent not found' })
  @ApiConflictResponse({ description: 'Payment intent is not in AUTHORIZED status' })
  mockHoldEscrow(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentIntentSummary> {
    return this.payments.mockHoldEscrow(user, id);
  }

  @Post(':id/mock-release')
  @RequiresActiveAccount()
  @UserWriteRateLimit()
  @ApiOperation({
    summary: 'Mock release escrow to Wayler payout (HELD_IN_ESCROW → RELEASED, local testing only)',
  })
  @ApiOkResponse({ type: PaymentIntentSummaryDto })
  @ApiUnauthorizedResponse({ description: 'Missing or invalid Bearer access token' })
  @ApiForbiddenResponse({ description: 'KYC required or caller cannot release this payment' })
  @ApiNotFoundResponse({ description: 'Payment intent not found' })
  @ApiConflictResponse({
    description: 'Not held in escrow, order not delivered, or proof of delivery missing',
  })
  mockRelease(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PaymentIntentSummary> {
    return this.payments.mockRelease(user, id);
  }
}
