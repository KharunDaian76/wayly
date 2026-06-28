# Demo dashboard UX checkpoint

**Last updated:** June 2026  
**Scope:** Admin queue reliability, demo seed walkthrough data, Wayler access UX, light mode, logged-in app polish, homepage globe. **Not** production deployment or real payment/escrow/KYC certification.

---

## 1. Admin queue errors fixed

### Root cause (list 500s)

`RolesGuard` ran as a **global** guard **before** route-level `JwtAuthGuard`. On `@Roles()` admin routes, it accessed `user.roles` while `user` was still undefined → **500 Internal Server Error** on admin list endpoints.

### Fix (list)

`RolesGuard` **defers** when `request.user` is not attached (same pattern as `VerificationGuard`).

### KYC approve / reject (June 2026)

- **Action routes** use `@UseGuards(JwtAuthGuard, RolesGuard)` on `AdminKycController` so role enforcement runs **after** JWT auth (global defer alone skipped role checks on mutations).
- **Pending KYC samples** in `seed:demo`: `demo.kyc-pending-paris@wayly.demo`, `demo.kyc-pending-bishkek@wayly.demo` — main demo accounts stay APPROVED for marketplace flows.
- **UI:** `safePanelErrorMessage` on action failures; default reject reason; queue refresh after success.

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

| Account | Email                    | Receives                                                                                                                                                        |
| ------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin   | `admin@wayly.demo`       | ADMIN role, **long-lived mock/manual Wayler pass**, listings (Amsterdam, Paris→London), incoming + accepted cross-account orders, support ticket, notifications |
| Sender  | `demo.sender@wayly.demo` | Listings (London, Almaty→Bishkek), incoming request, open/accepted orders as Wayler, support ticket, notifications                                              |
| Wayler  | `demo.wayler@wayly.demo` | Multiple listings, incoming requests, open orders, accepted/in-transit/delivered pipeline, support ticket, notifications                                        |

**KYC review samples (admin queue only):** `demo.kyc-pending-paris@wayly.demo`, `demo.kyc-pending-bishkek@wayly.demo`

Passwords: **`DEMO_ADMIN_PASSWORD`** required; **`DEMO_USER_PASSWORD`** optional (falls back to admin password). **Never hardcoded or printed.**

Legacy `demo.sender@wayly.app` / `demo.wayler@wayly.app` — no longer created; demo-owned cleanup includes them if present.

### Demo smoke check (read-only)

Verify walkthrough readiness without writing to the database:

```powershell
$env:DATABASE_URL = ((Get-Content "apps/api/.env" | Where-Object { $_ -match "^DATABASE_URL=" }) -replace "^DATABASE_URL=", "").Trim('"')
pnpm --dir apps/api demo:smoke
Remove-Item Env:DATABASE_URL
```

Requires **`DATABASE_URL` only** (no demo passwords). Prints PASS/WARN/FAIL for users, KYC, Wayler access, listings, requests, orders, chat, notifications, and admin queue data. Exit **0** when critical checks pass. Not a substitute for E2E tests.

Preflight before seed: `pnpm --dir apps/api seed:demo:check` (password env guards only).

---

## 3. Wayler access demo behavior

- **Admin:** long-lived pass via `demo-admin-long-lived-pass` marker (not a global ADMIN bypass).
- **Sender / Wayler:** today's UTC mock/manual pass on each `seed:demo`.
- UI shows **demo access card** when inactive; **“Demo admin access”** label for admin long-lived pass.
- Accept/contact actions require active pass — seed + mock activate satisfy demos.
- **Not** real Stripe/subscription confirmation.

---

## 4. Homepage interactive globe

- `interactive-route-globe.tsx` — canvas 3D-style globe in hero
- Drag/touch rotate, wheel zoom, animated route arcs, city labels (Istanbul, New York, Berlin, Paris, Bishkek, London)
- Auto-rotation; `prefers-reduced-motion` support; theme-aware colors

---

## 5. Light mode support

- **Theme toggle** on `/app` dashboard header (next-themes).
- Light mode uses solid **card backgrounds**, readable borders, and softer shadows (`:root:not(.dark)` overrides in `globals.css`).
- Error panels readable in light mode (`wayly-panel-error`).
- Globe uses CSS variables for light/dark compatibility.

---

## 6. UI / animation upgrades

- Premium **empty states** with icon, optional CTA (`panel-status-states.tsx`).
- **Hover-lift** order cards in light mode; skeleton fade-in.
- Respects **`prefers-reduced-motion`**.
- Admin dashboard **demo data note** banner.

---

## 7. Manual verification checklist

- [ ] Log in as `admin@wayly.demo` — admin queues load (or show empty), not generic 500 errors
- [ ] KYC queue — filter PENDING — approve/reject demo pending samples
- [ ] Overview KPIs populate or show `—` without red panel errors
- [ ] Switch to **light mode** on `/app` — background/cards become light and readable
- [ ] Run `seed:demo` locally — re-login each demo account
- [ ] Run `demo:smoke` — critical checks PASS
- [ ] **Wayler mode** on each account — “My listings”, incoming, open, accepted panels populated
- [ ] **Accept open order** works after seed or “Activate demo access”
- [ ] Homepage — interactive globe drag/zoom
- [ ] 429 from rate limit shows safe message (if testing burst)

---

## 8. Honesty limitations

- Wayler access is **mock/manual demo** — not real paid daily access.
- Demo orders, payments, and KYC are **seeded samples** — not real escrow, refunds, or legal guarantees.
- No insurance, emergency support, or guaranteed delivery claims.
- Re-run `seed:demo` after UTC midnight for sender/wayler daily passes if expired.

---

## Related docs

- [demo-walkthrough-checkpoint.md](./demo-walkthrough-checkpoint.md)
- [security-and-secrets-checkpoint.md](./security-and-secrets-checkpoint.md)
- [rate-limiting-abuse-protection-checkpoint.md](./rate-limiting-abuse-protection-checkpoint.md)
- [support-notifications-demo-checkpoint.md](./support-notifications-demo-checkpoint.md)
