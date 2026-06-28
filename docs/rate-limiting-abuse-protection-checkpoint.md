# Rate limiting & abuse protection checkpoint

**Last updated:** June 2026  
**Scope:** MVP API rate limiting via `@nestjs/throttler` with named policies. **Not** enterprise DDoS protection, bot mitigation, or WAF coverage.

---

## 1. What is protected

| Policy            | Default limit | Applies to                                                                                                                                                                                                                                |
| ----------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **authStrict**    | 10 req / 60s  | `POST /auth/login`, `register`, `refresh`, `password/forgot`, `password/reset`                                                                                                                                                            |
| **userWrite**     | 30 req / 60s  | User-generated writes: support tickets/messages, chat messages, reviews, disputes (open/message/evidence), orders (create/status/proof), availability listings/requests, KYC start/mock, mock payments, profile patch, Wayler access mock |
| **adminModerate** | 120 req / 60s | All `/admin/*` routes (queues, triage, moderation)                                                                                                                                                                                        |
| **publicLight**   | 120 req / 60s | All other API routes without a stricter policy (reads, lists, notifications GET, etc.)                                                                                                                                                    |

**Excluded:** `GET /health/live`, `GET /health/ready` — no rate limits (probe-friendly).

**Not HTTP-protected:** Demo seed scripts (`seed:demo`, `seed:demo:check`, `seed-demo-users`) — guarded by `demo-seed-safety.ts` env checks instead (see [security-and-secrets-checkpoint.md](./security-and-secrets-checkpoint.md)).

---

## 2. MVP limitation: in-memory / single instance

- Counters are stored in **process memory** via `@nestjs/throttler` default storage.
- Limits are **per API instance** — multiple Render replicas do not share counters.
- Restart clears counters.
- **Before serious scale or abuse scenarios:** move to Redis-backed throttler storage (Redis is already in the stack) or edge/CDN rate limits.

Code comments in `apps/api/src/common/rate-limit/wayly-throttler.guard.ts` document this honestly.

---

## 3. Production TODO

| Item                           | Notes                                                   |
| ------------------------------ | ------------------------------------------------------- |
| Redis / distributed throttling | Shared counters across API replicas                     |
| Edge / CDN / WAF rules         | Render/Vercel/Cloudflare layer limits                   |
| Bot protection                 | CAPTCHA or challenge on auth abuse (not in v1)          |
| Auth audit logging             | Complement throttling with login attempt audit trail    |
| `trust proxy` tuning           | Ensure client IP behind Render load balancer is correct |
| Per-route tuning               | Monitor 429 rates and adjust env limits                 |

---

## 4. Safe error message

When limited, clients receive **HTTP 429** with:

```text
Too many requests. Please wait and try again.
```

- No internal counters, tracker keys, or IP addresses in the response body.
- Rate-limit response headers are **disabled** (`setHeaders: false`) in v1.

---

## 5. Tracker behavior

| Context                 | Tracker key                                        |
| ----------------------- | -------------------------------------------------- |
| Authenticated request   | `user:{userId}`                                    |
| Login                   | `{ip}:login:{normalizedEmail}`                     |
| Register                | `{ip}:register:{normalizedEmail}`                  |
| Password forgot         | `{ip}:forgot:{normalizedEmail}`                    |
| Unauthenticated (other) | Client IP (`req.ip` / first `X-Forwarded-For` hop) |

IPs are **not stored in the database** — only used in ephemeral in-memory keys.

---

## 6. Configuration

Env vars (validated in `apps/api/src/config/env.schema.ts`):

| Variable                           | Default | Purpose                                         |
| ---------------------------------- | ------- | ----------------------------------------------- |
| `RATE_LIMIT_ENABLED`               | `true`  | Master switch (`false` disables all throttling) |
| `RATE_LIMIT_AUTH_WINDOW_SECONDS`   | `60`    | authStrict window                               |
| `RATE_LIMIT_AUTH_MAX`              | `10`    | authStrict max requests                         |
| `RATE_LIMIT_WRITE_WINDOW_SECONDS`  | `60`    | userWrite window                                |
| `RATE_LIMIT_WRITE_MAX`             | `30`    | userWrite max requests                          |
| `RATE_LIMIT_PUBLIC_WINDOW_SECONDS` | `60`    | publicLight window                              |
| `RATE_LIMIT_PUBLIC_MAX`            | `120`   | publicLight max requests                        |

Legacy `THROTTLE_TTL` / `THROTTLE_LIMIT` remain in schema but are superseded by `RATE_LIMIT_*` for the named policies.

---

## 7. No secrets logged

Rate limiting does **not** log passwords, tokens, cookies, or `Authorization` headers. Existing `LoggingInterceptor` logs method, URL, status, duration, and request id only.

---

## 8. Manual verification checklist

- [ ] `RATE_LIMIT_ENABLED=false` — repeated login attempts never return 429
- [ ] `RATE_LIMIT_ENABLED=true` — 11+ login attempts within 60s from same IP/email → 429 with safe message
- [ ] Register / password forgot similarly limited under **authStrict**
- [ ] Support ticket create or chat send — 31+ writes in 60s → 429
- [ ] Admin queue refresh — normal browsing stays under **adminModerate** (120/min)
- [ ] `GET /api/v1/health/live` — never 429 under load
- [ ] 429 body contains **no** IP, counter, or internal key details
- [ ] Auth login still returns generic invalid-credentials message (no email enumeration)

**Example (PowerShell, local API):**

```powershell
1..12 | ForEach-Object {
  Invoke-RestMethod -Method Post -Uri "http://localhost:4000/api/v1/auth/login" `
    -ContentType "application/json" `
    -Body '{"email":"test@example.com","password":"wrong"}' `
    -SkipHttpErrorCheck
} | Select-Object -Last 1 StatusCode, Content
```

Expect the last response to be **429**.

---

## Related docs

- [security-and-secrets-checkpoint.md](./security-and-secrets-checkpoint.md) — secrets, demo seed guards, deployment safety
- [support-notifications-demo-checkpoint.md](./support-notifications-demo-checkpoint.md) — demo seed (non-HTTP)
- [README.md](../README.md) — local dev setup
