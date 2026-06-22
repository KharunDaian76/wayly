# Admin Operations Center — read-only foundation

This document records the **current** Admin / Arbitrator Operations Center on Wayly: what exists today, how access is enforced, and what is explicitly **not** implemented yet.

**Last updated:** local development checkpoint (read-only admin foundation complete).

---

## Summary

| Item                                    | Status                                        |
| --------------------------------------- | --------------------------------------------- |
| Operations dashboard on `/app`          | ✅ Role-gated (`ADMIN` / `ARBITRATOR` only)   |
| All admin panels                        | ✅ **Read-only** — list/monitor/snapshot only |
| Admin mutation actions                  | ❌ Not implemented                            |
| Real Stripe / Sumsub admin integrations | ❌ Not implemented                            |
| Persistent audit log schema             | ❌ Not implemented                            |

Normal **`USER`** accounts do **not** see the Operations Center in the web app and receive **403 Forbidden** on admin API routes.

---

## Access control

### Web UI

- **Location:** `/app` — `AdminOperationsDashboard` renders only when `hasOperationsDashboardAccess(roles)` is true.
- **Allowed roles:** `ADMIN`, `ARBITRATOR`.
- **Normal users:** dashboard and all admin queue panels return `null` (not rendered).
- **Double-check:** each panel (`AdminDisputesQueuePanel`, `AdminKycQueuePanel`, etc.) independently verifies role access before fetching.

**Frontend helper:** `apps/web/src/lib/auth/operations-dashboard-access.ts`

### API

All admin operations routes use:

- `JwtAuthGuard` — valid Bearer access token required.
- `@Roles(UserRole.ADMIN, UserRole.ARBITRATOR)` — enforced globally via `RolesGuard`.
- **Normal `USER`:** **403 Forbidden** (not authorized).

Admin routes do **not** use `VerificationGuard` KYC marketplace rules — staff access is role-based only.

---

## Read-only admin panels

Each panel follows the same UX pattern: **loading**, **error + retry**, **empty state** (where applicable), **read-only list/cards**, and **Refresh** (reload data only — not a backend action).

Shared UI primitives: `apps/web/src/components/app/panel-status-states.tsx`

| Panel                 | Frontend component               | SDK method                         |
| --------------------- | -------------------------------- | ---------------------------------- |
| Disputes queue        | `admin-disputes-queue-panel.tsx` | `api.admin.listDisputes()`         |
| KYC review queue      | `admin-kyc-queue-panel.tsx`      | `api.admin.listKycVerifications()` |
| Orders monitoring     | `admin-orders-queue-panel.tsx`   | `api.admin.listOrders()`           |
| Users & Trust/Safety  | `admin-users-queue-panel.tsx`    | `api.admin.listUsers()`            |
| Payments & Escrow     | `admin-payments-queue-panel.tsx` | `api.admin.listPayments()`         |
| System Health & Audit | `admin-system-health-panel.tsx`  | `api.admin.getSystemHealth()`      |

**Dashboard shell:** `apps/web/src/components/app/admin-operations-dashboard.tsx`

---

### 1. Disputes queue

|              |                                                              |
| ------------ | ------------------------------------------------------------ |
| **Endpoint** | `GET /api/v1/admin/disputes`                                 |
| **Access**   | `ADMIN` / `ARBITRATOR` only                                  |
| **Backend**  | `apps/api/src/modules/disputes/admin-disputes.controller.ts` |

**Read-only data shown:** dispute status, reason, opened date, order reference, route, parties (Sender/Wayler display).

**Not implemented:** resolve, refund, close, assign arbitrator, or any dispute mutation from admin UI/API.

---

### 2. KYC review queue

|              |                                                    |
| ------------ | -------------------------------------------------- |
| **Endpoint** | `GET /api/v1/admin/kyc-verifications`              |
| **Access**   | `ADMIN` / `ARBITRATOR` only                        |
| **Backend**  | `apps/api/src/modules/kyc/admin-kyc.controller.ts` |

**Read-only data shown:** user display/email, KYC status, country, submitted/updated timestamps, rejection reason when present.

**Not implemented:** approve, reject, or any KYC decision workflow from admin UI/API.

---

### 3. Orders monitoring queue

|              |                                                          |
| ------------ | -------------------------------------------------------- |
| **Endpoint** | `GET /api/v1/admin/orders`                               |
| **Access**   | `ADMIN` / `ARBITRATOR` only                              |
| **Backend**  | `apps/api/src/modules/orders/admin-orders.controller.ts` |

**Read-only data shown:** order status, route, reward, Sender/Wayler, source type, payment status summary, proof status summary, dispute status summary, created/updated dates.

**Not implemented:** cancel, refund, release escrow, assign Wayler, or any order mutation from admin UI/API.

---

### 4. Users & Trust/Safety queue

|              |                                                        |
| ------------ | ------------------------------------------------------ |
| **Endpoint** | `GET /api/v1/admin/users`                              |
| **Access**   | `ADMIN` / `ARBITRATOR` only                            |
| **Backend**  | `apps/api/src/modules/users/admin-users.controller.ts` |

**Read-only data shown:** user display/email, roles, KYC status, safe activity counts (posted orders, accepted deliveries, disputes opened), created/updated/latest activity timestamps.

**Not implemented:** ban, suspend, delete, promote, demote, or any user moderation action from admin UI/API.

---

### 5. Payments & Escrow queue

|              |                                                              |
| ------------ | ------------------------------------------------------------ |
| **Endpoint** | `GET /api/v1/admin/payments`                                 |
| **Access**   | `ADMIN` / `ARBITRATOR` only                                  |
| **Backend**  | `apps/api/src/modules/payments/admin-payments.controller.ts` |

**Read-only data shown:** payment intent status, amount/currency, platform fee, escrow timestamps, order title/reference, Sender/Wayler display, latest linked dispute status, created/updated dates.

**Explicitly excluded from responses:** card numbers, payment method details, provider secrets, Stripe client/secret keys, tokens, private financial identifiers.

**Not implemented:** refund, release, capture, void, transfer, payout, or any payment mutation from admin UI/API.

---

### 6. System Health & Audit panel

|              |                                                                 |
| ------------ | --------------------------------------------------------------- |
| **Endpoint** | `GET /api/v1/admin/system-health`                               |
| **Access**   | `ADMIN` / `ARBITRATOR` only                                     |
| **Backend**  | `apps/api/src/modules/health/admin-system-health.controller.ts` |

**Read-only snapshot includes:**

- Overall status (`healthy` / `degraded`)
- API status (`ok` / `degraded`)
- Database status (`ok` / `error`) — lightweight `SELECT 1` probe
- Last checked timestamp
- Safe environment label (`NODE_ENV` only)
- App version — `null` unless a safe env var is added later (none in schema today)
- Operational counts (when DB healthy): users, pending KYC, open orders, open disputes, payment intents by status
- Recent activity timestamps: latest user, order, dispute, payment created

**Explicitly excluded:** secrets, database URLs, Redis URLs, provider keys, tokens, payment secrets, stack traces in normal responses.

**Not implemented:** restart, repair, log download, persistent audit log storage, or any system mutation from admin UI/API.

Public probes (`GET /api/v1/health/live`, `GET /api/v1/health/ready`) remain separate unauthenticated infrastructure endpoints.

---

## Security and safety notes

1. **Role enforcement:** normal `USER` → **403** on all `/api/v1/admin/*` routes.
2. **UI defense in depth:** Operations Center and each panel re-check roles client-side before rendering or fetching.
3. **No secrets in admin responses:** admin list/snapshot endpoints return operational metadata only — never connection strings, provider credentials, or payment instrument details.
4. **Demo/staging safe:** because all admin tooling is **read-only**, it is suitable for investor demos and staging walkthroughs without risk of accidental refunds, KYC decisions, or user moderation.
5. **Mock providers unchanged:** mock KYC, mock payments, and mock Wayler daily access remain separate user-facing flows — admin panels **observe** state; they do not trigger provider actions.

---

## SDK and types

Admin client surface: `packages/sdk/src/admin.ts` → `api.admin.*`

Types: `@wayly/types` — admin list/snapshot interfaces per domain (`AdminDisputeListResponse`, `AdminKycListResponse`, `AdminOrderListResponse`, `AdminUserListResponse`, `AdminPaymentListResponse`, `AdminSystemHealthResponse`).

Validation query schemas (where applicable): `@wayly/validation` — e.g. `disputesListQuerySchema`, `adminOrdersListQuerySchema`, `adminPaymentsListQuerySchema`.

---

## Roadmap — future admin actions (not implemented)

The following are **planned future work**, not part of the current read-only foundation:

| Future capability                           | Notes                                                       |
| ------------------------------------------- | ----------------------------------------------------------- |
| KYC approve/reject workflow                 | With audit trail and optional provider webhook sync         |
| Dispute resolution workflow                 | Assign arbitrator, resolve/reject, resolution notifications |
| Payment refund / release / capture / payout | Stripe-backed; tied to dispute outcomes                     |
| User ban / suspend / escalation             | Trust & safety moderation with audit trail                  |
| Persistent audit logs                       | Immutable operator action history (schema + UI)             |
| Real provider integrations                  | Sumsub review UI hooks, Stripe dispute/payout admin views   |
| Admin notification / realtime events        | WebSocket/SSE or push for operations queue updates          |

User-facing marketplace flows (Sender/Wayler dashboards, KYC identity panel, KYC gate, daily access, disputes modal, payments, chat, notifications) remain unchanged by the admin read-only foundation.

---

## Verification commands

From the repo root:

```bash
pnpm build
pnpm lint
pnpm typecheck
pnpm dev    # manual testing on http://localhost:3000/app
```

---

## Manual testing checklist (admin operations)

Use an account with `ADMIN` or `ARBITRATOR` role (seed or dev assignment):

- [ ] Operations Center visible on `/app`
- [ ] All six panels load (or show empty/error states appropriately)
- [ ] Refresh/retry on each panel reloads data only — no mutation buttons
- [ ] Normal `USER` account does **not** see Operations Center
- [ ] Normal `USER` token → **403** on `GET /api/v1/admin/disputes` (and other admin routes)
- [ ] Swagger tag **admin** lists read-only routes at `http://localhost:4000/docs`

Use a normal Sender/Wayler account to confirm user-facing flows still work: dashboards, KYC panel, KYC gate, daily access, disputes, payments, chat, notifications.

---

## Related README sections

- [Dispute and arbitration foundation](../README.md#dispute-and-arbitration-foundation) — user-facing dispute flow
- [Payment and escrow foundation](../README.md#payment-and-escrow-foundation) — mock payment flow
- [M2 KYC mock testing](../README.md#m2-kyc-mock-testing) — KYC user flow
- [Common scripts](../README.md#common-scripts) — build/lint/typecheck
