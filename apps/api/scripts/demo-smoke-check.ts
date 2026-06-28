/**
 * Wayly demo smoke check — read-only database verification for demo walkthrough readiness.
 *
 *   pnpm --dir apps/api demo:smoke
 *
 * Requires DATABASE_URL only. Does not mutate the database or print secrets.
 */
import {
  DeliveryOrderStatus,
  KycStatus,
  PaymentProvider,
  PrismaClient,
  UserRole,
  WaylerAccessPassProvider,
  WaylerAccessPassStatus,
  WaylerAvailabilityRequestStatus,
  WaylerAvailabilityStatus,
} from '@prisma/client';

const CANONICAL_DEMO_EMAILS = {
  admin: 'admin@wayly.demo',
  sender: 'demo.sender@wayly.demo',
  wayler: 'demo.wayler@wayly.demo',
} as const;

const DEMO_KYC_REVIEW_EMAILS = [
  'demo.kyc-pending-paris@wayly.demo',
  'demo.kyc-pending-bishkek@wayly.demo',
] as const;

const LEGACY_DEMO_EMAILS = ['demo.sender@wayly.app', 'demo.wayler@wayly.app'] as const;

const DEMO_ADMIN_LONG_LIVED_PASS_ID = 'demo-admin-long-lived-pass';
const DEMO_SEED_MOCK_MANUAL_PASS_ID = 'demo-seed-mock-manual';
const DEMO_TITLE_PREFIX = '[Demo]';
const DEMO_SEED_MARKER = 'Created by Wayly demo seed';

type CheckStatus = 'PASS' | 'WARN' | 'FAIL';

type CheckResult = {
  status: CheckStatus;
  label: string;
  detail: string;
  critical: boolean;
};

const prisma = new PrismaClient();

function requireDatabaseUrl(): void {
  if (!process.env.DATABASE_URL?.trim()) {
    console.error('[demo:smoke] DATABASE_URL is required.');
    process.exit(1);
  }
}

function utcDayStart(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function pushCheck(
  results: CheckResult[],
  status: CheckStatus,
  label: string,
  detail: string,
  critical: boolean,
): void {
  results.push({ status, label, detail, critical });
}

function printResults(results: CheckResult[]): void {
  const statusWidth = 4;
  for (const row of results) {
    console.log(`${row.status.padEnd(statusWidth)}  ${row.label} — ${row.detail}`);
  }
}

function isListingVisibleNow(
  listing: {
    status: WaylerAvailabilityStatus;
    isPublic: boolean;
    publishedAt: Date | null;
    expiresAt: Date | null;
    availableTo: Date | null;
  },
  now: Date,
): boolean {
  if (
    listing.status !== WaylerAvailabilityStatus.ACTIVE ||
    !listing.isPublic ||
    !listing.publishedAt
  ) {
    return false;
  }
  if (listing.expiresAt && listing.expiresAt <= now) {
    return false;
  }
  if (listing.availableTo && listing.availableTo < utcDayStart(now)) {
    return false;
  }
  return true;
}

async function main(): Promise<void> {
  requireDatabaseUrl();

  const results: CheckResult[] = [];
  const now = new Date();
  const accessDate = utcDayStart(now);

  console.log('');
  console.log('Wayly demo smoke check');
  console.log(
    'Read-only verification — no database writes. Demo/mock data only; not real payments.',
  );
  console.log('');

  const canonicalEmails = Object.values(CANONICAL_DEMO_EMAILS);
  const users = await prisma.user.findMany({
    where: { email: { in: canonicalEmails } },
    select: {
      id: true,
      email: true,
      roles: true,
      kycStatus: true,
    },
  });

  const userByEmail = new Map(users.map((user) => [user.email.toLowerCase(), user]));
  const admin = userByEmail.get(CANONICAL_DEMO_EMAILS.admin);
  const sender = userByEmail.get(CANONICAL_DEMO_EMAILS.sender);
  const wayler = userByEmail.get(CANONICAL_DEMO_EMAILS.wayler);

  const missingUsers = canonicalEmails.filter((email) => !userByEmail.has(email));
  if (missingUsers.length === 0) {
    pushCheck(results, 'PASS', 'Demo users', 'All 3 canonical @wayly.demo accounts exist', true);
  } else {
    pushCheck(
      results,
      'FAIL',
      'Demo users',
      `Missing: ${missingUsers.join(', ')} — run seed:demo`,
      true,
    );
  }

  if (admin?.roles.includes(UserRole.ADMIN)) {
    pushCheck(results, 'PASS', 'Admin role', 'admin@wayly.demo has ADMIN role', false);
  } else {
    pushCheck(results, 'FAIL', 'Admin role', 'admin@wayly.demo missing ADMIN role', true);
  }

  const senderRolesOk =
    sender?.roles.includes(UserRole.USER) && !sender.roles.includes(UserRole.ADMIN);
  const waylerRolesOk =
    wayler?.roles.includes(UserRole.USER) && !wayler.roles.includes(UserRole.ADMIN);

  if (senderRolesOk && waylerRolesOk) {
    pushCheck(results, 'PASS', 'Sender/Wayler roles', 'Both have USER role (not ADMIN)', false);
  } else {
    pushCheck(
      results,
      'FAIL',
      'Sender/Wayler roles',
      'demo.sender or demo.wayler missing USER role or has ADMIN',
      true,
    );
  }

  const mainDemoApproved =
    admin?.kycStatus === KycStatus.APPROVED &&
    sender?.kycStatus === KycStatus.APPROVED &&
    wayler?.kycStatus === KycStatus.APPROVED;

  if (mainDemoApproved) {
    pushCheck(
      results,
      'PASS',
      'KYC (main accounts)',
      'admin, sender, and wayler are KYC APPROVED',
      false,
    );
  } else {
    pushCheck(
      results,
      'FAIL',
      'KYC (main accounts)',
      'One or more main demo accounts are not KYC APPROVED',
      true,
    );
  }

  const pendingKycSamples = await prisma.kycVerification.count({
    where: {
      status: KycStatus.PENDING,
      user: { email: { in: [...DEMO_KYC_REVIEW_EMAILS] } },
    },
  });

  if (pendingKycSamples >= 2) {
    pushCheck(
      results,
      'PASS',
      'KYC (admin queue)',
      `${pendingKycSamples} pending demo KYC sample(s) for approve/reject testing`,
      true,
    );
  } else {
    pushCheck(
      results,
      'FAIL',
      'KYC (admin queue)',
      `Expected ≥2 pending demo KYC samples, found ${pendingKycSamples}`,
      true,
    );
  }

  const demoUserIds = [admin?.id, sender?.id, wayler?.id].filter((id): id is string => Boolean(id));

  if (demoUserIds.length === 3) {
    const accessPasses = await prisma.waylerAccessPass.findMany({
      where: { waylerId: { in: demoUserIds } },
    });

    const adminPass = accessPasses.find(
      (pass) =>
        pass.waylerId === admin!.id &&
        pass.providerPaymentId === DEMO_ADMIN_LONG_LIVED_PASS_ID &&
        pass.status === WaylerAccessPassStatus.ACTIVE &&
        pass.startsAt <= now &&
        pass.expiresAt > now,
    );

    if (adminPass && adminPass.provider === WaylerAccessPassProvider.MANUAL) {
      pushCheck(
        results,
        'PASS',
        'Wayler access (admin)',
        'Active long-lived mock/manual demo pass (not real payment)',
        true,
      );
    } else {
      pushCheck(
        results,
        'FAIL',
        'Wayler access (admin)',
        'Missing active demo-admin-long-lived-pass — re-run seed:demo',
        true,
      );
    }

    for (const [label, userId, email] of [
      ['sender', sender!.id, CANONICAL_DEMO_EMAILS.sender],
      ['wayler', wayler!.id, CANONICAL_DEMO_EMAILS.wayler],
    ] as const) {
      const dailyPass = accessPasses.find(
        (pass) =>
          pass.waylerId === userId &&
          pass.accessDate.getTime() === accessDate.getTime() &&
          pass.status === WaylerAccessPassStatus.ACTIVE &&
          pass.startsAt <= now &&
          pass.expiresAt > now &&
          (pass.providerPaymentId === DEMO_SEED_MOCK_MANUAL_PASS_ID ||
            pass.provider === WaylerAccessPassProvider.MANUAL),
      );

      if (dailyPass) {
        pushCheck(
          results,
          'PASS',
          `Wayler access (${label})`,
          `${email} has active today UTC mock/manual pass`,
          true,
        );
      } else {
        pushCheck(
          results,
          'FAIL',
          `Wayler access (${label})`,
          `${email} missing active today pass — re-run seed:demo after UTC midnight if needed`,
          true,
        );
      }
    }

    const listings = await prisma.waylerAvailability.findMany({
      where: { waylerId: { in: demoUserIds } },
      select: {
        waylerId: true,
        status: true,
        isPublic: true,
        publishedAt: true,
        expiresAt: true,
        availableTo: true,
      },
    });

    for (const [label, userId, email] of [
      ['admin', admin!.id, CANONICAL_DEMO_EMAILS.admin],
      ['sender', sender!.id, CANONICAL_DEMO_EMAILS.sender],
      ['wayler', wayler!.id, CANONICAL_DEMO_EMAILS.wayler],
    ] as const) {
      const visibleCount = listings.filter(
        (listing) => listing.waylerId === userId && isListingVisibleNow(listing, now),
      ).length;

      if (visibleCount >= 1) {
        pushCheck(
          results,
          'PASS',
          `Listings (${label})`,
          `${email} has ${visibleCount} published active listing(s)`,
          true,
        );
      } else {
        pushCheck(
          results,
          'FAIL',
          `Listings (${label})`,
          `${email} has no visible published listing`,
          true,
        );
      }
    }

    const incomingRequests = await prisma.waylerAvailabilityRequest.findMany({
      where: { waylerId: { in: demoUserIds } },
      select: { waylerId: true, status: true },
    });

    const pendingIncoming = incomingRequests.filter(
      (request) => request.status === WaylerAvailabilityRequestStatus.PENDING,
    ).length;

    for (const [label, userId, email] of [
      ['admin', admin!.id, CANONICAL_DEMO_EMAILS.admin],
      ['sender', sender!.id, CANONICAL_DEMO_EMAILS.sender],
      ['wayler', wayler!.id, CANONICAL_DEMO_EMAILS.wayler],
    ] as const) {
      const count = incomingRequests.filter((request) => request.waylerId === userId).length;
      if (count >= 1) {
        pushCheck(
          results,
          'PASS',
          `Incoming requests (${label})`,
          `${email} has ${count} incoming Sender request(s) as Wayler`,
          true,
        );
      } else {
        pushCheck(
          results,
          'FAIL',
          `Incoming requests (${label})`,
          `${email} has no incoming Sender requests`,
          true,
        );
      }
    }

    if (pendingIncoming >= 1) {
      pushCheck(
        results,
        'PASS',
        'Pending incoming requests',
        `${pendingIncoming} pending request(s) for accept/decline testing`,
        false,
      );
    } else {
      pushCheck(
        results,
        'WARN',
        'Pending incoming requests',
        'No pending incoming requests — accept/decline demo may be limited',
        false,
      );
    }

    const openOrders = await prisma.deliveryOrder.findMany({
      where: {
        status: DeliveryOrderStatus.OPEN,
        senderId: { in: demoUserIds },
      },
      select: { senderId: true },
    });

    for (const [label, userId, email] of [
      ['admin', admin!.id, CANONICAL_DEMO_EMAILS.admin],
      ['sender', sender!.id, CANONICAL_DEMO_EMAILS.sender],
      ['wayler', wayler!.id, CANONICAL_DEMO_EMAILS.wayler],
    ] as const) {
      const availableCount = openOrders.filter((order) => order.senderId !== userId).length;
      if (availableCount >= 1) {
        pushCheck(
          results,
          'PASS',
          `Open orders (${label})`,
          `${email} can accept ${availableCount} open order(s) from other demo account(s)`,
          true,
        );
      } else {
        pushCheck(
          results,
          'FAIL',
          `Open orders (${label})`,
          `${email} has no open orders from other demo users to accept`,
          true,
        );
      }
    }

    const acceptedStatuses = [DeliveryOrderStatus.ACCEPTED, DeliveryOrderStatus.IN_TRANSIT];
    const acceptedOrders = await prisma.deliveryOrder.findMany({
      where: {
        acceptedWaylerId: { in: demoUserIds },
        status: { in: acceptedStatuses },
      },
      select: { acceptedWaylerId: true },
    });

    for (const [label, userId, email] of [
      ['admin', admin!.id, CANONICAL_DEMO_EMAILS.admin],
      ['sender', sender!.id, CANONICAL_DEMO_EMAILS.sender],
      ['wayler', wayler!.id, CANONICAL_DEMO_EMAILS.wayler],
    ] as const) {
      const count = acceptedOrders.filter((order) => order.acceptedWaylerId === userId).length;
      if (count >= 1) {
        pushCheck(
          results,
          'PASS',
          `Accepted orders (${label})`,
          `${email} has ${count} accepted/in-progress order(s) as Wayler`,
          true,
        );
      } else {
        pushCheck(
          results,
          'FAIL',
          `Accepted orders (${label})`,
          `${email} has no accepted/in-progress Wayler orders`,
          true,
        );
      }
    }

    const deliveredCount = await prisma.deliveryOrder.count({
      where: {
        status: DeliveryOrderStatus.DELIVERED,
        OR: [{ senderId: { in: demoUserIds } }, { acceptedWaylerId: { in: demoUserIds } }],
        title: { startsWith: DEMO_TITLE_PREFIX },
      },
    });

    if (deliveredCount >= 1) {
      pushCheck(
        results,
        'PASS',
        'Delivered orders',
        `${deliveredCount} demo delivered order(s) for review/chat testing`,
        false,
      );
    } else {
      pushCheck(results, 'WARN', 'Delivered orders', 'No demo delivered orders found', false);
    }

    const reviewCount = await prisma.review.count({
      where: {
        order: {
          OR: [{ senderId: { in: demoUserIds } }, { acceptedWaylerId: { in: demoUserIds } }],
        },
      },
    });

    if (reviewCount >= 1) {
      pushCheck(results, 'PASS', 'Reviews', `${reviewCount} review(s) present`, false);
    } else {
      pushCheck(results, 'WARN', 'Reviews', 'No reviews found', false);
    }

    const hiddenReviewCount = await prisma.review.count({
      where: {
        isHidden: true,
        OR: [
          { adminNote: { contains: DEMO_SEED_MARKER } },
          { comment: { contains: DEMO_SEED_MARKER } },
        ],
      },
    });

    if (hiddenReviewCount >= 1) {
      pushCheck(
        results,
        'PASS',
        'Hidden review sample',
        `${hiddenReviewCount} hidden moderation sample review(s)`,
        false,
      );
    } else {
      pushCheck(
        results,
        'WARN',
        'Hidden review sample',
        'No hidden demo review moderation sample — admin reviews queue may be empty',
        false,
      );
    }

    const conversationCount = await prisma.conversation.count({
      where: {
        order: {
          OR: [{ senderId: { in: demoUserIds } }, { acceptedWaylerId: { in: demoUserIds } }],
        },
      },
    });

    const messageCount = await prisma.chatMessage.count({
      where: {
        conversation: {
          order: {
            OR: [{ senderId: { in: demoUserIds } }, { acceptedWaylerId: { in: demoUserIds } }],
          },
        },
      },
    });

    if (conversationCount >= 1 && messageCount >= 1) {
      pushCheck(
        results,
        'PASS',
        'Conversations/chat',
        `${conversationCount} conversation(s), ${messageCount} message(s)`,
        false,
      );
    } else {
      pushCheck(
        results,
        'WARN',
        'Conversations/chat',
        `Conversations: ${conversationCount}, messages: ${messageCount}`,
        false,
      );
    }

    for (const [label, userId, email] of [
      ['admin', admin!.id, CANONICAL_DEMO_EMAILS.admin],
      ['sender', sender!.id, CANONICAL_DEMO_EMAILS.sender],
      ['wayler', wayler!.id, CANONICAL_DEMO_EMAILS.wayler],
    ] as const) {
      const count = await prisma.notification.count({ where: { userId } });
      if (count >= 1) {
        pushCheck(
          results,
          'PASS',
          `Notifications (${label})`,
          `${email} has ${count} notification(s)`,
          false,
        );
      } else {
        pushCheck(
          results,
          'WARN',
          `Notifications (${label})`,
          `${email} has no notifications`,
          false,
        );
      }
    }

    const supportMissing: string[] = [];
    for (const [label, userId, email] of [
      ['admin', admin!.id, CANONICAL_DEMO_EMAILS.admin],
      ['sender', sender!.id, CANONICAL_DEMO_EMAILS.sender],
      ['wayler', wayler!.id, CANONICAL_DEMO_EMAILS.wayler],
    ] as const) {
      const count = await prisma.supportTicket.count({ where: { userId } });
      if (count >= 1) {
        pushCheck(
          results,
          'PASS',
          `Support tickets (${label})`,
          `${email} has ${count} ticket(s)`,
          false,
        );
      } else {
        supportMissing.push(email);
        pushCheck(
          results,
          'WARN',
          `Support tickets (${label})`,
          `${email} has no support ticket`,
          false,
        );
      }
    }

    if (supportMissing.length > 0) {
      pushCheck(
        results,
        'WARN',
        'Support tickets (summary)',
        `Missing for: ${supportMissing.join(', ')}`,
        false,
      );
    }

    const demoSupportTicketCount = await prisma.supportTicket.count({
      where: { subject: { startsWith: DEMO_TITLE_PREFIX } },
    });

    if (demoSupportTicketCount >= 1) {
      pushCheck(
        results,
        'PASS',
        'Admin support queue',
        `${demoSupportTicketCount} demo support ticket(s) for admin queue`,
        false,
      );
    } else {
      pushCheck(
        results,
        'WARN',
        'Admin support queue',
        'No demo-titled support tickets for admin queue',
        false,
      );
    }

    const mockPaymentCount = await prisma.paymentIntent.count({
      where: {
        payerId: { in: demoUserIds },
        provider: PaymentProvider.MANUAL,
      },
    });

    if (mockPaymentCount >= 1) {
      pushCheck(
        results,
        'PASS',
        'Mock payment data',
        `${mockPaymentCount} manual/mock payment intent(s) — not real payments`,
        false,
      );
    } else {
      pushCheck(
        results,
        'WARN',
        'Mock payment data',
        'No mock payment intents found for demo orders',
        false,
      );
    }

    const auditLogCount = await prisma.adminAuditLog.count();
    if (auditLogCount >= 1) {
      pushCheck(
        results,
        'PASS',
        'Admin audit logs',
        `${auditLogCount} audit log entry(ies) present`,
        false,
      );
    } else {
      pushCheck(
        results,
        'WARN',
        'Admin audit logs',
        'No audit logs yet — normal until admin KYC/support actions are performed',
        false,
      );
    }
  }

  const legacyUsers = await prisma.user.findMany({
    where: { email: { in: [...LEGACY_DEMO_EMAILS] } },
    select: { email: true },
  });

  if (legacyUsers.length === 0) {
    pushCheck(
      results,
      'PASS',
      'Legacy demo users',
      'No demo.sender@wayly.app / demo.wayler@wayly.app accounts in DB',
      false,
    );
  } else {
    pushCheck(
      results,
      'WARN',
      'Legacy demo users',
      `Found legacy accounts: ${legacyUsers.map((user) => user.email).join(', ')} — prefer @wayly.demo`,
      false,
    );
  }

  console.log('Results:');
  printResults(results);
  console.log('');

  const criticalFailures = results.filter((row) => row.critical && row.status === 'FAIL').length;
  const warnings = results.filter((row) => row.status === 'WARN').length;

  if (criticalFailures === 0) {
    console.log('Demo walkthrough ready');
    if (warnings > 0) {
      console.log(`(${warnings} warning(s) — optional demo data may be missing)`);
    }
  } else {
    console.log('Demo walkthrough not ready');
    console.log(`(${criticalFailures} critical check(s) failed — run seed:demo and re-check)`);
  }

  console.log('');
  console.warn(
    '[demo:smoke] Read-only smoke check only — not a substitute for automated E2E tests.',
  );

  process.exit(criticalFailures === 0 ? 0 : 1);
}

main()
  .catch((error) => {
    console.error('[demo:smoke] Failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
