# Demo walkthrough checkpoint

**Last updated:** June 2026  
**Scope:** End-to-end demo accounts, admin KYC actions, Wayler access, dashboard panels, homepage globe. **Not** real payments, escrow, KYC certification, or legal guarantees.

---

## Quick start

```powershell
$env:DEMO_ADMIN_PASSWORD="<strong-password-min-12>"
# optional: $env:DEMO_USER_PASSWORD="<separate-password>"
pnpm --dir apps/api seed:demo
```

| Account | Email                    | Password env                           |
| ------- | ------------------------ | -------------------------------------- |
| Admin   | `admin@wayly.demo`       | `DEMO_ADMIN_PASSWORD`                  |
| Sender  | `demo.sender@wayly.demo` | `DEMO_USER_PASSWORD` or admin password |
| Wayler  | `demo.wayler@wayly.demo` | `DEMO_USER_PASSWORD` or admin password |

**Legacy:** `seed-demo-users` now uses `@wayly.demo` emails. Old `@wayly.app` accounts are not created by current scripts; `seed:demo` cleans demo-owned rows for legacy emails if they still exist in the DB.

---

## KYC admin approve / reject

- **Pending samples:** `demo.kyc-pending-paris@wayly.demo`, `demo.kyc-pending-bishkek@wayly.demo` (PENDING KYC only — not main walkthrough accounts).
- **Fix:** `AdminKycController` uses `@UseGuards(JwtAuthGuard, RolesGuard)` so role checks run **after** authentication.
- **UI:** Safe error messages on 401/403/429/5xx; default reject reason when empty; queue refresh after success.
- Main demo accounts stay **KYC APPROVED** so marketplace flows work.

---

## Wayler access

| Account            | Pass type                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------- |
| `admin@wayly.demo` | **Long-lived mock/manual demo pass** (`demo-admin-long-lived-pass`) — labeled “Demo admin access” in UI |
| Sender / Wayler    | **Today's UTC mock/manual pass** (refreshed on each `seed:demo`)                                        |

- No global ADMIN bypass in production code — only the seeded pass marker applies.
- Inactive users see **demo/manual access required** card; mock activate when demo tools enabled.
- Re-run `seed:demo` after UTC midnight for sender/wayler daily passes if needed.

---

## Per-account dashboard data (after seed)

Each main demo account should show:

1. **My listings** — at least one `[Demo]` published listing
2. **Incoming Sender requests** — at least one pending request
3. **Available delivery requests** — open orders from other demo accounts
4. **Accepted delivery requests** — cross-account accepted orders (admin, sender, wayler each as Wayler on at least one)
5. **Delivered** samples — review/chat on wayler–sender pipeline
6. **Notifications** — demo in-app notices
7. **Support tickets** — sender (threaded), admin, wayler

**Routes in seed:** Amsterdam, London, Paris→London, Istanbul→New York, Bishkek local, Berlin→Paris, Almaty→Bishkek, and more.

---

## Homepage interactive globe

- Component: `apps/web/src/components/marketing/interactive-route-globe.tsx`
- Canvas-based 3D-style globe — drag/touch rotate, wheel zoom, route arcs, city labels
- Auto-rotation pauses while interacting; reduced motion respected
- No map API key; uses theme CSS variables (light/dark)

---

## Manual checklist

- [ ] `pnpm --dir apps/api seed:demo` on demo DB
- [ ] Admin KYC queue — filter **PENDING** — approve/reject sample users
- [ ] Admin — Wayler access **ACTIVE**, “Demo admin access” label
- [ ] Each `@wayly.demo` account — listings, incoming, open, accepted panels populated
- [ ] Accept open order works with active access
- [ ] Homepage — drag globe, zoom, see city labels
- [ ] Light mode on `/app` — readable cards and empty states

---

## Honesty

- Mock/manual access and demo KYC only — not real payment or identity certification.
- No escrow, payout, insurance, emergency support, or delivery guarantee claims.

---

## Related

- [demo-dashboard-ux-checkpoint.md](./demo-dashboard-ux-checkpoint.md)
- [security-and-secrets-checkpoint.md](./security-and-secrets-checkpoint.md)
