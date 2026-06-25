# Admin Operations Center — foundation and controlled mutations v1

This document records the **current** Admin / Arbitrator Operations Center on Wayly: read-only monitoring panels, the first **controlled admin mutation workflows** (KYC approve/reject and dispute resolution v1), access enforcement, safety boundaries, and what remains **future work**.

**Last updated:** payment admin review v1 (metadata-only) + audit log extensions.

---

## Summary

| Item                                                   | Status                                      |
| ------------------------------------------------------ | ------------------------------------------- |
| Operations dashboard on `/app`                         | ✅ Role-gated (`ADMIN` / `ARBITRATOR` only) |
| Disputes queue                                         | ✅ List + **manual resolve v1**             |
| KYC review queue                                       | ✅ List + **approve/reject v1**             |
| Orders monitoring                                      | ✅ **Read-only**                            |
| Users & Trust/Safety                                   | ✅ List + **suspend/unsuspend v1 (ADMIN)**  |
| Payments & Escrow                                      | ✅ List + **review decisions v1 (ADMIN)**   |
| System Health & Audit                                  | ✅ **Read-only** snapshot                   |
| Real Stripe / Sumsub admin integrations                | ❌ Not implemented                          |
| Persistent audit log schema                            | ✅ **Implemented v1** (append-only)         |
| Payment refund / release / capture / payout from admin | ❌ Not implemented (real money)             |
| User ban / delete from admin                           | ❌ Not implemented                          |

The Operations Center is **no longer fully read-only**: KYC, Disputes, Users (ADMIN-only), and Payments review (ADMIN-only) panels include **controlled mutations**. Orders and System Health remain list/monitor/snapshot only.

Normal **`USER`** accounts do **not** see the Operations Center in the web app and receive **403 Forbidden** on admin API routes.

---

## Access control

### Web UI

- **Location:** `/app` — `AdminOperationsDashboard` renders only when `hasOperationsDashboardAccess(roles)` is true.
- **Allowed roles:** `ADMIN`, `ARBITRATOR`.
- **Normal users:** dashboard and all admin queue panels return `null` (not rendered).
- **Double-check:** each panel independently verifies role access before fetching or showing mutation controls.

**Frontend helper:** `apps/web/src/lib/auth/operations-dashboard-access.ts`

### API

All admin operations routes use:

- `JwtAuthGuard` — valid Bearer access token required.
- `@Roles(UserRole.ADMIN, UserRole.ARBITRATOR)` — enforced globally via `RolesGuard`.
- **Normal `USER`:** **403 Forbidden** (not authorized).

Admin routes do **not** use `VerificationGuard` KYC marketplace rules — staff access is role-based only.

---

## Admin panels overview

Shared UX primitives: `apps/web/src/components/app/panel-status-states.tsx`

| Panel                 | Frontend component               | Read-only    | Mutations v1                 |
| --------------------- | -------------------------------- | ------------ | ---------------------------- |
| Disputes queue        | `admin-disputes-queue-panel.tsx` | List/refresh | **Resolve dispute**          |
| KYC review queue      | `admin-kyc-queue-panel.tsx`      | List/refresh | **Approve / Reject**         |
| Orders monitoring     | `admin-orders-queue-panel.tsx`   | ✅           | —                            |
| Users & Trust/Safety  | `admin-users-queue-panel.tsx`    | ✅           | —                            |
| Payments & Escrow     | `admin-payments-queue-panel.tsx` | ✅           | **Review decisions (ADMIN)** |
| System Health & Audit | `admin-system-health-panel.tsx`  | ✅           | —                            |

**Dashboard shell:** `apps/web/src/components/app/admin-operations-dashboard.tsx`

---

## Implemented mutation workflows (v1)

### 1. KYC approve/reject workflow v1

|              |                                                                                                    |
| ------------ | -------------------------------------------------------------------------------------------------- |
| **Access**   | `ADMIN` / `ARBITRATOR` only — normal `USER` → **403**                                              |
| **Backend**  | `apps/api/src/modules/kyc/admin-kyc.controller.ts`                                                 |
| **Service**  | `kyc.service.ts` — `approveForOperations` / `rejectForOperations`                                  |
| **Frontend** | `admin-kyc-queue-panel.tsx`                                                                        |
| **SDK**      | `api.admin.approveKycVerification(id)`, `api.admin.rejectKycVerification(id, { rejectionReason })` |

**Endpoints:**

| Method | Route                                         | Body                                                | Result                      |
| ------ | --------------------------------------------- | --------------------------------------------------- | --------------------------- |
| `POST` | `/api/v1/admin/kyc-verifications/:id/approve` | —                                                   | Updated `AdminKycQueueItem` |
| `POST` | `/api/v1/admin/kyc-verifications/:id/reject`  | `{ rejectionReason: string }` (required, non-empty) | Updated `AdminKycQueueItem` |

**Behavior:**

- **Approve:** sets KYC verification and linked user KYC status to **APPROVED**; approved records hide action buttons in the UI.
- **Reject:** requires `rejectionReason`; sets verification and user KYC status to **REJECTED**; rejection reason shown on the card.
- **Re-review:** `PENDING` and previously **REJECTED** records can be approved or rejected again from the queue.
- **Manual/mock review only** — uses existing schema fields; **no Sumsub**, **Stripe Identity**, **Persona**, or other real KYC provider integration; **no webhooks**.
- **No schema migration** was added for this workflow.

**Not implemented:** provider sync, document review UI, webhook callbacks, automated fraud scoring, audit log persistence.

---

### 2. Dispute resolution workflow v1

|              |                                                                   |
| ------------ | ----------------------------------------------------------------- |
| **Access**   | `ADMIN` / `ARBITRATOR` only — normal `USER` → **403**             |
| **Backend**  | `apps/api/src/modules/disputes/admin-disputes.controller.ts`      |
| **Service**  | `disputes.service.ts` — `resolveForOperations`                    |
| **Frontend** | `admin-disputes-queue-panel.tsx`                                  |
| **SDK**      | `api.admin.resolveAdminDispute(id, { resolutionNote, outcome? })` |

**Endpoints:**

| Method | Route                                | Body                                         | Result                          |
| ------ | ------------------------------------ | -------------------------------------------- | ------------------------------- |
| `GET`  | `/api/v1/admin/disputes`             | query: page, limit, status?                  | `AdminDisputeListResponse`      |
| `POST` | `/api/v1/admin/disputes/:id/resolve` | `{ resolutionNote: string, outcome?: enum }` | Updated `AdminDisputeQueueItem` |

**Resolve rules:**

- Dispute must exist.
- Only **`OPEN`** or **`UNDER_REVIEW`** disputes can be resolved.
- **`resolutionNote`** required (trimmed, 1–2000 characters).
- Sets `status` → **`RESOLVED`**, `resolutionNote`, `resolvedAt`, and optional `resolution` on existing schema fields.
- Already **`RESOLVED`** or non-resolvable status → **400**.
- Returns updated queue item (includes resolution metadata for read-only display).

**Optional admin outcome** (request body enum — maps to existing `DisputeResolution` **metadata only**, no payment execution):

| Admin outcome           | Stored `DisputeResolution` |
| ----------------------- | -------------------------- |
| `SENDER_FAVORED`        | `REFUND_SENDER`            |
| `WAYLER_FAVORED`        | `RELEASE_TO_WAYLER`        |
| `NO_FAULT` (or omitted) | `NO_ACTION`                |
| `INFORMATION_ONLY`      | `OTHER`                    |

**Explicitly not performed by this workflow:**

- No refund, escrow release, capture, void, transfer, or payout
- No order cancellation or reassignment
- No user ban, suspend, or punishment
- No payment provider calls
- No notification side effects (parties see updated status when they refresh user-facing dispute views)

**Not implemented:** assign arbitrator, bulk actions, dispute payment execution, resolution notifications, file evidence review from admin UI.

---

## Read-only admin panels

Each read-only panel follows: **loading**, **error + retry**, **empty state** (where applicable), **read-only list/cards**, and **Refresh** (reload data only).

### Disputes queue (list + resolve)

**List endpoint:** `GET /api/v1/admin/disputes`

**Data shown:** dispute status, reason, opened date, order reference, route, parties, and (when resolved) resolution outcome label, resolution note, resolved timestamp.

### KYC review queue (list + approve/reject)

**List endpoint:** `GET /api/v1/admin/kyc-verifications`

**Data shown:** user display/email, KYC status, country, submitted/updated timestamps, rejection reason when present.

### Orders monitoring queue

|              |                                                          |
| ------------ | -------------------------------------------------------- |
| **Endpoint** | `GET /api/v1/admin/orders`                               |
| **Backend**  | `apps/api/src/modules/orders/admin-orders.controller.ts` |

**Read-only data:** order status, route, reward, Sender/Wayler, source type, payment/dispute/proof summaries, timestamps.

**Not implemented:** cancel, refund, release escrow, assign Wayler, or any order mutation.

### Users & Trust/Safety queue

|               |                                                             |
| ------------- | ----------------------------------------------------------- |
| **List**      | `GET /api/v1/admin/users` — `ADMIN` / `ARBITRATOR`          |
| **Suspend**   | `POST /api/v1/admin/users/:id/suspend` — **`ADMIN` only**   |
| **Unsuspend** | `POST /api/v1/admin/users/:id/unsuspend` — **`ADMIN` only** |
| **Backend**   | `apps/api/src/modules/users/admin-users.controller.ts`      |

**List data:** display/email, roles, KYC status, account status, safe activity counts, timestamps.

**Suspend v1:** sets `accountStatus=SUSPENDED`, `suspendedAt`, `suspensionReason`. Requires reason. Cannot suspend self, `ADMIN`, or `ARBITRATOR`. No role/KYC/order/payment/dispute side effects.

**Unsuspend v1:** clears suspension fields. Optional note for audit only (not stored on user row).

**ARBITRATOR** can list users but gets **403** on suspend/unsuspend.

**Not implemented:** ban, delete, promote, demote, timed auto-expiry.

### Payments & Escrow queue

|                            |                                                              |
| -------------------------- | ------------------------------------------------------------ |
| **List**                   | `GET /api/v1/admin/payments`                                 |
| **Mutations (ADMIN only)** | See Payment Review v1 below                                  |
| **Backend**                | `apps/api/src/modules/payments/admin-payments.controller.ts` |

**List data:** intent status, amount/currency, platform fee, escrow timestamps, order/parties, latest dispute status, admin review metadata.

**Explicitly excluded:** card numbers, payment method details, provider secrets, Stripe keys, tokens.

**Not implemented (real money):** refund, release, capture, void, transfer, payout.

### 4. Payment review workflow v1 (metadata-only)

|              |                                                                                                                                   |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| **Access**   | **List:** `ADMIN` / `ARBITRATOR`. **Mutations:** `ADMIN` only — `ARBITRATOR` → **403**                                            |
| **Backend**  | `admin-payments.controller.ts` — `mark-manual-review`, `clear-manual-review`, `record-refund-decision`, `record-release-decision` |
| **Service**  | `payments.service.ts` — `*ForOperations` methods update `adminReview*` fields only                                                |
| **Frontend** | `admin-payments-queue-panel.tsx` — ADMIN-only inline forms; copy says **“Decision only — does not move money”**                   |

**Endpoints:**

- `POST /api/v1/admin/payments/:id/mark-manual-review` — requires note; sets `adminReviewStatus=MANUAL_REVIEW`
- `POST /api/v1/admin/payments/:id/clear-manual-review` — only when status is `MANUAL_REVIEW`; resets review fields
- `POST /api/v1/admin/payments/:id/record-refund-decision` — decision enum + note; sets `REFUND_DECISION_RECORDED`
- `POST /api/v1/admin/payments/:id/record-release-decision` — decision enum + note; sets `RELEASE_DECISION_RECORDED`

**Does NOT change:** `PaymentStatus`, `Payout`, `LedgerEntry`, order status, dispute status, user accounts.

**Audit (best-effort):** `PAYMENT_MANUAL_REVIEW_MARKED`, `PAYMENT_MANUAL_REVIEW_CLEARED`, `PAYMENT_REFUND_DECISION_RECORDED`, `PAYMENT_RELEASE_DECISION_RECORDED` — target type `PAYMENT_INTENT`.

**Not implemented:** real Stripe/refund/release/capture/payout, webhooks, idempotency, dispute→payment orchestration.

### System Health & Audit panel

|              |                                                                 |
| ------------ | --------------------------------------------------------------- |
| **Endpoint** | `GET /api/v1/admin/system-health`                               |
| **Backend**  | `apps/api/src/modules/health/admin-system-health.controller.ts` |

**Read-only snapshot:** overall/API/DB status, last checked, safe `NODE_ENV` label, operational counts, recent activity timestamps.

**Explicitly excluded:** secrets, connection strings, provider keys, stack traces in normal responses.

**Not implemented:** restart, repair, log download.

**Admin audit log (v1):** read-only **Recent admin actions** subsection loads `GET /api/v1/admin/audit-logs` (latest 20 entries). Append-only — no delete/export.

Public probes (`GET /api/v1/health/live`, `GET /api/v1/health/ready`) remain separate unauthenticated infrastructure endpoints.

---

## Admin audit log foundation v1

|                   |                                                             |
| ----------------- | ----------------------------------------------------------- |
| **Access**        | `ADMIN` / `ARBITRATOR` only — normal `USER` → **403**       |
| **Backend**       | `apps/api/src/modules/admin-audit/`                         |
| **List endpoint** | `GET /api/v1/admin/audit-logs`                              |
| **UI**            | **Recent admin actions** in `admin-system-health-panel.tsx` |

**Logged actions (v1):**

| Action                              | Trigger                                                     |
| ----------------------------------- | ----------------------------------------------------------- |
| `KYC_APPROVED`                      | `POST /admin/kyc-verifications/:id/approve` succeeds        |
| `KYC_REJECTED`                      | `POST /admin/kyc-verifications/:id/reject` succeeds         |
| `DISPUTE_RESOLVED`                  | `POST /admin/disputes/:id/resolve` succeeds                 |
| `USER_SUSPENDED`                    | `POST /admin/users/:id/suspend` succeeds                    |
| `USER_UNSUSPENDED`                  | `POST /admin/users/:id/unsuspend` succeeds                  |
| `PAYMENT_MANUAL_REVIEW_MARKED`      | `POST /admin/payments/:id/mark-manual-review` succeeds      |
| `PAYMENT_MANUAL_REVIEW_CLEARED`     | `POST /admin/payments/:id/clear-manual-review` succeeds     |
| `PAYMENT_REFUND_DECISION_RECORDED`  | `POST /admin/payments/:id/record-refund-decision` succeeds  |
| `PAYMENT_RELEASE_DECISION_RECORDED` | `POST /admin/payments/:id/record-release-decision` succeeds |

**Write behavior:** **best-effort after successful mutation** — audit insert failure is logged to Pino but does **not** fail the admin action in v1.

**Append-only:** no update/delete/export/download API.

**Stored safely:** actor snapshots (id, email, display, roles), action, target type/id, optional target user id, short summary, allowlisted metadata, optional `requestId`. IP/userAgent may be persisted but are **not** returned in list API v1.

**Not stored:** tokens, secrets, payment card data, KYC provider payloads, raw request bodies, full chat/evidence content.

**Prisma:** `AdminAuditLog` model — migrations `admin_audit_log_foundation`, `user_moderation_suspend_foundation`, `payment_admin_review_foundation`.

---

## Suspended account gating (v1)

- **Login / refresh / logout / `GET /users/me`:** allowed — suspended users see account status and a banner on `/app`.
- **Marketplace mutations blocked** via `@RequiresActiveAccount()` + `AccountModerationGuard` (`403`, code `ACCOUNT_SUSPENDED`): new orders, accept, publish/cancel orders, availability listings/requests, payments, dispute open/messages/evidence, chat send, profile PATCH, etc.
- **In-progress deliveries:** `start-transit`, `mark-delivered`, and proof submit remain allowed so accepted orders are not stranded (ownership checks unchanged).
- **No silent lockout:** users are not logged out automatically.

---

## Security and safety notes

1. **Role enforcement:** normal `USER` → **403** on all `/api/v1/admin/*` routes (including mutation endpoints).
2. **UI defense in depth:** Operations Center and each panel re-check roles client-side before rendering, fetching, or showing mutation controls.
3. **Controlled mutations only:** KYC approve/reject, dispute resolve, user suspend/unsuspend, and payment review decisions update **existing schema fields only** — they do **not** trigger real payment movement, order cancellation, or dispute auto-close side effects.
4. **Most panels remain read-only for ARBITRATOR mutations:** Orders and System Health are list/monitor/snapshot only. Users and Payments lists are readable by `ARBITRATOR`; suspend/unsuspend and payment review mutations are **ADMIN-only**.
5. **Dangerous actions not implemented:** payment refund/release/capture/payout, user ban/delete, order cancellation/reassignment, role promote/demote.
6. **Audit log v1:** append-only operator trail for KYC, dispute resolve, and user suspend/unsuspend; best-effort writes; no secrets in stored metadata or list responses.
7. **No secrets in admin responses:** admin list/snapshot endpoints return operational metadata only — never connection strings, provider credentials, or payment instrument details.
8. **Mock providers unchanged:** mock KYC (user-facing dev routes), mock payments, and mock Wayler daily access remain separate user-facing flows. Admin KYC review is **manual operator decision** on existing records — not a live Sumsub/Stripe Identity integration.
9. **Not production/commercial-ready** for real money movement, real KYC compliance, or automated dispute settlement — suitable for **local/staging operator workflow testing** only.

---

## SDK and types

Admin client surface: `packages/sdk/src/admin.ts` → `api.admin.*`

| Method                                   | Route                                                      |
| ---------------------------------------- | ---------------------------------------------------------- |
| `listDisputes(query?)`                   | `GET /admin/disputes`                                      |
| `resolveAdminDispute(id, body)`          | `POST /admin/disputes/:id/resolve`                         |
| `listKycVerifications(query?)`           | `GET /admin/kyc-verifications`                             |
| `approveKycVerification(id)`             | `POST /admin/kyc-verifications/:id/approve`                |
| `rejectKycVerification(id, body)`        | `POST /admin/kyc-verifications/:id/reject`                 |
| `listOrders(query?)`                     | `GET /admin/orders`                                        |
| `listUsers(query?)`                      | `GET /admin/users`                                         |
| `suspendAdminUser(id, body)`             | `POST /admin/users/:id/suspend` (ADMIN)                    |
| `unsuspendAdminUser(id, body?)`          | `POST /admin/users/:id/unsuspend` (ADMIN)                  |
| `listPayments(query?)`                   | `GET /admin/payments`                                      |
| `markPaymentManualReview(id, body)`      | `POST /admin/payments/:id/mark-manual-review` (ADMIN)      |
| `clearPaymentManualReview(id, body?)`    | `POST /admin/payments/:id/clear-manual-review` (ADMIN)     |
| `recordPaymentRefundDecision(id, body)`  | `POST /admin/payments/:id/record-refund-decision` (ADMIN)  |
| `recordPaymentReleaseDecision(id, body)` | `POST /admin/payments/:id/record-release-decision` (ADMIN) |
| `getSystemHealth()`                      | `GET /admin/system-health`                                 |
| `listAuditLogs(query?)`                  | `GET /admin/audit-logs`                                    |

Types: `@wayly/types` — admin queue/snapshot interfaces plus `AdminAuditLogItem`, `AdminAuditLogListResponse`.

Validation: `@wayly/validation` — `adminDisputeResolveSchema`, `adminAuditLogsListQuerySchema`, KYC reject body schema, list query schemas.

---

## Roadmap

### Implemented v1

| Capability                         | Notes                                                            |
| ---------------------------------- | ---------------------------------------------------------------- |
| KYC approve/reject workflow        | Manual review; audit logged (`KYC_APPROVED` / `KYC_REJECTED`)    |
| Dispute resolution workflow        | Metadata-only resolve; audit logged (`DISPUTE_RESOLVED`)         |
| User suspend/unsuspend v1          | ADMIN-only; audit logged (`USER_SUSPENDED` / `USER_UNSUSPENDED`) |
| Payment review v1 (metadata-only)  | ADMIN-only; audit logged (`PAYMENT_*` actions); no real money    |
| Persistent audit log (append-only) | `AdminAuditLog` model + `GET /admin/audit-logs` + UI subsection  |

### Future work (not implemented)

| Future capability                     | Notes                                                                             |
| ------------------------------------- | --------------------------------------------------------------------------------- |
| Strict transactional audit / outbox   | Atomic audit + mutation for compliance-critical actions                           |
| Richer audit export / retention       | CSV download, retention policy, advanced filters in UI                            |
| Real KYC provider integration         | Sumsub / Stripe Identity / Persona; webhooks; document review                     |
| Dispute payment execution             | Refund/release/capture/payout tied to dispute outcomes                            |
| Payment admin mutations               | **Real** Stripe-backed refund / release / capture / payout from Operations Center |
| User ban / delete / timed suspension  | Hard ban, GDPR delete, auto-expiry cron                                           |
| Assign arbitrator                     | Set `assignedArbitratorId`; dedicated queue routing                               |
| Admin notification / realtime updates | WebSocket/SSE or push for operations queue changes                                |
| Full legal/compliance review          | Production operator policies beyond current dev scope                             |

User-facing marketplace flows (Sender/Wayler dashboards, KYC identity panel, KYC gate, daily access, disputes modal, payments, chat, notifications) are unchanged by admin mutation v1 except that dispute/KYC status naturally reflects backend updates after operator actions.

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

### Access

- [ ] Operations Center visible on `/app`
- [ ] Normal `USER` account does **not** see Operations Center
- [ ] Normal `USER` token → **403** on `GET /api/v1/admin/disputes` and mutation routes

### Read-only panels

- [ ] Orders, Users, Payments, System Health panels load (or show empty/error appropriately)
- [ ] Refresh/retry reloads data only — **no mutation buttons** on those panels

### KYC approve/reject v1

- [ ] KYC queue shows pending/rejected records with **Approve** / **Reject**
- [ ] Reject without reason blocked (client + API validation)
- [ ] Approve updates card to approved — action buttons hidden
- [ ] Reject stores and displays rejection reason
- [ ] Previously rejected record can be approved on re-review

### Dispute resolution v1

- [ ] Disputes queue shows open disputes with **Resolve dispute**
- [ ] Empty resolution note blocked before submit
- [ ] Resolve with note updates card to **RESOLVED** — action buttons hidden
- [ ] Resolution note and outcome label visible on resolved card
- [ ] No refund/release/payment/order/user action buttons anywhere

### Audit log v1

- [ ] **Recent admin actions** visible in System Health & Audit panel
- [ ] Approve KYC → new `KYC_APPROVED` row in audit list
- [ ] Reject KYC → new `KYC_REJECTED` row
- [ ] Resolve dispute → new `DISPUTE_RESOLVED` row
- [ ] Normal `USER` → **403** on `GET /api/v1/admin/audit-logs`
- [ ] Audit list response does not include IP/userAgent

### Swagger

- [ ] Swagger tag **admin** lists read + mutation routes at `http://localhost:4000/docs`

Use a normal Sender/Wayler account to confirm user-facing flows still work: dashboards, KYC panel, KYC gate, daily access, disputes, payments, chat, notifications.

---

## Related README sections

- [Dispute and arbitration foundation](../README.md#dispute-and-arbitration-foundation) — user-facing dispute flow
- [Payment and escrow foundation](../README.md#payment-and-escrow-foundation) — mock payment flow
- [M2 KYC mock testing](../README.md#m2-kyc-mock-testing) — KYC user flow
- [Admin Operations Center](../README.md#admin-operations-center) — README summary
- [Common scripts](../README.md#common-scripts) — build/lint/typecheck
