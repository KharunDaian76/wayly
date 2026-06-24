import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { AccountModerationGuard } from './common/guards/account-moderation.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { VerificationGuard } from './common/guards/verification.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
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
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
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
            name: 'default',
            ttl: config.throttle.ttl,
            limit: config.throttle.limit,
          },
        ],
      }),
    }),
    HealthModule,
    AdminAuditModule,
    AuthModule,
    UsersModule,
    KycModule,
    OrdersModule,
    NotificationsModule,
    ConversationsModule,
    PaymentsModule,
    DisputesModule,
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
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: VerificationGuard },
    { provide: APP_GUARD, useClass: AccountModerationGuard },
  ],
})
export class AppModule {}
