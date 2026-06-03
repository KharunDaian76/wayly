import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { RolesGuard } from './common/guards/roles.guard';
import { VerificationGuard } from './common/guards/verification.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppConfigModule } from './config/config.module';
import { AppConfigService } from './config/config.service';
import { InfraModule } from './infra/infra.module';
import { LoggerModule } from './infra/logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { KycModule } from './modules/kyc/kyc.module';
import { OrdersModule } from './modules/orders/orders.module';
import { UsersModule } from './modules/users/users.module';

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
    AuthModule,
    UsersModule,
    KycModule,
    OrdersModule,
    // ---------------------------------------------------------------------
    // Future business modules:
    //   GeoModule,           // M5
    //   TripsModule,         // M4
    //   SubscriptionsModule, // M7
    //   PaymentsModule,      // M8
    //   AgreementsModule,    // M9
    //   ChatModule,          // M6
    //   NotificationsModule, // M11
    //   DisputesModule,      // M10
    //   AdminModule,         // M12
    //   AuditModule,
    // ---------------------------------------------------------------------
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: VerificationGuard },
  ],
})
export class AppModule {}
