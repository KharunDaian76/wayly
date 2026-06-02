/**
 * Idempotent admin seed.
 *
 * Credentials come from environment variables — NOTHING is hardcoded. If the
 * admin env vars are absent, the seed is skipped (safe no-op), so it never fails
 * a fresh `prisma migrate dev`. Run via `pnpm --filter @wayly/api db:seed`
 * (which loads .env through `prisma db seed`).
 */
import { PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const displayName = process.env.ADMIN_DISPLAY_NAME?.trim() || 'Wayly Admin';

  if (!email || !password) {
    console.warn('[seed] ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin seed.');
    return;
  }

  const passwordHash = await argon2.hash(password);

  const admin = await prisma.user.upsert({
    where: { email },
    // Idempotent: ensure the account stays an admin and verified; the password
    // is set only on creation so re-seeding never silently resets it.
    update: { roles: [UserRole.ADMIN], verified: true },
    create: {
      email,
      displayName,
      passwordHash,
      roles: [UserRole.ADMIN],
      verified: true,
    },
  });

  console.log(`[seed] Admin user ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error('[seed] Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
