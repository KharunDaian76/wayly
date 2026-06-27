# Admin operations checkpoint — local stack ahead of `origin/main`

**Last updated:** June 2026  
**Scope:** Admin / Arbitrator Operations Center on `/app`. **Local development only** — not production-ready for real money or compliance operations.

**Full technical reference:** [admin-operations-center.md](./admin-operations-center.md)

---

## Summary

| Capability                                                    | Status                                              |
| ------------------------------------------------------------- | --------------------------------------------------- |
| Operations dashboard + overview KPIs                          | ✅                                                  |
| Triage shortcuts (KPI → filtered queue)                       | ✅                                                  |
| Queue filters (KYC, disputes, users, orders, payments, audit) | ✅                                                  |
| KYC approve/reject v1                                         | ✅ Manual/mock review on existing records           |
| Dispute resolve v1                                            | ✅ Metadata-only resolution                         |
| User suspend/unsuspend v1                                     | ✅ ADMIN only                                       |
| Payment review v1                                             | ✅ **Metadata records only — no money movement**    |
| Orders queue                                                  | ✅ Read-only monitoring + review metadata filters   |
| Audit log list + filters                                      | ✅ Append-only                                      |
| Active Wayler counts (marketplace)                            | ✅ Separate user-facing API — not an admin mutation |
| Real Stripe refund/payout/capture                             | ❌                                                  |
| Real Sumsub / KYC provider admin                              | ❌                                                  |

---

## Access

- **Roles:** `ADMIN`, `ARBITRATOR` see Operations Center on `/app`
- **Normal `USER`:** UI hidden; all `/api/v1/admin/*` routes return **403**
- **Frontend guard:** `hasOperationsDashboardAccess` + per-panel checks
- **Mutation split:** User suspend/unsuspend and payment review mutations are **ADMIN-only**; `ARBITRATOR` can list but gets 403 on those writes

---

## Dashboard & triage

### Operations overview

- **Component:** `AdminOperationsOverviewPanel` inside `admin-operations-dashboard.tsx`
- **KPIs:** pending KYC, open disputes, suspended users, payments in manual review, orders in manual/risk review, recent admin actions count (from system health snapshot)

### Triage shortcuts

- **Helper:** `apps/web/src/lib/admin/admin-triage.ts`
- **Behavior:** Clicking a KPI scrolls/highlights the target panel and applies preset filters:

| KPI             | Target panel   | Preset filter                     |
| --------------- | -------------- | --------------------------------- |
| Pending KYC     | KYC queue      | `status=PENDING`                  |
| Open disputes   | Disputes queue | `status=OPEN`                     |
| Suspended users | Users queue    | `accountStatus=SUSPENDED`         |
| Payments review | Payments queue | `adminReviewStatus=MANUAL_REVIEW` |
| Orders review   | Orders queue   | `adminReviewStatus=MANUAL_REVIEW` |
| Risk orders     | Orders queue   | `adminReviewStatus=RISK_FLAGGED`  |
| Recent actions  | System Health  | Audit subsection focus            |

Banner text confirms which triage view is active.

---

## Queue panels & filters

| Panel         | Component                         | List API                       | Filters (v1)                                                              |
| ------------- | --------------------------------- | ------------------------------ | ------------------------------------------------------------------------- |
| Disputes      | `admin-disputes-queue-panel.tsx`  | `GET /admin/disputes`          | status, orderId, openedById                                               |
| KYC           | `admin-kyc-queue-panel.tsx`       | `GET /admin/kyc-verifications` | status, userId, country                                                   |
| Users         | `admin-users-queue-panel.tsx`     | `GET /admin/users`             | role, kycStatus, accountStatus, search                                    |
| Orders        | `admin-orders-queue-panel.tsx`    | `GET /admin/orders`            | adminReviewStatus (+ pagination)                                          |
| Payments      | `admin-payments-queue-panel.tsx`  | `GET /admin/payments`          | adminReviewStatus (+ pagination)                                          |
| System Health | `admin-system-health-panel.tsx`   | `GET /admin/system-health`     | —                                                                         |
| Audit log     | subsection in system health panel | `GET /admin/audit-logs`        | action, targetType, status, actorUserId, targetUserId, targetId, from, to |

All panels: loading / error+retry / empty / refresh patterns via `panel-status-states.tsx`.

---

## Mutation workflows (what operators can actually do)

### KYC approve/reject

- Approve or reject with reason on **existing verification records**
- **Not** a live Sumsub/Stripe Identity integration — manual operator decision only

### Dispute resolve

- Resolve `OPEN` / `UNDER_REVIEW` disputes with required `resolutionNote`
- Optional outcome enum stored as **metadata** (`DisputeResolution`) — **does not execute refund or payout**

### User suspend / unsuspend (ADMIN)

- Suspend with reason; unsuspend clears suspension fields
- Marketplace mutations blocked for suspended users; in-progress delivery progress actions still allowed

### Payment review (ADMIN) — metadata only

Endpoints under `/api/v1/admin/payments/:id/`:

- `mark-manual-review` / `clear-manual-review`
- `record-refund-decision` / `record-release-decision`

**Explicitly does NOT:**

- Change `PaymentStatus`, ledger, payouts, or provider state
- Move real money, issue Stripe refunds, or release escrow

UI copy: **“Decision only — does not move money”** (`PaymentTransparencyNote` variant `admin` on payments queue).

### Orders queue

- **Read-only** — status, route, parties, payment/dispute/proof summaries, admin review metadata
- **No** cancel, reassign, refund, or release from admin UI

---

## Audit log

- **Model:** `AdminAuditLog` (append-only)
- **Logged actions (v1):** KYC approve/reject, dispute resolve, user suspend/unsuspend, payment review decisions
- **Write behavior:** best-effort after successful mutation (failure logged, mutation still succeeds)
- **Filters:** action, target type, status, actor/target user ids, target id, date range
- **Not stored in API responses:** IP, user agent (may exist in DB but omitted from list v1)

---

## Active Wayler counts (marketplace API)

Relevant for **demo narrative**, not admin mutations:

- **Endpoint:** `GET /api/v1/marketplace/active-waylers`
- **Used by:** Sender browse `ActiveWaylersMarketplaceSection`
- **Purpose:** Show aggregate active listing counts by location — operational visibility for Senders

Admin system health may include operational counts in its snapshot; this is separate from payment/order review.

---

## Safety boundaries (repeat for operators & demos)

1. Payment and order **review decisions are metadata records only**.
2. **No real money movement** through Wayly admin tools today.
3. **No guaranteed refund or payout** execution from dispute or payment review outcomes.
4. KYC admin actions update **internal status fields** — not a certified KYC provider workflow.
5. Suitable for **local/staging operator workflow testing** — not commercial money movement or compliance sign-off.

See also: [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md)

---

## Verification (local)

```bash
pnpm dev          # http://localhost:3000/app with ADMIN/ARBITRATOR test user
pnpm build
pnpm lint
pnpm typecheck
```

Swagger admin tag: `http://localhost:4000/docs`

---

## Related docs

- [admin-operations-center.md](./admin-operations-center.md) — endpoints, SDK, security, manual checklist
- [marketplace-product-checkpoint.md](./marketplace-product-checkpoint.md)
- [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md)
