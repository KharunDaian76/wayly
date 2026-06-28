# MVP completion checkpoint

**Last updated:** June 2026  
**Scope:** Wayly demo/MVP walkthrough stabilization — what works locally, what is mock/manual only, and what must not be claimed in production.

---

## 1. What MVP includes now

The MVP supports a full **demo walkthrough** for `@wayly.demo` accounts:

| Step | Capability                                                                                             |
| ---- | ------------------------------------------------------------------------------------------------------ |
| 1    | Premium marketing landing page with interactive globe (light/dark)                                     |
| 2    | Register / login                                                                                       |
| 3    | Sender mode dashboard                                                                                  |
| 4    | Wayler mode dashboard                                                                                  |
| 5    | Active Wayler access view (mock/manual pass)                                                           |
| 6    | My listings (Wayler availabilities)                                                                    |
| 7    | Incoming Sender requests                                                                               |
| 8    | Accept open delivery requests (with active access + KYC)                                               |
| 9    | Accepted / in-progress delivery requests                                                               |
| 10   | Chat / conversations on accepted orders                                                                |
| 11   | In-app notifications (bell + center)                                                                   |
| 12   | Support tickets (user create + threaded replies)                                                       |
| 13   | Admin Operations Center (ADMIN / ARBITRATOR)                                                           |
| 14   | Admin KYC approve/reject (pending demo samples)                                                        |
| 15   | Admin queues — support, reviews, orders, users, payments (read + metadata mutations where implemented) |
| 16   | Light and dark mode on `/app` and marketing                                                            |
| 17   | Read-only `demo:smoke` DB verification after seed                                                      |

**In-app confidence panel:** collapsible **Demo walkthrough checklist** on `/app` — API health, user, mode, KYC, access, counts, admin flag. No secrets exposed.

**Environment diagnostics:** `API: {host}` badge in dev or when `NEXT_PUBLIC_SHOW_ENV_BADGE=true`.

---

## 2. Demo / mock / manual only

| Area                     | MVP behavior                                                                     |
| ------------------------ | -------------------------------------------------------------------------------- |
| Wayler access            | Mock/manual daily pass (seed) or long-lived admin demo pass — not a paid product |
| KYC                      | Mock verification workflow; pending samples for admin queue only                 |
| Payments                 | Mock metadata / hold labels — no real money movement                             |
| Escrow / payout / refund | UI and schema hints only — not executed                                          |
| Notifications            | In-app dispatch from app events — not push/email/SMS                             |
| Support                  | In-app tickets — not 24/7 emergency support                                      |
| Globe                    | Canvas visualization — not live routing or carrier tracking                      |
| Reviews                  | Post-delivery trust signals — not third-party certification                      |

---

## 3. Not production-ready

- Real payment provider integration (Stripe, etc.)
- Real escrow, payout, or refund execution
- Production KYC/identity provider
- Insurance or legal delivery guarantees
- File upload for dispute/KYC evidence (metadata-only in many flows)
- Automated E2E browser tests in CI
- Multi-region deployment sync without manual env alignment

---

## 4. Local demo commands

```powershell
# Start infra (Postgres, Redis)
pnpm docker:up

# Migrate + seed (requires DEMO_ADMIN_PASSWORD in env — never commit)
$env:DEMO_ADMIN_PASSWORD="<strong-password-min-12>"
pnpm demo:seed

# Verify seed script prerequisites (no DB writes)
pnpm demo:check

# Read-only DB smoke (uses DATABASE_URL from apps/api/.env)
pnpm demo:smoke

# Dev servers
pnpm dev
```

Web defaults to `http://localhost:4000` for API unless `NEXT_PUBLIC_API_URL` is set.

---

## 5. Live demo deployment sync checklist

Before a live demo, confirm **browser API host matches seeded database**:

- [ ] `NEXT_PUBLIC_API_URL` on web deployment points to the API that uses the seeded DB
- [ ] API `DATABASE_URL` is the database you ran `seed:demo` against
- [ ] `DEMO_ADMIN_PASSWORD` (and optional `DEMO_USER_PASSWORD`) set only in secure env — not in repo
- [ ] Log in with `@wayly.demo` accounts from [demo-walkthrough-checkpoint.md](./demo-walkthrough-checkpoint.md)
- [ ] Header shows expected `API: {host}` when badge enabled
- [ ] `/app` checklist shows non-zero counts for wayler/sender after seed
- [ ] `pnpm demo:smoke` passes against the same DB

**If `demo:smoke` passes locally but the browser shows empty panels**, the browser is almost certainly using a **different API/database** than your seeded demo DB. Check the API host badge and `NEXT_PUBLIC_API_URL`.

---

## 6. Smoke test command

```powershell
pnpm demo:smoke
# or
pnpm --dir apps/api demo:smoke
```

- Read-only; exit 0 = critical checks pass; exit 1 = re-run `seed:demo`.
- Does not replace manual browser walkthrough or E2E tests.

---

## 7. Browser walkthrough checklist

- [ ] Landing page — globe visible, draggable, auto-rotating, text readable (light + dark)
- [ ] Login `admin@wayly.demo` — Operations Center, KYC queue, support/reviews/orders/users/payments
- [ ] KYC — approve/reject `demo.kyc-pending-*@wayly.demo` samples; queue refreshes
- [ ] Login `demo.wayler@wayly.demo` — Wayler mode, access ACTIVE, listings + incoming + open + accepted populated
- [ ] Accept open order — enabled with active access; safe error if rejected
- [ ] Chat opens on accepted order
- [ ] Notifications bell loads
- [ ] Create support ticket
- [ ] Login `demo.sender@wayly.demo` — Sender mode, published + accepted orders
- [ ] `/app` Demo walkthrough checklist — counts match expectations
- [ ] Light and dark mode both usable

---

## 8. Known limitations

- Sender/Wayler daily passes expire at UTC midnight — re-seed if needed
- Empty UI with passing smoke test = environment mismatch (most common blocker)
- Rate limits may affect rapid admin actions in dev
- Some admin payment/dispute actions are metadata-only
- No real-time sync between multiple browser tabs guaranteed

---

## 9. Do-not-claim list

Do **not** state or imply in product copy, marketing, or demos:

- Real escrow or funds held in trust
- Real payout or refund to bank/card
- Real payment provider processing
- Production KYC / identity certification
- Insurance coverage or legal delivery guarantee
- Emergency or 24/7 human support

Use honest demo/mock language consistent with [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md).

---

## Related

- [demo-walkthrough-checkpoint.md](./demo-walkthrough-checkpoint.md) — accounts, seed, globe, panel data
- [admin-operations-center.md](./admin-operations-center.md) — admin endpoints and security
- [security-and-secrets-checkpoint.md](./security-and-secrets-checkpoint.md) — password env vars, no secrets in repo
