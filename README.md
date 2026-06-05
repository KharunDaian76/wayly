# Wayly

Cross-platform **P2P delivery platform** connecting Senders and Waylers directly — international/intercity and local city delivery — with mandatory KYC, escrow + offline payment flows, real-time chat, maps, and a premium mobile-first PWA experience.

> **Status:** M1 (Auth & Users), **M2 mock KYC**, **M3 Sender/Wayler mode switcher**, and **M4 marketplace flow** (draft → publish/cancel → Wayler OPEN feed → accept → **in-transit → delivered**, Sender/Wayler tracking panels, Wayler filters/maps) are complete. Payments, escrow, chat, disputes, and admin are future milestones.

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

| Area                                                           | Status                          |
| -------------------------------------------------------------- | ------------------------------- |
| Auth backend (register, login, refresh, logout, `/users/me`)   | Complete                        |
| Auth frontend (`/login`, `/register`, `/app`, session restore) | Complete                        |
| Password visibility toggle                                     | Complete                        |
| Basic language support (8 locales, localStorage preference)    | Complete                        |
| KYC mock flow (schema, API, SDK, `/app` panel)                 | Complete (M2)                   |
| Real KYC provider (Sumsub)                                     | Not started (future M2 batch)   |
| Marketplace orders (M4 draft/publish/cancel/accept/lifecycle)  | Complete (M4)                   |
| Payments, escrow, chat, disputes, admin                        | Not started (future milestones) |

The current frontend is a **functional foundation**, not final premium design.

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
- **Real order/feed/chat blocking** — enforce KYC gates in orders, marketplace, and chat modules (flags exist; downstream features are not built yet)

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

M4 delivers the first end-to-end **marketplace loop**: Senders create and publish delivery requests; Waylers browse the public OPEN feed, preview routes on a map, and accept jobs. Both sides have tracking panels on `/app`. **No payments, escrow, chat, disputes, admin, or subscriptions yet.**

Prerequisites: same as M1/M2/M3 — Docker running, migrations applied, `pnpm dev` up, and **KYC approved** (mock approve in dev) for marketplace actions.

### Current marketplace status

| Area                                                                 | Status   |
| -------------------------------------------------------------------- | -------- |
| `DeliveryOrder` schema (Prisma)                                      | Complete |
| Create draft (`POST /orders`)                                        | Complete |
| Cancel DRAFT/OPEN (`POST /orders/:id/cancel`, Sender only)           | Complete |
| Sender Cancel UI (Drafts + Published panels)                         | Complete |
| Publish draft → OPEN (`POST /orders/:id/publish`)                    | Complete |
| Wayler OPEN feed (`GET /orders`, default `status=OPEN`)              | Complete |
| Accept OPEN order (`POST /orders/:id/accept`)                        | Complete |
| Start transit (`POST /orders/:id/start-transit`)                     | Complete |
| Mark delivered (`POST /orders/:id/mark-delivered`)                   | Complete |
| Wayler accepted panel (`GET /orders/accepted`) + progression         | Complete |
| Sender tracking panels (Drafts / Published / Accepted)               | Complete |
| Sender Accepted lifecycle visibility (ACCEPTED/IN_TRANSIT/DELIVERED) | Complete |
| Wayler feed filters & sort (type, location, reward, sort)            | Complete |
| Wayler map route previews (Leaflet + city/country geocoding)         | Complete |
| Sender privacy endpoint (`GET /orders/mine`)                         | Complete |

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

Interactive docs: http://localhost:4000/docs (tag **orders**).

SDK: `api.orders.create`, `list`, `mine`, `accepted`, `detail`, `publish`, `cancel`, `accept`, `startTransit`, `markDelivered`.

### User flow

**Sender (mode: Sender on `/app`)**

1. Create a **draft** delivery request (title, type, route, reward, etc.).
2. **Cancel** a draft or published (OPEN) order before acceptance — **Cancel** button in Drafts / Published panels → `api.orders.cancel(id)`.
3. **Publish** the draft → status becomes **OPEN** (visible on the Wayler marketplace).
4. Track orders in three panels:
   - **Drafts** — `api.orders.mine({ status: 'DRAFT' })`; **Cancel** per draft
   - **Published** — `api.orders.mine({ status: 'OPEN' })`; **Cancel** per open order
   - **Accepted** — merged `api.orders.mine` for `ACCEPTED`, `IN_TRANSIT`, and `DELIVERED` (+ `detail` for `acceptedAt` / `deliveredAt`); status badges and lifecycle notes; **no Cancel** (post-accept orders cannot be cancelled via this flow)

**Wayler (mode: Wayler on `/app`)**

1. Browse the **OPEN** feed — `api.orders.list({ status: 'OPEN', ...filters })`.
2. **Filter & sort** by type, pickup/dropoff, reward range; sort by reward, published date, or route.
3. **Map preview** on each card (pickup → dropoff markers and route line; geocoded from city/country).
4. **Accept** an OPEN order (not own order; KYC required).
5. Track **Accepted delivery requests** — `api.orders.accepted()` (all statuses where `acceptedWaylerId` = current user).
6. **Progress delivery** — **Start transit** (ACCEPTED → IN_TRANSIT), **Mark delivered** (IN_TRANSIT → DELIVERED) from the Wayler Accepted panel.

### Privacy and KYC notes

- **DRAFT orders are private** — `GET /orders?status=DRAFT` is scoped to the current sender on the backend; other users cannot read another sender's drafts via `GET /orders/:id`.
- **Sender panels use `/orders/mine`** — the browser never receives other users' sent orders; no client-side `senderId` filtering.
- **Wayler marketplace feed** uses `GET /orders` with **OPEN** only (global feed for browsing/accepting).
- **KYC approval is required** to create orders, cancel orders, browse the Wayler feed, accept orders, progress delivery (start transit / mark delivered), and load Sender/Wayler marketplace panels (enforced by `VerificationGuard` + `requireKycApproved`).

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
| **Sender**          | Track lifecycle in **Sender Accepted** panel (badges, notes, `acceptedAt`, `deliveredAt`) |

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

| Panel                                                                          | Behavior                                                                                                                                            |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wayler Accepted** (`GET /orders/accepted`)                                   | **Start transit** when `ACCEPTED`; **Mark delivered** when `IN_TRANSIT`; **Delivered** note when `DELIVERED`; buttons disabled while an action runs |
| **Sender Accepted** (`GET /orders/mine` for ACCEPTED / IN_TRANSIT / DELIVERED) | Status badges, contextual notes, `acceptedAt` and `deliveredAt` when available                                                                      |

Wayler OPEN feed, Sender Drafts/Published panels, filters, maps, and KYC gating are unchanged.

### Manual testing checklist (lifecycle)

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User A** publishes an order
- [ ] **User B** accepts it (ACCEPTED)
- [ ] **User B** clicks **Start transit** in Wayler Accepted panel
- [ ] **User A** refreshes Sender Accepted panel → sees **IN_TRANSIT** badge and note
- [ ] **User B** clicks **Mark delivered**
- [ ] **User A** refreshes Sender Accepted panel → sees **DELIVERED** badge, note, and **deliveredAt** when set

### Future milestones (delivery lifecycle)

- **Pickup timestamp** field (`pickedUpAt`) if product needs explicit pickup time
- **Confirmation code / proof of delivery**
- **Photo / signature proof** of handoff
- **Payment release** after delivery (escrow / Stripe)
- **Disputes / arbitration** on delivery completion
- **Notifications** (push/email) on status changes

### Future milestones (marketplace)

- **Chat / contact** between Sender and Wayler after accept
- **Payments & escrow** (Stripe, offline flows)
- **Disputes & arbitration**
- **Production geocoding** — backend geocoding cache / Mapbox (or other provider); lat/lng on create
- **Admin / arbitrator panel**
- **Subscriptions / paywall**
- **Mobile / PWA polish** and premium redesign

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
- **M4 — Marketplace (Sender → Wayler):** `DeliveryOrder` schema, draft/create/publish/**cancel**, Wayler OPEN feed (filters, sort, Leaflet map previews), accept, **ACCEPTED → IN_TRANSIT → DELIVERED** progression, Wayler accepted panel controls, Sender lifecycle visibility + cancel UI, private `GET /orders/mine`. ✅ (core loop + cancellation + post-accept lifecycle complete; payments/chat/disputes later)
- **M5–M15:** cancellation reasons/refunds, pickup/proof-of-delivery, production geocoding, realtime chat, subscriptions, escrow/Stripe, offline + PDF agreements, disputes, notifications, admin panel, real-provider KYC swap, hardening, launch.

### Reserved for a future milestone — Reputation System

Architecture space is **reserved** (not implemented) for a future `ReputationModule` (backend) + reputation surfaces (frontend) supporting:

- ratings
- reviews
- delivery success rate
- reputation score

It will plug into the existing Users/Orders modules and shared `types`/`validation`/`sdk` packages without restructuring.
