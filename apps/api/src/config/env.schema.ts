import { z } from 'zod';

/**
 * Backend environment schema (single source of truth, validated at boot).
 *
 * Grouped to mirror `.env.example`. Provider credentials are optional by default
 * (mock-first development) but become REQUIRED via `superRefine` once the
 * corresponding provider is switched on — so production fails fast on missing
 * Stripe / Sumsub / Twilio / FCM configuration instead of failing at runtime.
 */
const boolFromString = (def: 'true' | 'false') =>
  z
    .enum(['true', 'false'])
    .default(def)
    .transform((v) => v === 'true');

export const envSchema = z
  .object({
    // --- Core ---
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    API_PORT: z.coerce.number().int().positive().default(4000),
    API_URL: z.string().url().default('http://localhost:4000'),
    WEB_URL: z.string().url().default('http://localhost:3000'),
    JWT_ACCESS_SECRET: z.string().min(16),
    JWT_REFRESH_SECRET: z.string().min(16),
    JWT_ACCESS_TTL: z.string().default('15m'),
    JWT_REFRESH_TTL: z.string().default('30d'),
    AUTH_COOKIE_NAME: z.string().default('wayly_refresh'),
    PASSWORD_RESET_TTL: z.string().default('1h'),
    THROTTLE_TTL: z.coerce.number().int().positive().default(60_000),
    THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
    RATE_LIMIT_ENABLED: boolFromString('true'),
    RATE_LIMIT_AUTH_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
    RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(10),
    RATE_LIMIT_WRITE_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
    RATE_LIMIT_WRITE_MAX: z.coerce.number().int().positive().default(30),
    RATE_LIMIT_PUBLIC_WINDOW_SECONDS: z.coerce.number().int().positive().default(60),
    RATE_LIMIT_PUBLIC_MAX: z.coerce.number().int().positive().default(120),

    // --- Database ---
    DATABASE_URL: z.string().url(),
    SHADOW_DATABASE_URL: z.string().url().optional(),

    // --- Redis ---
    REDIS_URL: z.string().url(),

    // --- Stripe ---
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_CONNECT_CLIENT_ID: z.string().optional(),

    // --- KYC (Sumsub) + OTP (Twilio Verify) ---
    KYC_PROVIDER: z.enum(['mock', 'sumsub']).default('mock'),
    SUMSUB_APP_TOKEN: z.string().optional(),
    SUMSUB_SECRET_KEY: z.string().optional(),
    SUMSUB_WEBHOOK_SECRET: z.string().optional(),
    OTP_PROVIDER: z.enum(['mock', 'twilio']).default('mock'),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_VERIFY_SERVICE_SID: z.string().optional(),

    // --- Maps ---
    MAPS_PROVIDER: z.enum(['mapbox']).default('mapbox'),
    MAPBOX_TOKEN: z.string().optional(),

    // --- Notifications (FCM + email) ---
    FCM_PROJECT_ID: z.string().optional(),
    FCM_CLIENT_EMAIL: z.string().optional(),
    FCM_PRIVATE_KEY: z.string().optional(),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().email().default('no-reply@wayly.app'),

    // --- Storage (S3-compatible) ---
    S3_ENDPOINT: z.string().optional(),
    S3_BUCKET: z.string().optional(),
    S3_REGION: z.string().optional(),
    S3_ACCESS_KEY_ID: z.string().optional(),
    S3_SECRET_ACCESS_KEY: z.string().optional(),

    // --- Monitoring ---
    SENTRY_DSN: z.string().optional(),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().optional(),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

    // --- Mock flags (mock-first development) ---
    MOCK_KYC: boolFromString('true'),
    MOCK_OTP: boolFromString('true'),
    MOCK_PAYMENTS: boolFromString('true'),
    MOCK_PUSH: boolFromString('true'),
  })
  .superRefine((env, ctx) => {
    const require = (keys: Array<keyof typeof env>, when: string) => {
      for (const key of keys) {
        if (!env[key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [key as string],
            message: `${String(key)} is required when ${when}.`,
          });
        }
      }
    };

    if (env.KYC_PROVIDER === 'sumsub') {
      require([
        'SUMSUB_APP_TOKEN',
        'SUMSUB_SECRET_KEY',
        'SUMSUB_WEBHOOK_SECRET',
      ], 'KYC_PROVIDER=sumsub');
    }
    if (env.OTP_PROVIDER === 'twilio') {
      require([
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_VERIFY_SERVICE_SID',
      ], 'OTP_PROVIDER=twilio');
    }
    if (!env.MOCK_PAYMENTS) {
      require(['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'], 'MOCK_PAYMENTS=false');
    }
    if (!env.MOCK_PUSH) {
      require(['FCM_PROJECT_ID', 'FCM_CLIENT_EMAIL', 'FCM_PRIVATE_KEY'], 'MOCK_PUSH=false');
    }
  });

export type Env = z.infer<typeof envSchema>;
