/**
 * Preflight checks for demo seed — validates env guards and password policy without writing data.
 *
 *   pnpm --dir apps/api seed:demo:check
 */
import { assertDemoSeedPasswordSafe, assertDemoSeedSafeToRun } from './demo-seed-safety';

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`[seed-demo:check] Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function main(): void {
  assertDemoSeedSafeToRun('seed-demo:check');

  const adminPassword = requireEnv('DEMO_ADMIN_PASSWORD');
  assertDemoSeedPasswordSafe('DEMO_ADMIN_PASSWORD', adminPassword);

  const userPassword = process.env.DEMO_USER_PASSWORD?.trim();
  if (userPassword) {
    assertDemoSeedPasswordSafe('DEMO_USER_PASSWORD', userPassword);
  } else {
    console.warn(
      '[seed-demo:check] DEMO_USER_PASSWORD not set — seed:demo will reuse DEMO_ADMIN_PASSWORD for sender/wayler.',
    );
  }

  console.log('[seed-demo:check] Preflight passed — env guards and password policy OK.');
  console.warn(
    '[seed-demo:check] Demo/mock data only — not real payments, escrow, or emergency support.',
  );
}

main();
