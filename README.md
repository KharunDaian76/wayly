# Wayly

Cross-platform **P2P delivery platform** connecting Senders and Waylers directly — international/intercity and local city delivery — with mandatory KYC, escrow + offline payment flows, real-time chat, maps, and a premium mobile-first PWA experience.

> **Status:** M1 (Auth & Users), **M2 mock KYC**, **M3 Sender/Wayler mode switcher**, and **M4 marketplace flow** (draft → publish/cancel → Wayler OPEN feed → accept → **in-transit → delivered**, **metadata proof-of-delivery** submit/view, Sender/Wayler tracking panels, Wayler filters/maps, **in-app notifications** — schema, API, SDK, Sender lifecycle dispatch, **chat message dispatch**, bell/dropdown, polling, **order-based chat** — schema, API, SDK, Sender/Wayler Accepted panel UI, modal on `/app`, **chat modal polling**, **premium `/app` dashboard UI foundation**, **payment/escrow schema + mock/manual API + SDK + Sender Accepted payment UI + Wayler Accepted payout visibility**) are complete. Photo/signature proof, Stripe/checkout, real payout processing, refunds, Wayler payout dashboard, WebSocket/SSE real-time chat/push, disputes, and admin are future milestones.

## Tech stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Frontend:** Next.js 14 (App Router) + React + TypeScript, Tailwind CSS, PWA — deploys to **Vercel**
- **Backend:** NestJS (Node.js 20 LTS) + Prisma — deploys to **Render**
- **Database:** PostgreSQL 16 + PostGIS
- **Cache / sessions / queues / WS scaling:** Redis 7
- **Integrations:** Stripe + Stripe Connect, Sumsub (KYC), Twilio Verify (OTP), Mapbox, Firebase Cloud Messaging

## Repository layout (target)

```text
wayly/
├─ apps/
│  ├─ web/                 # Next.js: landing + PWA app + admin panel  (later batch)
│  └─ api/                 # NestJS backend                           (later batch)
├─ packages/
│  ├─ ui/                  # design system / components               (later batch)
│  ├─ types/               # shared TS types & enums                  (later batch)
│  ├─ validation/          # shared Zod schemas                       (later batch)
│  ├─ sdk/                 # typed API client                         (later batch)
│  ├─ config-eslint/       # shared ESLint config                     ✅ M0
│  ├─ config-tsconfig/     # shared TypeScript config                 ✅ M0
│  └─ config-tailwind/     # shared Tailwind preset / design tokens   ✅ M0
└─ infra/                  # Docker / compose / deploy                (later batch)
```

## Prerequisites

- **Node 20 LTS** via [nvm](https://github.com/nvm-sh/nvm) (`nvm use` reads `.nvmrc`)
- **pnpm 9.9.0** via [Corepack](https://nodejs.org/api/corepack.html) (`corepack enable`)
- **Docker Desktop** (local Postgres + Redis)

## Getting started (local)

```bash
nvm use                 # Node 20 (reads .nvmrc)
corepack enable         # pnpm 9
pnpm install            # installs workspace + generates the lockfile

cp .env.example .env    # fill local values (see M1 / M2 / M3 sections below)

pnpm docker:up          # start Postgres 16 (+PostGIS) and Redis 7 in Docker
pnpm db:generate        # generate the Prisma client
pnpm dev                # run web + api with Turbo (hot reload)
```

## M1 local development and testing

This section covers the **Auth & Users** foundation: register/login, session refresh via httpOnly cookie, protected `/app`, password visibility toggle, and basic language switching.

### Required local tools

| Tool           | Version / notes                                                         |
| -------------- | ----------------------------------------------------------------------- |
| Node.js        | **20 LTS** — install via nvm, then run `nvm use` in the repo root       |
| pnpm           | **9.9.0** — enable with `corepack enable` (Corepack ships with Node 20) |
| Docker Desktop | Must be running before `pnpm docker:up`                                 |

### Start infrastructure

From the repo root:

```bash
pnpm docker:up
```

This starts Postgres (port `5432`) and Redis (port `6379`). Stop with `pnpm docker:down`.

### Required `.env` values

Copy `.env.example` to `.env` and ensure at least these are set for local M1 testing:

```env
DATABASE_URL=postgresql://wayly:wayly@localhost:5432/wayly_dev?schema=public
NEXT_PUBLIC_API_URL=http://localhost:4000
WEB_URL=http://localhost:3000
```

Also keep the JWT secrets and other values from `.env.example` (defaults are fine for local dev).

### Run database migrations

Apply Prisma migrations before first auth test (creates `User`, `RefreshToken`, etc.):

**Windows (PowerShell):**

```powershell
cd apps/api
$env:DATABASE_URL="postgresql://wayly:wayly@localhost:5432/wayly_dev?schema=public"
pnpm exec prisma migrate dev
cd ../..
```

**macOS / Linux:**

```bash
cd apps/api
DATABASE_URL="postgresql://wayly:wayly@localhost:5432/wayly_dev?schema=public" pnpm exec prisma migrate dev
cd ../..
```

### Start dev servers

From the repo root:

```bash
pnpm dev
```

Turbo runs the API and web app in parallel with hot reload.

### Local URLs

| Service                  | URL                            |
| ------------------------ | ------------------------------ |
| Web app                  | http://localhost:3000          |
| Login                    | http://localhost:3000/login    |
| Register                 | http://localhost:3000/register |
| App (protected)          | http://localhost:3000/app      |
| API Swagger docs         | http://localhost:4000/docs     |
| Health check (web → API) | http://localhost:3000/health   |

### Manual auth test checklist

Use this after `pnpm dev` is running and migrations have been applied:

- [ ] **Register** a new account at `/register`
- [ ] **Login** at `/login`
- [ ] **`/app`** loads when authenticated (shows profile + KYC readiness notice)
- [ ] **Refresh browser** on `/app` — session is restored (httpOnly refresh cookie; access token stays in memory only)
- [ ] **Sign out** — redirects to `/login`
- [ ] **Refresh after logout** — stays unauthenticated (refresh endpoint fails as expected)

Backend errors from the API are shown as returned (not translated yet).

### Manual language test checklist

Basic i18n uses local dictionaries and stores the UI language in `localStorage` (`wayly-locale`):

- [ ] On **`/login`**, **`/register`**, or **`/app`**, change language via the selector (English, Russian, Spanish, French, German, Turkish, Arabic, Chinese)
- [ ] Page labels and buttons update immediately
- [ ] **Refresh the page** — selected language persists
- [ ] Select **Arabic** — document direction switches to **RTL** (`dir="rtl"` on `<html>`)

Marketing landing page (`/`) is not translated yet.

### Troubleshooting

| Problem                               | What to try                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| `localhost:4000` refuses connection   | Start **Docker Desktop**, run `pnpm docker:up`, then `pnpm dev`                        |
| `users` table missing / Prisma errors | Confirm `DATABASE_URL` uses database **`wayly_dev`** and run migrations (see above)    |
| Next.js build `EPERM` on Windows      | Stop the dev server, delete `apps/web/.next`, run `pnpm dev` again                     |
| CORS / cookie issues                  | Ensure `WEB_URL=http://localhost:3000` and `NEXT_PUBLIC_API_URL=http://localhost:4000` |

### Current M1 status

| Area                                                                | Status                          |
| ------------------------------------------------------------------- | ------------------------------- |
| Auth backend (register, login, refresh, logout, `/users/me`)        | Complete                        |
| Auth frontend (`/login`, `/register`, `/app`, session restore)      | Complete                        |
| Password visibility toggle                                          | Complete                        |
| Basic language support (8 locales, localStorage preference)         | Complete                        |
| KYC mock flow (schema, API, SDK, `/app` panel)                      | Complete (M2)                   |
| Real KYC provider (Sumsub)                                          | Not started (future M2 batch)   |
| Marketplace orders (M4 draft/publish/cancel/accept/lifecycle)       | Complete (M4)                   |
| Proof of delivery (metadata note + confirmation code)               | Complete (M4)                   |
| In-app notifications (schema, API, SDK, bell/dropdown, polling)     | Complete (M4)                   |
| Order-based chat (schema, API, SDK, Sender/Wayler Accepted UI)      | Complete (M4)                   |
| Chat message in-app notifications (other participant only)          | Complete (M4)                   |
| Chat modal polling (10s while open, visibility-aware)               | Complete (M4)                   |
| Premium `/app` dashboard UI foundation (visual polish)              | Complete (M4)                   |
| Payment/escrow schema foundation (Prisma + shared types)            | Complete (M5)                   |
| Mock/manual payment API + SDK (`MANUAL` provider)                   | Complete (M5)                   |
| Sender Accepted mock payment UI (authorize / hold / release)        | Complete (M5)                   |
| Wayler Accepted read-only payment/payout visibility                 | Complete (M5)                   |
| Stripe, checkout, real payout processing, refunds, payout dashboard | Not started (future milestones) |
| Disputes, admin                                                     | Not started (future milestones) |

The `/app` dashboard has a **premium UI foundation** (shell, cards, badges, alerts); full landing/onboarding redesign is a future milestone.

### Local development workflow

1. **Backing services** run in Docker (`pnpm docker:up`): Postgres on `5432`
   (user/db `wayly`), Redis on `6379`. Data persists in named volumes; both have
   health checks. Stop them with `pnpm docker:down`.
2. **Apps** run on the host for fast HMR: `pnpm dev` starts the API
   (`http://localhost:4000`, docs at `/docs`) and web (`http://localhost:3000`)
   in parallel via Turborepo.
3. **Verify**: open `http://localhost:3000/health` — it calls the API readiness
   probe through `@wayly/sdk` and should report all systems operational.
4. **Validate config** any time with `pnpm --filter @wayly/api check:env`.

> The `Dockerfile.api` / `Dockerfile.web` images are for container parity and
> future deployment (API → Render, web → Vercel); local dev uses the host + the
> Compose services above.

## M2 KYC mock testing

This section covers the **mock KYC gate** delivered in M2: Prisma schema, backend mock endpoints, SDK methods, and the KYC status panel on `/app`. There is **no real Sumsub (or other provider) integration yet** — local dev uses a mock approve/reject flow.

### Current M2 KYC status

| Area                                       | Status                              |
| ------------------------------------------ | ----------------------------------- |
| KYC schema (`KycVerification`, user flags) | Complete                            |
| Mock backend KYC endpoints                 | Complete                            |
| SDK KYC methods (`api.kyc.*`)              | Complete                            |
| `/app` KYC status panel                    | Complete                            |
| Real Sumsub / provider integration         | Not implemented (future batch)      |
| File upload, webhooks, admin review UI     | Not implemented (future milestones) |

Prerequisites are the same as M1: Docker running, migrations applied, `pnpm dev` up, and a registered user (or use your existing account).

### Backend KYC routes

All routes require a valid JWT (`Authorization: Bearer <accessToken>`). They are mounted under `/api/v1`:

| Method | Path                       | Description                                     |
| ------ | -------------------------- | ----------------------------------------------- |
| GET    | `/api/v1/kyc/status`       | Current KYC status, latest verification, flags  |
| POST   | `/api/v1/kyc/start`        | Start or resume mock verification (→ `PENDING`) |
| POST   | `/api/v1/kyc/mock/approve` | **Dev only** — approve pending verification     |
| POST   | `/api/v1/kyc/mock/reject`  | **Dev only** — reject pending verification      |

Interactive docs: http://localhost:4000/docs (tag **kyc**).

### Frontend manual testing

Use this after M1 setup (`pnpm dev`, migrations, registered user):

- [ ] **Login** at `/login`
- [ ] Open **`/app`** — KYC status panel is visible (status, latest verification, access flags)
- [ ] Click **Start verification** — status moves to **PENDING** (mock buttons become enabled in dev)
- [ ] Confirm **PENDING** on the panel and in latest verification
- [ ] Click **Mock approve** (development only) — status becomes **APPROVED**
- [ ] Confirm **APPROVED** and all feature flags show **Yes** (`canCreateOrder`, `canBrowseOrders`, `canAcceptOrder`, `canChat`, `canContact`, `canReceivePayout`)
- [ ] **Refresh the page** — status persists; Start and mock buttons are disabled with the approved helper text

To test reject instead of approve: after **Start verification**, use **Mock reject** and confirm status becomes **REJECTED** and flags stay **No**.

### PowerShell manual API test

Replace `you@example.com` and `YourPassword1!` with a user you registered locally.

```powershell
# 1. Login and capture access token
$login = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:4000/api/v1/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"you@example.com","password":"YourPassword1!"}'

$token = $login.accessToken
$headers = @{ Authorization = "Bearer $token" }

# 2. GET KYC status
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:4000/api/v1/kyc/status" `
  -Headers $headers

# 3. POST start (optional body: country, levelName)
Invoke-RestMethod -Method POST `
  -Uri "http://localhost:4000/api/v1/kyc/start" `
  -ContentType "application/json" `
  -Headers $headers `
  -Body '{}'

# 4. POST mock approve (development only)
Invoke-RestMethod -Method POST `
  -Uri "http://localhost:4000/api/v1/kyc/mock/approve" `
  -Headers $headers

# 5. GET status again — expect kycStatus APPROVED, verified true, flags true
Invoke-RestMethod -Method GET `
  -Uri "http://localhost:4000/api/v1/kyc/status" `
  -Headers $headers
```

### Troubleshooting

| Problem                                                | What to try                                                                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| KYC status/API fails                                   | Confirm **Docker Desktop** is running, `pnpm docker:up` succeeded, and **`pnpm dev`** is up                           |
| `http://localhost:4000/docs` does not load             | The **API is not running** — start Docker, then `pnpm dev` from the repo root                                         |
| Mock approve: _No pending KYC verification to approve_ | User is already **APPROVED**, or there is **no PENDING** verification — run **start** first, or register a fresh user |
| Mock reject: _No pending KYC verification to reject_   | Same as above — need a **PENDING** verification before mock reject                                                    |
| Mock approve/reject return **404** in production       | Expected — mock routes are **development-only** and must not be exposed in production                                 |

### Future milestones (KYC)

- **Real Sumsub integration** — applicant creation, SDK/token flow, production provider
- **File upload & webhooks** — document submission and async provider callbacks
- **Admin / manual review** — operator tools beyond mock approve/reject
- **KYC enforcement polish** — orders, marketplace, and chat modules enforce KYC today; remaining flags (e.g. `canChat`, `canContact`) may gate future contact surfaces

## M3 Sender/Wayler mode

Wayly users can act as **Senders** (create delivery requests) or **Waylers** (carry/deliver items). M3 Batch 1 adds a **frontend-only mode switcher** on `/app` — a UI preference, not a security role.

### Current M3 status

| Area                                             | Status                                          |
| ------------------------------------------------ | ----------------------------------------------- |
| Sender/Wayler mode switcher on `/app`            | Complete                                        |
| Mode stored in `localStorage` (`wayly-app-mode`) | Complete                                        |
| Default mode                                     | **sender**                                      |
| Sender/Wayler mode is a UI preference            | Yes — **not** a security role                   |
| Security roles                                   | **USER**, **ADMIN**, **ARBITRATOR** (unchanged) |
| Backend mode persistence                         | Not implemented                                 |
| Real order creation / browsing (M4)              | Complete — see **M4 Marketplace flow** below    |

Prerequisites are the same as M1/M2: `pnpm dev` running and a logged-in user.

### Manual test checklist

- [ ] **Login** at `/login`
- [ ] Open **`/app`** — mode switcher appears near the top (“Choose how you want to use Wayly”)
- [ ] Switch **Sender ↔ Wayler** — placeholder dashboard card updates (title, description, button label)
- [ ] **Refresh the page** — selected mode persists (`localStorage`)
- [ ] **Change language** — mode switcher and dashboard text translate (8 locales)
- [ ] Confirm mode switcher and dashboard cards still work after M4 (Sender/Wayler panels load when KYC is approved)

If KYC is not approved, each mode shows a verification notice; M4 enforces KYC on create, browse, accept, and Sender/Wayler marketplace panels.

### Future milestones (Sender/Wayler)

- **Backend mode persistence** — optional server-side preference (today: `localStorage` only)
- **Subscription and payment gates** — apply when those business features are built

## M4 Marketplace flow: Sender to Wayler

M4 delivers the first end-to-end **marketplace loop**: Senders create and publish delivery requests; Waylers browse the public OPEN feed, preview routes on a map, and accept jobs. Both sides have tracking panels on `/app`, in-app notifications, and **order-based chat** after accept. **Mock/manual payment API + two-sided payment UI** (Sender controls, Wayler read-only visibility) exist for local testing (see **Payment and escrow foundation**); **no Stripe, checkout, real payout processing, disputes, admin, or subscriptions yet.**

Prerequisites: same as M1/M2/M3 — Docker running, migrations applied, `pnpm dev` up, and **KYC approved** (mock approve in dev) for marketplace actions.

### Current marketplace status

| Area                                                                      | Status   |
| ------------------------------------------------------------------------- | -------- |
| `DeliveryOrder` schema (Prisma)                                           | Complete |
| Create draft (`POST /orders`)                                             | Complete |
| Cancel DRAFT/OPEN (`POST /orders/:id/cancel`, Sender only)                | Complete |
| Sender Cancel UI (Drafts + Published panels)                              | Complete |
| Publish draft → OPEN (`POST /orders/:id/publish`)                         | Complete |
| Wayler OPEN feed (`GET /orders`, default `status=OPEN`)                   | Complete |
| Accept OPEN order (`POST /orders/:id/accept`)                             | Complete |
| Start transit (`POST /orders/:id/start-transit`)                          | Complete |
| Mark delivered (`POST /orders/:id/mark-delivered`)                        | Complete |
| Wayler accepted panel (`GET /orders/accepted`) + progression              | Complete |
| Sender tracking panels (Drafts / Published / Accepted)                    | Complete |
| Sender Accepted lifecycle visibility (ACCEPTED/IN_TRANSIT/DELIVERED)      | Complete |
| Proof-of-delivery schema + submit API + SDK                               | Complete |
| Wayler proof submit/update UI (IN_TRANSIT / DELIVERED)                    | Complete |
| Sender proof read-only visibility                                         | Complete |
| Notification schema + API + SDK                                           | Complete |
| Automatic Sender lifecycle notifications (accept/transit/proof/delivered) | Complete |
| Frontend notification bell/dropdown on `/app`                             | Complete |
| Notification bell polling (30s unread / 60s list, visibility-aware)       | Complete |
| Chat schema + API + SDK (Conversation / ChatMessage)                      | Complete |
| Frontend chat modal on `/app` (Sender/Wayler Accepted panels)             | Complete |
| Chat message notifications (`SYSTEM` type → bell/dropdown)                | Complete |
| Chat modal polling (10s detail refresh, visibility-aware)                 | Complete |
| Wayler feed filters & sort (type, location, reward, sort)                 | Complete |
| Wayler map route previews (Leaflet + city/country geocoding)              | Complete |
| Sender privacy endpoint (`GET /orders/mine`)                              | Complete |
| Premium `/app` dashboard UI foundation (shell, cards, badges, alerts)     | Complete |
| Payment/escrow schema (`PaymentIntent`, `Payout`, `LedgerEntry`)          | Complete |
| Mock/manual payment API + SDK (`MANUAL` provider)                         | Complete |
| Sender Accepted mock payment UI (authorize / hold / release)              | Complete |
| Wayler Accepted read-only payment/payout visibility                       | Complete |

### API routes (orders)

All routes require JWT + KYC approval (`JwtAuthGuard`, `VerificationGuard`). Base path: `/api/v1`.

| Method | Path                                | Description                                                                                                            |
| ------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/v1/orders`                    | Create a delivery order as DRAFT (Sender)                                                                              |
| GET    | `/api/v1/orders`                    | List orders — defaults to **OPEN** (Wayler marketplace feed); supports `status`, `type`, location filters, pagination  |
| GET    | `/api/v1/orders/mine`               | List **current user's sent orders** only (`senderId` = authenticated user); optional `status`, `type`, `page`, `limit` |
| GET    | `/api/v1/orders/accepted`           | List orders **accepted by the current Wayler** (includes `acceptedAt`)                                                 |
| GET    | `/api/v1/orders/:id`                | Order detail; other users' DRAFTs return 404                                                                           |
| POST   | `/api/v1/orders/:id/publish`        | Sender publishes own DRAFT → OPEN                                                                                      |
| POST   | `/api/v1/orders/:id/cancel`         | Sender cancels own DRAFT or OPEN → CANCELLED (sets `cancelledAt`)                                                      |
| POST   | `/api/v1/orders/:id/accept`         | Wayler accepts OPEN order → ACCEPTED                                                                                   |
| POST   | `/api/v1/orders/:id/start-transit`  | Accepted Wayler moves ACCEPTED → IN_TRANSIT                                                                            |
| POST   | `/api/v1/orders/:id/mark-delivered` | Accepted Wayler moves IN_TRANSIT → DELIVERED (sets `deliveredAt`)                                                      |
| POST   | `/api/v1/orders/:id/proof`          | Accepted Wayler submits/updates proof-of-delivery metadata (IN_TRANSIT or DELIVERED)                                   |

Interactive docs: http://localhost:4000/docs (tag **orders**).

SDK: `api.orders.create`, `list`, `mine`, `accepted`, `detail`, `publish`, `cancel`, `accept`, `startTransit`, `markDelivered`, `submitProof`.

### User flow

**Sender (mode: Sender on `/app`)**

1. Create a **draft** delivery request (title, type, route, reward, etc.).
2. **Cancel** a draft or published (OPEN) order before acceptance — **Cancel** button in Drafts / Published panels → `api.orders.cancel(id)`.
3. **Publish** the draft → status becomes **OPEN** (visible on the Wayler marketplace).
4. Track orders in three panels:
   - **Drafts** — `api.orders.mine({ status: 'DRAFT' })`; **Cancel** per draft
   - **Published** — `api.orders.mine({ status: 'OPEN' })`; **Cancel** per open order
   - **Accepted** — merged `api.orders.mine` for `ACCEPTED`, `IN_TRANSIT`, and `DELIVERED` (+ `detail` for `acceptedAt`, `deliveredAt`, and proof fields); status badges and lifecycle notes; **read-only proof** when submitted; pending/missing proof notes when appropriate; **no Cancel** (post-accept orders cannot be cancelled via this flow)

**Wayler (mode: Wayler on `/app`)**

1. Browse the **OPEN** feed — `api.orders.list({ status: 'OPEN', ...filters })`.
2. **Filter & sort** by type, pickup/dropoff, reward range; sort by reward, published date, or route.
3. **Map preview** on each card (pickup → dropoff markers and route line; geocoded from city/country).
4. **Accept** an OPEN order (not own order; KYC required).
5. Track **Accepted delivery requests** — `api.orders.accepted()` (all statuses where `acceptedWaylerId` = current user).
6. **Progress delivery** — **Start transit** (ACCEPTED → IN_TRANSIT), **Mark delivered** (IN_TRANSIT → DELIVERED) from the Wayler Accepted panel.
7. **Submit proof of delivery** — when **IN_TRANSIT** or **DELIVERED**, submit or update metadata proof (note + confirmation code) via `api.orders.submitProof(id, body)` from the Wayler Accepted panel.

### Privacy and KYC notes

- **DRAFT orders are private** — `GET /orders?status=DRAFT` is scoped to the current sender on the backend; other users cannot read another sender's drafts via `GET /orders/:id`.
- **Sender panels use `/orders/mine`** — the browser never receives other users' sent orders; no client-side `senderId` filtering.
- **Wayler marketplace feed** uses `GET /orders` with **OPEN** only (global feed for browsing/accepting).
- **KYC approval is required** to create orders, cancel orders, browse the Wayler feed, accept orders, progress delivery (start transit / mark delivered), submit proof of delivery, and load Sender/Wayler marketplace panels (enforced by `VerificationGuard` + `requireKycApproved`).

### Manual testing checklist

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User A** (Sender mode): create a draft, then **publish** it
- [ ] **User B** (Sender mode): Drafts / Published / Accepted panels do **not** show A's orders
- [ ] **User B** (Wayler mode): OPEN feed shows A's published order
- [ ] **User B** accepts A's OPEN order
- [ ] **User B** (Wayler): order appears in **Accepted delivery requests** panel after refresh
- [ ] **User A** (Sender): order appears in **Accepted Orders** panel after refresh
- [ ] **User B** (Sender): Accepted panel does **not** show A's sent order (only B's own sent orders via `/orders/mine`)
- [ ] **Map preview** visible on Wayler OPEN cards when pickup and dropoff city/country are set
- [ ] **User B** (Wayler): **Start transit** on accepted order → status **IN_TRANSIT**
- [ ] **User A** (Sender): refresh **Accepted Orders** → **IN_TRANSIT** badge and note
- [ ] **User B** (Wayler): **Mark delivered** → status **DELIVERED**
- [ ] **User A** (Sender): refresh **Accepted Orders** → **DELIVERED** badge, note, and `deliveredAt` when set
- [ ] **User A**: create DRAFT → **Cancel** in Drafts → order disappears
- [ ] **User A**: create + publish OPEN → **Cancel** in Published → order disappears
- [ ] **User B** (Wayler): refresh OPEN feed → cancelled order **not** visible
- [ ] **Accepted / IN_TRANSIT / DELIVERED** orders in Sender Accepted panel have **no Cancel** button

## Order cancellation

Senders can cancel their own delivery requests **before acceptance** — while status is **DRAFT** or **OPEN**. Once a Wayler accepts, cancellation through the normal Sender cancel flow is blocked (**409 Conflict**).

### Lifecycle diagram (with cancellation)

```text
                    cancel (Sender)
DRAFT ──────────────────────────────→ CANCELLED
  │
  │ publish (Sender)
  ▼
OPEN ───────────────────────────────→ CANCELLED
  │              cancel (Sender)
  │ accept (Wayler)
  ▼
ACCEPTED → IN_TRANSIT → DELIVERED
              ↑            ↑
       start-transit   mark-delivered
         (Wayler)        (Wayler)
```

### API route

| Method | Path                        | Transition                |
| ------ | --------------------------- | ------------------------- |
| POST   | `/api/v1/orders/:id/cancel` | DRAFT or OPEN → CANCELLED |

Requires JWT + **KYC approved**. Returns safe `DeliveryOrderDetail`.

### SDK

```typescript
api.orders.cancel(id); // POST /api/v1/orders/:id/cancel → DeliveryOrderDetail
```

### Rules

- **Sender only** — `senderId` must match the authenticated user; non-senders receive **404** (same privacy pattern as publish).
- **KYC required** — same `VerificationGuard` as create/publish/accept.
- **DRAFT and OPEN** can be cancelled.
- **ACCEPTED**, **IN_TRANSIT**, **DELIVERED**, and **already CANCELLED** return **409 Conflict** with a clear message.
- **`cancelledAt`** is set on successful cancel.
- **Visibility after cancel** — cancelled orders no longer appear in Sender **Drafts** (`status=DRAFT`), **Published** (`status=OPEN`), or Wayler **OPEN** feed after refresh.

### Frontend behavior

| Panel                | Behavior                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Sender Drafts**    | **Cancel** button per DRAFT; loading state **Cancelling…**; success removes order from list |
| **Sender Published** | **Cancel** button per OPEN order; same loading/success behavior                             |
| **Sender Accepted**  | **No Cancel** — ACCEPTED / IN_TRANSIT / DELIVERED are not cancellable here                  |

Publish and Cancel buttons are disabled while another Sender list action (publish or cancel) is in progress.

### Manual testing checklist (cancellation)

Use KYC-approved **User A** (Sender) and **User B** (Wayler):

- [ ] Create **DRAFT** → click **Cancel** in Drafts → order disappears
- [ ] Create + **publish** OPEN → click **Cancel** in Published → order disappears
- [ ] **User B** refreshes Wayler OPEN feed → cancelled order is **not** visible
- [ ] After **User B** accepts an order, **User A** has **no Cancel** on Sender Accepted panel
- [ ] **IN_TRANSIT** / **DELIVERED** orders likewise have **no Cancel** button

### Future milestones (cancellation)

- **Cancellation reasons** — structured reason codes / free-text from Sender
- **Refund / payment handling** — escrow reversal when payments exist
- **Dispute-based cancellation** after acceptance
- **Admin / arbitrator cancellation** — operator overrides
- **Notifications** to affected Waylers when an OPEN order is cancelled

## Delivery lifecycle after acceptance

Once a Wayler accepts an OPEN order, both parties track progress through **ACCEPTED → IN_TRANSIT → DELIVERED**. Only the **accepted Wayler** can advance status after accept; the Sender monitors via the **Accepted Orders** panel.

### Lifecycle diagram

```text
DRAFT → OPEN → ACCEPTED → IN_TRANSIT → DELIVERED
  │       │        ↑            ↑            ↑
  │    publish  accept    start-transit  mark-delivered
  │   (Sender) (Wayler)    (Wayler)       (Wayler)
  └── cancel ──→ CANCELLED
      (Sender; DRAFT or OPEN only — see Order cancellation)

Proof of delivery (metadata): accepted Wayler may submit/update while IN_TRANSIT or DELIVERED
— see Proof of delivery section.
```

### Who can do what

| Actor               | Action                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------- |
| **Sender**          | Create draft                                                                              |
| **Sender**          | Cancel DRAFT or OPEN → CANCELLED (before acceptance)                                      |
| **Sender**          | Publish draft → OPEN                                                                      |
| **Wayler**          | Accept OPEN order → ACCEPTED                                                              |
| **Accepted Wayler** | Start transit → IN_TRANSIT                                                                |
| **Accepted Wayler** | Mark delivered → DELIVERED                                                                |
| **Accepted Wayler** | Submit/update proof of delivery (IN_TRANSIT or DELIVERED)                                 |
| **Sender**          | Track lifecycle in **Sender Accepted** panel (badges, notes, `acceptedAt`, `deliveredAt`) |
| **Sender**          | View proof read-only when submitted (cannot edit)                                         |

The Sender **cannot** start transit or mark delivered. Wrong users (non-accepted Waylers) receive **403**; invalid status transitions return **409 Conflict**.

### API routes (post-accept progression)

| Method | Path                                | Transition             |
| ------ | ----------------------------------- | ---------------------- |
| POST   | `/api/v1/orders/:id/start-transit`  | ACCEPTED → IN_TRANSIT  |
| POST   | `/api/v1/orders/:id/mark-delivered` | IN_TRANSIT → DELIVERED |

Both routes require JWT + **KYC approved**. Only the order's `acceptedWaylerId` may call them.

### Rules

- **Only the accepted Wayler** can start transit or mark delivered.
- **Sender cannot progress** delivery status.
- **Wrong status transitions** (e.g. OPEN → start-transit, ACCEPTED → mark-delivered) return **409 Conflict**.
- **KYC required** for progression endpoints (same `VerificationGuard` as create/browse/accept).

### Frontend behavior

| Panel                                                                          | Behavior                                                                                                                                                                                        |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wayler Accepted** (`GET /orders/accepted`)                                   | **Start transit** when `ACCEPTED`; **Mark delivered** when `IN_TRANSIT`; proof form when `IN_TRANSIT` / `DELIVERED`; **Delivered** note when `DELIVERED`; buttons disabled while an action runs |
| **Sender Accepted** (`GET /orders/mine` for ACCEPTED / IN_TRANSIT / DELIVERED) | Status badges, contextual notes, `acceptedAt` and `deliveredAt` when available; read-only proof section when submitted; pending/missing proof notes otherwise                                   |

Wayler OPEN feed, Sender Drafts/Published panels, filters, maps, and KYC gating are unchanged.

### Manual testing checklist (lifecycle)

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User A** publishes an order
- [ ] **User B** accepts it (ACCEPTED)
- [ ] **User B** clicks **Start transit** in Wayler Accepted panel
- [ ] **User A** refreshes Sender Accepted panel → sees **IN_TRANSIT** badge and note
- [ ] **User B** clicks **Mark delivered**
- [ ] **User A** refreshes Sender Accepted panel → sees **DELIVERED** badge, note, and **deliveredAt** when set
- [ ] **User A** opens the notification bell → sees lifecycle notifications (see **Notifications** section)
- [ ] **User A** and **User B** can open chat from Accepted panels after accept (see **Chat / contact** section)

### Future milestones (delivery lifecycle)

- **Pickup timestamp** field (`pickedUpAt`) if product needs explicit pickup time
- **Photo / signature proof** of handoff — see **Proof of delivery** future milestones
- **Payment release** after delivery (escrow / Stripe)
- **Disputes / arbitration** on delivery completion
- **Real-time / push / email** on status changes — in-app notifications exist today; see **Notifications**

## Proof of delivery

Proof-of-delivery metadata supports **later payment release**, **disputes**, **admin/arbitrator review**, and **delivery confirmation** between Sender and Wayler. The current implementation is **metadata-only**: optional **note** and **confirmation code**. **Photo and signature proof** are planned for a later milestone.

### Schema fields (`DeliveryOrder`)

| Field                   | Type        | Description                                     |
| ----------------------- | ----------- | ----------------------------------------------- |
| `proofNote`             | `String?`   | Free-text delivery note from the Wayler         |
| `proofConfirmationCode` | `String?`   | Confirmation code (e.g. recipient handoff code) |
| `proofSubmittedAt`      | `DateTime?` | When proof was last submitted/updated           |
| `proofSubmittedById`    | `UUID?`     | User who submitted proof (accepted Wayler)      |

Proof fields are exposed on safe `DeliveryOrderDetail` responses and mapped in the orders API. The Wayler **accepted** list does not include proof fields; the frontend enriches IN_TRANSIT/DELIVERED rows via existing `GET /orders/:id` detail calls.

### API route

| Method | Path                       | Description                                            |
| ------ | -------------------------- | ------------------------------------------------------ |
| POST   | `/api/v1/orders/:id/proof` | Submit or update proof metadata (accepted Wayler only) |

Requires JWT + **KYC approved**. Body (at least one field required):

```json
{
  "note": "Left with building concierge",
  "confirmationCode": "AB12CD"
}
```

Validation (`submitDeliveryProofSchema`): `note` optional, trim, max 1000 chars; `confirmationCode` optional, trim, max 64 chars; **at least one** must be present; empty strings rejected.

Returns safe `DeliveryOrderDetail` on success.

### SDK

```typescript
api.orders.submitProof(id, {
  note?: string;
  confirmationCode?: string;
}); // POST /api/v1/orders/:id/proof → DeliveryOrderDetail
```

Type: `SubmitDeliveryProofInput` (from `@wayly/validation`, re-exported by `@wayly/sdk`).

### Rules

- **KYC required** — same `VerificationGuard` as other marketplace actions.
- **Accepted Wayler only** — `acceptedWaylerId` must match the authenticated user; others receive **403**.
- **Allowed statuses:** **IN_TRANSIT** and **DELIVERED** only.
- **ACCEPTED is too early** — returns **409** with message that delivery must be in transit first.
- **DRAFT / OPEN / CANCELLED** — **409** (proof only for in-transit or delivered orders).
- **Empty proof body rejected** — **400** if neither `note` nor `confirmationCode` is provided (after trim).
- **Re-submit/update allowed** — Wayler can submit again; omitted fields keep existing values; `proofSubmittedAt` refreshes.
- **Sender can view proof but cannot edit** — read-only in Sender Accepted panel; no submit/update controls for Senders.

### Frontend behavior

**Wayler (Accepted delivery requests panel)**

| Status         | Behavior                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------- |
| **ACCEPTED**   | Shows “Start transit before submitting proof”; no proof form                                                   |
| **IN_TRANSIT** | Proof section with note + confirmation code inputs; **Submit proof** or **Update proof**; existing proof shown |
| **DELIVERED**  | Same proof UI — proof remains visible and updateable by the Wayler                                             |

At least one non-empty field required before submit. Loading state while submitting; success message and panel refresh on success.

**Sender (Accepted Orders panel)**

| State                    | Behavior                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------- |
| **Proof submitted**      | Compact read-only “Proof of delivery” section: note, confirmation code, submitted time |
| **IN_TRANSIT, no proof** | “Proof has not been submitted yet.”                                                    |
| **DELIVERED, no proof**  | “No proof submitted yet.”                                                              |
| **ACCEPTED**             | No proof section (proof not applicable before transit)                                 |

Sender panels use existing `api.orders.detail()` enrichment — no additional API calls.

### Manual testing checklist (proof of delivery)

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User A** publishes an order
- [ ] **User B** accepts it
- [ ] **User B** tries proof before transit → API **409**; UI shows “Start transit before submitting proof” (no submit button)
- [ ] **User B** clicks **Start transit**
- [ ] **User B** submits proof with **note** + **confirmation code** → proof fields and timestamp appear in Wayler Accepted panel
- [ ] **User A** refreshes **Sender Accepted** panel → sees read-only proof (note, code, submitted time)
- [ ] **User B** updates proof (e.g. revised note) → timestamp refreshes; Sender sees updated proof after refresh
- [ ] **User B** marks **delivered** → proof section still visible and updateable on Wayler side
- [ ] **User A** can view proof but has **no edit** controls
- [ ] Empty proof body (both fields blank) → submit button disabled / API **400**
- [ ] **User A** opens notification bell → sees **PROOF_SUBMITTED** notification (see **Notifications**)

### Future milestones (proof of delivery)

- **`proofPhotoUrl`** — photo of handoff or package at delivery
- **`recipientSignatureUrl`** — captured signature image
- **Confirmation-code verification** by Sender or recipient (validate code matches)
- **Proof required before mark-delivered** — if product rules require proof before completion
- **Payment release** after proof and/or delivery (escrow / Stripe)
- **Dispute evidence bundle** — attach proof to dispute records
- **Admin / arbitrator proof review** — operator review of submitted proof
- **Push/email on proof updates** — Sender in-app **PROOF_SUBMITTED** notification exists today; see **Notifications**

## Notifications

Notifications keep users aware of **order lifecycle events**, **new chat messages**, and other platform activity. The current version is an **in-app notification list** in a bell/dropdown on `/app`, refreshed by **lightweight client-side polling** while the tab is visible. Order and chat notifications share the same bell, API, and SDK — **WebSocket/SSE, email, and push** are not implemented yet.

### Current notification flow

```text
Order lifecycle action OR chat message sent (backend)
        ↓
NotificationsService.createForUser()  →  Notification row in DB
        ↓
Notification API  (/api/v1/notifications*)
        ↓
@wayly/sdk  (api.notifications.*)
        ↓
NotificationBell on /app  (badge + dropdown)
        ↓
Polling refresh  (unread count every 30s; list every 60s while open)
```

Chat message notifications appear in the **same bell/dropdown** as order lifecycle notifications — no separate chat inbox. Recipients with the chat modal open also pick up new messages via **chat modal polling** (10s) without relying on the bell alone.

### Schema (`Notification`)

| Field            | Type               | Description                           |
| ---------------- | ------------------ | ------------------------------------- |
| `id`             | UUID               | Primary key                           |
| `userId`         | UUID               | Recipient user                        |
| `type`           | `NotificationType` | Event category (see enum below)       |
| `title`          | String             | Short headline                        |
| `body`           | String?            | Optional detail text                  |
| `relatedOrderId` | UUID?              | Linked delivery order when applicable |
| `readAt`         | DateTime?          | When marked read (`null` = unread)    |
| `createdAt`      | DateTime           | When the notification was created     |

Shared types: `NotificationSummary`, `NotificationListResponse` (`@wayly/types`).

### `NotificationType` enum

| Value              | Notes (current dispatch)                                                                                                   |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `ORDER_PUBLISHED`  | Reserved — not dispatched yet                                                                                              |
| `ORDER_ACCEPTED`   | **Dispatched** → Sender when Wayler accepts                                                                                |
| `ORDER_IN_TRANSIT` | **Dispatched** → Sender when transit starts                                                                                |
| `ORDER_DELIVERED`  | **Dispatched** → Sender when marked delivered                                                                              |
| `ORDER_CANCELLED`  | Reserved — cancel notifications not yet sent                                                                               |
| `PROOF_SUBMITTED`  | **Dispatched** → Sender when proof submitted                                                                               |
| `KYC_APPROVED`     | Reserved — KYC notifications not yet sent                                                                                  |
| `KYC_REJECTED`     | Reserved — KYC notifications not yet sent                                                                                  |
| `SYSTEM`           | **Dispatched** → other chat participant on new message (until `CHAT_MESSAGE` type exists); admin/system reserved for later |

### API routes

All routes require a valid **JWT** only — **KYC is not required** to list or mark notifications read. Base path: `/api/v1`.

| Method | Path                                 | Description                                        |
| ------ | ------------------------------------ | -------------------------------------------------- |
| GET    | `/api/v1/notifications`              | Paginated list (`page`, `limit`, `unreadOnly`)     |
| GET    | `/api/v1/notifications/unread-count` | `{ unreadTotal }` for badge                        |
| POST   | `/api/v1/notifications/:id/read`     | Mark one notification read → `NotificationSummary` |
| POST   | `/api/v1/notifications/read-all`     | Mark all notifications read for current user       |

Interactive docs: http://localhost:4000/docs (tag **notifications**).

### SDK

```typescript
api.notifications.list(query?);   // GET /notifications — page, limit, unreadOnly
api.notifications.unreadCount();  // GET /notifications/unread-count
api.notifications.markRead(id);   // POST /notifications/:id/read
api.notifications.markAllRead();  // POST /notifications/read-all
```

### Dispatch behavior (automatic creation)

The backend creates notifications **internally** when order lifecycle actions or chat messages succeed. Failures to create a notification are logged and do **not** block the underlying action.

**Order lifecycle** (after successful order transition):

| Order event            | `NotificationType` | Recipient  |
| ---------------------- | ------------------ | ---------- |
| Wayler accepts         | `ORDER_ACCEPTED`   | **Sender** |
| Wayler starts transit  | `ORDER_IN_TRANSIT` | **Sender** |
| Wayler submits proof   | `PROOF_SUBMITTED`  | **Sender** |
| Wayler marks delivered | `ORDER_DELIVERED`  | **Sender** |

**Chat messages** (after `POST /conversations/:id/messages` succeeds):

| Event            | `NotificationType` | Recipient                               |
| ---------------- | ------------------ | --------------------------------------- |
| New chat message | `SYSTEM`           | **Other participant** (Sender ↔ Wayler) |

Chat notification payload:

- **title:** `New chat message`
- **body:** `You received a new message about a delivery.` — or with a short message preview (max 80 chars) when available
- **relatedOrderId:** `conversation.orderId`
- **No self-notification** — the user who sent the message is not notified

A dedicated `CHAT_MESSAGE` enum value is planned for a later batch; `SYSTEM` is used today to avoid a schema migration.

**Not dispatched in the current version:**

- **No Wayler self-action notifications** — Waylers are not notified for their own accept/transit/proof/deliver actions.
- **No cancel notification** — Sender cancel (DRAFT/OPEN) does not create `ORDER_CANCELLED` yet.
- **No KYC / publish notifications** — enum values exist; dispatch comes later.
- **No admin/system broadcasts** — `SYSTEM` is used for chat today; operator messages later.

### Frontend behavior (`/app` header)

| Feature           | Behavior                                                                                              |
| ----------------- | ----------------------------------------------------------------------------------------------------- |
| **Bell**          | Outline button with bell icon; placed next to language selector / sign out                            |
| **Unread badge**  | Shown when `unreadTotal > 0` (caps display at `99+`)                                                  |
| **On app load**   | `api.notifications.unreadCount()` on mount; then polls every **30s** while tab visible                |
| **Dropdown open** | Loads latest **10** via `api.notifications.list({ page: 1, limit: 10 })`; also refreshes unread count |
| **List polling**  | While dropdown is open **and** tab visible, list polls every **60s** (silent background refresh)      |
| **Loading**       | Translated loading message on foreground list fetches only                                            |
| **Empty**         | Translated empty state when user has no notifications                                                 |
| **Error**         | Foreground list/action errors shown in dropdown; background poll failures are silent                  |
| **Each item**     | Title, optional body, `createdAt`, read/unread pill, mark-read if unread                              |
| **Refresh**       | Reloads list; disabled while loading or an action is in progress                                      |
| **Mark all read** | `api.notifications.markAllRead()` then refresh; disabled when no unread                               |
| **Mark one read** | `api.notifications.markRead(id)` then refresh list + unread count                                     |
| **KYC**           | **Not required** to open bell or read notifications                                                   |

i18n keys under `app.notifications.*` (8 locales).

### Polling behavior

| Behavior              | Detail                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Unread count**      | `api.notifications.unreadCount()` on mount, then every **30 seconds** while user is on `/app` and tab is **visible**      |
| **List refresh**      | Every **60 seconds** while dropdown is **open** and tab is **visible** (`api.notifications.list({ page: 1, limit: 10 })`) |
| **Tab hidden**        | Polling **paused** when `document.visibilityState` is `hidden` (intervals cleared)                                        |
| **Tab visible**       | Polling **resumed** when tab becomes visible again (immediate unread fetch + intervals restart)                           |
| **Overlap guard**     | Skips a new unread-count or list request if the same request type is already in flight                                    |
| **Also refreshes**    | Unread count after dropdown open, mark read, mark all read, and manual Refresh                                            |
| **Background errors** | Silent — badge/list keep last known values; main app unaffected                                                           |
| **Foreground errors** | Dropdown list loads and user actions (mark read / mark all read) still show translated errors                             |

No WebSocket/SSE, email, push, or notification preferences in the current version.

### Manual testing checklist (notifications)

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User A** publishes an order
- [ ] **User B** accepts → **User A** receives `ORDER_ACCEPTED` (check bell badge / dropdown)
- [ ] **User B** starts transit → **User A** receives `ORDER_IN_TRANSIT`
- [ ] **User B** submits proof → **User A** receives `PROOF_SUBMITTED`
- [ ] **User B** marks delivered → **User A** receives `ORDER_DELIVERED`
- [ ] **User A** opens bell → sees notifications with title, body (if any), timestamps
- [ ] **User A** marks **one** notification read → unread badge count decreases
- [ ] **User A** marks **all** read → unread badge disappears
- [ ] **User B** does **not** receive notifications for own accept/transit/proof/deliver actions
- [ ] User with **no notifications** sees empty state
- [ ] **KYC-unapproved** authenticated user can still open bell and read notifications

**Polling (auto-refresh):**

- [ ] **User A** on `/app`; **User B** triggers an order action → **User A** badge updates within **30 seconds** without page refresh
- [ ] **User A** opens dropdown → list loads; new notifications appear within **60 seconds** while dropdown stays open (no manual Refresh)
- [ ] **User A** switches to another browser tab (document hidden) → polling pauses
- [ ] **User A** returns to tab → polling resumes; badge updates again within 30 seconds if new notifications exist
- [ ] **User A** marks **all** read → badge stays at **0** after subsequent polls

**Chat message notifications:**

- [ ] **User A** and **User B** have an accepted-order conversation (see **Chat / contact**)
- [ ] **User A** sends a chat message → **User B** sees a new notification in bell/dropdown (`SYSTEM`, title “New chat message”)
- [ ] **User A** does **not** receive a notification for their own message
- [ ] **User B** replies → **User A** receives a notification
- [ ] **User B**'s unread badge updates within **30 seconds** via existing bell polling (no page refresh)

### Future milestones (notifications)

- **Dedicated `CHAT_MESSAGE` type** — replace `SYSTEM` for chat dispatch (schema enum addition)
- **WebSocket/SSE real-time delivery** — instant unread count and list updates (lightweight **polling exists today**)
- **Email / push notifications** — FCM, transactional email for offline users
- **Notification preferences** — per-type opt-in/out, quiet hours
- **Localized notification templates** — server-side title/body per user locale
- **KYC notifications** — `KYC_APPROVED`, `KYC_REJECTED` on provider/mock outcomes
- **Cancellation notifications** — `ORDER_CANCELLED` if post-accept cancellation is added later; notify Wayler when OPEN order is cancelled (see **Order cancellation**)
- **Admin / system notifications** — operator broadcasts (separate from chat `SYSTEM` dispatch today)
- **Push/email for chat** — offline chat alerts

## Chat / contact between Sender and Wayler

Chat lets the **Sender** and **accepted Wayler** coordinate delivery details for an order. The current version is **order-based in-app chat** — one conversation per accepted order, opened from Accepted panels on `/app`. The open chat modal **polls for new messages every 10 seconds** (visibility-aware). When a message is sent, the **other participant** receives an **in-app notification** in the shared bell/dropdown (`SYSTEM` type until `CHAT_MESSAGE` exists). **WebSocket/SSE, push/email, attachments, and read-receipt UI** are not implemented yet.

### Current chat flow

```text
Accepted order (ACCEPTED / IN_TRANSIT / DELIVERED)
        ↓
Open chat  (Sender or Wayler Accepted panel → api.conversations.forOrder)
        ↓
Send / read messages  (detail + send + markRead)
        ↓
Chat modal polling  (detail every 10s while open + tab visible → markRead)
        ↓
Other participant notified  (in-app bell/dropdown via SYSTEM notification)
```

### Purpose

- Coordinate pickup, handoff, and delivery questions between the two parties on an active job.
- Tied to a single `DeliveryOrder` — not a global inbox or open-marketplace chat.
- Lightweight **10s polling** keeps the open modal up to date; WebSocket/SSE and push/email alerts are planned for later milestones.

### Schema

**`Conversation`** (`conversations`)

| Field       | Type     | Description                                        |
| ----------- | -------- | -------------------------------------------------- |
| `id`        | UUID     | Primary key                                        |
| `orderId`   | UUID     | Unique — one conversation per order                |
| `senderId`  | UUID     | Order Sender (`DeliveryOrder.senderId`)            |
| `waylerId`  | UUID     | Accepted Wayler (`DeliveryOrder.acceptedWaylerId`) |
| `createdAt` | DateTime | When conversation was created                      |
| `updatedAt` | DateTime | Bumped when a new message is sent                  |

Relations: `order` → `DeliveryOrder`, `sender` / `wayler` → `User`, `messages` → `ChatMessage[]`.

**`ChatMessage`** (`chat_messages`)

| Field            | Type      | Description                    |
| ---------------- | --------- | ------------------------------ |
| `id`             | UUID      | Primary key                    |
| `conversationId` | UUID      | Parent conversation            |
| `senderId`       | UUID      | User who sent the message      |
| `body`           | String    | Message text (trimmed, 1–2000) |
| `readAt`         | DateTime? | When recipient marked read     |
| `createdAt`      | DateTime  | When message was sent          |

Shared types: `ConversationSummary`, `ChatMessageSummary`, `ConversationDetail`, `ConversationListResponse` (`@wayly/types`).

### API routes

All routes require **JWT + KYC approved**. Base path: `/api/v1`.

| Method | Path                                   | Description                                             |
| ------ | -------------------------------------- | ------------------------------------------------------- |
| POST   | `/api/v1/conversations/order/:orderId` | Create or fetch conversation for an eligible order      |
| GET    | `/api/v1/conversations`                | Paginated list for current user (`page`, `limit`)       |
| GET    | `/api/v1/conversations/:id`            | Conversation detail + message history (latest 100, asc) |
| POST   | `/api/v1/conversations/:id/messages`   | Send message — body `{ body: string }`                  |
| POST   | `/api/v1/conversations/:id/read`       | Mark unread messages from the other participant as read |

Interactive docs: http://localhost:4000/docs (tag **conversations**).

### SDK

```typescript
api.conversations.forOrder(orderId);              // POST /conversations/order/:orderId
api.conversations.list(query?);                   // GET /conversations
api.conversations.detail(id);                     // GET /conversations/:id
api.conversations.sendMessage(id, { body });      // POST /conversations/:id/messages
api.conversations.markRead(id);                   // POST /conversations/:id/read
```

### Rules

- **JWT + KYC required** on all conversation routes (`VerificationGuard`).
- **Participants only** — current user must be `senderId` or `waylerId` on the order/conversation; others receive **404** (privacy style).
- **Eligible order statuses:** **ACCEPTED**, **IN_TRANSIT**, **DELIVERED** only.
- **Not eligible:** **DRAFT**, **OPEN**, **CANCELLED** (and orders without `acceptedWaylerId`) → **409** on create/fetch by order.
- **One conversation per order** — `orderId` is unique; `forOrder` returns existing conversation if already created.
- **Message body** — trimmed, min 1, max 2000 characters (`sendChatMessageSchema`).
- **Mark read** — sets `readAt` on messages where `senderId !== currentUser` and `readAt` is null.
- **No WebSocket/SSE** — live updates use lightweight client polling in the open modal (see **Polling behavior** below).

### Chat notification behavior

When `POST /api/v1/conversations/:id/messages` succeeds:

| Sender                  | Recipient notified      | Self-notification |
| ----------------------- | ----------------------- | ----------------- |
| **Sender** (`senderId`) | **Wayler** (`waylerId`) | **No**            |
| **Wayler** (`waylerId`) | **Sender** (`senderId`) | **No**            |

- Notification type: **`SYSTEM`** (dedicated `CHAT_MESSAGE` planned later).
- **relatedOrderId:** linked to the conversation's order.
- Notification creation failure does **not** block message send (same pattern as order lifecycle dispatch).
- Recipient sees the notification in the **same bell/dropdown** as order notifications; existing **30s unread polling** picks up new chat alerts without page refresh.
- Recipient with chat modal open also sees new messages via **10s chat modal polling** (see below).

### Polling behavior (chat modal)

| Behavior              | Detail                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Detail refresh**    | `api.conversations.detail(id)` every **10 seconds** while modal is **open** and tab is **visible**           |
| **Mark read**         | `api.conversations.markRead(id)` after each **successful** background poll (and on open / Refresh / send)    |
| **Tab hidden**        | Polling **paused** when `document.visibilityState` is `hidden` (interval cleared)                            |
| **Tab visible**       | Polling **resumed** when tab becomes visible again (immediate catch-up poll + interval restarts)             |
| **Overlap guard**     | Skips a new detail request if one is already in flight; `markRead` skipped if already in flight              |
| **Manual Refresh**    | Still available — foreground reload with translated errors on failure                                        |
| **After send**        | Immediate foreground refresh after successful `sendMessage` (unchanged)                                      |
| **Background errors** | Silent — existing messages stay visible; input draft is not cleared                                          |
| **Foreground errors** | Open, Refresh, and send failures still show translated errors (`loadFailed`, `markReadFailed`, `sendFailed`) |
| **Typing**            | Background polls do **not** set loading state — message input stays enabled while polling                    |

No WebSocket/SSE in the current version.

### Frontend behavior (`/app`)

| Feature             | Behavior                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------- |
| **Open chat**       | Button on **Sender Accepted Orders** and **Wayler Accepted** panels                         |
| **Eligible orders** | `ACCEPTED`, `IN_TRANSIT`, `DELIVERED` only — no button on DRAFT/OPEN                        |
| **Open flow**       | `api.conversations.forOrder(order.id)` → opens compact chat modal                           |
| **On open**         | Foreground `api.conversations.detail(id)` + `api.conversations.markRead(id)`                |
| **Polling**         | Background detail refresh every **10s** while open + tab visible (see **Polling behavior**) |
| **Message list**    | You/Other bubbles, `createdAt`, empty state                                                 |
| **Send**            | Textarea max 2000 chars; Send disabled when body empty/whitespace-only                      |
| **After send**      | Clear input, immediate foreground reload + mark read                                        |
| **Refresh**         | Manual foreground reload detail + mark read                                                 |
| **Close**           | Dismiss modal; click outside to close; polling stops                                        |

i18n keys under `app.chat.*` (8 locales).

### Manual testing checklist (chat)

Use two KYC-approved users (**A** = Sender, **B** = Wayler) and optional **User C**:

- [ ] **User A** publishes an order
- [ ] **User B** accepts
- [ ] **User A** (Sender Accepted panel) → **Open chat** → conversation created
- [ ] **User A** sends a message
- [ ] **User B** (Wayler Accepted panel) → **Open chat** → sees **User A**'s message
- [ ] **User B** replies
- [ ] **User A** (chat modal open) sees **User B**'s reply within **10 seconds** without clicking Refresh
- [ ] **User A** clicks **Refresh** in chat → still works; sees latest messages
- [ ] **User A** switches to another browser tab (document hidden) → chat polling pauses
- [ ] **User A** returns to tab → chat polling resumes; new messages appear within **10 seconds**
- [ ] **User A** types a draft message while polling runs → input is **not** interrupted or cleared
- [ ] **User A** sends message → **User B** sees `SYSTEM` chat notification in bell (A does not)
- [ ] **User B** replies → **User A** sees chat notification in bell
- [ ] Bell unread badge updates within **30 seconds** without page refresh
- [ ] **User C** (not participant) → `POST /conversations/order/:orderId` or `GET /conversations/:id` → **404**
- [ ] DRAFT/OPEN orders → **no Open chat button** (not in Accepted panels / ineligible status)
- [ ] Empty/whitespace message → Send disabled
- [ ] KYC-unapproved user → conversation API blocked (**403** `KYC_REQUIRED`)

### Future milestones (chat)

- **Dedicated `CHAT_MESSAGE` notification type** — replace `SYSTEM` for chat dispatch
- **WebSocket/SSE** — instant message delivery (lightweight **10s polling exists today**)
- **Push / email notifications** for chat — offline alerts beyond in-app bell
- **Notification preferences** — per-type opt-in/out for chat vs order events
- **Typing indicators** — show when the other party is composing
- **Read receipt UI** — visual read state beyond backend `readAt` + `markRead`
- **File / image attachments** — proof photos, location pins, etc.
- **Moderation / reporting** — flag abusive messages
- **Admin / arbitrator access** — visibility during disputes
- **Localized system messages** — server-side templates for automated chat events

### Future milestones (marketplace)

- **Stripe checkout & real payout processing** — provider integration (mock/manual API + Sender/Wayler payment UI complete — see **Payment and escrow foundation**)
- **Disputes & arbitration**
- **Production geocoding** — backend geocoding cache / Mapbox (or other provider); lat/lng on create
- **Admin / arbitrator panel**
- **Subscriptions / paywall**
- **Mobile / PWA polish** and premium redesign (see **Premium dashboard UI foundation** — foundation pass complete)

## Payment and escrow foundation

Wayly is preparing for **monetization** with a database foundation, shared types, a **mock/manual payment API**, and **two-sided payment UI** on `/app` — **Sender Accepted payment controls** plus **Wayler Accepted read-only payout visibility** — for **payments**, **escrow**, **platform fees**, **payouts**, **refunds**, and an **audit ledger**. The current version uses provider **`MANUAL` only** — **no Stripe**, **no checkout**, **no card forms**, **no webhooks**, and **no real money movement**. Suitable for **local and business-flow testing** only.

### Purpose

- Prepare the data model for Sender → platform → Wayler money flows tied to `DeliveryOrder`.
- Exercise **authorize → hold escrow → release** transitions via mock API and Sender UI before Stripe integration.
- Let Waylers **observe** payment/payout status on accepted jobs (read-only) while Senders control mock actions.
- Record **platform fee** (mock 10%), **escrow hold**, and **payout creation** in the ledger.
- Provide an append-only-style **ledger** for audit and future dispute evidence.
- API/SDK/Swagger remain available for direct testing (`/docs`, tag **payments**).

### Schema

**Enums** (mirror `@wayly/types`):

| Enum              | Values (summary)                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `PaymentStatus`   | `PENDING`, `AUTHORIZED`, `HELD_IN_ESCROW`, `RELEASED`, `REFUNDED`, `FAILED`, `CANCELLED`                                     |
| `PaymentProvider` | `MANUAL`, `STRIPE`, `OTHER`                                                                                                  |
| `PayoutStatus`    | `PENDING`, `PROCESSING`, `PAID`, `FAILED`, `CANCELLED`                                                                       |
| `LedgerEntryType` | `PAYMENT_AUTHORIZED`, `ESCROW_HELD`, `PLATFORM_FEE_CHARGED`, `PAYOUT_CREATED`, `PAYOUT_PAID`, `REFUND_CREATED`, `ADJUSTMENT` |

**`PaymentIntent`** (`payment_intents`) — one per delivery order (`orderId` unique)

| Field                                                                               | Description                                       |
| ----------------------------------------------------------------------------------- | ------------------------------------------------- |
| `orderId`                                                                           | Linked `DeliveryOrder` (cascade delete)           |
| `payerId`                                                                           | Sender (payer)                                    |
| `payeeId`                                                                           | Accepted Wayler (nullable until accept)           |
| `provider`                                                                          | `MANUAL` default; `STRIPE` later                  |
| `status`                                                                            | Payment lifecycle (default `PENDING`)             |
| `currency`, `amount`                                                                | Charge amount (`Decimal(12,2)`)                   |
| `platformFeeAmount`, `escrowAmount`                                                 | Fee and escrow splits (nullable until calculated) |
| `providerPaymentId`                                                                 | External provider reference (e.g. Stripe PI id)   |
| `authorizedAt`, `escrowedAt`, `releasedAt`, `refundedAt`, `failedAt`, `cancelledAt` | Lifecycle timestamps                              |

**`Payout`** (`payouts`) — Wayler payout linked to a payment intent

| Field                                              | Description                          |
| -------------------------------------------------- | ------------------------------------ |
| `paymentIntentId`                                  | Optional parent intent               |
| `userId`                                           | Payee Wayler                         |
| `status`                                           | Payout lifecycle (default `PENDING`) |
| `currency`, `amount`                               | Payout amount                        |
| `provider`, `providerPayoutId`                     | Provider + external id               |
| `processedAt`, `paidAt`, `failedAt`, `cancelledAt` | Lifecycle timestamps                 |

**`LedgerEntry`** (`ledger_entries`) — immutable audit line

| Field                                              | Description                  |
| -------------------------------------------------- | ---------------------------- |
| `paymentIntentId`, `payoutId`, `orderId`, `userId` | Optional links for context   |
| `type`                                             | `LedgerEntryType`            |
| `currency`, `amount`                               | Signed movement amount       |
| `description`                                      | Optional human-readable note |
| `createdAt`                                        | When recorded                |

**Relations:**

- `User` — `paymentIntentsAsPayer`, `paymentIntentsAsPayee`, `payouts`, `ledgerEntries`
- `DeliveryOrder` — optional `paymentIntent` (1:1), `ledgerEntries[]`

**Shared types** (`@wayly/types`): `PaymentIntentSummary`, `PayoutSummary`, `LedgerEntrySummary` (amounts as `DecimalString`).

Migration: `apps/api/prisma/migrations/20260605163921_payment_escrow_foundation/migration.sql`

### Current mock payment lifecycle

```text
Order ACCEPTED or IN_TRANSIT (with reward + currency, accepted Wayler)
        ↓
Sender: mock-authorize (UI or POST)  →  PaymentIntent AUTHORIZED (MANUAL)
        ↓  LedgerEntry: PAYMENT_AUTHORIZED
Sender: mock-hold-escrow (UI or POST)  →  HELD_IN_ESCROW
        ↓  LedgerEntry: ESCROW_HELD, PLATFORM_FEE_CHARGED (10% mock fee)
Wayler: transit → submit proof → mark DELIVERED
        ↓
Sender: mock-release (UI or POST)  →  RELEASED + Payout PENDING (MANUAL)
        ↓  LedgerEntry: PAYOUT_CREATED
```

Sender Accepted panel buttons call the same SDK methods as the API routes above. Wayler Accepted panel loads the same intent read-only via `api.payments.forOrder(order.id)`.

**Fee split (mock):** `amount` = `offeredRewardAmount`; `platformFeeAmount` = 10%; `escrowAmount` = remainder.

### Two-sided mock payment UI flow

```text
User A (Sender)                          User B (Wayler)
        │                                        │
        │ creates order (reward + currency)      │
        │                                        │ accepts
        │ mock authorize → AUTHORIZED            │ sees "Payment not authorized yet"
        │ mock hold escrow → HELD_IN_ESCROW      │ refreshes → HELD_IN_ESCROW + amounts
        │                                        │ transit → proof → DELIVERED
        │ mock release → RELEASED + Payout PENDING │ refreshes → RELEASED / mock payout created
```

- **Sender** controls mock **authorize**, **hold escrow**, and **release** from **Accepted Orders**.
- **Wayler** **observes** status only — **no payment action buttons**.
- **Release** requires order **DELIVERED** and **`proofSubmittedAt`** (matches API).
- **Released** means a **Payout** was created in mock/manual mode (`PENDING`, provider **MANUAL**).

### API routes

All routes require **JWT + KYC approved**. Base path: `/api/v1`. Provider is **`MANUAL` only** — no Stripe calls.

| Method | Path                                              | Description                                                    |
| ------ | ------------------------------------------------- | -------------------------------------------------------------- |
| POST   | `/api/v1/payments/orders/:orderId/mock-authorize` | Sender creates/updates intent → `AUTHORIZED`                   |
| POST   | `/api/v1/payments/:id/mock-hold-escrow`           | Payer moves `AUTHORIZED` → `HELD_IN_ESCROW`                    |
| POST   | `/api/v1/payments/:id/mock-release`               | Payer/Sender releases escrow → `RELEASED` + `Payout` `PENDING` |
| GET    | `/api/v1/payments/orders/:orderId`                | Sender or accepted Wayler reads intent (`404` if none)         |

Interactive docs: http://localhost:4000/docs (tag **payments**).

### SDK

```typescript
api.payments.mockAuthorizeOrder(orderId); // POST /payments/orders/:orderId/mock-authorize
api.payments.mockHoldEscrow(paymentIntentId); // POST /payments/:id/mock-hold-escrow
api.payments.mockRelease(paymentIntentId); // POST /payments/:id/mock-release
api.payments.forOrder(orderId); // GET /payments/orders/:orderId
```

Returns `PaymentIntentSummary` from `@wayly/types`.

### Frontend mock payment controls (Sender Accepted panel)

On `/app` in **Sender mode**, each order in **Accepted Orders** includes a **Payment** panel. The panel loads the related intent via `api.payments.forOrder(order.id)` alongside existing order detail enrichment.

**Sender UI flow:**

```text
User A creates order with reward + currency
        ↓
User B accepts
        ↓
User A opens Sender Accepted panel
        ↓
Mock authorize payment → Authorized
        ↓
Mock hold escrow → Held in escrow
        ↓
User B: transit → submit proof → mark DELIVERED
        ↓
User A refreshes Sender Accepted panel
        ↓
Mock release payout → Released (payout pending, mock/manual)
```

| State                                     | UI behavior                                                                                                                                                                                                                            |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No intent** (`404` from `forOrder`)     | Status **Not authorized** — not shown as a scary error. **Mock authorize payment** when order is **ACCEPTED** or **IN_TRANSIT**.                                                                                                       |
| **AUTHORIZED**                            | Status **Authorized**. **Mock hold escrow** button. Shows **provider**, **amount**, **currency** when available.                                                                                                                       |
| **HELD_IN_ESCROW**                        | Status **Held in escrow**. Shows **platform fee** and **escrow amount** after hold. **Mock release payout** only when order is **DELIVERED** and **`proofSubmittedAt`** exists; otherwise a note that delivery and proof are required. |
| **RELEASED**                              | Status **Released** with payout-created note (mock/manual, payout **PENDING**). No action buttons.                                                                                                                                     |
| **REFUNDED** / **FAILED** / **CANCELLED** | Status label only — no action buttons for now.                                                                                                                                                                                         |

**Frontend rules:**

- **Sender only** — mock payment actions are Sender controls on accepted sent orders.
- **Release gated** — requires **DELIVERED** order and **`proofSubmittedAt`** (matches API).
- **Missing intent** — `404` from `forOrder` is treated as **Not authorized**, not a panel-breaking error.
- **Non-404 load failures** — per-order `loadFailed` message; panel otherwise continues.
- **Mock/manual only** — buttons call existing SDK methods; no Stripe, checkout, or card UI.

i18n keys: `app.senderPanel.payment.*` (8 locales).

### Wayler payment/payout visibility (Accepted panel, read-only)

On `/app` in **Wayler mode**, each job in **Accepted delivery requests** includes a compact **Payment / payout** section. The panel loads the related intent via `api.payments.forOrder(order.id)` alongside existing proof/status enrichment. **Read-only only** — **no payment action buttons**.

| State                                     | UI behavior                                                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **No intent** (`404` from `forOrder`)     | Muted note: **Payment not authorized yet** — not shown as a scary error.                                                                                |
| **AUTHORIZED**                            | Status **Authorized** + note: Sender has mock-authorized payment. Shows **provider**, **status**, **currency**, **amount**.                             |
| **HELD_IN_ESCROW**                        | Status **Held in escrow** + note: escrow held; payout releasable after delivery and proof. Shows **platform fee** and **escrow amount** when available. |
| **RELEASED**                              | Status **Released** + note: **mock payout has been created** (`Payout` **PENDING**, **MANUAL**).                                                        |
| **REFUNDED** / **FAILED** / **CANCELLED** | Status label only — no action buttons.                                                                                                                  |

**Wayler frontend rules:**

- **Read-only** — Waylers cannot authorize, hold, or release payments in this batch.
- **Missing intent** — `404` from `forOrder` → **Payment not authorized yet**, not a panel-breaking error.
- **Non-404 load failures** — per-order `loadFailed` message; panel otherwise continues.
- **Refresh** — Wayler must refresh **Accepted delivery requests** to see Sender payment updates.

i18n keys: `app.waylerFeed.acceptedPanel.payment.*` (8 locales).

### Rules (mock/manual)

| Step                 | Rules                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **mock-authorize**   | Caller must be **order Sender** (`senderId`). Order **ACCEPTED** or **IN_TRANSIT** only (not DRAFT/OPEN/CANCELLED/DELIVERED). Requires `acceptedWaylerId`, `offeredRewardAmount`, and `currency` (else **409**). Creates or updates one `PaymentIntent` per order. **409** if already `RELEASED`/`REFUNDED`. Idempotent return if already `AUTHORIZED`/`HELD_IN_ESCROW`. |
| **mock-hold-escrow** | Caller must be **payerId**. Status must be **AUTHORIZED** → sets **HELD_IN_ESCROW**, `escrowedAt`.                                                                                                                                                                                                                                                                       |
| **mock-release**     | Caller must be **payerId** or **order Sender**. Status **HELD_IN_ESCROW**. Order **DELIVERED** and **`proofSubmittedAt`** required (else **409**). Sets **RELEASED**, creates **Payout** (`PENDING`, `MANUAL`, amount = `escrowAmount`).                                                                                                                                 |
| **forOrder (GET)**   | Caller must be **Sender** or **accepted Wayler**.                                                                                                                                                                                                                                                                                                                        |

**Ledger entries created:**

| Action           | `LedgerEntryType`                                                    |
| ---------------- | -------------------------------------------------------------------- |
| mock-authorize   | `PAYMENT_AUTHORIZED` (full amount)                                   |
| mock-hold-escrow | `ESCROW_HELD` (escrow amount); `PLATFORM_FEE_CHARGED` (platform fee) |
| mock-release     | `PAYOUT_CREATED` (escrow amount, payee user)                         |

### Safety notes

- **`MANUAL` provider only** — no payment processor integration.
- **No Stripe** — no env vars, webhooks, or Connect calls.
- **No checkout UI** — no card forms, payment links, or Stripe Elements.
- **No real money movement** — database state transitions for business-flow validation.
- **No real payout processing** — `Payout` stays **PENDING** / **MANUAL** after mock release.
- **For local/business-flow testing only** — not production payment processing.

### Current scope

| Included                                                     | Not included (yet)                |
| ------------------------------------------------------------ | --------------------------------- |
| Prisma enums + models + migration                            | Stripe / Connect integration      |
| `@wayly/types` payment summaries                             | Real Wayler payout dashboard      |
| Mock/manual payment API + SDK                                | Checkout flow / card forms        |
| Sender Accepted mock payment UI (authorize / hold / release) | Payout method setup               |
| Wayler Accepted read-only payment/payout visibility          | Payout processing (`PAID`)        |
| Escrow release rules (mock, proof-gated)                     | Refund workflow                   |
| Ledger on authorize/hold/release                             | Payment webhooks                  |
| Two-sided mock payment UI (Sender acts, Wayler observes)     | Payout history / failure handling |
|                                                              | Subscription / paywall UI         |
|                                                              | Real money movement               |

### Manual testing checklist (mock payments — API)

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User A** creates order with **reward amount** and **currency**
- [ ] **User B** accepts → order `ACCEPTED`
- [ ] **User A** `POST mock-authorize` → `PaymentIntent` **AUTHORIZED**, `provider` **MANUAL**
- [ ] **User A** `POST mock-hold-escrow` → status **HELD_IN_ESCROW**
- [ ] **User B** starts transit
- [ ] **User B** submits proof
- [ ] **User B** marks delivered
- [ ] **User A** `POST mock-release` → status **RELEASED**; **Payout** created **PENDING**
- [ ] `GET /payments/orders/:orderId` returns intent for **A** and **B**
- [ ] **User B** cannot `mock-authorize` (not payer) → **403**
- [ ] `mock-release` before **DELIVERED** or without **proof** → **409**
- [ ] `pnpm build`, `pnpm lint`, `pnpm typecheck` pass

### Manual visual testing checklist (Sender Accepted payment UI)

On `/app` in **Sender mode** with the same two users:

- [ ] Accepted order **without** payment intent shows **Not authorized** (no error banner for `404`)
- [ ] **Mock authorize payment** changes status to **Authorized**
- [ ] **Mock hold escrow** changes status to **Held in escrow**
- [ ] **Release** button hidden or blocked until **DELIVERED** + proof submitted (note shown)
- [ ] After **User B** delivers with proof, **User A** refreshes → **Mock release payout** available
- [ ] Release changes status to **Released** with payout-pending note (mock/manual)
- [ ] **Amount**, **platform fee**, **escrow amount**, **currency**, and **provider** display correctly
- [ ] No Stripe, checkout, or card-form UI appears anywhere on `/app`

### Manual visual testing checklist (Wayler Accepted payout visibility)

On `/app` in **Wayler mode** with the same two users (**A** = Sender, **B** = Wayler):

- [ ] **User A** creates order with **reward** and **currency**; **User B** accepts
- [ ] **User B** opens **Accepted delivery requests** → **Payment not authorized yet**
- [ ] **User A** mock-authorizes and mock-holds escrow
- [ ] **User B** refreshes → status **Held in escrow** with **amount**, **platform fee**, **escrow amount**, **currency**, **provider**
- [ ] **User B** delivers with proof; **User A** mock-releases payout
- [ ] **User B** refreshes → status **Released** / **mock payout created** note
- [ ] **User B** panel has **no** payment action buttons (authorize / hold / release)
- [ ] No Stripe, checkout, or card-form UI on Wayler panel

### Intended production flow (future)

```text
Sender pays via Stripe checkout
        ↓
AUTHORIZED → HELD_IN_ESCROW (platform fee)
        ↓
DELIVERED + proof → RELEASED → Payout PAID
        ↓
Refunds / disputes → holds, arbitrator review
```

Mock API and two-sided payment UI (Sender controls + Wayler visibility) today exercise the middle lifecycle without a payment processor.

### Future milestones (payments & monetization)

- **Real Wayler payout dashboard** — earnings summary, pending/paid payouts beyond per-order read-only panel
- **Payout method setup** — bank/account onboarding for Waylers
- **Stripe Connect / provider payout integration** — real payee onboarding and transfers
- **Payout processing** — `Payout` → `PAID` (today: **PENDING** / **MANUAL** after mock release)
- **Payout history** — searchable ledger and payout timeline for Waylers
- **Payout failure handling** — retry, notifications, and status recovery
- **Stripe checkout / PaymentIntent** — real Sender authorize and capture; `provider` **STRIPE**
- **Stripe webhooks** — async status sync
- **Refund workflow** — partial/full refunds; `REFUNDED` + ledger lines
- **Dispute-aware payout hold** — block release/payout while order `DISPUTED`
- **Platform fee settings** — configurable percentage/fixed (today: hard-coded 10% mock)
- **Admin / arbitrator payout review** — ledger + intent + payout visibility during disputes
- **Subscriptions / paywall UI** — Wayler access packages (separate from per-order escrow)

## Premium dashboard UI foundation

The authenticated **`/app` dashboard** has a **premium visual foundation** so the product feels like a real commercial global P2P delivery marketplace — not a prototype wireframe. The pass improves **visual hierarchy**, **readability**, **mobile layout**, and **user confidence** while keeping all **business logic unchanged**.

### Purpose

- Make `/app` feel like a serious, modern delivery product users can trust.
- Strengthen section hierarchy, card separation, and status clarity across Sender and Wayler modes.
- Improve mobile spacing and prevent horizontal overflow on narrow viewports.
- **No changes** to data loading, API calls, KYC gates, chat, notifications, maps, or form validation.

### Current UI improvements

| Area               | What shipped                                                                                           |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| **App shell**      | Premium background — subtle radial gradients + faint dot grid (`wayly-app-shell`)                      |
| **Header**         | Glass-style header with backdrop blur; wrapping language, notification bell, and sign-out actions      |
| **Panels / cards** | Consistent glass-style panels on Sender/Wayler, KYC, Account, and order sections (`wayly-app-panel`)   |
| **Order cards**    | Unified order list cards across feed, drafts, published, and accepted panels (`wayly-order-card`)      |
| **Status badges**  | Color-coded pills for **DRAFT**, **OPEN**, **ACCEPTED**, **IN_TRANSIT**, **DELIVERED**, **CANCELLED**  |
| **Alerts**         | Standardized success / danger / info alert styles for errors, KYC notices, and success messages        |
| **Actions**        | Consistent action button grouping (`wayly-action-group`) — primary, secondary, outline/danger patterns |
| **Mobile**         | Tighter responsive spacing, `min-w-0` / `truncate` / `flex-wrap`, `overflow-x: clip` on shell          |

Implementation: `apps/web/src/app/(app)/app/page.tsx` + utility classes in `apps/web/src/app/globals.css`.

### Scope note

- **Frontend visual polish only** — CSS/className and presentational structure on `/app`.
- **No API, SDK, Prisma, backend, or business logic changes** in this batch.
- Not a full design system or landing-page redesign — a focused dashboard foundation pass.

### Manual visual checklist

- [ ] `/app` loads normally after sign-in
- [ ] **Sender mode** — create draft, drafts/published/accepted panels render with new cards and badges
- [ ] **Wayler mode** — OPEN feed, accepted panel, maps, and filters render correctly
- [ ] **Notification bell** opens and dropdown works
- [ ] **Chat modal** opens from Accepted panels and send/refresh works
- [ ] **Maps** still render in Wayler feed cards
- [ ] **Forms** (create order, proof, filters) remain usable; inputs not obscured
- [ ] **Mobile width** (~375px) — no horizontal overflow; header actions wrap cleanly
- [ ] **Text contrast** — status badges, alerts, and body text remain readable in light mode

### Future UI milestones

- **Full landing page redesign** — marketing site polish beyond functional foundation
- **Premium onboarding / KYC flow** — guided verification UX
- **World-map hero / dashboard** — optional global logistics visual on dashboard or home
- **Mobile / PWA polish** — install prompts, touch targets, offline shell refinements
- **Empty-state illustrations** — drafts, feed, notifications, chat
- **Animation / microinteraction pass** — transitions, loading states, feed enter/exit polish
- **Design system components** — shared primitives beyond ad-hoc `/app` utilities
- **Dark mode** — optional later; token architecture already supports `.dark`

## Common scripts

| Command                          | Description                        |
| -------------------------------- | ---------------------------------- |
| `pnpm dev`                       | Run all apps in dev mode (Turbo).  |
| `pnpm build`                     | Build all workspaces.              |
| `pnpm lint`                      | Lint all workspaces.               |
| `pnpm typecheck`                 | Type-check all workspaces.         |
| `pnpm test`                      | Run tests across workspaces.       |
| `pnpm format`                    | Format the repo with Prettier.     |
| `pnpm docker:up` / `docker:down` | Start/stop local Postgres + Redis. |

## Conventions

- **Commits:** Conventional Commits (enforced by commitlint), e.g. `feat(api): add health module`.
- **Line endings:** LF everywhere (`.gitattributes`), enforced for cross-platform consistency.
- **Versions:** shared dependency versions live in the pnpm **catalog** (`pnpm-workspace.yaml`).

## Milestone roadmap

- **M0 — Foundation:** monorepo, tooling, shared config, design tokens, Docker Compose. ✅
- **M1 — Auth & Users:** JWT auth, refresh sessions (httpOnly cookie), users profile, SDK + frontend auth, password toggle, basic i18n. ✅ (foundation complete; polish ongoing)
- **M2 — KYC gate (mocked):** schema + mock backend, SDK, `/app` status panel, dev-only mock approve/reject. ✅ (mock flow complete; real Sumsub/provider swap later)
- **M3 — Design system & app shell:** Sender/Wayler mode switcher on `/app` (frontend-only, localStorage). ✅
- **M4 — Marketplace (Sender → Wayler):** `DeliveryOrder` schema, draft/create/publish/**cancel**, Wayler OPEN feed (filters, sort, Leaflet map previews), accept, **ACCEPTED → IN_TRANSIT → DELIVERED** progression, **metadata proof-of-delivery** (submit + read-only Sender view), Wayler accepted panel controls, Sender lifecycle visibility + cancel UI, private `GET /orders/mine`, **in-app notifications** (schema, API, SDK, order lifecycle dispatch, **chat message dispatch** via `SYSTEM`, bell/dropdown, polling), **order-based chat** (schema, API, SDK, Sender/Wayler Accepted panel UI, modal on `/app`, **10s chat modal polling**), **premium `/app` dashboard UI foundation** (shell, cards, badges, alerts). ✅ (core loop + cancellation + lifecycle + metadata proof + notifications + chat + chat in-app alerts + chat polling + dashboard visual foundation complete; photo/signature proof, WebSocket/SSE/push/email, `CHAT_MESSAGE` type, payment processing/disputes later)
- **M5 — Payments & escrow:** **payment/escrow schema** (`PaymentIntent`, `Payout`, `LedgerEntry`, enums), shared types, **mock/manual payment API + SDK** (`MANUAL` provider — authorize, hold escrow, release, read by order), **Sender Accepted mock payment UI** (authorize / hold / release, proof-gated release), **Wayler Accepted read-only payment/payout visibility** (status + amounts, no action buttons; 8-locale i18n on both panels). ✅ (schema + mock API + two-sided UI complete; no Stripe/real money). Next: real Wayler payout dashboard, Stripe checkout, Connect/payout processing, webhooks, refunds.
- **M6–M15:** photo/signature proof, confirmation-code verification, cancellation reasons, pickup timestamps, production geocoding, `CHAT_MESSAGE` type, WebSocket/SSE chat, push/email, moderation, **Stripe checkout + webhooks + payout processing + refunds**, subscriptions/paywall, offline + PDF agreements, disputes, WebSocket/SSE notification preferences, admin/arbitrator panel, real-provider KYC swap, **full landing/onboarding UI redesign**, world-map hero, empty-state illustrations, design system expansion, hardening, launch.

### Reserved for a future milestone — Reputation System

Architecture space is **reserved** (not implemented) for a future `ReputationModule` (backend) + reputation surfaces (frontend) supporting:

- ratings
- reviews
- delivery success rate
- reputation score

It will plug into the existing Users/Orders modules and shared `types`/`validation`/`sdk` packages without restructuring.
