import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AccountModerationGuard } from './common/guards/account-moderation.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { VerificationGuard } from './common/guards/verification.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { WaylyThrottlerGuard } from './common/rate-limit/wayly-throttler.guard';
import { shouldApplyThrottler } from './common/rate-limit/rate-limit.util';
import { RATE_LIMIT_ERROR_MESSAGE } from './common/rate-limit/rate-limit.constants';
import { AppConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';
import { InfraModule } from './infra/infra.module';
import { LoggerModule } from './infra/logger/logger.module';
import { AdminAuditModule } from './modules/admin-audit/admin-audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { ConversationsModule } from './modules/conversations/conversations.module';
import { DisputesModule } from './modules/disputes/disputes.module';
import { HealthModule } from './modules/health/health.module';
import { KycModule } from './modules/kyc/kyc.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { SupportTicketsModule } from './modules/support-tickets/support-tickets.module';
import { UsersModule } from './modules/users/users.module';
import { WaylerAccessModule } from './modules/wayler-access/wayler-access.module';
import { WaylerAvailabilitiesModule } from './modules/wayler-availabilities/wayler-availabilities.module';
import { WaylerAvailabilityRequestsModule } from './modules/wayler-availability-requests/wayler-availability-requests.module';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule,
    InfraModule,
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        throttlers: [
          {
            name: 'authStrict',
            ttl: config.rateLimit.auth.windowMs,
            limit: config.rateLimit.auth.max,
            skipIf: (context) => !shouldApplyThrottler(context, 'authStrict'),
          },
          {
            name: 'userWrite',
            ttl: config.rateLimit.write.windowMs,
            limit: config.rateLimit.write.max,
            skipIf: (context) => !shouldApplyThrottler(context, 'userWrite'),
          },
          {
            name: 'adminModerate',
            ttl: config.rateLimit.admin.windowMs,
            limit: config.rateLimit.admin.max,
            skipIf: (context) => !shouldApplyThrottler(context, 'adminModerate'),
          },
          {
            name: 'publicLight',
            ttl: config.rateLimit.public.windowMs,
            limit: config.rateLimit.public.max,
            skipIf: (context) => !shouldApplyThrottler(context, 'publicLight'),
          },
        ],
        errorMessage: RATE_LIMIT_ERROR_MESSAGE,
        setHeaders: false,
      }),
    }),
    HealthModule,
    AdminAuditModule,
    AuthModule,
    UsersModule,
    KycModule,
    MarketplaceModule,
    OrdersModule,
    NotificationsModule,
    ConversationsModule,
    PaymentsModule,
    DisputesModule,
    SupportTicketsModule,
    ReviewsModule,
    WaylerAvailabilitiesModule,
    WaylerAvailabilityRequestsModule,
    WaylerAccessModule,
    // ---------------------------------------------------------------------
    // Future business modules:
    //   GeoModule,           // M5
    //   TripsModule,         // M4
    //   SubscriptionsModule, // M7
    //   PaymentsModule (Stripe/real processing), // M8+
    //   AgreementsModule,    // M9
    //   ChatModule WebSocket, // later batch
    //   Notifications dispatch / WebSocket, // later batch
    //   AdminModule,         // M12
    //   AuditModule,         // replaced by AdminAuditModule
    // ---------------------------------------------------------------------
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: WaylyThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: VerificationGuard },
    { provide: APP_GUARD, useClass: AccountModerationGuard },
  ],
})
export class AppModule {}
