# Support, notifications & demo seed checkpoint

**Last updated:** June 2026  
**Scope:** User support tickets, admin support queue, in-app notification foundation, and local demo seed script. **Local/dev and staging demos** — not emergency support, not real-time alerting, not production payment operations.

This checkpoint records foundations added in recent commits (`feat(api): add support ticket foundation`, `chore(api): add demo data seed`, `feat(api): add notifications foundation`) so demos, investor walkthroughs, and future development stay understandable.

---

## 1. Overview

Wayly now includes four related foundations:

| Foundation                     | Purpose                                                                                                                                    |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **User support tickets**       | Authenticated users can submit and list platform support requests from `/app`                                                              |
| **Admin support ticket queue** | `ADMIN` operators list, filter, and update tickets from the Operations Center                                                              |
| **In-app notifications**       | Activity updates surfaced in `/app` (notification center + bell) — no email/SMS/push; live review API also notifies reviewee on new review |
| **Demo seed script**           | Idempotent local/dev data for admin, sender, wayler accounts and sample marketplace activity                                               |

**Explicitly not included:** email, SMS, push/web push, third-party notification providers, emergency response, guaranteed real-time delivery, or automatic changes to payment/order/dispute/KYC state from support tickets.

---

## 2. Support Ticket Foundation

### User flow (`/app`)

- **Component:** `support-ticket-panel.tsx` — collapsible panel below `NotificationsCenter` and `LaunchStatusNoticeCard`
- **Create:** `POST /api/v1/support-tickets` (JWT + email verification required)
- **List own:** `GET /api/v1/support-tickets/me`
- **SDK:** `api.supportTickets.create(...)`, `api.supportTickets.listMine()`

### Admin flow (Operations Center)

- **Component:** `admin-support-tickets-queue-panel.tsx` inside `AdminOperationsDashboard`
- **List/filter:** `GET /api/v1/admin/support-tickets` — `ADMIN` only  
  Filters: `status`, `category`, `priority`, `userId`, `orderId`, pagination
- **Update:** `PATCH /api/v1/admin/support-tickets/:id` — `ADMIN` only
- **SDK:** `api.admin.supportTickets.list(...)`, `api.admin.supportTickets.update(...)`

### Categories

`GENERAL`, `ACCOUNT`, `SAFETY`, `PAYMENT_STATUS`, `ORDER_ISSUE`, `BUG_REPORT`, `OTHER`

### Statuses

`OPEN`, `UNDER_REVIEW`, `WAITING_FOR_USER`, `RESOLVED`, `CLOSED`

### Priorities

`LOW`, `NORMAL`, `HIGH`, `URGENT` (default `NORMAL` on create)

### User fields vs admin-only fields

| Field                                     | User (create) | User (read)           | Admin (update)             |
| ----------------------------------------- | ------------- | --------------------- | -------------------------- |
| `subject`                                 | ✅ required   | ✅                    | —                          |
| `message`                                 | ✅ required   | ✅                    | —                          |
| `category`                                | ✅ required   | ✅                    | —                          |
| `orderId`                                 | optional link | ✅                    | filter only                |
| `status`                                  | —             | ✅                    | ✅                         |
| `priority`                                | —             | ✅                    | ✅                         |
| `adminNote`                               | —             | ✅ (visible to owner) | ✅                         |
| `lastAdminActionAt` / `lastAdminActionBy` | —             | ✅                    | set on admin update        |
| `closedAt`                                | —             | ✅                    | set when status → `CLOSED` |

### Honesty limits (repeat for demos)

1. **Not emergency support** — tickets are for platform review; no SLA or 24/7 response guarantee.
2. **No guaranteed refund, payout, insurance, legal outcome, or escrow resolution** from submitting a ticket.
3. **Support tickets do not automatically change** payment status, order lifecycle, dispute state, or KYC status.
4. Admin updates are **metadata and communication** — operators still use separate admin tools for payment/dispute/KYC mutations.

See also: [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md), [admin-operations-checkpoint.md](./admin-operations-checkpoint.md)

---

## 3. Notification Foundation

### User UI (`/app`)

| Surface                 | Component                  | Behavior                                                                        |
| ----------------------- | -------------------------- | ------------------------------------------------------------------------------- |
| **Notification center** | `notifications-center.tsx` | Collapsible card near top of `/app`; manual **Refresh** only (no polling in v1) |
| **Notification bell**   | `notification-bell.tsx`    | Header bell + dropdown; existing light polling for badge/list                   |

Both surfaces: unread count, mark one read, mark all read, empty/loading/error states, honest notice copy (in-app only; not email/SMS/push/emergency/real-time).

### API endpoints (own notifications only)

| Method  | Path                                    | Description                                                                    |
| ------- | --------------------------------------- | ------------------------------------------------------------------------------ |
| `GET`   | `/api/v1/notifications/me`              | List own notifications (`unreadOnly`, `limit` default 20 max 50; newest first) |
| `GET`   | `/api/v1/notifications/me/unread-count` | `{ unreadCount: number }`                                                      |
| `PATCH` | `/api/v1/notifications/:id/read`        | Mark one own notification read                                                 |
| `PATCH` | `/api/v1/notifications/read-all`        | Mark all own notifications read                                                |

Ownership enforced in service layer — users cannot read or modify another user's notifications.

### SDK

- `api.notifications.listMine(query?)`
- `api.notifications.unreadCount()`
- `api.notifications.markRead(id)`
- `api.notifications.markAllRead()`

### Notification types (severity)

`INFO`, `SUCCESS`, `WARNING`, `ACTION_REQUIRED`

### Entity-linked notifications

`NotificationEntityType`: `SUPPORT_TICKET`, `DELIVERY_ORDER`, `WAYLER_AVAILABILITY_REQUEST`, `PAYMENT`, `DISPUTE`, `SYSTEM`

Each notification may include `linkHref`, `entityType`, and `entityId` for in-app navigation (e.g. order focus from accepted deliveries panel).

### Hooks added (safe, additive only)

| Domain                    | Events that create in-app notifications                                                                               |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Support tickets**       | User creates ticket → owner; admin updates status/priority/note → ticket owner                                        |
| **Availability requests** | New request → wayler; accepted/declined → sender; cancelled → wayler                                                  |
| **Orders**                | Accepted, in transit, proof submitted, delivered → sender                                                             |
| **Disputes**              | Opened, new message, new evidence → counterparty                                                                      |
| **Payments**              | Authorized, escrow held, mock payout → payee; admin manual review / refund decision / release decision → related user |
| **Chat**                  | New message → recipient                                                                                               |
| **Wayler access**         | Pass approved/rejected → wayler                                                                                       |

**No lifecycle logic changed** — only `NotificationService.createForUser` calls after existing successful mutations.

### Skipped (document honestly)

| Item                               | Reason                                                       |
| ---------------------------------- | ------------------------------------------------------------ |
| Email / SMS / push / web push      | Out of scope for v1                                          |
| Guaranteed real-time delivery      | Center uses manual refresh; bell polling is best-effort only |
| Emergency alerts                   | Not an alerting system                                       |
| KYC approve/reject notifications   | No hook added yet                                            |
| Dispute admin final resolution     | `resolveForOperations` does not emit a notification yet      |
| Order publish/cancel notifications | Only post-acceptance lifecycle events hooked                 |

---

## 4. Demo Seed Script

### Script & command

- **Path:** `apps/api/scripts/seed-demo.ts`
- **Command:** `pnpm --dir apps/api seed:demo`

### Environment variables

| Variable              | Required | Purpose                                                                 |
| --------------------- | -------- | ----------------------------------------------------------------------- |
| `DATABASE_URL`        | ✅       | Target database                                                         |
| `DEMO_ADMIN_PASSWORD` | ✅       | Password for demo admin (and fallback for sender/wayler)                |
| `DEMO_ADMIN_EMAIL`    | optional | Default `admin@wayly.demo`                                              |
| `DEMO_USER_PASSWORD`  | optional | Sender/wayler password; falls back to `DEMO_ADMIN_PASSWORD`             |
| `ALLOW_DEMO_SEED`     | optional | Set `true` to allow hosted-looking `DATABASE_URL` (non-production only) |

### Demo accounts

| Role   | Email                                                   |
| ------ | ------------------------------------------------------- |
| Admin  | [admin@wayly.demo](mailto:admin@wayly.demo)             |
| Sender | [demo.sender@wayly.demo](mailto:demo.sender@wayly.demo) |
| Wayler | [demo.wayler@wayly.demo](mailto:demo.wayler@wayly.demo) |

Passwords come from env only — **never committed**.

### Seeded data (idempotent)

On each run, demo-marked rows (`[Demo]` title prefix / `Created by Wayly demo seed` marker) are deleted and recreated for demo users:

- Demo users (admin, sender, wayler)
- Wayler availability / trip listings
- Sender → Wayler availability requests
- Delivery orders across lifecycle: **draft**, **open**, **accepted**, **in transit**, **delivered**
- Conversations and chat messages (on demo orders)
- Wayler daily access pass
- Support tickets
- Mock payment intent metadata (including one manual-review example)
- **7 demo notifications** (mix of read/unread across demo users)
- **Up to 5 demo reviews** on DELIVERED orders only (bidirectional visible samples + one hidden moderation row) — see [trust-reviews-ratings-checkpoint.md](./trust-reviews-ratings-checkpoint.md)

### Safety guards

- Refuses `NODE_ENV=production`
- Blocks hosted-looking `DATABASE_URL` unless `ALLOW_DEMO_SEED=true`
- No hardcoded passwords
- Obvious demo titles and marker text
- **No real payments, escrow, or emergency support** — mock/metadata only

Legacy script `seed-demo-users.ts` (`pnpm db:seed-demo-users`) remains; prefer `seed:demo` for full demo data.

---

## 5. Migration notes

| Migration                                  | Purpose                                                                                                        |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `20260628160118_support_ticket_foundation` | `SupportTicket` model + category/status/priority enums                                                         |
| `20260628170000_notification_foundation`   | Replaces legacy notification enum/schema; adds entity linking, `linkHref`, `updatedAt`; drops `relatedOrderId` |

### Deploy / Render

- **Apply migrations before backend endpoints are usable:** run `pnpm --dir apps/api db:deploy` (or `prisma migrate deploy`) against the target database **before or as part of** backend deploy.
- If your Render start command already runs `prisma migrate deploy` before `node dist/main.js`, keep that pattern — no change required for these migrations alone.
- **Notification migration warning:** `20260628170000_notification_foundation` **truncates existing `notifications` rows** because enum values were replaced. Safe for dev; **confirm before production** if real notification history exists.

Local apply:

```bash
pnpm --dir apps/api db:migrate    # dev — interactive
pnpm --dir apps/api db:deploy     # staging/production — non-interactive
```

---

## 6. Manual verification checklist

- [ ] Support ticket create from `/app` (verified user)
- [ ] Support ticket list own (`GET /support-tickets/me`)
- [ ] Admin support queue list with filters
- [ ] Admin update ticket status/priority/note → owner receives in-app notification
- [ ] Notification center loads on `/app` with unread count
- [ ] Mark one read / mark all read works
- [ ] Notification bell badge and dropdown work
- [ ] Order/request/support flows emit expected notifications (check after action + refresh)
- [ ] `pnpm --dir apps/api seed:demo` runs twice with stable idempotent counts
- [ ] Demo admin/sender/wayler login locally with env passwords
- [ ] No payment/dispute/order/KYC **business logic** changed (notifications additive only)
- [ ] Health endpoints respond after deploy (`GET /api/v1/health` or project health route)

---

## Related docs

- [admin-operations-checkpoint.md](./admin-operations-checkpoint.md) — Operations Center queues and admin mutations
- [admin-operations-center.md](./admin-operations-center.md) — full admin reference
- [marketplace-product-checkpoint.md](./marketplace-product-checkpoint.md) — user-facing marketplace UX
- [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md) — honest payment/dispute language
- [public-guidance-and-safety-checkpoint.md](./public-guidance-and-safety-checkpoint.md) — help/policy pages and in-app safety copy
- [README.md](../README.md) — milestone history and local dev setup
