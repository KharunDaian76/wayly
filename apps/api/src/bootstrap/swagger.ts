import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * OpenAPI/Swagger setup served at `/docs`.
 *
 * Tags are pre-declared for every planned module so the API surface and its
 * documentation structure are established up front. Future modules attach to
 * their tag with `@ApiTags(...)` — no central change required here.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Wayly API')
    .setDescription('Wayly — cross-platform P2P delivery platform. Backend API.')
    .setVersion('1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'access-token')
    .addTag('health', 'Liveness & readiness probes')
    .addTag('auth', 'Authentication & sessions (M1)')
    .addTag('users', 'User profiles & GDPR deletion (M1)')
    .addTag('kyc', 'KYC: phone OTP, Sumsub identity, liveness (M2)')
    .addTag('geo', 'Maps, geocoding & routing (M5)')
    .addTag('orders', 'Delivery orders, feed & status (M4)')
    .addTag('trips', 'Wayler planned routes/trips (M4)')
    .addTag('subscriptions', 'Wayler access packages & gating (M7)')
    .addTag('payments', 'Escrow & Stripe Connect payouts (M8)')
    .addTag('agreements', 'Offline PDF agreements (M9)')
    .addTag('chat', 'Realtime chat & conversations (M6)')
    .addTag('disputes', 'Dispute & arbitration (M10)')
    .addTag('notifications', 'Push & in-app notifications (M11)')
    .addTag('admin', 'Admin & arbitrator dashboard APIs (M12)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
