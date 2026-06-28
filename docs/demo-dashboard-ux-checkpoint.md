# Demo dashboard UX checkpoint

**Last updated:** June 2026  
**Scope:** Admin queue reliability, demo seed walkthrough data, Wayler access UX, light mode, and logged-in app polish. **Not** production deployment or real payment/escrow/KYC certification.

---

## 1. Admin queue errors fixed

### Root cause

`RolesGuard` ran as a **global** guard **before** route-level `JwtAuthGuard`. On `@Roles()` admin routes, it accessed `user.roles` while `user` was still undefined → **500 Internal Server Error** on all admin list endpoints.

### Fix

`RolesGuard` now **defers** when `request.user` is not attached (same pattern as `VerificationGuard` / `AccountModerationGuard`), allowing `JwtAuthGuard` to authenticate first.

### Frontend improvements

- Shared `safePanelErrorMessage()` maps **401/403** → “Admin access required”, **429** → rate-limit message, **5xx** → safe fallback.
- Admin panels show **empty states** when queues return zero items (not red errors).
- Operations dashboard includes **demo/mock honesty note**.

### Queues covered

Disputes, KYC, orders, users, payments, system health, audit logs, support tickets, reviews moderation, overview KPIs.

---

## 2. Demo seed accounts and data

Run (local/intentional demo DB only):

```powershell
$env:DEMO_ADMIN_PASSWORD="<strong-password-min-12>"
# optional: $env:DEMO_USER_PASSWORD="<separate-password>"
pnpm --dir apps/api seed:demo
```

| Account | Email                    | Receives                                                                                                                                                       |
| ------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin   | `admin@wayly.demo`       | ADMIN role, today's **mock/manual Wayler access**, 1 published listing (Amsterdam), incoming Sender request, admin-initiated pending request to wayler listing |
| Sender  | `demo.sender@wayly.demo` | 1 published listing (London), incoming request from wayler, open marketplace orders, accepted/delivered samples                                                |
| Wayler  | `demo.wayler@wayly.demo` | 5 published listings, incoming requests (incl. from admin), open orders from other demo accounts, accepted/in-transit/delivered pipeline                       |

Passwords: **`DEMO_ADMIN_PASSWORD`** required; **`DEMO_USER_PASSWORD`** optional (falls back to admin password). **Never hardcoded or printed.**

After seed, each demo account has **today's UTC Wayler access pass** (mock/manual, no real charge).

---

## 3. Wayler access demo behavior

- Seed upserts **ACTIVE** `WaylerAccessPass` for all three `@wayly.demo` accounts (UTC calendar day).
- UI shows a **demo access card** when inactive: mock/manual only, no real payment, activate button when demo tools enabled.
- Accept/contact actions still require active pass — seed + mock activate both satisfy this for demos.
- **Not** real Stripe/subscription confirmation.

---

## 4. Light mode support

- **Theme toggle** added to `/app` dashboard header (next-themes).
- Light mode uses solid **card backgrounds**, readable borders, and softer shadows (`:root:not(.dark)` overrides in `globals.css`).
- Error panels readable in light mode (`wayly-panel-error`).
- Dark mode premium styling preserved.

---

## 5. UI / animation upgrades

- Premium **empty states** with icon, optional CTA (`panel-status-states.tsx`).
- **Hover-lift** order cards in light mode; skeleton fade-in.
- Respects **`prefers-reduced-motion`**.
- Admin dashboard **demo data note** banner.

---

## 6. Manual verification checklist

- [ ] Log in as `admin@wayly.demo` — admin queues load (or show empty), not generic 500 errors
- [ ] Overview KPIs populate or show `—` without red panel errors
- [ ] Switch to **light mode** on `/app` — background/cards become light and readable
- [ ] Run `seed:demo` locally — re-login each demo account
- [ ] **Wayler mode** on each account — “My listings” shows at least one `[Demo]` listing
- [ ] **Incoming Sender requests** shows at least one pending request per account (after seed)
- [ ] **Accept open order** works after seed (access pass active) or after “Activate demo access”
- [ ] Admin queues with no data show **No items in queue**, not red error
- [ ] 429 from rate limit shows safe message (if testing burst)

---

## 7. Honesty limitations

- Wayler access is **mock/manual demo** — not real paid daily access.
- Demo orders, payments, and KYC are **seeded samples** — not real escrow, refunds, or legal guarantees.
- No insurance, emergency support, or guaranteed delivery claims.
- Re-run `seed:demo` after UTC midnight if access passes expired.

---

## Related docs

- [security-and-secrets-checkpoint.md](./security-and-secrets-checkpoint.md)
- [rate-limiting-abuse-protection-checkpoint.md](./rate-limiting-abuse-protection-checkpoint.md)
- [support-notifications-demo-checkpoint.md](./support-notifications-demo-checkpoint.md)
