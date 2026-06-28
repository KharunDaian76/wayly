/**
 * Shared safety guards for demo seed scripts (local/dev by default).
 * Never prints secrets or DATABASE_URL values.
 */

/** Known weak or documented placeholder passwords — reject for demo seeding. */
export const DEMO_SEED_PLACEHOLDER_PASSWORDS = [
  'choose-a-local-demo-password',
  'your-strong-local-demo-password',
  'your-strong-local-demo-password-min-12-chars',
  'yourstronglocalpassword123!',
  'yourstronglocalpassword123',
  'waylydemo2026!',
  'password',
  'password123',
  'admin',
  'demo',
  'changeme',
  'secret',
  'test',
  '123456789012',
] as const;

const HOSTED_DATABASE_URL_HINTS = [
  'render.com',
  'dpg-', // Render Postgres internal hostname prefix
  'amazonaws.com',
  'neon.tech',
  'supabase.co',
  'railway.app',
  'prod',
  'production',
] as const;

function isHostedLookingDatabaseUrl(databaseUrl: string): boolean {
  const normalized = databaseUrl.toLowerCase();
  return HOSTED_DATABASE_URL_HINTS.some((hint) => normalized.includes(hint));
}

function isPlaceholderDemoPassword(password: string): boolean {
  const normalized = password.trim().toLowerCase();
  return DEMO_SEED_PLACEHOLDER_PASSWORDS.some(
    (placeholder) => normalized === placeholder.toLowerCase(),
  );
}

export function isDemoSeedExplicitlyAllowed(): boolean {
  return process.env.ALLOW_DEMO_SEED === 'true';
}

export function assertDemoSeedSafeToRun(scriptName: string): void {
  const tag = `[${scriptName}]`;

  if (!process.env.DATABASE_URL?.trim()) {
    console.error(`${tag} DATABASE_URL is required.`);
    process.exit(1);
  }

  const production = process.env.NODE_ENV === 'production';
  const explicitAllow = isDemoSeedExplicitlyAllowed();
  const hostedDb = isHostedLookingDatabaseUrl(process.env.DATABASE_URL);

  if (production && !explicitAllow) {
    console.error(
      `${tag} Refusing to run in NODE_ENV=production.`,
      'Set ALLOW_DEMO_SEED=true only when you intentionally seed a non-production demo database.',
    );
    process.exit(1);
  }

  if (hostedDb && !explicitAllow) {
    console.error(
      `${tag} DATABASE_URL looks like a hosted/production database.`,
      'Set ALLOW_DEMO_SEED=true only if you intentionally target a non-production demo database.',
    );
    process.exit(1);
  }

  if (production && explicitAllow) {
    console.warn(
      `${tag} WARNING: NODE_ENV=production with ALLOW_DEMO_SEED=true — demo/mock data only; verify target DB and passwords.`,
    );
  }

  if (hostedDb && explicitAllow) {
    console.warn(
      `${tag} WARNING: Hosted-looking DATABASE_URL with ALLOW_DEMO_SEED=true — demo/mock data only; rotate credentials if ever exposed.`,
    );
  }
}

/**
 * Validates demo seed passwords. Fails on placeholders; enforces min length.
 * Stricter when ALLOW_DEMO_SEED=true or DATABASE_URL looks hosted.
 */
export function assertDemoSeedPasswordSafe(envVarName: string, password: string): void {
  const tag = '[seed-demo]';
  const trimmed = password.trim();

  if (trimmed.length < 12) {
    console.error(`${tag} ${envVarName} must be at least 12 characters for demo seed accounts.`);
    process.exit(1);
  }

  if (isPlaceholderDemoPassword(trimmed)) {
    console.error(
      `${tag} ${envVarName} looks like a placeholder or known weak demo password.`,
      'Use a unique strong password from env — never commit or reuse documented placeholders on live databases.',
    );
    process.exit(1);
  }

  const strict =
    isDemoSeedExplicitlyAllowed() || isHostedLookingDatabaseUrl(process.env.DATABASE_URL ?? '');

  if (strict && trimmed.length < 16) {
    console.warn(
      `${tag} WARNING: ${envVarName} is shorter than 16 characters while ALLOW_DEMO_SEED/hosted DB is active — prefer a longer unique password.`,
    );
  }
}
