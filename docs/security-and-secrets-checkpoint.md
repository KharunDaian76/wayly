# Security & secrets checkpoint

**Last updated:** June 2026  
**Scope:** Secret handling, demo seed safety, deployment hygiene, and honest security limits. **Operational guidance only** — not a penetration test or compliance certification.

If a **DATABASE_URL**, JWT secret, or demo password was exposed (chat, ticket, screenshot, commit), treat it as compromised and **rotate immediately**.

---

## 1. Secret handling

### Never commit or paste real secrets

| Secret                                     | Where it lives                | Never put in                     |
| ------------------------------------------ | ----------------------------- | -------------------------------- |
| `DATABASE_URL`                             | Render/host env, local `.env` | Git, README, docs, chat, tickets |
| `REDIS_URL`                                | Host env, local `.env`        | Git, docs                        |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Host env, local `.env`        | Git, client bundles              |
| Demo passwords (`DEMO_*_PASSWORD`)         | Shell env at seed time only   | Git, logs, seed output           |

**`.gitignore`** excludes `.env` and `.env.*` (except `.env.example` placeholders).

### If PostgreSQL credentials were exposed

1. **Rotate** the database user password in Render (or your host) — create a new password; do not reuse.
2. **Update** Render service env for `wayly-api`: set the new `DATABASE_URL` (or password component).
3. **Redeploy** the API so running instances pick up the new secret.
4. **Review** access logs if available; assume the old URL/password is known.
5. **Do not** paste the new URL into chat, docs, or commits.

### JWT secrets

- Use long random values (32+ chars) per environment.
- Rotate if leaked; invalidates existing refresh tokens (users re-login).
- Placeholders in `.env.example` only — never use `change-me-*` in production.

---

## 2. Demo seed safety

**Scripts:**

| Script            | Command                                  | Purpose                                        |
| ----------------- | ---------------------------------------- | ---------------------------------------------- |
| Full demo data    | `pnpm --dir apps/api seed:demo`          | Users, orders, tickets, notifications, reviews |
| Preflight only    | `pnpm --dir apps/api seed:demo:check`    | Validates guards/passwords **without** writing |
| Legacy users only | `pnpm --dir apps/api db:seed-demo-users` | Two KYC-approved `@wayly.app` users            |

**Shared guards** (`apps/api/scripts/demo-seed-safety.ts`):

| Guard                         | Behavior                                                                                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV=production`         | **Blocked** unless `ALLOW_DEMO_SEED=true`                                                                                                                 |
| Hosted-looking `DATABASE_URL` | **Blocked** unless `ALLOW_DEMO_SEED=true` (hints: `render.com`, `dpg-`, `amazonaws.com`, `neon.tech`, `supabase.co`, `railway.app`, `prod`, `production`) |
| `DEMO_ADMIN_PASSWORD`         | **Required** for `seed:demo`; min **12** chars; rejects known placeholders                                                                                |
| `DEMO_USERS_PASSWORD`         | **Required** for legacy `seed-demo-users`                                                                                                                 |
| Password output               | **Never printed**                                                                                                                                         |
| Warnings                      | Logs **demo/mock data only** — not real payments, escrow, or emergency support                                                                            |

**Explicit opt-in for hosted DB:**

```powershell
$env:ALLOW_DEMO_SEED="true"
$env:DEMO_ADMIN_PASSWORD="<unique-strong-password-min-16-chars>"
pnpm --dir apps/api seed:demo
```

Use `ALLOW_DEMO_SEED=true` only for intentional **non-production demo** databases — not production launch databases.

**Rejected placeholder passwords** include: `choose-a-local-demo-password`, `YourStrongerLocalPassword123!`, `WaylyDemo2026!`, `password`, `admin`, `demo`, and similar documented examples.

---

## 3. Live demo users

Known demo accounts from `seed:demo` (emails are intentional; passwords are **env-only**):

| Role   | Email                  |
| ------ | ---------------------- |
| Admin  | admin@wayly.demo       |
| Sender | demo.sender@wayly.demo |
| Wayler | demo.wayler@wayly.demo |

**Rules:**

- Demo users are for **demos and walkthroughs only** — not real admin operations.
- **Rotate** demo passwords periodically on any hosted demo environment.
- **Remove or disable** demo admin/sender/wayler accounts before public production launch.
- **Never** use demo admin as the real production administrator.
- If demo users were seeded on a DB whose URL leaked, **rotate DB credentials and demo passwords**.

Legacy script uses `demo.sender@wayly.app` / `demo.wayler@wayly.app` — prefer `seed:demo` for current checkpoint docs.

---

## 4. Deployment checklist

Before/after deploy to Render (or similar):

- [ ] `prisma migrate deploy` runs before or during API start
- [ ] Health endpoints respond (`/health` or configured probe)
- [ ] `DATABASE_URL` rotated if ever exposed; Render env updated; API redeployed
- [ ] No secrets in git history from recent commits (scan: `postgres://`, real hostnames, passwords)
- [ ] Demo seed **not** run accidentally in production (`ALLOW_DEMO_SEED` unset unless intentional demo DB)
- [ ] JWT secrets are unique per environment
- [ ] `.env` files not committed

---

## 5. Remaining security TODOs

Not complete in current v1 stack:

| Area                                   | Status                                                                                                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rate limiting                          | MVP v1 — named policies via `@nestjs/throttler` (in-memory); see [rate-limiting-abuse-protection-checkpoint.md](./rate-limiting-abuse-protection-checkpoint.md) |
| Auth/admin audit logging               | Partial (`AdminAuditLog` for some admin actions; not full auth audit)                                                                                           |
| Stronger admin access control          | Role split exists; production hardening ongoing                                                                                                                 |
| Production monitoring / error tracking | Sentry/OTEL placeholders in `.env.example`                                                                                                                      |
| Legal / privacy review                 | Draft public pages only                                                                                                                                         |
| Payment / KYC provider security review | Mock/manual flows today                                                                                                                                         |
| Secret scanning in CI                  | Recommended addition                                                                                                                                            |
| Demo account removal automation        | Manual before launch                                                                                                                                            |

---

## Manual verification checklist

- [ ] Repo scan finds **no** real Render/production `DATABASE_URL` or exposed passwords in committed files
- [ ] `seed:demo` refuses hosted `DATABASE_URL` without `ALLOW_DEMO_SEED=true`
- [ ] `seed:demo` refuses `NODE_ENV=production` without `ALLOW_DEMO_SEED=true`
- [ ] `seed:demo` rejects placeholder `DEMO_ADMIN_PASSWORD` values
- [ ] `seed:demo:check` passes with valid env without writing data
- [ ] `seed-demo-users` requires `DEMO_USERS_PASSWORD` (no hardcoded default)
- [ ] Seed scripts do not print passwords
- [ ] `.env.example` uses placeholders only
- [ ] Rate limiting enabled in production (`RATE_LIMIT_ENABLED=true`); auth/login returns 429 after burst — see [rate-limiting-abuse-protection-checkpoint.md](./rate-limiting-abuse-protection-checkpoint.md)

---

## Related docs

- [support-notifications-demo-checkpoint.md](./support-notifications-demo-checkpoint.md) — demo seed command and env vars
- [trust-reviews-ratings-checkpoint.md](./trust-reviews-ratings-checkpoint.md) — demo review seed samples
- [admin-operations-checkpoint.md](./admin-operations-checkpoint.md) — admin access and queues
- [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md) — no real money movement
- [rate-limiting-abuse-protection-checkpoint.md](./rate-limiting-abuse-protection-checkpoint.md) — MVP API rate limits
- [README.md](../README.md) — local dev setup
