import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { Env } from './env.schema';

/**
 * Typed, domain-grouped access to validated configuration.
 *
 * Future provider services (Stripe, Sumsub, Twilio, Mapbox, FCM, S3, ...) inject
 * this and read their own typed slice — no scattered `process.env` access and no
 * refactor when those modules land.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<Env, true>) {}

  private get<T extends keyof Env>(key: T): Env[T] {
    return this.config.get(key, { infer: true });
  }

  get isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  get isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  get core() {
    return {
      nodeEnv: this.get('NODE_ENV'),
      port: this.get('API_PORT'),
      apiUrl: this.get('API_URL'),
      webUrl: this.get('WEB_URL'),
    };
  }

  get jwt() {
    return {
      accessSecret: this.get('JWT_ACCESS_SECRET'),
      refreshSecret: this.get('JWT_REFRESH_SECRET'),
      accessTtl: this.get('JWT_ACCESS_TTL'),
      refreshTtl: this.get('JWT_REFRESH_TTL'),
    };
  }

  get auth() {
    return {
      cookieName: this.get('AUTH_COOKIE_NAME'),
      passwordResetTtl: this.get('PASSWORD_RESET_TTL'),
      /** Refresh cookie flags — strict in production, http-friendly in local dev. */
      refreshCookie: {
        httpOnly: true as const,
        secure: this.isProduction,
        sameSite: (this.isProduction ? 'none' : 'lax') as 'none' | 'lax',
        path: '/api/v1/auth',
      },
    };
  }

  get throttle() {
    return {
      ttl: this.get('THROTTLE_TTL'),
      limit: this.get('THROTTLE_LIMIT'),
    };
  }

  /** Named rate-limit policies for @nestjs/throttler (MVP in-memory). */
  get rateLimit() {
    return {
      enabled: this.get('RATE_LIMIT_ENABLED'),
      auth: {
        windowMs: this.get('RATE_LIMIT_AUTH_WINDOW_SECONDS') * 1000,
        max: this.get('RATE_LIMIT_AUTH_MAX'),
      },
      write: {
        windowMs: this.get('RATE_LIMIT_WRITE_WINDOW_SECONDS') * 1000,
        max: this.get('RATE_LIMIT_WRITE_MAX'),
      },
      public: {
        windowMs: this.get('RATE_LIMIT_PUBLIC_WINDOW_SECONDS') * 1000,
        max: this.get('RATE_LIMIT_PUBLIC_MAX'),
      },
      /** Admin routes — fixed defaults; not env-tuned in v1. */
      admin: {
        windowMs: 60_000,
        max: 120,
      },
    };
  }

  get database() {
    return {
      url: this.get('DATABASE_URL'),
      shadowUrl: this.get('SHADOW_DATABASE_URL'),
    };
  }

  get redis() {
    return {
      url: this.get('REDIS_URL'),
    };
  }

  get logging() {
    return {
      level: this.get('LOG_LEVEL'),
    };
  }

  get stripe() {
    return {
      secretKey: this.get('STRIPE_SECRET_KEY'),
      webhookSecret: this.get('STRIPE_WEBHOOK_SECRET'),
      connectClientId: this.get('STRIPE_CONNECT_CLIENT_ID'),
    };
  }

  get kyc() {
    return {
      provider: this.get('KYC_PROVIDER'),
      sumsub: {
        appToken: this.get('SUMSUB_APP_TOKEN'),
        secretKey: this.get('SUMSUB_SECRET_KEY'),
        webhookSecret: this.get('SUMSUB_WEBHOOK_SECRET'),
      },
    };
  }

  get otp() {
    return {
      provider: this.get('OTP_PROVIDER'),
      twilio: {
        accountSid: this.get('TWILIO_ACCOUNT_SID'),
        authToken: this.get('TWILIO_AUTH_TOKEN'),
        verifyServiceSid: this.get('TWILIO_VERIFY_SERVICE_SID'),
      },
    };
  }

  get maps() {
    return {
      provider: this.get('MAPS_PROVIDER'),
      mapboxToken: this.get('MAPBOX_TOKEN'),
    };
  }

  get notifications() {
    return {
      fcm: {
        projectId: this.get('FCM_PROJECT_ID'),
        clientEmail: this.get('FCM_CLIENT_EMAIL'),
        privateKey: this.get('FCM_PRIVATE_KEY'),
      },
      email: {
        resendApiKey: this.get('RESEND_API_KEY'),
        from: this.get('EMAIL_FROM'),
      },
    };
  }

  get storage() {
    return {
      endpoint: this.get('S3_ENDPOINT'),
      bucket: this.get('S3_BUCKET'),
      region: this.get('S3_REGION'),
      accessKeyId: this.get('S3_ACCESS_KEY_ID'),
      secretAccessKey: this.get('S3_SECRET_ACCESS_KEY'),
    };
  }

  get monitoring() {
    return {
      sentryDsn: this.get('SENTRY_DSN'),
      otelEndpoint: this.get('OTEL_EXPORTER_OTLP_ENDPOINT'),
    };
  }

  /** Provider mock switches (mock-first development). */
  get flags() {
    return {
      mockKyc: this.get('MOCK_KYC'),
      mockOtp: this.get('MOCK_OTP'),
      mockPayments: this.get('MOCK_PAYMENTS'),
      mockPush: this.get('MOCK_PUSH'),
    };
  }
}
