/**
 * Wayly Demo Data Seed v1 — local/dev only.
 *
 * Idempotent seed for demo admin, sender, wayler, availabilities, requests,
 * orders, chats, Wayler access, and support tickets.
 *
 * Usage (PowerShell):
 *   $env:DEMO_ADMIN_EMAIL="admin@wayly.demo"
 *   $env:DEMO_ADMIN_PASSWORD="choose-a-local-demo-password"
 *   $env:DEMO_USER_PASSWORD="choose-a-local-demo-password"
 *   pnpm --dir apps/api seed:demo
 *
 * Requires DATABASE_URL. Passwords must come from env — nothing is hardcoded.
 * Never run against production.
 */
import {
  DeliveryOrderSource,
  DeliveryOrderStatus,
  DeliveryOrderType,
  KycStatus,
  NotificationEntityType,
  NotificationType,
  PackageSize,
  PaymentProvider,
  PaymentStatus,
  PaymentAdminReviewStatus,
  Prisma,
  PrismaClient,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus,
  TripDirection,
  UserRole,
  UserAccountStatus,
  WaylerAccessPassProvider,
  WaylerAccessPassStatus,
  WaylerAvailabilityRequestStatus,
  WaylerAvailabilityStatus,
  WaylerAvailabilityType,
} from '@prisma/client';
import * as argon2 from 'argon2';

const DEMO_SEED_MARKER = 'Created by Wayly demo seed';
const DEMO_TITLE_PREFIX = '[Demo]';

const DEFAULT_ADMIN_EMAIL = 'admin@wayly.demo';
const DEMO_SENDER_EMAIL = 'demo.sender@wayly.demo';
const DEMO_WAYLER_EMAIL = 'demo.wayler@wayly.demo';

const prisma = new PrismaClient();

type DemoUserIds = {
  adminId: string;
  senderId: string;
  waylerId: string;
};

type SeedCounts = {
  users: number;
  availabilities: number;
  requests: number;
  orders: number;
  conversations: number;
  messages: number;
  accessPasses: number;
  supportTickets: number;
  paymentIntents: number;
  notifications: number;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`[seed-demo] Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function assertSafeToRun(): void {
  if (!process.env.DATABASE_URL) {
    console.error('[seed-demo] DATABASE_URL is required.');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production') {
    console.error('[seed-demo] Refusing to run in NODE_ENV=production.');
    process.exit(1);
  }

  const url = process.env.DATABASE_URL.toLowerCase();
  const blockedHints = ['render.com', 'amazonaws.com', 'prod', 'production'];
  if (blockedHints.some((hint) => url.includes(hint)) && process.env.ALLOW_DEMO_SEED !== 'true') {
    console.error(
      '[seed-demo] DATABASE_URL looks like a hosted/production database.',
      'Set ALLOW_DEMO_SEED=true only if you intentionally target a non-production DB.',
    );
    process.exit(1);
  }
}

function addDays(base: Date, days: number): Date {
  const copy = new Date(base);
  copy.setUTCDate(copy.getUTCDate() + days);
  return copy;
}

function utcDayStart(date: Date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function nextUtcDayStart(date: Date = new Date()): Date {
  return new Date(utcDayStart(date).getTime() + 24 * 60 * 60 * 1000);
}

function demoTitle(label: string): string {
  return `${DEMO_TITLE_PREFIX} ${label}`;
}

function demoNotes(key: string): string {
  return `${DEMO_SEED_MARKER} | key=${key}`;
}

async function upsertDemoUser(params: {
  email: string;
  displayName: string;
  passwordHash: string;
  roles: UserRole[];
}): Promise<string> {
  const email = params.email.trim().toLowerCase();
  const now = new Date();

  const user = await prisma.$transaction(async (tx) => {
    const record = await tx.user.upsert({
      where: { email },
      update: {
        displayName: params.displayName,
        passwordHash: params.passwordHash,
        roles: params.roles,
        verified: true,
        kycStatus: KycStatus.APPROVED,
        accountStatus: UserAccountStatus.ACTIVE,
        suspendedAt: null,
        suspensionReason: null,
      },
      create: {
        email,
        displayName: params.displayName,
        passwordHash: params.passwordHash,
        roles: params.roles,
        verified: true,
        kycStatus: KycStatus.APPROVED,
        accountStatus: UserAccountStatus.ACTIVE,
      },
    });

    const latestKyc = await tx.kycVerification.findFirst({
      where: { userId: record.id },
      orderBy: { createdAt: 'desc' },
    });

    if (latestKyc) {
      await tx.kycVerification.update({
        where: { id: latestKyc.id },
        data: {
          status: KycStatus.APPROVED,
          provider: latestKyc.provider ?? 'mock',
          levelName: 'demo-seed',
          submittedAt: latestKyc.submittedAt ?? now,
          reviewedAt: now,
          rejectionReason: null,
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

  return user.id;
}

async function cleanupDemoData(ids: DemoUserIds): Promise<void> {
  const demoOrderIds = (
    await prisma.deliveryOrder.findMany({
      where: {
        OR: [
          { senderId: ids.senderId, title: { startsWith: DEMO_TITLE_PREFIX } },
          { acceptedWaylerId: ids.waylerId, title: { startsWith: DEMO_TITLE_PREFIX } },
        ],
      },
      select: { id: true },
    })
  ).map((row) => row.id);

  if (demoOrderIds.length > 0) {
    await prisma.chatMessage.deleteMany({
      where: { conversation: { orderId: { in: demoOrderIds } } },
    });
    await prisma.conversation.deleteMany({ where: { orderId: { in: demoOrderIds } } });
    await prisma.paymentIntent.deleteMany({ where: { orderId: { in: demoOrderIds } } });
    await prisma.supportTicket.deleteMany({
      where: { orderId: { in: demoOrderIds }, subject: { startsWith: DEMO_TITLE_PREFIX } },
    });
    await prisma.deliveryOrder.deleteMany({ where: { id: { in: demoOrderIds } } });
  }

  await prisma.supportTicket.deleteMany({
    where: {
      userId: { in: [ids.senderId, ids.waylerId] },
      subject: { startsWith: DEMO_TITLE_PREFIX },
    },
  });

  await prisma.waylerAvailabilityRequest.deleteMany({
    where: {
      senderId: ids.senderId,
      title: { startsWith: DEMO_TITLE_PREFIX },
    },
  });

  await prisma.waylerAvailability.deleteMany({
    where: {
      waylerId: ids.waylerId,
      notes: { contains: DEMO_SEED_MARKER },
    },
  });

  await prisma.notification.deleteMany({
    where: {
      userId: { in: [ids.adminId, ids.senderId, ids.waylerId] },
      title: { startsWith: DEMO_TITLE_PREFIX },
    },
  });
}

async function seedAvailabilities(waylerId: string, now: Date): Promise<Map<string, string>> {
  const keys = new Map<string, string>();
  const specs = [
    {
      key: 'istanbul-nyc-trip',
      type: WaylerAvailabilityType.TRIP_ROUTE,
      originCountry: 'TR',
      originCity: 'Istanbul',
      destinationCountry: 'US',
      destinationCity: 'New York',
      maxPackages: 3,
      maxWeightKg: 8,
      tripDirection: TripDirection.ONE_WAY,
      departureDays: 14,
    },
    {
      key: 'berlin-paris-trip',
      type: WaylerAvailabilityType.TRIP_ROUTE,
      originCountry: 'DE',
      originCity: 'Berlin',
      destinationCountry: 'FR',
      destinationCity: 'Paris',
      maxPackages: 2,
      maxWeightKg: 5,
      tripDirection: TripDirection.ONE_WAY,
      departureDays: 21,
    },
    {
      key: 'bishkek-local',
      type: WaylerAvailabilityType.LOCAL_AVAILABILITY,
      originCountry: 'KG',
      originCity: 'Bishkek',
      destinationCountry: 'KG',
      destinationCity: 'Bishkek',
      maxPackages: 4,
      maxWeightKg: 10,
      tripDirection: null,
      departureDays: 7,
    },
    {
      key: 'istanbul-local',
      type: WaylerAvailabilityType.LOCAL_AVAILABILITY,
      originCountry: 'TR',
      originCity: 'Istanbul',
      destinationCountry: 'TR',
      destinationCity: 'Istanbul',
      maxPackages: 5,
      maxWeightKg: 12,
      tripDirection: null,
      departureDays: 10,
    },
    {
      key: 'nyc-local',
      type: WaylerAvailabilityType.LOCAL_AVAILABILITY,
      originCountry: 'US',
      originCity: 'New York',
      destinationCountry: 'US',
      destinationCity: 'New York',
      maxPackages: 3,
      maxWeightKg: 6,
      tripDirection: null,
      departureDays: 12,
    },
  ] as const;

  for (const spec of specs) {
    const availableFrom = addDays(now, spec.departureDays - 3);
    const availableTo = addDays(now, spec.departureDays + 5);
    const departureDate = addDays(now, spec.departureDays);

    const record = await prisma.waylerAvailability.create({
      data: {
        waylerId,
        type: spec.type,
        status: WaylerAvailabilityStatus.ACTIVE,
        isPublic: true,
        publishedAt: now,
        originCountry: spec.originCountry,
        originCity: spec.originCity,
        destinationCountry: spec.destinationCountry,
        destinationCity: spec.destinationCity,
        availableFrom,
        availableTo,
        departureDate,
        tripDirection: spec.tripDirection,
        maxPackages: spec.maxPackages,
        maxWeightKg: new Prisma.Decimal(spec.maxWeightKg),
        expiresAt: availableTo,
        notes: demoNotes(spec.key),
      },
    });
    keys.set(spec.key, record.id);
  }

  return keys;
}

async function seedAvailabilityRequests(
  ids: DemoUserIds,
  availabilityIds: Map<string, string>,
  now: Date,
): Promise<{ requests: number; orders: number }> {
  let requests = 0;
  let orders = 0;

  const requestSpecs = [
    {
      key: 'req-documents-pending',
      availabilityKey: 'istanbul-nyc-trip',
      status: WaylerAvailabilityRequestStatus.PENDING,
      title: demoTitle('Documents envelope (pending)'),
      packageDescription: 'Sealed documents envelope for demo review only.',
      pickupCountry: 'TR',
      pickupCity: 'Istanbul',
      dropoffCountry: 'US',
      dropoffCity: 'New York',
      rewardCents: 4500,
      currency: 'USD',
    },
    {
      key: 'req-books-accepted',
      availabilityKey: 'berlin-paris-trip',
      status: WaylerAvailabilityRequestStatus.ACCEPTED,
      title: demoTitle('Books package (accepted)'),
      packageDescription: 'Two paperback books in a small box.',
      pickupCountry: 'DE',
      pickupCity: 'Berlin',
      dropoffCountry: 'FR',
      dropoffCity: 'Paris',
      rewardCents: 2800,
      currency: 'EUR',
    },
    {
      key: 'req-gift-declined',
      availabilityKey: 'istanbul-local',
      status: WaylerAvailabilityRequestStatus.DECLINED,
      title: demoTitle('Gift package (declined)'),
      packageDescription: 'Small gift box with non-restricted items.',
      pickupCountry: 'TR',
      pickupCity: 'Istanbul',
      dropoffCountry: 'TR',
      dropoffCity: 'Ankara',
      rewardCents: 1500,
      currency: 'TRY',
    },
    {
      key: 'req-accessory-cancelled',
      availabilityKey: 'nyc-local',
      status: WaylerAvailabilityRequestStatus.CANCELLED,
      title: demoTitle('Electronics accessory (cancelled)'),
      packageDescription: 'Phone case and cable — allowed consumer accessory.',
      pickupCountry: 'US',
      pickupCity: 'New York',
      dropoffCountry: 'US',
      dropoffCity: 'Brooklyn',
      rewardCents: 1200,
      currency: 'USD',
    },
  ] as const;

  for (const spec of requestSpecs) {
    const availabilityId = availabilityIds.get(spec.availabilityKey);
    if (!availabilityId) {
      continue;
    }

    const acceptedAt =
      spec.status === WaylerAvailabilityRequestStatus.ACCEPTED ? addDays(now, -2) : null;

    const request = await prisma.waylerAvailabilityRequest.create({
      data: {
        availabilityId,
        senderId: ids.senderId,
        waylerId: ids.waylerId,
        status: spec.status,
        title: spec.title,
        packageDescription: spec.packageDescription,
        pickupCountry: spec.pickupCountry,
        pickupCity: spec.pickupCity,
        dropoffCountry: spec.dropoffCountry,
        dropoffCity: spec.dropoffCity,
        desiredPickupFrom: addDays(now, 5),
        desiredPickupTo: addDays(now, 7),
        desiredDeliveryFrom: addDays(now, 10),
        desiredDeliveryTo: addDays(now, 14),
        proposedRewardCents: spec.rewardCents,
        currency: spec.currency,
        message: demoNotes(spec.key),
        responseMessage:
          spec.status === WaylerAvailabilityRequestStatus.DECLINED
            ? 'Demo decline — route capacity full for this window.'
            : spec.status === WaylerAvailabilityRequestStatus.CANCELLED
              ? 'Demo cancel — sender changed plans.'
              : null,
        acceptedAt,
        declinedAt:
          spec.status === WaylerAvailabilityRequestStatus.DECLINED ? addDays(now, -1) : null,
        cancelledAt:
          spec.status === WaylerAvailabilityRequestStatus.CANCELLED ? addDays(now, -1) : null,
      },
    });
    requests += 1;

    if (spec.status === WaylerAvailabilityRequestStatus.ACCEPTED && acceptedAt) {
      await prisma.deliveryOrder.create({
        data: {
          senderId: request.senderId,
          acceptedWaylerId: request.waylerId,
          status: DeliveryOrderStatus.ACCEPTED,
          type:
            request.pickupCountry !== request.dropoffCountry
              ? DeliveryOrderType.INTERNATIONAL
              : DeliveryOrderType.LOCAL,
          sourceType: DeliveryOrderSource.WAYLER_AVAILABILITY_REQUEST,
          availabilityRequestId: request.id,
          title: request.title,
          description: request.packageDescription,
          pickupCountry: request.pickupCountry,
          pickupCity: request.pickupCity,
          dropoffCountry: request.dropoffCountry,
          dropoffCity: request.dropoffCity,
          pickupDateFrom: request.desiredPickupFrom,
          pickupDateTo: request.desiredPickupTo,
          deliveryDeadline: request.desiredDeliveryTo,
          currency: request.currency,
          offeredRewardAmount: new Prisma.Decimal(request.proposedRewardCents).div(100),
          notes: request.message,
          acceptedAt,
          packageSize: PackageSize.SMALL,
        },
      });
      orders += 1;
    }
  }

  return { requests, orders };
}

async function seedSenderOrders(ids: DemoUserIds, now: Date): Promise<number> {
  let created = 0;

  const draftSpecs = [
    {
      title: demoTitle('Draft: Bishkek to Istanbul'),
      pickupCountry: 'KG',
      pickupCity: 'Bishkek',
      dropoffCountry: 'TR',
      dropoffCity: 'Istanbul',
      currency: 'USD',
      reward: 55,
    },
    {
      title: demoTitle('Draft: Berlin local pickup'),
      pickupCountry: 'DE',
      pickupCity: 'Berlin',
      dropoffCountry: 'DE',
      dropoffCity: 'Munich',
      currency: 'EUR',
      reward: 35,
    },
    {
      title: demoTitle('Draft: NYC documents'),
      pickupCountry: 'US',
      pickupCity: 'New York',
      dropoffCountry: 'US',
      dropoffCity: 'Boston',
      currency: 'USD',
      reward: 40,
    },
  ] as const;

  for (const spec of draftSpecs) {
    await prisma.deliveryOrder.create({
      data: {
        senderId: ids.senderId,
        status: DeliveryOrderStatus.DRAFT,
        type:
          spec.pickupCountry !== spec.dropoffCountry
            ? DeliveryOrderType.INTERNATIONAL
            : DeliveryOrderType.LOCAL,
        sourceType: DeliveryOrderSource.SENDER_POSTED_ORDER,
        title: spec.title,
        description: 'Demo draft order for sender workspace testing.',
        pickupCountry: spec.pickupCountry,
        pickupCity: spec.pickupCity,
        dropoffCountry: spec.dropoffCountry,
        dropoffCity: spec.dropoffCity,
        currency: spec.currency,
        offeredRewardAmount: new Prisma.Decimal(spec.reward),
        notes: demoNotes('draft-order'),
        packageSize: PackageSize.SMALL,
      },
    });
    created += 1;
  }

  const openSpecs = [
    {
      title: demoTitle('Open: Istanbul to New York'),
      pickupCountry: 'TR',
      pickupCity: 'Istanbul',
      dropoffCountry: 'US',
      dropoffCity: 'New York',
      currency: 'USD',
      reward: 120,
    },
    {
      title: demoTitle('Open: Paris to London'),
      pickupCountry: 'FR',
      pickupCity: 'Paris',
      dropoffCountry: 'GB',
      dropoffCity: 'London',
      currency: 'EUR',
      reward: 75,
    },
    {
      title: demoTitle('Open: Bishkek local'),
      pickupCountry: 'KG',
      pickupCity: 'Bishkek',
      dropoffCountry: 'KG',
      dropoffCity: 'Osh',
      currency: 'KGS',
      reward: 2500,
    },
  ] as const;

  for (const spec of openSpecs) {
    await prisma.deliveryOrder.create({
      data: {
        senderId: ids.senderId,
        status: DeliveryOrderStatus.OPEN,
        type:
          spec.pickupCountry !== spec.dropoffCountry
            ? DeliveryOrderType.INTERNATIONAL
            : DeliveryOrderType.LOCAL,
        sourceType: DeliveryOrderSource.SENDER_POSTED_ORDER,
        title: spec.title,
        description: 'Demo open marketplace order.',
        pickupCountry: spec.pickupCountry,
        pickupCity: spec.pickupCity,
        dropoffCountry: spec.dropoffCountry,
        dropoffCity: spec.dropoffCity,
        currency: spec.currency,
        offeredRewardAmount: new Prisma.Decimal(spec.reward),
        publishedAt: now,
        notes: demoNotes('open-order'),
        packageSize: PackageSize.MEDIUM,
      },
    });
    created += 1;
  }

  const acceptedSpecs = [
    {
      title: demoTitle('Accepted: Berlin to Paris'),
      pickupCountry: 'DE',
      pickupCity: 'Berlin',
      dropoffCountry: 'FR',
      dropoffCity: 'Paris',
      currency: 'EUR',
      reward: 60,
    },
    {
      title: demoTitle('Accepted: Istanbul local'),
      pickupCountry: 'TR',
      pickupCity: 'Istanbul',
      dropoffCountry: 'TR',
      dropoffCity: 'Izmir',
      currency: 'TRY',
      reward: 900,
    },
    {
      title: demoTitle('Accepted: New York local'),
      pickupCountry: 'US',
      pickupCity: 'New York',
      dropoffCountry: 'US',
      dropoffCity: 'Jersey City',
      currency: 'USD',
      reward: 45,
    },
  ] as const;

  for (const spec of acceptedSpecs) {
    await prisma.deliveryOrder.create({
      data: {
        senderId: ids.senderId,
        acceptedWaylerId: ids.waylerId,
        status: DeliveryOrderStatus.ACCEPTED,
        type:
          spec.pickupCountry !== spec.dropoffCountry
            ? DeliveryOrderType.INTERNATIONAL
            : DeliveryOrderType.LOCAL,
        sourceType: DeliveryOrderSource.SENDER_POSTED_ORDER,
        title: spec.title,
        description: 'Demo accepted Wayler work item.',
        pickupCountry: spec.pickupCountry,
        pickupCity: spec.pickupCity,
        dropoffCountry: spec.dropoffCountry,
        dropoffCity: spec.dropoffCity,
        currency: spec.currency,
        offeredRewardAmount: new Prisma.Decimal(spec.reward),
        publishedAt: addDays(now, -5),
        acceptedAt: addDays(now, -2),
        notes: demoNotes('accepted-order'),
        packageSize: PackageSize.SMALL,
      },
    });
    created += 1;
  }

  const inTransitOrder = await prisma.deliveryOrder.create({
    data: {
      senderId: ids.senderId,
      acceptedWaylerId: ids.waylerId,
      status: DeliveryOrderStatus.IN_TRANSIT,
      type: DeliveryOrderType.INTERNATIONAL,
      sourceType: DeliveryOrderSource.SENDER_POSTED_ORDER,
      title: demoTitle('In transit: Bishkek to Istanbul'),
      description: 'Demo in-transit order for status coverage.',
      pickupCountry: 'KG',
      pickupCity: 'Bishkek',
      dropoffCountry: 'TR',
      dropoffCity: 'Istanbul',
      currency: 'USD',
      offeredRewardAmount: new Prisma.Decimal(85),
      publishedAt: addDays(now, -10),
      acceptedAt: addDays(now, -7),
      notes: demoNotes('in-transit-order'),
      packageSize: PackageSize.MEDIUM,
    },
  });
  created += 1;

  const deliveredOrder = await prisma.deliveryOrder.create({
    data: {
      senderId: ids.senderId,
      acceptedWaylerId: ids.waylerId,
      status: DeliveryOrderStatus.DELIVERED,
      type: DeliveryOrderType.LOCAL,
      sourceType: DeliveryOrderSource.SENDER_POSTED_ORDER,
      title: demoTitle('Delivered: NYC local handoff'),
      description: 'Demo delivered order with proof metadata.',
      pickupCountry: 'US',
      pickupCity: 'New York',
      dropoffCountry: 'US',
      dropoffCity: 'New York',
      currency: 'USD',
      offeredRewardAmount: new Prisma.Decimal(30),
      publishedAt: addDays(now, -14),
      acceptedAt: addDays(now, -12),
      deliveredAt: addDays(now, -3),
      proofNote: 'Demo proof — recipient confirmed handoff in app.',
      proofConfirmationCode: 'DEMO-OK-001',
      proofSubmittedAt: addDays(now, -3),
      proofSubmittedById: ids.waylerId,
      notes: demoNotes('delivered-order'),
      packageSize: PackageSize.SMALL,
    },
  });
  created += 1;

  return created;
}

async function seedChats(ids: DemoUserIds): Promise<{ conversations: number; messages: number }> {
  const acceptedOrders = await prisma.deliveryOrder.findMany({
    where: {
      acceptedWaylerId: ids.waylerId,
      senderId: ids.senderId,
      title: { startsWith: DEMO_TITLE_PREFIX },
      status: {
        in: [
          DeliveryOrderStatus.ACCEPTED,
          DeliveryOrderStatus.IN_TRANSIT,
          DeliveryOrderStatus.DELIVERED,
        ],
      },
    },
    take: 4,
    orderBy: { createdAt: 'asc' },
  });

  let conversations = 0;
  let messages = 0;

  const chatTemplates = [
    [
      {
        senderId: ids.senderId,
        body: 'Hi — this is a demo chat about pickup timing. No payment details here.',
      },
      {
        senderId: ids.waylerId,
        body: 'Thanks. I can meet near the main station during the demo window.',
      },
      { senderId: ids.senderId, body: 'Perfect. Please confirm when you are en route.' },
    ],
    [
      {
        senderId: ids.waylerId,
        body: 'Demo Wayler checking in — package looks sealed and labeled.',
      },
      {
        senderId: ids.senderId,
        body: 'Great. Remember this is mock/manual flow only, not real escrow.',
      },
    ],
  ] as const;

  for (let i = 0; i < acceptedOrders.length; i += 1) {
    const order = acceptedOrders[i];
    const template = chatTemplates[i % chatTemplates.length];

    const conversation = await prisma.conversation.create({
      data: {
        orderId: order.id,
        senderId: ids.senderId,
        waylerId: ids.waylerId,
      },
    });
    conversations += 1;

    for (const msg of template) {
      await prisma.chatMessage.create({
        data: {
          conversationId: conversation.id,
          senderId: msg.senderId,
          body: msg.body,
        },
      });
      messages += 1;
    }
  }

  return { conversations, messages };
}

async function seedWaylerAccess(waylerId: string, now: Date): Promise<number> {
  const accessDate = utcDayStart(now);
  const startsAt = accessDate;
  const expiresAt = nextUtcDayStart(now);

  await prisma.waylerAccessPass.upsert({
    where: {
      waylerId_accessDate: {
        waylerId,
        accessDate,
      },
    },
    update: {
      status: WaylerAccessPassStatus.ACTIVE,
      provider: WaylerAccessPassProvider.MANUAL,
      currency: 'EUR',
      amount: new Prisma.Decimal('1.00'),
      startsAt,
      expiresAt,
      activatedAt: now,
      providerPaymentId: 'demo-seed-mock-manual',
      cancelledAt: null,
      failedAt: null,
      refundedAt: null,
    },
    create: {
      waylerId,
      status: WaylerAccessPassStatus.ACTIVE,
      provider: WaylerAccessPassProvider.MANUAL,
      currency: 'EUR',
      amount: new Prisma.Decimal('1.00'),
      accessDate,
      startsAt,
      expiresAt,
      activatedAt: now,
      providerPaymentId: 'demo-seed-mock-manual',
    },
  });

  return 1;
}

async function seedSupportTickets(
  ids: DemoUserIds,
  now: Date,
): Promise<{ tickets: number; linkedOrderId: string | null }> {
  const orderForTicket = await prisma.deliveryOrder.findFirst({
    where: {
      senderId: ids.senderId,
      title: { startsWith: DEMO_TITLE_PREFIX },
      status: DeliveryOrderStatus.OPEN,
    },
    orderBy: { createdAt: 'asc' },
  });

  const specs = [
    {
      subject: demoTitle('General platform question'),
      message:
        'Demo support ticket — asking how launch status and mock payment areas work. Not an emergency.',
      category: SupportTicketCategory.GENERAL,
      status: SupportTicketStatus.OPEN,
      priority: SupportTicketPriority.NORMAL,
      orderId: null as string | null,
    },
    {
      subject: demoTitle('Payment status question'),
      message:
        'Demo ticket about mock/manual payment visibility. No refund or payout guarantee requested.',
      category: SupportTicketCategory.PAYMENT_STATUS,
      status: SupportTicketStatus.UNDER_REVIEW,
      priority: SupportTicketPriority.NORMAL,
      orderId: null as string | null,
    },
    {
      subject: demoTitle('Order issue follow-up'),
      message:
        'Demo ticket linked to an open order for admin queue testing. Platform support review only.',
      category: SupportTicketCategory.ORDER_ISSUE,
      status: SupportTicketStatus.OPEN,
      priority: SupportTicketPriority.NORMAL,
      orderId: orderForTicket?.id ?? null,
    },
  ] as const;

  let tickets = 0;
  for (const spec of specs) {
    await prisma.supportTicket.create({
      data: {
        userId: ids.senderId,
        subject: spec.subject,
        message: `${spec.message}\n\n${demoNotes('support-ticket')}`,
        category: spec.category,
        status: spec.status,
        priority: spec.priority,
        orderId: spec.orderId,
      },
    });
    tickets += 1;
  }

  return { tickets, linkedOrderId: orderForTicket?.id ?? null };
}

async function seedMockPaymentIntents(ids: DemoUserIds, now: Date): Promise<number> {
  const orders = await prisma.deliveryOrder.findMany({
    where: {
      senderId: ids.senderId,
      acceptedWaylerId: ids.waylerId,
      title: { startsWith: DEMO_TITLE_PREFIX },
      status: {
        in: [
          DeliveryOrderStatus.ACCEPTED,
          DeliveryOrderStatus.IN_TRANSIT,
          DeliveryOrderStatus.DELIVERED,
        ],
      },
    },
    take: 2,
  });

  let created = 0;
  for (const order of orders) {
    const amount = order.offeredRewardAmount ?? new Prisma.Decimal(50);
    await prisma.paymentIntent.create({
      data: {
        orderId: order.id,
        payerId: ids.senderId,
        payeeId: ids.waylerId,
        provider: PaymentProvider.MANUAL,
        status: PaymentStatus.HELD_IN_ESCROW,
        currency: order.currency,
        amount,
        platformFeeAmount: amount.mul(0.1),
        escrowAmount: amount,
        providerPaymentId: 'demo-seed-mock-intent',
        authorizedAt: addDays(now, -4),
        escrowedAt: addDays(now, -3),
        adminReviewStatus:
          created === 0 ? PaymentAdminReviewStatus.MANUAL_REVIEW : PaymentAdminReviewStatus.NONE,
        adminReviewNote: created === 0 ? demoNotes('payment-manual-review') : null,
        adminReviewAt: created === 0 ? now : null,
        adminReviewByUserId: created === 0 ? ids.adminId : null,
      },
    });
    created += 1;
  }

  return created;
}

async function seedDemoNotifications(ids: DemoUserIds, now: Date): Promise<number> {
  const readAt = addDays(now, -1);
  const specs: Prisma.NotificationCreateManyInput[] = [
    {
      userId: ids.senderId,
      type: NotificationType.SUCCESS,
      title: demoTitle('Support ticket created'),
      body: `${DEMO_SEED_MARKER} Demo in-app notice: your support ticket was recorded.`,
      linkHref: '/app#support-tickets',
      entityType: NotificationEntityType.SUPPORT_TICKET,
      readAt: null,
      createdAt: addDays(now, -2),
    },
    {
      userId: ids.senderId,
      type: NotificationType.INFO,
      title: demoTitle('Order accepted'),
      body: `${DEMO_SEED_MARKER} Demo in-app notice: a demo delivery order was accepted.`,
      linkHref: '/app',
      entityType: NotificationEntityType.DELIVERY_ORDER,
      readAt,
      createdAt: addDays(now, -5),
    },
    {
      userId: ids.senderId,
      type: NotificationType.WARNING,
      title: demoTitle('Payment under review'),
      body: `${DEMO_SEED_MARKER} Demo in-app notice: mock payment flagged for manual review (not real money).`,
      linkHref: '/app',
      entityType: NotificationEntityType.PAYMENT,
      readAt: null,
      createdAt: addDays(now, -3),
    },
    {
      userId: ids.waylerId,
      type: NotificationType.ACTION_REQUIRED,
      title: demoTitle('New availability request'),
      body: `${DEMO_SEED_MARKER} Demo in-app notice: a sender submitted a demo availability request.`,
      linkHref: '/app',
      entityType: NotificationEntityType.WAYLER_AVAILABILITY_REQUEST,
      readAt: null,
      createdAt: addDays(now, -4),
    },
    {
      userId: ids.waylerId,
      type: NotificationType.SUCCESS,
      title: demoTitle('Delivery proof submitted'),
      body: `${DEMO_SEED_MARKER} Demo in-app notice: delivery proof was submitted on a demo order.`,
      linkHref: '/app',
      entityType: NotificationEntityType.DELIVERY_ORDER,
      readAt,
      createdAt: addDays(now, -6),
    },
    {
      userId: ids.adminId,
      type: NotificationType.INFO,
      title: demoTitle('System notice'),
      body: `${DEMO_SEED_MARKER} Demo in-app notice: admin operations dashboard activity (demo only).`,
      linkHref: '/app/admin',
      entityType: NotificationEntityType.SYSTEM,
      readAt: null,
      createdAt: addDays(now, -1),
    },
    {
      userId: ids.adminId,
      type: NotificationType.SUCCESS,
      title: demoTitle('Support ticket updated'),
      body: `${DEMO_SEED_MARKER} Demo in-app notice: a demo support ticket status was updated.`,
      linkHref: '/app/admin',
      entityType: NotificationEntityType.SUPPORT_TICKET,
      readAt,
      createdAt: addDays(now, -7),
    },
  ];

  const result = await prisma.notification.createMany({ data: specs });
  return result.count;
}

async function main(): Promise<void> {
  assertSafeToRun();

  const adminEmail = (process.env.DEMO_ADMIN_EMAIL?.trim() || DEFAULT_ADMIN_EMAIL).toLowerCase();
  const adminPassword = requireEnv('DEMO_ADMIN_PASSWORD');
  const userPassword = process.env.DEMO_USER_PASSWORD?.trim() || adminPassword;

  if (!process.env.DEMO_USER_PASSWORD?.trim()) {
    console.warn(
      '[seed-demo] DEMO_USER_PASSWORD not set — using DEMO_ADMIN_PASSWORD for demo sender/wayler.',
    );
  }

  const [adminHash, userHash] = await Promise.all([
    argon2.hash(adminPassword),
    argon2.hash(userPassword),
  ]);

  const now = new Date();

  const adminId = await upsertDemoUser({
    email: adminEmail,
    displayName: 'Demo Admin',
    passwordHash: adminHash,
    roles: [UserRole.ADMIN],
  });

  const senderId = await upsertDemoUser({
    email: DEMO_SENDER_EMAIL,
    displayName: 'Demo Sender',
    passwordHash: userHash,
    roles: [UserRole.USER],
  });

  const waylerId = await upsertDemoUser({
    email: DEMO_WAYLER_EMAIL,
    displayName: 'Demo Wayler',
    passwordHash: userHash,
    roles: [UserRole.USER],
  });

  const ids: DemoUserIds = { adminId, senderId, waylerId };

  await cleanupDemoData(ids);

  const availabilityIds = await seedAvailabilities(waylerId, now);
  const requestResult = await seedAvailabilityRequests(ids, availabilityIds, now);
  const ordersFromSender = await seedSenderOrders(ids, now);
  const chatResult = await seedChats(ids);
  const accessPasses = await seedWaylerAccess(waylerId, now);
  const ticketResult = await seedSupportTickets(ids, now);
  const paymentIntents = await seedMockPaymentIntents(ids, now);
  const notifications = await seedDemoNotifications(ids, now);

  const counts: SeedCounts = {
    users: 3,
    availabilities: availabilityIds.size,
    requests: requestResult.requests,
    orders: requestResult.orders + ordersFromSender,
    conversations: chatResult.conversations,
    messages: chatResult.messages,
    accessPasses,
    supportTickets: ticketResult.tickets,
    paymentIntents,
    notifications,
  };

  console.log('');
  console.log('[seed-demo] ===== Demo seed complete (local/dev only) =====');
  console.log(`[seed-demo] Admin email:  ${adminEmail}`);
  console.log(`[seed-demo] Sender email: ${DEMO_SENDER_EMAIL}`);
  console.log(`[seed-demo] Wayler email: ${DEMO_WAYLER_EMAIL}`);
  console.log(
    '[seed-demo] Passwords: set via DEMO_ADMIN_PASSWORD / DEMO_USER_PASSWORD env (not printed).',
  );
  console.log('');
  console.log('[seed-demo] Counts:');
  console.log(`  users:            ${counts.users}`);
  console.log(`  availabilities:   ${counts.availabilities}`);
  console.log(`  requests:         ${counts.requests}`);
  console.log(`  orders:           ${counts.orders}`);
  console.log(`  conversations:    ${counts.conversations}`);
  console.log(`  chat messages:    ${counts.messages}`);
  console.log(`  access passes:    ${counts.accessPasses}`);
  console.log(`  support tickets:  ${counts.supportTickets}`);
  console.log(`  payment intents:  ${counts.paymentIntents}`);
  console.log(`  notifications:    ${counts.notifications}`);
  if (ticketResult.linkedOrderId) {
    console.log(`  linked ticket order: ${ticketResult.linkedOrderId}`);
  }
  console.log('');
  console.warn(
    '[seed-demo] WARNING: Demo/mock data only — not real payments, escrow, or emergency support.',
  );
}

main()
  .catch((error) => {
    console.error('[seed-demo] Failed:', error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
