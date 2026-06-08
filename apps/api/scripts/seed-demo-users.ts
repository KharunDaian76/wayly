/**
 * Idempotent demo user seed for stakeholder showcase.
 *
 * Creates or updates two KYC-approved demo accounts (Sender + Wayler modes).
 * Run manually only — never invoked on app startup.
 *
 *   pnpm --filter @wayly/api run db:seed-demo-users
 *
 * Optional: DEMO_USERS_PASSWORD (default: WaylyDemo2026!)
 */
import { KycStatus, PrismaClient, UserRole } from '@prisma/client';
import * as argon2 from 'argon2';

const DEMO_USERS = [
  { email: 'demo.sender@wayly.app', displayName: 'Demo Sender' },
  { email: 'demo.wayler@wayly.app', displayName: 'Demo Wayler' },
] as const;

const DEFAULT_PASSWORD = 'WaylyDemo2026!';

const prisma = new PrismaClient();

async function upsertDemoUser(
  email: string,
  displayName: string,
  passwordHash: string,
): Promise<{ email: string; displayName: string }> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.$transaction(async (tx) => {
    const record = await tx.user.upsert({
      where: { email: normalizedEmail },
      update: {
        displayName,
        passwordHash,
        roles: [UserRole.USER],
        verified: true,
        kycStatus: KycStatus.APPROVED,
      },
      create: {
        email: normalizedEmail,
        displayName,
        passwordHash,
        roles: [UserRole.USER],
        verified: true,
        kycStatus: KycStatus.APPROVED,
      },
    });

    const now = new Date();
    const latest = await tx.kycVerification.findFirst({
      where: { userId: record.id },
      orderBy: { createdAt: 'desc' },
    });

    if (latest) {
      await tx.kycVerification.update({
        where: { id: latest.id },
        data: {
          status: KycStatus.APPROVED,
          provider: latest.provider ?? 'mock',
          reviewedAt: now,
          rejectionReason: null,
          submittedAt: latest.submittedAt ?? now,
        },
      });
    } else {
      await tx.kycVerification.create({
        data: {
          userId: record.id,
          status: KycStatus.APPROVED,
          provider: 'mock',
          levelName: 'demo-seed',
          submittedAt: now,
          reviewedAt: now,
        },
      });
    }

    return record;
  });

  return { email: user.email, displayName: user.displayName };
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error('[seed-demo-users] DATABASE_URL is required.');
    process.exit(1);
  }

  const password = process.env.DEMO_USERS_PASSWORD ?? DEFAULT_PASSWORD;
  const passwordHash = await argon2.hash(password);

  for (const demo of DEMO_USERS) {
    const user = await upsertDemoUser(demo.email, demo.displayName, passwordHash);
    console.log(`[seed-demo-users] Demo user ready: ${user.email} (${user.displayName})`);
  }

  console.log('[seed-demo-users] Success — both demo accounts are KYC-approved.');
  console.log('[seed-demo-users] Login emails: demo.sender@wayly.app, demo.wayler@wayly.app');
}

main()
  .catch((error) => {
    console.error('[seed-demo-users] Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
