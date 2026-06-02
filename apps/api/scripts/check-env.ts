/**
 * Standalone environment validator.
 *
 * Validates `process.env` against the backend Zod schema and exits non-zero on
 * any invalid/missing critical configuration. Used by CI as a hard gate (so a
 * misconfigured Stripe/Sumsub/Twilio/FCM setup fails the pipeline, not prod) and
 * runnable locally via `pnpm --filter @wayly/api check:env`.
 */
import { envSchema } from '../src/config/env.schema';

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration:');
  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.join('.') || '(root)'}: ${issue.message}`);
  }
  process.exit(1);
}

console.log('Environment configuration is valid.');
