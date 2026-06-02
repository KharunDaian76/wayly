import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AppConfigModule } from './config/config.module';
import { InfraModule } from './infra/infra.module';
import { LoggerModule } from './infra/logger/logger.module';
import { HealthModule } from './modules/health/health.module';

/**
 * Root application module.
 *
 * Foundation modules only. Business modules plug into the `imports` array in
 * their respective milestones; the commented map below documents that strategy
 * and ordering so no structural refactor is needed when they land.
 */
@Module({
  imports: [
    // --- Foundation ---
    AppConfigModule, // global, fail-fast environment validation
    LoggerModule, // global structured (pino) logging + audit-safe redaction
    InfraModule, // global Prisma + Redis providers

    // --- Operational ---
    HealthModule, // liveness + readiness probes

    // ---------------------------------------------------------------------
    // Future business modules (DO NOT implement in this milestone):
    //   AuthModule,          // M1  - JWT auth, refresh sessions (Redis), RBAC
    //   UsersModule,         // M1  - profiles, GDPR deletion, device tokens
    //   KycModule,           // M2  - phone OTP, Sumsub identity + liveness
    //   GeoModule,           // M5  - Mapbox geocoding/routing proxy
    //   OrdersModule,        // M4  - orders, feed, status state machine
    //   TripsModule,         // M4  - wayler routes
    //   SubscriptionsModule, // M7  - access packages + entitlement gating
    //   PaymentsModule,      // M8  - Stripe escrow + Connect payouts (+ webhooks)
    //   AgreementsModule,    // M9  - offline PDF agreements
    //   ChatModule,          // M6  - conversations + RealtimeGateway (WebSockets)
    //   NotificationsModule, // M11 - FCM push + in-app (BullMQ workers)
    //   DisputesModule,      // M10 - arbitration + evidence aggregation
    //   AdminModule,         // M12 - admin/arbitrator dashboard APIs
    //   AuditModule,         // cross-cutting audit logging
    // ---------------------------------------------------------------------
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
