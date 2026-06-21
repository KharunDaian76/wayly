# Wayly

Cross-platform **two-sided P2P delivery marketplace** connecting Senders and Waylers directly — Senders post delivery requests; Waylers publish local availability and trip routes — with international/intercity and local city delivery, mandatory KYC, escrow + offline payment flows, real-time chat, maps, and a premium mobile-first PWA experience.

> **Status:** M1 (Auth & Users), **M2 mock KYC**, **M3 Sender/Wayler mode switcher**, and **M4 marketplace flow** (draft → publish/cancel → Wayler OPEN feed → accept → **in-transit → delivered**, **metadata proof-of-delivery** submit/view, Sender/Wayler tracking panels, Wayler filters/maps, **Sender Published Orders panel states** (loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale cards on error when cached; shared `panel-status-states.tsx`), **Wayler open orders feed panel states** (loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale cards on error when cached; shared `panel-status-states.tsx`), **Accepted delivery requests panel states** (Sender + Wayler — loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale cards on error when cached), **in-app notifications** — schema, API, SDK, Sender lifecycle dispatch, **chat message dispatch**, **mock payment dispatch to Wayler**, bell/dropdown, **notification bell / popover panel states** (loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale notification cards on error when cached; mark-read loading/disabled; shared `panel-status-states.tsx`), polling, **order-linked notification click navigation** (mark unread as read, close popover, focus Accepted delivery requests panel, scroll/highlight matching card, **open Accepted Order Details drawer** for the same **`DeliveryOrder.id`** — not `availabilityRequestId`), **Accepted Order Details drawer** (View details on Sender/Wayler accepted cards — frontend-only drawer/modal on `/app`, existing `GET /orders/:id` enrich; **compact Delivery progress timeline**; **loading skeleton / refreshing with stale detail / error+Retry / missing-detail empty**; **Copy reference** clipboard action for **`DeliveryOrder.id`** + **Copied** feedback; posted + converted orders; notification click opens same drawer after focus; no route), **order-based chat** — schema, API, SDK, Sender/Wayler Accepted panel UI, modal on `/app`, **chat modal polling**, **accepted order chat modal panel states** (loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale messages on error when cached; Sending… + duplicate-send prevention; send-failure banner preserves draft; shared `panel-status-states.tsx`), **premium `/app` dashboard UI foundation**, **payment/escrow schema + mock/manual API + SDK + Sender Accepted payment UI + Wayler Accepted payout visibility + Wayler Accepted payment refresh helper** (Refresh reloads orders + per-order payment status; panel hint + “Refreshing…” button label; **per-card payment panel states** — Loading/Refreshing payment…, Retry, Sender processing labels, duplicate action blocked; Wayler read-only unchanged), **dispute/arbitration schema + API + SDK + Sender/Wayler Accepted dispute UI** — open/view modal, messages, evidence metadata, **dispute panel states** (loading/refreshing, no-dispute empty, submit processing, duplicate submit blocked, submit failure preserves draft, existing dispute summary), **dispute in-app notifications** — other-participant dispatch on open/message/evidence via `SYSTEM`, **proof-of-delivery per-card panel states** (Loading/Refreshing proof…, Retry, empty no-proof, submit failure preserves draft, per-card action errors, stale proof preserved), **KYC marketplace access gate UI** (`kyc-marketplace-gate.tsx` — loading/error+Retry/missing/pending/rejected gates + action-specific blocked hints; **Wayler daily-access gating remains separate**), **App dashboard shell loading/error states** (`app-dashboard-shell.tsx` — profile/mode/KYC bootstrap loading shell; no blank screen or wrong role panel flash before `modeReady`; critical profile bootstrap failure shows dashboard-level error with retry/return; panel-level failures stay panel-level), **KYC identity panel states** (`kyc-identity-panel.tsx` — loading skeleton, load error+Retry, missing/pending/rejected/approved phases, country form+validation, submit processing/success/failure, draft preserved on failure; **KYC gate remains separate from Wayler daily access**), **production-safety demo tools gate** (`demo-tools.ts` — `demoToolsEnabled`; local dev shows mock controls; production default hides KYC mock approve/reject, Wayler mock activate, Sender mock payment buttons; `NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true` for staging demos), **Wayler availability / trip listings** — schema + **`WaylerAvailabilitiesModule` API + SDK** + **two-sided discovery UI** (Wayler management + **Wayler availability/trips panel states** on **My listings** — loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale listing cards on error when cached; shared `panel-status-states.tsx`) + **Sender browse Wayler availability / discovery panel states** (Results list — loading skeleton, true empty vs filter-empty, error + Retry, Refresh/Refreshing…; stale listing cards on error when cached; shared `panel-status-states.tsx`)), **`WaylerAvailabilityRequest` schema + `WaylerAvailabilityRequestsModule` API + SDK + Sender request UI + Wayler incoming accept/decline UI + availability-request panel states** (Sender **“My requests to Waylers”** + Wayler **“Incoming Sender requests”** — loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale request cards on error when cached; shared `panel-status-states.tsx`) **+ availability-request in-app notifications (**`SYSTEM`** on create/decline/cancel; **`ORDER_ACCEPTED`** + **`relatedOrderId`** = **`DeliveryOrder.id`** on accept — not **`availabilityRequestId`**) + DeliveryOrder conversion on accept + “Converted to order” badge/reference on request panels + “From Wayler request” source badge on Accepted order panels + Accepted-panel auto-refresh after request accept + converted-order chat via existing `DeliveryOrder.id` flow + converted-order mock payment via existing `DeliveryOrder.id` flow** (`SYSTEM` on create/decline/cancel; **`ORDER_ACCEPTED`** + `relatedOrderId` = created **`DeliveryOrder.id`** on accept; backend creates **`ACCEPTED` `DeliveryOrder`** with `sourceType=WAYLER_AVAILABILITY_REQUEST` and `availabilityRequestId`; request cards show short linked order reference when `deliveryOrderId` is set; accepted order cards show short request reference when converted; chat uses **`POST /conversations/order/:deliveryOrderId`** — lazy conversation create, no auto-chat on accept; mock payment uses **`POST /payments/orders/:deliveryOrderId/mock-authorize`** — no `sourceType` filter, verified compatible with no code changes), **daily Wayler work access pass** — schema + **`WaylerAccessModule` API + SDK** + **Wayler access panel UI** on `/app` + **accept gating** (posted orders + **incoming Sender availability requests**) + **contact/chat/message gating** + **activate/cancel in-app notifications** (`SYSTEM`; mock/manual only — no Stripe yet) are complete. **Repo stability:** root `pnpm build` / `pnpm lint` run Turbo serially (`--concurrency=1`) for reliable Windows local builds — product behavior unchanged; `typecheck` unchanged. **Nothing pushed or deployed yet** (branch ahead of `origin/main`; local development only). Photo/signature proof, Stripe/checkout, real paid daily access, real payout processing, refunds, Wayler payout dashboard, WebSocket/SSE real-time chat/push, **realtime Wayler payment panel updates**, **realtime published-order panel updates**, **realtime open-order feed updates**, **realtime Wayler availability listing panel updates**, **realtime Sender browse Wayler discovery panel updates**, **realtime availability-request panel updates**, dedicated dispute/availability-request notification types, payment hold/refund integration, resolution workflow, admin/arbitrator panel, request expiry automation, matching recommendations, **scheduled access expiry notifications**, Stripe payment-confirmation notifications for daily access, admin-configured notification templates, admin pricing controls, platform fee adjustment toward 5%, and production deployment are future milestones.
>
> **Scope note for recent UI batches:** Payment/proof/dispute/drawer/KYC gate/**dashboard shell**/**KYC identity panel**/**demo tools gate** improvements above are **frontend UI-state polish only** unless otherwise stated — **backend contracts unchanged**; **demo tools hidden by default in production builds**; **no real Stripe/Stripe Connect escrow**; **no WebSocket/SSE** realtime updates for chat, payment, proof, or dispute panels yet.

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

| Area                                                                                                                                                                                                                                        | Status                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Auth backend (register, login, refresh, logout, `/users/me`)                                                                                                                                                                                | Complete                        |
| Auth frontend (`/login`, `/register`, `/app`, session restore)                                                                                                                                                                              | Complete                        |
| Password visibility toggle                                                                                                                                                                                                                  | Complete                        |
| Basic language support (8 locales, localStorage preference)                                                                                                                                                                                 | Complete                        |
| KYC mock flow (schema, API, SDK, `/app` panel)                                                                                                                                                                                              | Complete (M2)                   |
| Real KYC provider (Sumsub)                                                                                                                                                                                                                  | Not started (future M2 batch)   |
| Marketplace orders (M4 draft/publish/cancel/accept/lifecycle)                                                                                                                                                                               | Complete (M4)                   |
| Proof of delivery (metadata note + confirmation code)                                                                                                                                                                                       | Complete (M4)                   |
| In-app notifications (schema, API, SDK, bell/dropdown, polling)                                                                                                                                                                             | Complete (M4)                   |
| Notification bell / popover panel states (loading/empty/error/retry/refresh; mark-read loading/disabled)                                                                                                                                    | Complete (M4)                   |
| Order-linked notification click navigation (bell → Accepted panel focus/scroll/highlight + open details drawer via `DeliveryOrder.id`)                                                                                                      | Complete (M4)                   |
| Accepted delivery requests panel states (Sender + Wayler; loading/empty/error/retry/refresh)                                                                                                                                                | Complete (M4)                   |
| Sender Published Orders panel states (loading/empty/error/retry/refresh)                                                                                                                                                                    | Complete (M4)                   |
| Wayler open orders feed panel states (loading/empty/error/retry/refresh)                                                                                                                                                                    | Complete (M4)                   |
| Accepted Order Details drawer (View details; Sender + Wayler; frontend-only; **Delivery progress timeline**; **loading skeleton / refreshing+stale detail / error+Retry / missing-detail empty**; **Copy reference** + **Copied** feedback) | Complete (M4)                   |
| Accepted payment panel states (Sender + Wayler per-card — loading/refreshing, Retry, Sender processing labels, duplicate action blocked; Wayler read-only)                                                                                  | Complete (M5)                   |
| Proof-of-delivery panel states (per-card loading/refreshing, Retry, empty no-proof, submit failure preserves draft, per-card action errors, stale proof)                                                                                    | Complete (M4)                   |
| Dispute panel states on Accepted cards (loading/refreshing, no-dispute empty, submit processing, duplicate submit blocked, submit failure preserves draft, existing dispute summary)                                                        | Complete (M6)                   |
| KYC marketplace access gate UI (`kyc-marketplace-gate.tsx` — loading/error+Retry/missing/pending/rejected + action-specific hints; daily access separate)                                                                                   | Complete (M2/M4)                |
| App dashboard shell loading/error states (`app-dashboard-shell.tsx` — bootstrap loading shell, profile error+retry/return, no wrong role flash)                                                                                             | Complete                        |
| KYC identity panel states (`kyc-identity-panel.tsx` — loading/error/pending/rejected/approved, country form, submit states)                                                                                                                 | Complete (M2)                   |
| Production-safety demo tools gate (`demo-tools.ts` — `demoToolsEnabled`; production hides mock UI; `NEXT_PUBLIC_ENABLE_DEMO_TOOLS` for staging)                                                                                             | Complete                        |
| Repo stability scripts (root `pnpm build` / `pnpm lint` → Turbo `--concurrency=1`; Windows-friendly; product behavior unchanged)                                                                                                            | Complete                        |
| Order-based chat (schema, API, SDK, Sender/Wayler Accepted UI + **accepted order chat modal panel states**)                                                                                                                                 | Complete (M4)                   |
| Chat message in-app notifications (other participant only)                                                                                                                                                                                  | Complete (M4)                   |
| Chat modal polling (10s while open, visibility-aware)                                                                                                                                                                                       | Complete (M4)                   |
| Accepted order chat modal panel states (loading/empty/error/retry/refresh; sending/duplicate-send prevention; send-failure preserves draft)                                                                                                 | Complete (M4)                   |
| Premium `/app` dashboard UI foundation (visual polish)                                                                                                                                                                                      | Complete (M4)                   |
| Payment/escrow schema foundation (Prisma + shared types)                                                                                                                                                                                    | Complete (M5)                   |
| Mock/manual payment API + SDK (`MANUAL` provider)                                                                                                                                                                                           | Complete (M5)                   |
| Sender Accepted mock payment UI (authorize / hold / release)                                                                                                                                                                                | Complete (M5)                   |
| Wayler Accepted read-only payment/payout visibility                                                                                                                                                                                         | Complete (M5)                   |
| Mock payment in-app notifications (Wayler dispatch, `SYSTEM`)                                                                                                                                                                               | Complete (M5)                   |
| Dispute/arbitration schema foundation (Prisma + shared types)                                                                                                                                                                               | Complete (M6)                   |
| Disputes API + SDK (`DisputesModule`, `api.disputes.*`)                                                                                                                                                                                     | Complete (M6)                   |
| Sender/Wayler Accepted dispute UI (open/view modal, messages, evidence metadata)                                                                                                                                                            | Complete (M6)                   |
| Dispute panel states on Accepted cards (loading/refreshing/empty/submit processing/duplicate blocked/draft preserved)                                                                                                                       | Complete (M6)                   |
| Dispute in-app notifications (other-participant dispatch, `SYSTEM`)                                                                                                                                                                         | Complete (M6)                   |
| Wayler availability / trip listings schema foundation (Prisma + shared types)                                                                                                                                                               | Complete (M7)                   |
| Wayler availability API + SDK (`WaylerAvailabilitiesModule`, `api.waylerAvailabilities.*`)                                                                                                                                                  | Complete (M7)                   |
| Wayler availability management UI on `/app` (create, my listings, publish/pause/cancel)                                                                                                                                                     | Complete (M7)                   |
| Wayler availability/trips panel states (My listings; loading/empty/error/retry/refresh)                                                                                                                                                     | Complete (M7)                   |
| Sender browse active Waylers/trips UI + active courier count cards on `/app`                                                                                                                                                                | Complete (M7)                   |
| Sender browse Wayler availability / discovery panel states (Results list; loading/true-empty/filter-empty/error/retry/refresh)                                                                                                              | Complete (M7)                   |
| Wayler availability request schema (`WaylerAvailabilityRequest`, shared types)                                                                                                                                                              | Complete (M7)                   |
| Availability request API + SDK (`WaylerAvailabilityRequestsModule`, `api.waylerAvailabilityRequests.*`)                                                                                                                                     | Complete (M7)                   |
| Sender request-to-Wayler UI (browse → request form, “My requests to Waylers”, cancel)                                                                                                                                                       | Complete (M7)                   |
| Wayler incoming availability request UI (accept/decline + optional response message)                                                                                                                                                        | Complete (M7)                   |
| Sender/Wayler availability request panel states (loading/empty/error/retry/refresh on request lists)                                                                                                                                        | Complete (M7)                   |
| Availability request in-app notifications (`SYSTEM` on create/decline/cancel; `ORDER_ACCEPTED` + `relatedOrderId` on accept)                                                                                                                | Complete (M7)                   |
| DeliveryOrder conversion from accepted availability request (backend — transactional)                                                                                                                                                       | Complete (M7)                   |
| Converted-order badge + short order reference on request panels (Sender + Wayler)                                                                                                                                                           | Complete (M7)                   |
| Order source badge on Accepted panels (“From Wayler request” + short request reference)                                                                                                                                                     | Complete (M7)                   |
| Accepted-panel auto-refresh after availability-request accept (Wayler + Sender)                                                                                                                                                             | Complete (M7)                   |
| Converted-order chat via existing order flow (`DeliveryOrder.id`, lazy conversation create)                                                                                                                                                 | Complete (M7)                   |
| Converted-order mock payment via existing order flow (`DeliveryOrder.id`; no sourceType filter)                                                                                                                                             | Complete (M7)                   |
| Wayler Accepted payment refresh helper (Refresh reloads orders + payment status; panel hint UI)                                                                                                                                             | Complete (M5)                   |
| Daily Wayler work access pass schema foundation (`WaylerAccessPass`, shared types)                                                                                                                                                          | Complete (M8)                   |
| Wayler access pass API + SDK (`WaylerAccessModule`, `api.waylerAccess.*`)                                                                                                                                                                   | Complete (M8)                   |
| Wayler access panel UI on `/app` (active/inactive, mock activate, cancel, history)                                                                                                                                                          | Complete (M8)                   |
| Accept gating behind active daily Wayler access (order accept + incoming availability request accept)                                                                                                                                       | Complete (M8)                   |
| Contact / chat / message gating behind active daily Wayler access                                                                                                                                                                           | Complete (M8)                   |
| Wayler access activate/cancel in-app notifications (`SYSTEM` on mock flow)                                                                                                                                                                  | Complete (M8)                   |
| Platform fee adjustment (mock 10% → planned ~5%)                                                                                                                                                                                            | Not started (future milestones) |
| Stripe, checkout, real payout processing, refunds, payout dashboard                                                                                                                                                                         | Not started (future milestones) |
| Admin/arbitrator panel, dispute resolution, payment hold on dispute                                                                                                                                                                         | Not started (future milestones) |

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
5. **Build / lint reliably on Windows:** root `pnpm build` and `pnpm lint` run Turbo with **`--concurrency=1`** (serial package execution) to reduce flaky parallel builds on Windows — **product behavior unchanged**; `pnpm typecheck` is unchanged. All three should pass before manual testing.

> The `Dockerfile.api` / `Dockerfile.web` images are for container parity and
> future deployment (API → Render, web → Vercel); local dev uses the host + the
> Compose services above.

## M2 KYC mock testing

This section covers the **mock KYC gate** delivered in M2: Prisma schema, backend mock endpoints, SDK methods, and the KYC status panel on `/app`. There is **no real Sumsub (or other provider) integration yet** — local dev uses a mock approve/reject flow.

### Current M2 KYC status

| Area                                        | Status                              |
| ------------------------------------------- | ----------------------------------- |
| KYC schema (`KycVerification`, user flags)  | Complete                            |
| Mock backend KYC endpoints                  | Complete                            |
| SDK KYC methods (`api.kyc.*`)               | Complete                            |
| `/app` KYC status panel                     | Complete                            |
| KYC identity panel states on `/app`         | Complete (frontend-only)            |
| KYC marketplace access gate UI on `/app`    | Complete (frontend-only)            |
| App dashboard shell loading/error on `/app` | Complete (frontend-only)            |
| Production-safety demo tools gate           | Complete (frontend-only)            |
| Real Sumsub / provider integration          | Not implemented (future batch)      |
| File upload, webhooks, admin review UI      | Not implemented (future milestones) |

Prerequisites are the same as M1: Docker running, migrations applied, `pnpm dev` up, and a registered user (or use your existing account).

### KYC marketplace access gate UI (`/app`)

Beyond the **KYC identity panel** (`kyc-identity-panel.tsx` — start verification, country form, phase notices; mock approve/reject when demo tools enabled), marketplace panels use a shared **frontend-only gate** — **`apps/web/src/components/app/kyc-marketplace-gate.tsx`** — wired from `apps/web/src/app/(app)/app/page.tsx` and marketplace child panels. **No backend/schema/SDK changes**; existing `GET /kyc/status` + `VerificationGuard` rules unchanged.

| Phase                  | UI behavior                                                                                                                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**            | Compact **Checking verification status…** (`app.kycGate.kycLoading`) where marketplace access depends on KYC — **no wrong approved/blocked message** before load finishes                     |
| **Load error**         | Localized error (`app.kycPanel.loadFailed`) + **Retry verification status** → re-runs `loadKycStatus()`; KYC identity card shows same error+Retry; **other dashboard panels are not cleared** |
| **Missing / required** | `PanelEmptyState` — verification required title/body; marketplace actions disabled with friendly messaging                                                                                    |
| **Pending**            | Pending title/body — explains marketplace actions may be limited until approval; blocked actions disabled safely                                                                              |
| **Rejected**           | Rejected title/body — verification needs attention; actions disabled; **no invented appeal/resubmission backend**                                                                             |
| **Approved**           | Gate notice hidden — **no extra friction**; demo accounts with approved KYC unchanged                                                                                                         |

**Action-specific blocked helper text** (`KycActionBlockedHint`) where useful — e.g. post order, accept posted order — with separate keys for required/pending/rejected (`app.kycGate.action*`).

**Separate from Wayler daily access:** KYC gating does **not** replace **`WaylerAccessPass`** paywall — Waylers still need **active daily access** for paid work actions (accept posted order, accept incoming request, contact/chat) when KYC is approved (see **Daily Wayler work access foundation**).

**i18n** (8 locales): `app.kycGate.*` (+ reuses `app.kycPanel.loadFailed` for load errors).

### App dashboard shell loading/error states (`/app`)

**`apps/web/src/components/app/app-dashboard-shell.tsx`** — dashboard-level bootstrap UX on `/app` (frontend-only; **no backend changes**).

| State                         | UI behavior                                                                                                                                                                                                                                   |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bootstrapping**             | **`AppDashboardLoadingShell`** while auth user, **`modeReady`** (localStorage mode hydration), profile bootstrap, and initial KYC status load complete — **avoids blank screen** and **wrong Sender/Wayler panel flash** before mode is known |
| **Profile bootstrap failure** | **`AppDashboardBootstrapError`** — localized dashboard-level error with **Retry** and **Return to login**; does not wipe unrelated state                                                                                                      |
| **Panel-level failures**      | Individual panels (orders, feed, KYC refresh, etc.) keep **panel-level** error + Retry — dashboard shell only covers critical bootstrap                                                                                                       |

**i18n** (8 locales): `app.shell.*`.

### KYC identity panel (`/app`)

Dedicated **`apps/web/src/components/app/kyc-identity-panel.tsx`** — identity verification card on `/app` (replaces inline KYC card in `page.tsx`). **Normal KYC user flow unchanged**; **KYC marketplace gate** (`kyc-marketplace-gate.tsx`) remains **separate** from **Wayler daily-access** gating.

| Phase / action              | UI behavior                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Loading**                 | Compact loading text + skeleton inside the KYC card — **no premature pending/approved/rejected state** before load finishes          |
| **Load error**              | `PanelErrorState` + **Retry status**; if stale status exists, **error banner + last-known status** remain visible                    |
| **Missing / not submitted** | Friendly required explanation + **country code form** (required 2-letter ISO); inline validation (`requiredField`, `invalidCountry`) |
| **Pending**                 | Pending title/body; **submit form hidden** (backend blocks duplicate pending)                                                        |
| **Rejected**                | Attention title/body + **rejection reason** when available; **resubmit form** when product logic allows                              |
| **Approved**                | Approved title/body + access flags; **no extra friction**; approved demo accounts unchanged                                          |
| **Submit processing**       | Button disabled; **Submitting verification…** label                                                                                  |
| **Submit success**          | Localized success alert; refreshes KYC status via existing `loadKycStatus()` + user refresh                                          |
| **Submit failure**          | Localized error; **country draft preserved**; status not faked                                                                       |

Dev-only **Mock approve / Mock reject** buttons (when KYC is pending) are gated by **`demoToolsEnabled`** — see **Production-safety demo tools gate** below.

**i18n** (8 locales): `app.kycPanel.*` (+ reuses `app.kycGate.retryKycStatus` where appropriate).

### Production-safety demo tools gate

Centralized **`apps/web/src/lib/demo-tools.ts`** — **`demoToolsEnabled`** gates all client-side mock/dev-only controls:

```typescript
export const demoToolsEnabled =
  process.env.NEXT_PUBLIC_ENABLE_DEMO_TOOLS === 'true' || process.env.NODE_ENV !== 'production';
```

| Environment                                        | Mock/dev UI                                                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Local dev** (`pnpm dev`, `NODE_ENV=development`) | Demo tools **visible** (KYC mock approve/reject when pending, Wayler mock activate, Sender mock payment authorize/hold/release) |
| **Production build (default)**                     | Demo tools **hidden** — normal users cannot see dangerous mock shortcuts                                                        |
| **Staging / demo build**                           | Set **`NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true`** at build time to **explicitly enable** demo tools                                  |

**Gated controls (frontend-only; backend contracts unchanged):**

- **KYC** — mock approve / mock reject (`kyc-identity-panel.tsx`)
- **Wayler daily access** — mock activate today's access + manual-only note (`wayler-access-panel.tsx`)
- **Sender payments** — mock authorize / hold escrow / release payout buttons on Accepted orders (`page.tsx`)

**Unchanged:** Real product state displays (payment status labels, access flags, KYC status rows, cancel pass, etc.) — only **interactive mock shortcuts** are gated.

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

**App dashboard shell:**

- [ ] **`/app` loading shell** — after login/refresh, localized bootstrap message (not blank) until profile + mode + initial KYC load complete
- [ ] **No wrong role flash** — Sender/Wayler panels do not appear before **`modeReady`**
- [ ] **Profile/bootstrap error** (simulate API down during bootstrap) — dashboard-level error with **Retry** and **Return to login**; other panels not required to mount first

**KYC identity panel:**

- [ ] Open **`/app`** — **KYC identity panel** visible (status rows, access flags, phase notice)
- [ ] **Missing KYC** — required explanation + country form; empty/invalid country shows inline validation
- [ ] **Start verification** with valid country — **Submitting verification…** → success alert → status moves to **PENDING**
- [ ] **Submit failure** — error shown; **country draft preserved**
- [ ] **Pending KYC** — pending notice; form hidden; marketplace gate shows pending
- [ ] **Rejected KYC** — attention notice + rejection reason when available; resubmit form when allowed
- [ ] **Approved KYC** — approved notice; no submit form; demo approved accounts work unchanged
- [ ] **KYC load failure** — error + Retry on identity panel (stale status + banner if cached); `/app` stable

**Demo tools gate:**

- [ ] **`pnpm dev`** — KYC mock approve/reject (when pending), Wayler mock activate, Sender mock payment buttons **visible**
- [ ] **Production/default** (`pnpm build` + `pnpm start`, no demo flag) — those controls **hidden**
- [ ] **`NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true`** on production-like build — demo tools **visible** again for staging demos

**KYC marketplace gate + mock flow (dev):**

- [ ] **Login** at `/login`
- [ ] Click **Start verification** — status moves to **PENDING** (mock buttons enabled when demo tools allowed)
- [ ] Confirm **PENDING** on the panel and in latest verification
- [ ] Click **Mock approve** (development / demo tools only) — status becomes **APPROVED**
- [ ] Confirm **APPROVED** and all feature flags show **Yes** (`canCreateOrder`, `canBrowseOrders`, `canAcceptOrder`, `canChat`, `canContact`, `canReceivePayout`)
- [ ] **Refresh the page** — status persists; Start and mock buttons disabled/hidden when approved
- [ ] **Missing KYC** — marketplace panels show required gate; actions disabled with helper text
- [ ] **Pending KYC** — pending gate; marketplace actions blocked safely
- [ ] **Rejected KYC** — attention gate; resubmit via identity panel when allowed
- [ ] **KYC load failure** — error + Retry on KYC panel and gated marketplace panels; `/app` stable
- [ ] **Approved KYC** — no gate friction; **Wayler daily access** still separate for accept/chat

To test reject instead of approve: after **Start verification**, use **Mock reject** (when demo tools enabled) and confirm status becomes **REJECTED** and flags stay **No**.

### Current limitations / deployment note

- **Nothing pushed or deployed yet** — branch ahead of `origin/main`; local development only.
- **Demo tools hidden by default in production builds** — mock KYC review, Wayler mock activate, and Sender mock payment shortcuts require **`pnpm dev`** or explicit **`NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true`**.
- **Real Stripe / Stripe Connect escrow** — still future work; current payment UI uses **mock/manual** provider flows for local testing.
- **No realtime WebSocket/SSE** — chat, payment, proof, dispute, and notification panels use polling/refresh patterns.
- **Backend mock KYC routes** (`/kyc/mock/*`) remain **development-only** on the API — frontend gating is an additional safety layer.

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

M4 delivers the first end-to-end **marketplace loop** (Sender-initiated orders): Senders create and publish delivery requests; Waylers browse the public OPEN feed, preview routes on a map, and accept jobs. Both sides have tracking panels on `/app`, in-app notifications, and **order-based chat** after accept. **Two-sided discovery** (Wayler-published availability and trip routes) has **API + SDK + Wayler management UI + Sender browse UI + Sender request UI + Wayler incoming accept/decline UI + availability-request in-app notifications** (`ORDER_ACCEPTED` + `relatedOrderId` on accept) **+ backend DeliveryOrder conversion on accept** — see **Wayler availability and trip listings foundation**, **Sender ↔ Wayler availability requests**, and **Notifications**; **daily Wayler work access pass API + SDK + panel UI + accept/contact/chat gating** is enforced for Waylers on **posted order accept**, **incoming Sender availability-request accept**, and **order chat** (decline incoming requests and browse/list incoming requests are **not** gated) — see **Daily Wayler work access foundation** (mock/manual activation today; Stripe checkout later). **Mock/manual payment API + two-sided payment UI** (Sender controls, Wayler read-only visibility) exist for local testing on **accepted delivery orders** only — including orders created from availability-request accept (Sender must still mock-authorize manually; see **Payment and escrow foundation**). **Dispute/arbitration schema + API + SDK + Sender/Wayler Accepted dispute UI** let parties open disputes, exchange messages, and attach evidence metadata on eligible orders (see **Dispute and arbitration foundation**); **no Stripe, checkout, real payout processing, admin/arbitrator panel, dispute resolution workflow, or subscriptions yet.**

Prerequisites: same as M1/M2/M3 — Docker running, migrations applied, `pnpm dev` up, and **KYC approved** (mock approve in dev) for marketplace actions.

### Current marketplace status

| Area                                                                                                                                                                                                                                        | Status        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| `DeliveryOrder` schema (Prisma)                                                                                                                                                                                                             | Complete      |
| Create draft (`POST /orders`)                                                                                                                                                                                                               | Complete      |
| Cancel DRAFT/OPEN (`POST /orders/:id/cancel`, Sender only)                                                                                                                                                                                  | Complete      |
| Sender Cancel UI (Drafts + Published panels)                                                                                                                                                                                                | Complete      |
| Publish draft → OPEN (`POST /orders/:id/publish`)                                                                                                                                                                                           | Complete      |
| Wayler OPEN feed (`GET /orders`, default `status=OPEN`)                                                                                                                                                                                     | Complete      |
| Wayler open orders feed panel states (loading/empty/error/retry/refresh)                                                                                                                                                                    | Complete      |
| Sender Published Orders panel states (loading/empty/error/retry/refresh)                                                                                                                                                                    | Complete      |
| Accept OPEN order (`POST /orders/:id/accept`)                                                                                                                                                                                               | Complete      |
| Start transit (`POST /orders/:id/start-transit`)                                                                                                                                                                                            | Complete      |
| Mark delivered (`POST /orders/:id/mark-delivered`)                                                                                                                                                                                          | Complete      |
| Wayler accepted panel (`GET /orders/accepted`) + progression + **loading/empty/error/retry/refresh**                                                                                                                                        | Complete      |
| Sender tracking panels (Drafts / Published / Accepted)                                                                                                                                                                                      | Complete      |
| Sender Accepted lifecycle visibility (ACCEPTED/IN_TRANSIT/DELIVERED)                                                                                                                                                                        | Complete      |
| Sender Accepted panel (`GET /orders/mine` ACCEPTED/IN_TRANSIT/DELIVERED) + **loading/empty/error/retry/refresh**                                                                                                                            | Complete      |
| Proof-of-delivery schema + submit API + SDK                                                                                                                                                                                                 | Complete      |
| Wayler proof submit/update UI (IN_TRANSIT / DELIVERED)                                                                                                                                                                                      | Complete      |
| Sender proof read-only visibility                                                                                                                                                                                                           | Complete      |
| Notification schema + API + SDK                                                                                                                                                                                                             | Complete      |
| Automatic Sender lifecycle notifications (accept/transit/proof/delivered)                                                                                                                                                                   | Complete      |
| Frontend notification bell/dropdown on `/app`                                                                                                                                                                                               | Complete      |
| Notification bell / popover panel states (loading/empty/error/retry/refresh; mark-read loading/disabled)                                                                                                                                    | Complete      |
| Notification bell polling (30s unread / 60s list, visibility-aware)                                                                                                                                                                         | Complete      |
| Order-linked notification click (bell → Accepted panel, scroll/highlight card, open details drawer via `DeliveryOrder.id`)                                                                                                                  | Complete      |
| Sender Accepted panel (`GET /orders/mine` ACCEPTED/IN_TRANSIT/DELIVERED) + **loading/empty/error/retry/refresh**                                                                                                                            | Complete      |
| Accepted Order Details drawer (View details; Sender + Wayler; frontend-only; **Delivery progress timeline**; **loading skeleton / refreshing+stale detail / error+Retry / missing-detail empty**; **Copy reference** + **Copied** feedback) | Complete      |
| Accepted payment panel states (Sender + Wayler per-card — loading/refreshing, Retry, Sender processing labels, duplicate action blocked)                                                                                                    | Complete      |
| Proof-of-delivery panel states (per-card loading/refreshing, Retry, empty no-proof, submit failure preserves draft)                                                                                                                         | Complete      |
| Dispute panel states on Accepted cards (loading/refreshing, no-dispute empty, submit processing, duplicate submit blocked)                                                                                                                  | Complete      |
| KYC marketplace access gate UI (`kyc-marketplace-gate.tsx`)                                                                                                                                                                                 | Complete      |
| Repo stability (root build/lint Turbo `--concurrency=1`)                                                                                                                                                                                    | Complete      |
| Mock payment in-app notifications (Wayler dispatch on authorize/hold/release)                                                                                                                                                               | Complete      |
| Chat schema + API + SDK (Conversation / ChatMessage)                                                                                                                                                                                        | Complete      |
| Frontend chat modal on `/app` (Sender/Wayler Accepted panels + **accepted order chat modal panel states**)                                                                                                                                  | Complete      |
| Chat message notifications (`SYSTEM` type → bell/dropdown)                                                                                                                                                                                  | Complete      |
| Chat modal polling (10s detail refresh, visibility-aware)                                                                                                                                                                                   | Complete      |
| Accepted order chat modal panel states (loading/empty/error/retry/refresh; sending/duplicate-send prevention; send-failure preserves draft)                                                                                                 | Complete      |
| Wayler feed filters & sort (type, location, reward, sort)                                                                                                                                                                                   | Complete      |
| Wayler map route previews (Leaflet + city/country geocoding)                                                                                                                                                                                | Complete      |
| Sender privacy endpoint (`GET /orders/mine`)                                                                                                                                                                                                | Complete      |
| Premium `/app` dashboard UI foundation (shell, cards, badges, alerts)                                                                                                                                                                       | Complete      |
| Payment/escrow schema (`PaymentIntent`, `Payout`, `LedgerEntry`)                                                                                                                                                                            | Complete      |
| Mock/manual payment API + SDK (`MANUAL` provider)                                                                                                                                                                                           | Complete      |
| Sender Accepted mock payment UI (authorize / hold / release)                                                                                                                                                                                | Complete      |
| Wayler Accepted read-only payment/payout visibility                                                                                                                                                                                         | Complete      |
| Wayler Accepted payment refresh helper (Refresh + hint; reloads payment per order)                                                                                                                                                          | Complete      |
| Mock payment in-app notifications (Wayler dispatch on authorize/hold/release)                                                                                                                                                               | Complete      |
| Wayler availability management UI (`/app` Wayler mode — create, listings, publish/pause/cancel)                                                                                                                                             | Complete (M7) |
| Wayler availability/trips panel states (My listings; loading/empty/error/retry/refresh)                                                                                                                                                     | Complete (M7) |
| Sender browse active Waylers UI (`/app` Sender mode — filters, listings, active counts, request flow)                                                                                                                                       | Complete (M7) |
| Sender browse Wayler availability / discovery panel states (Results list; loading/true-empty/filter-empty/error/retry/refresh)                                                                                                              | Complete (M7) |
| Wayler incoming availability request UI (`/app` Wayler mode — accept/decline pending requests)                                                                                                                                              | Complete (M7) |
| Sender/Wayler availability request panel states (loading/empty/error/retry/refresh)                                                                                                                                                         | Complete (M7) |
| Availability request API + SDK (`WaylerAvailabilityRequestsModule`, `api.waylerAvailabilityRequests.*`)                                                                                                                                     | Complete (M7) |
| Availability request in-app notifications (`SYSTEM` on create/decline/cancel; `ORDER_ACCEPTED` + `relatedOrderId` on accept)                                                                                                                | Complete (M7) |
| DeliveryOrder conversion on availability-request accept (`ACCEPTED` order + traceability fields)                                                                                                                                            | Complete (M7) |
| Converted-order UI on request panels (“Converted to order” badge + short order reference)                                                                                                                                                   | Complete (M7) |
| Order source badge on Accepted panels (“From Wayler request” + short request reference)                                                                                                                                                     | Complete (M7) |
| Accepted-panel auto-refresh after availability-request accept                                                                                                                                                                               | Complete (M7) |
| Converted-order chat (existing `POST /conversations/order/:deliveryOrderId` flow)                                                                                                                                                           | Complete (M7) |
| Converted-order mock payment (existing `/payments/orders/:orderId` flow; verified compatible)                                                                                                                                               | Complete (M7) |
| Daily Wayler work access pass schema (`WaylerAccessPass`, migration `wayler_access_pass_foundation`)                                                                                                                                        | Complete (M8) |
| Wayler access pass API + SDK (`WaylerAccessModule`, `api.waylerAccess.*` — mock/manual only)                                                                                                                                                | Complete (M8) |
| Wayler access panel UI (`/app` Wayler mode — active/inactive, mock activate, cancel, history)                                                                                                                                               | Complete (M8) |
| Accept gating — `POST /orders/:id/accept` + Wayler OPEN feed accept button (active pass required)                                                                                                                                           | Complete (M8) |
| Accept gating — `POST /wayler-availability-requests/:id/accept` + incoming **Accept request** button                                                                                                                                        | Complete (M8) |
| Contact/chat gating — `POST /conversations/order/:id` + Wayler Open chat (active pass required)                                                                                                                                             | Complete (M8) |
| Message gating — `POST /conversations/:id/messages` as Wayler (active pass required)                                                                                                                                                        | Complete (M8) |
| Wayler access activate/cancel in-app notifications (`SYSTEM` on mock activate/cancel)                                                                                                                                                       | Complete (M8) |

### API routes (orders)

All routes require JWT + KYC approval (`JwtAuthGuard`, `VerificationGuard`). Base path: `/api/v1`.

| Method | Path                                | Description                                                                                                                  |
| ------ | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/v1/orders`                    | Create a delivery order as DRAFT (Sender)                                                                                    |
| GET    | `/api/v1/orders`                    | List orders — defaults to **OPEN** (Wayler marketplace feed); supports `status`, `type`, location filters, pagination        |
| GET    | `/api/v1/orders/mine`               | List **current user's sent orders** only (`senderId` = authenticated user); optional `status`, `type`, `page`, `limit`       |
| GET    | `/api/v1/orders/accepted`           | List orders **accepted by the current Wayler** (includes `acceptedAt`)                                                       |
| GET    | `/api/v1/orders/:id`                | Order detail; other users' DRAFTs return 404                                                                                 |
| POST   | `/api/v1/orders/:id/publish`        | Sender publishes own DRAFT → OPEN                                                                                            |
| POST   | `/api/v1/orders/:id/cancel`         | Sender cancels own DRAFT or OPEN → CANCELLED (sets `cancelledAt`)                                                            |
| POST   | `/api/v1/orders/:id/accept`         | Wayler accepts OPEN order → ACCEPTED (requires **active daily Wayler access** — `403` `WAYLER_ACCESS_REQUIRED` when missing) |
| POST   | `/api/v1/orders/:id/start-transit`  | Accepted Wayler moves ACCEPTED → IN_TRANSIT                                                                                  |
| POST   | `/api/v1/orders/:id/mark-delivered` | Accepted Wayler moves IN_TRANSIT → DELIVERED (sets `deliveredAt`)                                                            |
| POST   | `/api/v1/orders/:id/proof`          | Accepted Wayler submits/updates proof-of-delivery metadata (IN_TRANSIT or DELIVERED)                                         |

Interactive docs: http://localhost:4000/docs (tag **orders**).

SDK: `api.orders.create`, `list`, `mine`, `accepted`, `detail`, `publish`, `cancel`, `accept`, `startTransit`, `markDelivered`, `submitProof`.

### User flow

**Sender (mode: Sender on `/app`)**

1. Create a **draft** delivery request (title, type, route, reward, etc.).
2. **Cancel** a draft or published (OPEN) order before acceptance — **Cancel** button in Drafts / Published panels → `api.orders.cancel(id)`.
3. **Publish** the draft → status becomes **OPEN** (visible on the Wayler marketplace).
4. Track orders in three panels:
   - **Drafts** — `api.orders.mine({ status: 'DRAFT' })`; **Cancel** per draft
   - **Published** — `api.orders.mine({ status: 'OPEN' })`; **Cancel** per open order; **loading/empty/error/retry** panel states (see **Sender Published Orders panel states**)
   - **Accepted** — merged `api.orders.mine` for `ACCEPTED`, `IN_TRANSIT`, and `DELIVERED` (+ `detail` for `acceptedAt`, `deliveredAt`, and proof fields); status badges and lifecycle notes; **read-only proof** when submitted; pending/missing proof notes when appropriate; **no Cancel** (post-accept orders cannot be cancelled via this flow)

**Wayler (mode: Wayler on `/app`)**

1. Browse the **OPEN** feed — `api.orders.list({ status: 'OPEN', ...filters })` with **loading/empty/error/retry** panel states (see **Wayler open orders feed panel states**).
2. **Filter & sort** by type, pickup/dropoff, reward range; sort by reward, published date, or route.
3. **Map preview** on each card (pickup → dropoff markers and route line; geocoded from city/country).
4. **Accept** an OPEN order (not own order; KYC required; **active daily Wayler access required** — see **Daily Wayler work access foundation**).
5. Track **Accepted delivery requests** — `api.orders.accepted()` (all statuses where `acceptedWaylerId` = current user).
6. **Progress delivery** — **Start transit** (ACCEPTED → IN_TRANSIT), **Mark delivered** (IN_TRANSIT → DELIVERED) from the Wayler Accepted panel.
7. **Submit proof of delivery** — when **IN_TRANSIT** or **DELIVERED**, submit or update metadata proof (note + confirmation code) via `api.orders.submitProof(id, body)` from the Wayler Accepted panel.
8. **Contact Sender / chat** — open order conversation from Wayler Accepted panel when eligible (**active daily Wayler access required** to open chat and send messages; reading existing messages is not blocked).

### Privacy and KYC notes

- **DRAFT orders are private** — `GET /orders?status=DRAFT` is scoped to the current sender on the backend; other users cannot read another sender's drafts via `GET /orders/:id`.
- **Sender panels use `/orders/mine`** — the browser never receives other users' sent orders; no client-side `senderId` filtering.
- **Wayler marketplace feed** uses `GET /orders` with **OPEN** only (global feed for browsing/accepting).
- **KYC approval is required** to create orders, cancel orders, browse the Wayler feed, accept orders, progress delivery (start transit / mark delivered), submit proof of delivery, and load Sender/Wayler marketplace panels (enforced by `VerificationGuard` + `requireKycApproved`).

### Manual testing checklist

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User A** (Sender mode): create a draft, then **publish** it
- [ ] **User A** (Sender mode): **Published Orders** initial load shows **Loading published orders…** + skeleton (not empty)
- [ ] **User A** (Sender mode): with no published OPEN orders → **No posted delivery requests yet** title + body (create/publish via delivery request form above)
- [ ] **User A** (Sender mode): simulate Published panel load failure → localized error + **Retry**; stale cards when cached; dashboard stable
- [ ] **User A** (Sender mode): Published panel **Refresh** / **Refreshing…** keeps cards visible during reload
- [ ] **User B** (Sender mode): Drafts / Published / Accepted panels do **not** show A's orders
- [ ] **User B** (Wayler mode): OPEN feed shows A's published order
- [ ] **User B** (Wayler mode): OPEN feed initial load shows **Loading open delivery orders…** + skeleton (not empty)
- [ ] With no open orders in marketplace → **No open delivery jobs yet** title + body (Sender-posted jobs + publish Wayler availability)
- [ ] Simulate OPEN feed load failure → localized error + **Retry**; stale cards when cached
- [ ] OPEN feed **Refresh** / **Refreshing…** keeps cards visible during reload
- [ ] **User B** without active daily access: **Accept** disabled + access note; `POST /orders/:id/accept` → **403** `WAYLER_ACCESS_REQUIRED`
- [ ] **User B** mock-activates today's access (Wayler access panel) → **Accept** enabled
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

Once a Wayler accepts a job, both parties track progress through **ACCEPTED → IN_TRANSIT → DELIVERED**. Only the **accepted Wayler** can advance status after accept; the Sender monitors via the **Accepted Orders** panel.

**Two ways an order reaches ACCEPTED today:**

| Origin                   | How it becomes `ACCEPTED`                                                                                                | `sourceType`                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| **Sender-posted order**  | Sender publishes → Wayler accepts OPEN order (`POST /orders/:id/accept`)                                                 | `SENDER_POSTED_ORDER` (default) |
| **Availability request** | Sender requests published Wayler listing → Wayler accepts request → backend creates `DeliveryOrder` already **ACCEPTED** | `WAYLER_AVAILABILITY_REQUEST`   |

Availability-request orders skip **DRAFT** / **OPEN** — the match happens when the Wayler accepts the Sender’s request. They use the same post-accept lifecycle (transit, delivered, proof, mock payment UI, disputes, **chat when opened manually from Accepted panel**). Traceability: `DeliveryOrder.availabilityRequestId` → `WaylerAvailabilityRequest.id` (1:1 unique). **Accepted order panels** show a **“From Wayler request”** source badge + short request reference when `sourceType=WAYLER_AVAILABILITY_REQUEST` (see **Sender ↔ Wayler availability requests** → **Order source badge**); **View details** opens the drawer with **Delivery progress** timeline (lifecycle uses `DeliveryOrder.status`/dates, not `availabilityRequestId`); **Open chat** uses `DeliveryOrder.id` like any other accepted order; **mock authorize / hold / release** uses the same **`DeliveryOrder.id`** payment endpoints (see **Payment and escrow foundation** → **Converted DeliveryOrders (mock payment)**). Sender-posted orders show **no** source badge by default. See **DeliveryOrder conversion**.

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

| Panel                                                                          | Behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wayler OPEN feed** (`GET /orders`, `status=OPEN`)                            | **Panel states:** loading text + skeleton on initial load (no empty while loading); friendly empty when none; error + **Retry** on load failure (stale cards + error banner when cached); header **Refresh** / **Refreshing…** keeps cards visible during reload. **Cards:** map preview, filters/sort, **Accept** (KYC + daily access gating unchanged)                                                                                                                                                                                                                                                                                                                  |
| **Sender Published** (`GET /orders/mine`, `status=OPEN`)                       | **Panel states:** loading text + skeleton on initial load (no empty while loading); friendly empty when none; error + **Retry** on load failure (stale cards + error banner when cached); header **Refresh** / **Refreshing…** keeps cards visible during reload. **Cards:** OPEN status badge, route/reward/published date, **Cancel** (unchanged)                                                                                                                                                                                                                                                                                                                       |
| **Wayler Accepted** (`GET /orders/accepted`)                                   | **Panel states:** loading text + skeleton on initial load (no empty while loading); friendly empty when none; error + **Retry** on load failure (stale cards + error banner when cached); **Refresh** / **Refreshing…** unchanged. **Cards:** **View details** opens drawer (**Delivery progress** timeline; **loading skeleton / refreshing+stale detail / error+Retry / missing-detail empty**; **Copy reference** + **Copied** feedback); order-linked bell click opens same drawer after focus/highlight; **Start transit** / **Mark delivered** / proof / chat / payment / dispute on card with **per-card loading/refreshing/error/retry/action-processing states** |
| **Sender Accepted** (`GET /orders/mine` for ACCEPTED / IN_TRANSIT / DELIVERED) | **Panel states:** loading text + skeleton on initial load; friendly empty when none; error + **Retry** on load failure (stale cards when cached); **Refresh** / **Refreshing…** on header button. **Cards:** **View details** opens drawer with timeline, **Copy reference**; notification focus/highlight; chat/payment/proof/dispute on card with **per-card UI states** (payment/proof/dispute — see sections below)                                                                                                                                                                                                                                                   |

Sender **Drafts** panel, filters, maps, and **KYC marketplace access gate** (see **M2 KYC mock testing** → **KYC marketplace access gate UI**) are unchanged in backend contract; **Wayler daily-access gating** remains separate.

### Sender Published Orders panel states

The **Published Orders** card on `/app` (Sender mode) — **`loadPublishedOrders()`** via `api.orders.mine({ status: 'OPEN' })` — shares polished loading, empty, error, and refresh UX with other marketplace panels. Frontend-only (shared `PanelEmptyState`, `PanelErrorState` from `apps/web/src/components/app/panel-status-states.tsx`, wired in `apps/web/src/app/(app)/app/page.tsx`). **No backend/schema changes.**

| State             | Behavior                                                                                                                                                                                                                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**       | Visible **“Loading published orders…”** (`app.senderPanel.postedOrdersLoading`, `role="status"`, `aria-live="polite"`) + order-card skeleton (`SenderOrdersSkeleton`) on **initial load when no cached published orders**. **Does not show empty state while loading.**                                                                        |
| **Success**       | Published OPEN order cards render (title, type, route, reward, published date, **OPEN** status badge, **Cancel** button). Cancel success/error alerts unchanged.                                                                                                                                                                               |
| **Empty**         | When `!loading && !error && publishedOrders.length === 0` — bordered empty state with **title** (`app.senderPanel.postedOrdersEmptyTitle`) + **body** (`app.senderPanel.postedOrdersEmptyBody`): posted delivery requests appear here after the Sender creates and publishes an order; use the **delivery request form above** to get started. |
| **Error**         | Localized **“Could not load published orders.”** (`app.senderPanel.postedOrdersLoadFailed`) + **Retry** (`app.senderPanel.retryPostedOrders`) → re-runs `loadPublishedOrders()`. Retry **disabled while loading**. Dashboard does **not** crash.                                                                                               |
| **Error + cache** | If published orders were loaded previously, **stale cards remain visible** below the error banner (no empty state).                                                                                                                                                                                                                            |
| **Refresh**       | Header **Refresh** → `loadPublishedOrders()`; label **Refreshing…** (`app.senderPanel.refreshing`) while loading **when cached orders exist**; button disabled while loading or during cancel actions (`senderListActionBusy`). Refresh with cached orders **keeps cards visible** during reload.                                              |

**Unchanged Published panel behavior:** Sender **order creation** (draft form → publish), **publish/cancel** actions (`handleCancelOrder`, `api.orders.cancel`), order cards and **OPEN** status badges, cancel success/error alerts, **Wayler OPEN feed** visibility of published orders after publish, **Wayler accept** flow, **Accepted delivery requests panel refresh** after accept, **Accepted Order Details drawer**, and **order-linked notification click** (focus accepted card + open drawer via **`DeliveryOrder.id`**) — all unchanged.

**Current limitations:**

- **Frontend-only panel reliability** — Retry re-calls existing `GET /orders/mine`; **no new backend endpoints**
- **No realtime published-order panel updates** — list refreshes on panel load, **Refresh**, Retry, and after publish/cancel success — **no WebSocket/SSE**
- **Nothing deployed yet** — local development only

**i18n** (8 locales): `app.senderPanel.postedOrdersLoading`, `postedOrdersEmptyTitle`, `postedOrdersEmptyBody`, `postedOrdersLoadFailed`, `retryPostedOrders`, `refreshing` (legacy single-line `publishedLoading` / `publishedEmpty` / `publishedLoadFailed` keys retained).

### Manual testing checklist (Sender Published Orders)

Use KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User A** (Sender mode) → **Published Orders** initial load shows **Loading published orders…** + skeleton (not empty)
- [ ] With no published OPEN orders → **No posted delivery requests yet** title + body (create/publish via delivery request form above)
- [ ] **User A** creates draft → **publish** → Published panel shows card(s) with OPEN badge, route, reward, **Cancel**
- [ ] Simulate load failure (stop API) on empty panel → error + **Retry**; dashboard stable; no empty state
- [ ] With cached published orders, simulate failure → error banner + **stale cards still visible**; **Retry** restores
- [ ] **Refresh** with cached orders → cards stay visible; button shows **Refreshing…** while loading
- [ ] **User A** order creation (draft → publish) still works
- [ ] **User A** **Cancel** in Published panel still works
- [ ] **User B** (Wayler mode): OPEN feed still shows **User A**’s published order
- [ ] **User B** **Accept** posted order still works (with active daily access)
- [ ] After accept → **Accepted delivery requests** panel refresh still works on both sides
- [ ] Order-linked notification click → focus accepted card + open drawer still works
- [ ] Normal `/app` load — no crash

### Wayler open orders feed panel states

The **Available delivery requests** card on `/app` (Wayler mode) — **`loadFeedOrders()`** via `api.orders.list({ status: 'OPEN', ...filters })` — shares polished loading, empty, error, and refresh UX with other marketplace panels. Frontend-only (shared `PanelEmptyState`, `PanelErrorState` from `apps/web/src/components/app/panel-status-states.tsx`, wired in `apps/web/src/app/(app)/app/page.tsx`). **No backend/schema changes.**

| State              | Behavior                                                                                                                                                                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**        | Visible **“Loading open delivery orders…”** (`app.waylerFeed.openOrdersLoading`, `role="status"`, `aria-live="polite"`) + order-card skeleton (`FeedOrdersSkeleton`) on **initial load when no cached open orders**. **Does not show empty state while loading.**                                                     |
| **Success**        | OPEN order cards render (title, type, map preview, route/reward, **Accept** button, own-order block, KYC/access notes). Client-side reward filter + sort applied via `displayedFeedOrders`.                                                                                                                           |
| **Empty**          | When `!loading && !error && feedOrders.length === 0` — bordered empty state with **title** (`app.waylerFeed.openOrdersEmptyTitle`) + **body** (`app.waylerFeed.openOrdersEmptyBody`): new Sender-posted delivery jobs appear here; Wayler can also publish availability so Senders can request delivery through them. |
| **Filtered empty** | When API returns orders but client filters/sort exclude all — single-line **“No open delivery requests match your filters.”** (`app.waylerFeed.emptyFiltered`; unchanged).                                                                                                                                            |
| **Error**          | Localized **“Could not load open delivery orders.”** (`app.waylerFeed.openOrdersLoadFailed`) + **Retry** (`app.waylerFeed.retryOpenOrders`) → re-runs `loadFeedOrders()`. Retry **disabled while loading**. Dashboard does **not** crash.                                                                             |
| **Error + cache**  | If open orders were loaded previously, **stale cards remain visible** below the error banner (no empty state).                                                                                                                                                                                                        |
| **Refresh**        | Header **Refresh** → `loadFeedOrders()`; label **Refreshing…** (`app.waylerFeed.openOrdersRefreshing`) while loading **when cached orders exist**; button disabled while loading. Refresh with cached orders **keeps cards visible** during reload. Filter fieldset disabled while loading (unchanged).               |

**Unchanged feed behavior:** **Accept** posted OPEN order (`handleAcceptOrder` → `api.orders.accept`), own-order block (`senderCannotAcceptOwn`), KYC gate, **daily Wayler access gating on accept**, filters/sort/map previews, accept success/error alerts, **Accepted delivery requests panel refresh** after accept (`loadFeedOrders()` + `loadAcceptedOrders()`), **Sender Published Orders panel** (Sender sees own published OPEN orders — see **Sender Published Orders panel states**), **Accepted Order Details drawer**, and **order-linked notification click** (focus accepted card + open drawer via **`DeliveryOrder.id`**) — all unchanged.

**Relationship to two-sided discovery:** OPEN feed empty state directs Waylers to **publish Wayler availability** (see **Wayler availability and trip listings foundation** and **Sender ↔ Wayler availability requests**) as the reverse discovery lane when no Sender-posted OPEN jobs exist.

**Current limitations:**

- **Frontend-only feed reliability** — Retry re-calls existing `GET /orders`; **no new backend endpoints**
- **No realtime open-order feed updates** — list refreshes on panel load, filter change (via `loadFeedOrders` dependency), **Refresh**, Retry, and after accept — **no WebSocket/SSE**
- **Nothing deployed yet** — local development only

**i18n** (8 locales): `app.waylerFeed.openOrdersLoading`, `openOrdersEmptyTitle`, `openOrdersEmptyBody`, `openOrdersLoadFailed`, `retryOpenOrders`, `openOrdersRefreshing` (legacy single-line `loading` / `empty` / `loadFailed` keys retained).

### Manual testing checklist (Wayler open orders feed)

Use KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User B** (Wayler mode) → **Available delivery requests** initial load shows **Loading open delivery orders…** + skeleton (not empty)
- [ ] With no OPEN orders in marketplace → **No open delivery jobs yet** title + body (Sender-posted jobs + publish availability)
- [ ] **User A** publishes order → **User B** OPEN feed shows card(s) with map preview when locations set
- [ ] Simulate load failure (stop API) on empty feed → error + **Retry**; dashboard stable; no empty state
- [ ] With cached OPEN orders, simulate failure → error banner + **stale cards still visible**; **Retry** restores
- [ ] **Refresh** with cached orders → cards stay visible; button shows **Refreshing…** while loading
- [ ] Client-side filters exclude all results → **No open delivery requests match your filters.** (not full empty state)
- [ ] **User B** **Accept** posted order still works (with active daily access)
- [ ] Own-order block, KYC gate, and access gating notes unchanged on feed cards
- [ ] After accept → order leaves feed; **Accepted delivery requests** panel refreshes
- [ ] Order-linked notification → focus accepted card + open drawer still works
- [ ] Normal `/app` load — no crash

### Accepted delivery requests panel states

Both **Sender** (`#sender-accepted-panel`) and **Wayler** (`#wayler-accepted-panel`) **Accepted delivery requests** panels on `/app` share polished loading, empty, error, and refresh UX — frontend-only (shared `PanelEmptyState`, `PanelErrorState` from `apps/web/src/components/app/panel-status-states.tsx`, wired in `apps/web/src/app/(app)/app/page.tsx`). **No backend/schema changes.**

**Sender Accepted panel** (`loadSenderAcceptedOrders()` — `GET /orders/mine` for ACCEPTED, IN_TRANSIT, DELIVERED):

| State             | Behavior                                                                                                                                                                                                                                                                          |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**       | Visible **“Loading accepted orders…”** (`app.senderPanel.acceptedLoading`, `role="status"`, `aria-live="polite"`) + order-card skeleton (`SenderOrdersSkeleton`) on **initial load when no cached orders**. **Does not show empty state while loading.**                          |
| **Success**       | Accepted order cards render (status badges, proof, payment, chat, dispute, **View details**, notification `id="accepted-order-{DeliveryOrder.id}"`).                                                                                                                              |
| **Empty**         | When `!loading && !error && orders.length === 0` — bordered empty state with **title** (`app.senderPanel.acceptedEmptyTitle`) + **body** (`app.senderPanel.acceptedEmptyBody`): accepted deliveries appear after a Wayler accepts a **posted order** or **availability request**. |
| **Error**         | Localized **“Failed to load accepted orders.”** (`app.senderPanel.acceptedLoadFailed`) + **Retry** (`app.senderPanel.retryAccepted`) → re-runs `loadSenderAcceptedOrders()`. Retry **disabled while loading**. Dashboard does **not** crash.                                      |
| **Error + cache** | If orders were loaded previously, **stale cards remain visible** below the error banner (no empty state).                                                                                                                                                                         |
| **Refresh**       | Header **Refresh** → `loadSenderAcceptedOrders()`; label **Refreshing…** (`app.senderPanel.refreshing`) while loading; button disabled while loading. Refresh with cached orders **keeps cards visible** during reload.                                                           |

**Wayler Accepted panel** (`loadAcceptedOrders()` — `GET /orders/accepted`):

| State             | Behavior                                                                                                                                                                                                                                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**       | Visible **“Loading accepted delivery requests…”** (`app.waylerFeed.acceptedPanel.loading`) + compact skeleton (`AcceptedOrdersSkeleton`, 2 cards) on **initial load when no cached orders**. **Does not show empty while loading.**                                                                              |
| **Success**       | Accepted job cards with transit/delivered/proof/payment/chat/dispute actions + **View details** + notification DOM ids.                                                                                                                                                                                          |
| **Empty**         | When `!loading && !error && orders.length === 0` — **title** (`app.waylerFeed.acceptedPanel.emptyTitle`) + **body** (`app.waylerFeed.acceptedPanel.emptyBody`): accepted work appears after accepting from the **open feed** (see **Wayler open orders feed panel states**) or **Sender availability requests**. |
| **Error**         | **“Failed to load accepted delivery requests.”** (`app.waylerFeed.acceptedPanel.loadFailed`) + **Retry** (`app.waylerFeed.acceptedPanel.retry`) → re-runs `loadAcceptedOrders()`. Retry disabled while loading.                                                                                                  |
| **Error + cache** | Stale accepted cards remain visible with error banner when previously loaded.                                                                                                                                                                                                                                    |
| **Refresh**       | Existing header **Refresh** / **Refreshing…** (`app.waylerFeed.acceptedPanel.refresh` / `refreshing`) unchanged — reloads orders + per-order payment enrichment; disabled during in-flight transit/proof actions.                                                                                                |

**Unchanged card/panel behavior:** **View details** (drawer), **Copy reference** (inside drawer), **Open chat** (accepted order chat modal panel states — see **Chat / contact** → **Accepted order chat modal panel states**), mock payment (**per-card payment panel states** — see **Payment and escrow foundation** → **Accepted payment panel states**), proof (**per-card proof panel states** — see **Proof of delivery** → **Proof panel states on Accepted cards**), dispute (**per-card dispute panel states** — see **Dispute and arbitration foundation** → **Dispute panel states on Accepted cards**), **notification bell / popover panel states** (see **Notifications** → **Notification bell / popover panel states**), order-linked notification focus/highlight + drawer open, converted-order source badges, post-accept auto-refresh from availability-request accept, **Sender Published Orders** panel (create/publish/cancel + panel states — see **Sender Published Orders panel states**), **Sender browse Wayler availability / discovery Results list panel states** (see **Sender browse Wayler availability / discovery panel states**), **Wayler availability/trips My listings** panel (create/publish/pause/cancel + panel states — see **Wayler availability/trips panel states**), and **Wayler OPEN feed** accept flow (see **Wayler open orders feed panel states**).

### Per-card payment / proof / dispute UI on Accepted panels

Each accepted order card on Sender and Wayler **Accepted delivery requests** panels includes inline **payment**, **proof**, and **dispute** sections with polished loading, refresh, error, empty, and action-processing states — **frontend-only** (`apps/web/src/app/(app)/app/page.tsx` + `dispute-panel.tsx`; shared `panel-status-states.tsx`). **Backend contracts unchanged.** Converted orders use the same **`DeliveryOrder.id`** semantics for payment/proof/dispute/chat/drawer (not `availabilityRequestId`). See dedicated subsections under **Payment and escrow foundation**, **Proof of delivery**, and **Dispute and arbitration foundation**.

**Current limitations:**

- **Frontend-only panel reliability** — retry re-calls existing list APIs; **no new backend endpoints**
- **No realtime accepted-order updates** — lists refresh on panel load, **Refresh**, Retry, notification click reload, or availability-request accept callbacks — **no WebSocket/SSE**
- **Nothing deployed yet** — local development only

**i18n** (8 locales): `app.senderPanel.acceptedLoading`, `acceptedLoadFailed`, `retryAccepted`, `acceptedEmptyTitle`, `acceptedEmptyBody`, `refreshing`; `app.waylerFeed.acceptedPanel.loading`, `loadFailed`, `retry`, `emptyTitle`, `emptyBody`, `refresh`, `refreshing` (legacy single-line `acceptedEmpty` / `empty` keys retained).

### Manual testing checklist (Accepted delivery requests panels)

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

**Sender Accepted panel:**

- [ ] Open `/app` in **Sender mode** (KYC approved) → initial load shows **Loading accepted orders…** + skeleton (not empty)
- [ ] With no accepted orders → **No accepted deliveries yet** title + body explaining Wayler accept of posted order or availability request
- [ ] **User B** accepts **User A**’s order → Sender Accepted shows card(s); **Refresh** / **Refreshing…** works
- [ ] Simulate load failure (stop API) on empty panel → error + **Retry**; no empty state; dashboard stable
- [ ] With cached accepted orders, simulate failure → error banner + **stale cards still visible**; **Retry** restores
- [ ] **View details**, chat, payment, proof, dispute on cards still work

**Wayler Accepted panel:**

- [ ] Open `/app` in **Wayler mode** (KYC approved) → initial load shows loading text + skeleton (not empty)
- [ ] With no accepted work → friendly empty title + body (open feed or Sender availability requests)
- [ ] After accept → cards appear; **Refresh** / **Refreshing…** unchanged
- [ ] Simulate load failure → error + **Retry**; stale cards when cached
- [ ] Transit, proof, payment, chat, dispute, **View details** still work on cards

**Cross-panel (notifications + drawer + published orders):**

- [ ] Bell popover loading/empty/error/retry/refresh/mark-read states do not break order-linked click flow
- [ ] Order-linked notification click → panel reload, card focus/highlight, drawer opens; panel loading/error states do not break notification flow
- [ ] **Sender Published Orders** loading/empty/error states do not break notification or drawer flow
- [ ] Normal `/app` load without query params → stable; no drawer auto-open

### Accepted Order Details drawer

Accepted order cards on **Sender** and **Wayler** **Accepted delivery requests** panels include a **View details** action (`app.orders.viewDetails`). It opens a lightweight **frontend-only drawer/modal** on `/app` — **no new route**, no navigation away from the dashboard.

**Component:** `apps/web/src/components/app/accepted-order-details-drawer.tsx`, wired from `apps/web/src/app/(app)/app/page.tsx`.

**Supported orders:**

| Order type                               | Drawer behavior                                                                                                                                 |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Posted accepted order**                | `sourceType = SENDER_POSTED_ORDER` — subtle **Posted order** badge in drawer                                                                    |
| **Converted availability-request order** | `sourceType = WAYLER_AVAILABILITY_REQUEST` — **From Wayler request** badge + short request reference (`DeliveryOrderSourceBadge`; same as card) |

**Data:** Card summary fields from the accepted order row render **immediately** on open; the drawer then calls existing **`GET /api/v1/orders/:id`** (`api.orders.detail`, **`DeliveryOrder.id` only** — never `availabilityRequestId`) to enrich addresses, description, notes, and pickup/deadline fields. **No backend/schema/SDK package changes.**

**Detail fetch loading, error, and retry** (frontend-only — `DetailFetchStatus` in `accepted-order-details-drawer.tsx`):

| Phase              | Behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**        | Compact **loading skeleton** + **“Loading order details…”** banner (`app.orders.detailsLoading`, `role="status"`, `aria-live="polite"`) on **initial fetch when no cached detail**. **Does not blank the drawer** — accepted-row summary (title, status badge, type, role, order reference, source badge, route, reward) and **Delivery progress** timeline stay visible using row/fallback data.                                                               |
| **Refreshing**     | When re-fetching with **cached detail** (e.g. reopen or retry after success) — **Refreshing order details…** label; **stale detail fields remain visible** during refresh (no blank flash).                                                                                                                                                                                                                                                                     |
| **Success**        | Full detail fields populate when fetch succeeds. Detail-only fields (pickup/dropoff address text, description, notes, pickup window, delivery deadline) appear only after success. Timeline merges safe row + detail data (`detail?.status ?? order.status`, dates, payment status from card).                                                                                                                                                                  |
| **Error**          | Drawer **does not crash** if detail fetch fails. Shows localized **“Could not load full order details.”** (`app.orders.detailsLoadFailed`) — **no raw API error text**. Shows fallback notice (`app.orders.detailsFallbackNotice`) that the accepted-row summary may be incomplete. Row summary + timeline **remain visible**; detail-only fields stay hidden (`detail?.` guards). **Retry** (`app.orders.retryDetails`) re-runs `api.orders.detail(order.id)`. |
| **Missing detail** | When fetch succeeds but full detail is unavailable/empty for optional fields — safe empty/missing copy (no crash); row summary + timeline still shown.                                                                                                                                                                                                                                                                                                          |

**Entry points:** identical loading/error/retry and **Copy reference** behavior when opened from **View details** on an accepted card or from an **order-linked notification** click (after focus/highlight). Notifications **without** `relatedOrderId` still do **not** open the drawer.

**Copy reference** (frontend-only — `OrderReferenceCopyAction` in `accepted-order-details-drawer.tsx`):

| Aspect           | Behavior                                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Placement**    | Inline next to the order reference row (below role label, above source badge)                                                                                  |
| **Display**      | Short formatted reference via `formatShortOrderReference` (first 8 hex chars of `DeliveryOrder.id`)                                                            |
| **Copy action**  | **Copy reference** button (`app.orders.copyReference`) copies the full **`DeliveryOrder.id`** UUID to the clipboard — for support, disputes, and communication |
| **Safe data**    | Copies **`DeliveryOrder.id` only** — never `availabilityRequestId`; does **not** copy addresses, notes, user data, or full order details                       |
| **Clipboard**    | Uses `navigator.clipboard.writeText` when available; falls back to hidden textarea + `document.execCommand('copy')`                                            |
| **Success**      | Temporary **Copied** feedback (`app.orders.referenceCopied`, ~2s, `role="status"`, `aria-live="polite"`)                                                       |
| **Failure**      | Temporary **Could not copy** (`app.orders.referenceCopyFailed`, `role="alert"`) — drawer does **not** crash                                                    |
| **Entry points** | Same from **View details** and order-linked notification open — does **not** change notification behavior                                                      |
| **Not included** | No public share link, no backend share token, no URL deep link, no analytics/tracking                                                                          |

**Fields displayed (existing order data only):**

| Field                              | Source                                                                     |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Title                              | Header subtitle                                                            |
| Status + delivery type             | Badge row                                                                  |
| Sender / Wayler role context       | Panel role when opened                                                     |
| **DeliveryOrder** short reference  | First 8 chars of `DeliveryOrder.id`                                        |
| Source badge or posted-order label | By `sourceType`                                                            |
| Route                              | Pickup city/country → dropoff city/country                                 |
| Pickup / dropoff address text      | `pickupAddressText` / `dropoffAddressText` — **detail fetch success only** |
| Reward + currency                  | Row immediately; detail may override `offeredRewardAmount` / `currency`    |
| Pickup window / delivery deadline  | **Detail fetch success only**                                              |
| Description / notes                | **Detail fetch success only**                                              |

**Delivery progress timeline** (`app.orders.deliveryProgress` — compact vertical tracker inside the drawer):

Shows the accepted delivery lifecycle in a professional, mobile-friendly layout. Uses **existing order data only** — **no invented states, dates, or backend lifecycle events**.

| Step           | When shown                                                                 | Data source                                                                                                      |
| -------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Accepted**   | Always (accepted-order drawer context)                                     | Always **complete**; `acceptedAt` formatted when set, else `dateUnavailable`                                     |
| **Payment**    | When payment status was loaded on the accepted card (`paymentIntent` path) | `PaymentStatus` from card row — reuses sender/wayler payment status labels; **omitted** when payment load failed |
| **In transit** | Always                                                                     | `DeliveryOrder.status` — **current** when `IN_TRANSIT`; **pending** until transit starts                         |
| **Delivered**  | Always                                                                     | `DeliveryOrder.status` + `deliveredAt` — **complete** when `DELIVERED`; date or `dateUnavailable`                |

**Step state rules (frontend-only):**

- **Accepted** — complete in accepted-panel context; never marked pending.
- **Payment** — complete when `AUTHORIZED`, `HELD_IN_ESCROW`, `RELEASED`, or `REFUNDED`; **current** when order is `ACCEPTED` and payment not yet progressed; shows existing mock payment labels (not authorized / authorized / held / released / etc.).
- **In transit** — complete when `IN_TRANSIT` or `DELIVERED`; **current** when actively in transit or when `ACCEPTED` and payment step (if shown) is complete.
- **Delivered** — all steps complete when status is `DELIVERED`.
- **Missing dates** — `progressPending` / `dateUnavailable` safe text; **no fake timestamps**.
- **Payment load failure** — payment step **omitted** entirely (no misleading escrow state).

**Supported orders:** same timeline for **posted accepted orders** and **converted availability-request accepted orders** — lifecycle driven by **`DeliveryOrder.status`**, `acceptedAt`, `deliveredAt`, and optional payment status only (**not** `availabilityRequestId`). Converted orders still show **From Wayler request** source badge/reference separately above the timeline.

**UX / accessibility:**

| Behavior    | Detail                                                                                |
| ----------- | ------------------------------------------------------------------------------------- |
| **Mobile**  | Bottom sheet — full width, `rounded-t-xl`, scrollable body (`max-h-[90vh]`)           |
| **Desktop** | Centered modal — `sm:max-w-lg`                                                        |
| **Close**   | Visible **Close** button; **Escape** key; backdrop click                              |
| **A11y**    | `role="dialog"`, `aria-modal="true"`, `aria-labelledby`; focus moves to Close on open |

**Explicitly not in drawer:** chat, mock payment, proof submit, dispute actions — those remain on the accepted card (unchanged).

**Notification compatibility:** Order-linked bell click **scrolls/highlights** the accepted card (`#accepted-order-{DeliveryOrder.id}`) **and opens the Accepted Order Details drawer** (including **Delivery progress** timeline, **loading/error/retry**, and **Copy reference**) for that same **`DeliveryOrder.id`** — same drawer as **View details**, opened after focus (~50ms scroll delay). Matching uses **`DeliveryOrder.id` only** — never `availabilityRequestId`. If the order is not found in either Accepted list, focus fails safely (panel scroll only; **no drawer**). Normal `/app` load and optional `?focusOrderId=` URL focus **do not** auto-open the drawer unless the user clicks an order-linked notification or **View details**.

**Current limitations:**

- **No full order detail page/route** — drawer is the inspection surface today (no `/app/orders/:id` deep link)
- **No drawer operational actions** — chat, mock payment, proof submit, dispute actions stay on the accepted card; drawer is read-only inspection + **Copy reference**
- **No public share link** — **Copy reference** copies order id to clipboard only; not a shareable URL
- **No backend share token** — no server-generated share id or expiring link
- **No URL deep link to drawer** — notification click and **View details** only; `?focusOrderId=` highlights card without opening drawer
- **No analytics/tracking** on copy action
- **Timeline is frontend-only** — derived from existing status/dates/payment snapshot; **no new backend lifecycle events**
- **Detail fetch reliability is frontend-only** — retry re-calls existing `GET /orders/:id`; **no new backend detail endpoint**
- **No realtime detail/timeline refresh** — snapshot on open/retry; no WebSocket/SSE while drawer stays open
- **No real carrier tracking** — status-based progress only (not GPS/live courier map)
- **Nothing deployed yet** — local development only

**i18n** (`app.orders.*`, 8 locales): `viewDetails`, `orderDetails`, `closeDetails`, `orderReference`, `copyReference`, `referenceCopied`, `referenceCopyFailed`, `route`, `pickup`, `dropoff`, `reward`, `notes`, `deliveryProgress`, `progressCurrent`, `progressPending`, `dateUnavailable`, `detailsLoading`, `detailsLoadFailed`, `retryDetails`, `detailsFallbackNotice`, plus role/deadline labels; step titles reuse `app.senderPanel.status*` and `app.senderPanel.payment.*` / wayler payment keys.

### Manual testing checklist (Accepted Order Details drawer)

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User B** accepts **User A**’s posted order → **View details** visible on both Accepted panels
- [ ] **User A** (Sender Accepted) clicks **View details** → drawer opens; compact **Loading order details…** banner may appear briefly; then title, status, route, reward, order reference, **Copy reference** button, **Posted order** label, **Delivery progress** timeline
- [ ] **Copy reference** button visible next to short order reference
- [ ] Click **Copy reference** → full **`DeliveryOrder.id`** UUID on clipboard (not `availabilityRequestId`); temporary **Copied** feedback appears
- [ ] **Simulate clipboard failure** (block clipboard in browser or non-secure context) → **Could not copy** appears; drawer does not crash
- [ ] After successful detail load → pickup/dropoff addresses, description, notes, pickup windows/deadlines appear when set on `GET /orders/:id`
- [ ] **Simulate detail fetch failure** (stop API or block network) → drawer still opens with row summary + timeline; **Could not load full order details.** message; fallback notice; **no raw API error text**; detail-only fields hidden
- [ ] Click **Retry** after restoring API/network → loading banner; on success full details populate; error/fallback notice disappear; **Retry** disabled while loading
- [ ] **Close** / **Escape** / **backdrop** still work while error/fallback notice is shown
- [ ] **User B** (Wayler Accepted) clicks **View details** on same order → drawer opens with Wayler role context and timeline
- [ ] Timeline **Accepted** step shows `acceptedAt` when set, or safe unavailable text
- [ ] Timeline **Payment** step appears when payment status loaded on card; **omitted** when payment load failed
- [ ] Timeline **In transit** / **Delivered** steps reflect `DeliveryOrder.status` (pending → current → complete as lifecycle progresses)
- [ ] Drawer closes via **Close** button
- [ ] Drawer closes via **Escape**
- [ ] Drawer closes via **backdrop** click
- [ ] Converted order (`WAYLER_AVAILABILITY_REQUEST`) → drawer shows **From Wayler request** badge + request reference; timeline still appears (lifecycle uses `DeliveryOrder.status`/dates)
- [ ] **Chat**, **payment**, and **proof** buttons still on card and work after closing drawer
- [ ] **User A** clicks posted-order **`ORDER_ACCEPTED`** notification → card scrolls/highlights; drawer opens with timeline; same loading/error/retry and **Copy reference** behavior as **View details**
- [ ] **User S** clicks converted availability-request **`ORDER_ACCEPTED`** notification → same (read, close bell, focus, highlight, drawer + timeline; loading/error/retry + **Copy reference** apply)
- [ ] **Copy reference** works after opening drawer from notification
- [ ] Drawer closes via **Close** / **Escape** / **backdrop** after notification open
- [ ] Notification **without** `relatedOrderId` → **no drawer**, no navigation
- [ ] Normal `/app` load without query params → **no drawer** auto-open
- [ ] **Refreshing order details…** keeps stale detail visible during re-fetch
- [ ] **Loading skeleton** on initial drawer detail fetch (not blank drawer)
- [ ] **Missing full details** empty state when optional detail fields unavailable after success

### Manual testing checklist (lifecycle)

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User A** publishes an order
- [ ] **User B** accepts it (ACCEPTED)
- [ ] **User B** clicks **Start transit** in Wayler Accepted panel
- [ ] **User A** refreshes Sender Accepted panel → sees **IN_TRANSIT** badge and note
- [ ] **User B** clicks **Mark delivered**
- [ ] **User A** refreshes Sender Accepted panel → sees **DELIVERED** badge, note, and **deliveredAt** when set
- [ ] **User A** opens the notification bell → sees lifecycle notifications (see **Notifications** section)
- [ ] **User A** clicks an **`ORDER_ACCEPTED`** (or other order-linked) notification → marks read, closes bell, focuses Sender Accepted panel, scrolls/highlights the order card, **opens Accepted Order Details drawer** (see **Notifications** → **Order-linked notification click behavior**)
- [ ] **User A** and **User B** can open chat from Accepted panels after accept (see **Chat / contact** → **Accepted order chat modal panel states**)

### Future milestones (delivery lifecycle)

- **Dedicated order detail page/route** — full `/app/orders/:id` (or similar) with deep links from bell, badges, and notifications (drawer + timeline + **loading/error/retry** + **Copy reference** exist today; bell already opens drawer after focus)
- **Public share link / backend share token** — shareable order URL or expiring token (today: clipboard **Copy reference** for **`DeliveryOrder.id`** only)
- **URL deep link to drawer** — e.g. `?focusOrderId=` could optionally open drawer (today: highlight only on URL focus)
- **Real carrier / live tracking** — GPS or provider webhooks on timeline (today: status-based progress only)
- **Realtime timeline/detail updates** — WebSocket/SSE refresh while drawer open (today: snapshot on open/retry)
- **Realtime accepted-order panel updates** — WebSocket/SSE push new accepts/status changes (today: manual Refresh, Retry, notification reload, accept callbacks)
- **Realtime published-order panel updates** — WebSocket/SSE push when Sender publishes or cancels OPEN orders (today: panel load, **Refresh**, Retry, publish/cancel success — see **Sender Published Orders panel states**)
- **Realtime open-order feed updates** — WebSocket/SSE push when Senders publish new OPEN jobs (today: load, filter change, Refresh, Retry, post-accept reload — see **Wayler open orders feed panel states**)
- **Pickup timestamp** field (`pickedUpAt`) if product needs explicit pickup time
- **Photo / signature proof** of handoff — see **Proof of delivery** future milestones
- **Payment release** after delivery (escrow / Stripe)
- **Disputes / arbitration** on delivery completion
- **Real-time / push / email** on status changes — in-app notifications exist today; see **Notifications**

## Proof of delivery

Proof-of-delivery metadata supports **later payment release**, **disputes**, **admin/arbitrator review**, and **delivery confirmation** between Sender and Wayler. The current implementation is **metadata-only**: optional **note** and **confirmation code**. **Photo and signature proof** are planned for a later milestone.

### Schema fields (`DeliveryOrder`)

**Source traceability** (migration `add_delivery_order_source_for_availability_requests`):

| Field                   | Type                  | Description                                                                 |
| ----------------------- | --------------------- | --------------------------------------------------------------------------- |
| `sourceType`            | `DeliveryOrderSource` | `SENDER_POSTED_ORDER` (default) or `WAYLER_AVAILABILITY_REQUEST`            |
| `availabilityRequestId` | `UUID?` @unique       | Links to originating `WaylerAvailabilityRequest` when converted from accept |

**Proof-of-delivery metadata:**

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

At least one non-empty field required before submit. Per-card **Loading proof…** / **Refreshing proof…** / **Retry proof status** on detail enrichment; **submit failure preserves draft** inputs; **Start transit** / **Mark delivered** show per-card errors without clearing other cards. See **Proof panel states on Accepted cards** below.

**Sender (Accepted Orders panel)**

| State                    | Behavior                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------- |
| **Proof submitted**      | Compact read-only “Proof of delivery” section: note, confirmation code, submitted time |
| **IN_TRANSIT, no proof** | Friendly empty — proof has not been submitted yet                                      |
| **DELIVERED, no proof**  | Friendly empty — no proof submitted yet for delivered order                            |
| **ACCEPTED**             | No proof section (proof not applicable before transit)                                 |

Sender panels use existing `api.orders.detail()` enrichment — no additional API calls.

### Proof panel states on Accepted cards

Frontend-only polish on Wayler/Sender **Accepted delivery requests** cards (`apps/web/src/app/(app)/app/page.tsx`). **No backend/schema changes.**

| State                 | Behavior                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Loading proof**     | **Loading proof…** while per-order proof detail fetch in flight (no misleading empty/submitted state)                  |
| **Refreshing proof**  | **Refreshing proof…** when re-fetching with known proof — **stale proof fields stay visible**                          |
| **Load error**        | Localized load failure + **Retry proof status** → re-runs proof detail fetch for that card only; other cards unchanged |
| **Empty (no proof)**  | Sender: friendly “not submitted yet” copy for IN_TRANSIT/DELIVERED; Wayler: guidance before transit                    |
| **Submit processing** | Wayler submit button shows in-flight label; **duplicate submit blocked** while request in flight                       |
| **Submit failure**    | Per-card error alert; **proof form draft preserved** (note + confirmation code not cleared)                            |
| **Stale proof**       | On transient errors after prior success, last known proof note/code/timestamp remain visible where possible            |

**i18n** (8 locales): `app.waylerFeed.acceptedPanel.proofLoading`, `proofRefreshing`, `proofLoadFailed`, `retryProofStatus`, plus existing proof empty/submit keys.

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
- [ ] Per-card **Loading proof…** / **Refreshing proof…** / **Retry proof status** on load failure
- [ ] Wayler **submit proof failure** preserves draft; **duplicate submit** blocked while processing
- [ ] **Start transit** / **Mark delivered** per-card errors do not clear other cards or stale proof

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

Notifications keep users aware of **order lifecycle events**, **mock payment events**, **new chat messages**, **dispute events**, **Wayler daily work access activation/cancellation**, **Sender ↔ Wayler availability request events**, and other platform activity. The current version is an **in-app notification list** in a bell/dropdown on `/app`, refreshed by **lightweight client-side polling** while the tab is visible, with **polished panel states** on the popover — loading skeleton, friendly empty, error + **Retry**, **Refresh** / **Refreshing…** (stale notification cards on error when cached), and mark-read loading/disabled states (see **Notification bell / popover panel states**). Notifications with **`relatedOrderId`** are **clickable** — they mark as read when unread, close the popover, switch to the correct Sender/Wayler mode, reload the **Accepted delivery requests** panel, **scroll/highlight** the matching order card, and **open the Accepted Order Details drawer** for that same order (always **`DeliveryOrder.id`**, never `availabilityRequestId`; drawer uses same **loading/error/retry** and **Copy reference** as **View details**). Notifications **without** `relatedOrderId` stay display-only with the existing mark-as-read action — no invented navigation, no drawer. Order, payment, chat, dispute, Wayler access, and availability-request notifications share the same bell, API, and SDK — **WebSocket/SSE, email, and push** are not implemented yet.

### Current notification flow

```text
Order lifecycle action OR mock payment action OR chat message sent OR dispute action OR Wayler access activate/cancel OR availability request create/accept/decline/cancel (backend — accept dispatches `ORDER_ACCEPTED`)
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
        ↓
User clicks order-linked item  (relatedOrderId = DeliveryOrder.id)
        ↓
markRead (if unread)  →  close popover  →  focus Accepted panel  →  scroll/highlight card  →  open Accepted Order Details drawer (same DeliveryOrder.id)
```

Payment, chat, dispute, Wayler access, and availability-request notifications appear in the **same bell/dropdown** as order lifecycle notifications — no separate payment, chat, dispute, access, or availability-request inbox. Recipients with the chat modal open also pick up new messages via **chat modal polling** (10s) without relying on the bell alone.

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

| Value              | Notes (current dispatch)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ORDER_PUBLISHED`  | Reserved — not dispatched yet                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `ORDER_ACCEPTED`   | **Dispatched** → Sender when Wayler accepts a posted OPEN order **or** accepts an availability request (converted order); **`relatedOrderId`** = **`DeliveryOrder.id`**                                                                                                                                                                                                                                                                                                                                                         |
| `ORDER_IN_TRANSIT` | **Dispatched** → Sender when transit starts                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `ORDER_DELIVERED`  | **Dispatched** → Sender when marked delivered                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `ORDER_CANCELLED`  | Reserved — cancel notifications not yet sent                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `PROOF_SUBMITTED`  | **Dispatched** → Sender when proof submitted                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `KYC_APPROVED`     | Reserved — KYC notifications not yet sent                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `KYC_REJECTED`     | Reserved — KYC notifications not yet sent                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `SYSTEM`           | **Dispatched** → other chat participant on new message; **Wayler on mock payment events** (authorize / hold / release); **Wayler on mock daily access activate/cancel** (see **Daily Wayler work access foundation**); **other dispute participant** on open dispute / new message / new evidence (until dedicated dispute types exist); **Wayler or Sender on availability request create/decline/cancel** (see **Sender ↔ Wayler availability requests** — accept uses **`ORDER_ACCEPTED`**); admin/system reserved for later |

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

The backend creates notifications **internally** when order lifecycle actions, mock payment actions, chat messages, dispute actions, Wayler daily access activate/cancel, or availability request create/accept/decline/cancel succeed. Failures to create a notification are logged and do **not** block the underlying action. Notifications are created **only after a successful state change** — validation failures, **409** conflicts, and idempotent/no-op calls do **not** create notifications.

**Order lifecycle** (after successful order transition):

| Order event            | `NotificationType` | Recipient  |
| ---------------------- | ------------------ | ---------- |
| Wayler accepts         | `ORDER_ACCEPTED`   | **Sender** |
| Wayler starts transit  | `ORDER_IN_TRANSIT` | **Sender** |
| Wayler submits proof   | `PROOF_SUBMITTED`  | **Sender** |
| Wayler marks delivered | `ORDER_DELIVERED`  | **Sender** |

Posted-order accept and **availability-request accept** (converted order) both dispatch **`ORDER_ACCEPTED`** to the **Sender** with **`relatedOrderId`** = **`DeliveryOrder.id`**. Normal posted-order accept behavior is unchanged.

**Mock payment** (after successful `PaymentsService` transition — see **Payment and escrow foundation**):

| Payment event    | `NotificationType` | Recipient  | Title                  | Body                                                |
| ---------------- | ------------------ | ---------- | ---------------------- | --------------------------------------------------- |
| mock-authorize   | `SYSTEM`           | **Wayler** | Payment was authorized | The Sender authorized payment for your delivery.    |
| mock-hold-escrow | `SYSTEM`           | **Wayler** | Escrow is held         | Payment is now held in escrow for your delivery.    |
| mock-release     | `SYSTEM`           | **Wayler** | Mock payout created    | A mock/manual payout was created for your delivery. |

All mock payment notifications include **`relatedOrderId`** = linked delivery order. **Sender is not notified** for their own authorize/hold actions. No dedicated payment `NotificationType` enum values yet — `SYSTEM` is used to avoid a schema migration.

**Duplicate prevention:** `mock-authorize` returns early without notification when status is already `AUTHORIZED` or `HELD_IN_ESCROW`. `mock-hold-escrow` and `mock-release` require prior status and reject invalid repeats with **409**.

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

**Dispute events** (after successful `DisputesService` write — see **Dispute and arbitration foundation**):

| Dispute event         | `NotificationType` | Recipient                               | Title                | Body                                                               |
| --------------------- | ------------------ | --------------------------------------- | -------------------- | ------------------------------------------------------------------ |
| Open dispute          | `SYSTEM`           | **Other participant** (Sender ↔ Wayler) | Dispute opened       | A dispute was opened for one of your deliveries.                   |
| Add dispute message   | `SYSTEM`           | **Other participant** (Sender ↔ Wayler) | New dispute message  | `A new message was added to a dispute: "{preview}"` (max 80 chars) |
| Add evidence metadata | `SYSTEM`           | **Other participant** (Sender ↔ Wayler) | New dispute evidence | New evidence was added to a dispute.                               |

Dispute notification payload:

- **`relatedOrderId`:** linked delivery order on every dispute notification
- **No self-notification** — the user who opened the dispute, sent the message, or submitted evidence is not notified
- **Sender opens dispute** → **Wayler** notified; **Wayler opens dispute** → **Sender** notified
- **Sender adds message/evidence** → **Wayler** notified; **Wayler adds message/evidence** → **Sender** notified
- No dedicated dispute `NotificationType` enum values yet — `SYSTEM` is used to avoid a schema migration
- **Arbitrator notifications** — not dispatched yet (assignment/resolution workflow is future)

**Duplicate prevention:** notifications are created only **after** successful Prisma writes. Failed validation or **409** (e.g. duplicate active dispute) does **not** create a notification. Notification insert failures are logged and do **not** roll back the dispute action.

**Wayler daily work access** (after successful `WaylerAccessService` transition — see **Daily Wayler work access foundation**):

| Access event              | `NotificationType` | Recipient  | Title                        | Body                                             |
| ------------------------- | ------------------ | ---------- | ---------------------------- | ------------------------------------------------ |
| `mock-activate-today`     | `SYSTEM`           | **Wayler** | Wayler work access active    | Your Wayler work access is active for today.     |
| `cancel` (was **ACTIVE**) | `SYSTEM`           | **Wayler** | Wayler work access cancelled | Your Wayler work access for today was cancelled. |

Wayler access notification payload:

- **Plain English** title/body stored in DB — no server-side i18n templates yet (same pattern as other `SYSTEM` dispatch today)
- **No `relatedOrderId`** — access pass is not tied to a delivery order; notification schema has no `entityType` / `entityId` fields yet
- **Self-notification only** — the Wayler who activated or cancelled receives the alert (not Senders or admins)
- **Mock/business-flow only** — not Stripe webhook or payment-provider confirmation notifications

**Duplicate prevention:**

- **`mock-activate-today`** — if a valid **ACTIVE** pass already exists for today, the service returns early **without** creating a notification (idempotent activate)
- **`cancel`** — notification only when status changes **ACTIVE → CANCELLED**; cancelling **PENDING** does not notify; repeat cancel on **CANCELLED** returns **409** before any notification

**Availability request events** (after successful `WaylerAvailabilityRequestsService` write — see **Sender ↔ Wayler availability requests**):

| Request event   | `NotificationType` | Recipient  | Title                              | Body                                                                             |
| --------------- | ------------------ | ---------- | ---------------------------------- | -------------------------------------------------------------------------------- |
| Sender creates  | `SYSTEM`           | **Wayler** | New delivery request               | A Sender sent you a delivery request for your Wayler availability.               |
| Wayler accepts  | `ORDER_ACCEPTED`   | **Sender** | Your delivery request was accepted | `Your delivery request "{title}" was accepted and a delivery order was created.` |
| Wayler declines | `SYSTEM`           | **Sender** | Delivery request declined          | Your delivery request was declined by the Wayler.                                |
| Sender cancels  | `SYSTEM`           | **Wayler** | Delivery request cancelled         | A Sender cancelled a delivery request.                                           |

Availability request notification payload:

- **`relatedOrderId` on accept:** set to the created **`DeliveryOrder.id`** — **not** `availabilityRequestId`; same field as posted-order **`ORDER_ACCEPTED`** notifications
- **No self-notification** — the user who performed the action is not notified (Sender create/cancel does not notify Sender; Wayler accept/decline does not notify Wayler)
- **Plain English** title/body stored in DB — no server-side i18n templates yet (same pattern as other dispatch today)
- **Same bell/dropdown** — existing **30s unread polling** picks up new alerts; **accept `ORDER_ACCEPTED`** notifications are **clickable** and focus the Accepted panel + open the details drawer via **`DeliveryOrder.id`** (see **Order-linked notification click behavior**)

**Duplicate prevention:**

- Notifications are created **only after** successful Prisma writes (`create`, `update` to `ACCEPTED` / `DECLINED` / `CANCELLED`)
- **Accept / decline / cancel** call `assertPending()` first — repeat action on non-`PENDING` request returns **409** `AVAILABILITY_REQUEST_NOT_PENDING` **before** any notification
- **Create** notifies once per successful insert; validation failures (`AVAILABILITY_NOT_FOUND`, `AVAILABILITY_NOT_REQUESTABLE`, `CANNOT_REQUEST_OWN_AVAILABILITY`) throw **before** insert
- Notification insert failures are logged and do **not** roll back the request action (`NotificationsService.createForUser`)

**Not implemented (availability requests — future):**

- **No dedicated availability-request `NotificationType`** — e.g. `AVAILABILITY_REQUEST_CREATED` (replace `SYSTEM` for create/decline/cancel when enum is extended; accept already uses **`ORDER_ACCEPTED`**)
- **No click navigation for decline/cancel** — those notifications have no `relatedOrderId`; create/decline/cancel remain display + mark-read only
- **No `relatedAvailabilityRequestId` or generic entity link** — decline/cancel deep-links are future
- **No push/email** — in-app bell only
- **No localized backend templates** — hard-coded English title/body only
- **No notifications for listing publish/pause/cancel/expiry** — only the request lifecycle above

**Not dispatched (Wayler access — future):**

- **No scheduled expiry notification** — pass expiry at end of day does not auto-notify yet
- **No Stripe payment confirmation** — real checkout/webhook success notifications are future
- **No admin-configured templates** — hard-coded English title/body only

**Not dispatched in the current version:**

- **No Wayler self-action notifications** — Waylers are not notified for their own accept/transit/proof/deliver actions.
- **No Sender payment-action notifications** — Senders are not notified when they authorize or hold escrow (Wayler is notified instead).
- **No cancel notification** — Sender cancel (DRAFT/OPEN) does not create `ORDER_CANCELLED` yet.
- **No KYC / publish notifications** — enum values exist; dispatch comes later.
- **No admin/system broadcasts** — `SYSTEM` is used for chat, mock payment, and dispute dispatch today; operator messages later.
- **No dispute resolution / arbitrator notifications** — open, message, and evidence only; assignment and resolution outcomes are future.

### Frontend behavior (`/app` header)

| Feature              | Behavior                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bell**             | Outline button with bell icon; placed next to language selector / sign out                                                                                                                                                                                                                                                                                                                                                      |
| **Unread badge**     | Shown when `unreadTotal > 0` (caps display at `99+`)                                                                                                                                                                                                                                                                                                                                                                            |
| **On app load**      | `api.notifications.unreadCount()` on mount; then polls every **30s** while tab visible                                                                                                                                                                                                                                                                                                                                          |
| **Dropdown open**    | Loads latest **10** via `api.notifications.list({ page: 1, limit: 10 })`; also refreshes unread count                                                                                                                                                                                                                                                                                                                           |
| **List polling**     | While dropdown is open **and** tab visible, list polls every **60s** (silent background refresh)                                                                                                                                                                                                                                                                                                                                |
| **Panel states**     | Popover loading/empty/error/retry/refresh + mark-read loading/disabled — see **Notification bell / popover panel states**                                                                                                                                                                                                                                                                                                       |
| **Each item**        | Title, optional body, `createdAt`, read/unread pill; **order-linked** items (`relatedOrderId` set) render as a full-width clickable row with “View in accepted deliveries” hint; others show mark-read button when unread                                                                                                                                                                                                       |
| **Refresh**          | Reloads list; disabled while loading or an action is in progress                                                                                                                                                                                                                                                                                                                                                                |
| **Mark all read**    | `api.notifications.markAllRead()` then refresh; disabled when no unread                                                                                                                                                                                                                                                                                                                                                         |
| **Mark one read**    | `api.notifications.markRead(id)` then refresh list + unread count (non-linked unread items, or explicit button)                                                                                                                                                                                                                                                                                                                 |
| **Click navigation** | **Implemented for `relatedOrderId`** — marks unread as read, closes popover, switches Sender/Wayler mode, reloads Accepted orders, scrolls to matching card (`accepted-order-{DeliveryOrder.id}`), temporary primary ring highlight (~2.5s), **opens Accepted Order Details drawer** (loading/error/retry + **Copy reference**). **No navigation** when `relatedOrderId` is null — safe display + mark-read only; **no drawer** |
| **KYC**              | **Not required** to open bell or read notifications                                                                                                                                                                                                                                                                                                                                                                             |

i18n keys under `app.notifications.*` (8 locales).

### Notification bell / popover panel states

The notification bell **dropdown/popover** on `/app` header — **`fetchList()`** via `api.notifications.list({ page: 1, limit: 10 })` — shares polished loading, empty, error, and refresh UX with other marketplace panels. Frontend-only (shared `PanelEmptyState`, `PanelErrorState`, `RequestsListSkeleton` from `apps/web/src/components/app/panel-status-states.tsx`, wired in `apps/web/src/components/app/notification-bell.tsx`). **No backend/schema changes.** Unread badge polling (`unreadCount` every **30s** while tab visible) and background list polling (**60s** while popover open) are unchanged.

| State             | Behavior                                                                                                                                                                                                                                                                                                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**       | Visible **“Loading notifications…”** (`app.notifications.loading`, `role="status"`, `aria-live="polite"`) + compact notification-card skeleton (`RequestsListSkeleton`, 3 rows, `h-14`) on **initial load when no cached notifications** (`loading && items.length === 0`). **Does not show empty state while loading.** Bell remains usable; dashboard does **not** crash. |
| **Success**       | Notification cards render (title, optional body, `createdAt`, read/unread pill). **Order-linked** items (`relatedOrderId` set) are full-width clickable rows; others show **Mark as read** when unread.                                                                                                                                                                     |
| **Empty**         | When `!loading && !error && items.length === 0` — bordered empty state with **title** (`app.notifications.emptyTitle`: **“No notifications yet”**) + **body** (`app.notifications.emptyBody`): order, request, access, and delivery updates will appear here as marketplace activity progresses.                                                                            |
| **Error**         | Localized **“Could not load notifications.”** (`app.notifications.loadFailed`) + **Retry** (`app.notifications.retry`) → re-runs `fetchList(true)`. Retry **disabled while loading**. Foreground list failures only; background poll failures stay silent (badge keeps last known value).                                                                                   |
| **Error + cache** | If notifications were loaded previously, **stale notification cards remain visible** below the error banner (items are **not** cleared on failure; no empty state).                                                                                                                                                                                                         |
| **Refresh**       | Header **Refresh** → `fetchList(true)`; label **Refreshing…** (`app.notifications.refreshing`) while loading **when cached notifications exist**; button disabled while loading or mark-read actions run. Refresh with cached notifications **keeps cards visible** during reload.                                                                                          |
| **Mark one read** | **Mark as read** button shows **Updating…** (`app.notifications.markReadLoading`) while `markingReadId` matches; `actionBusy` disables Refresh, Mark all read, order-linked clicks, and other mark buttons — **prevents duplicate clicks**. On success, item updates in place + `fetchUnreadCount()` refreshes badge.                                                       |
| **Mark all read** | Header **Mark all read** shows **Marking all read…** (`app.notifications.markAllReadLoading`) while `markingAll`; button disabled while loading, marking, or when `unreadTotal === 0`. On success, list reloads + success message + badge clears.                                                                                                                           |

**Unchanged bell behavior:** **`relatedOrderId` click** — mark unread as read → close popover → `onFocusOrder(relatedOrderId, panel)` → Accepted panel focus/scroll/highlight → **Accepted Order Details drawer** (same **`DeliveryOrder.id`** logic; never `availabilityRequestId`); **non-order notifications** — no navigation, no drawer, mark-as-read only; **manual Mark as read** and **Mark all read**; unread badge/count after mark actions; **Accepted delivery requests panel states**, drawer timeline/**Copy reference**/loading/error/retry — all unchanged.

**Current limitations:**

- **Frontend-only panel reliability** — Retry re-calls existing `GET /notifications`; **no new backend endpoints**
- **No realtime notification delivery** — list refreshes on popover open, **Refresh**, Retry, mark-read actions, and polling (30s unread / 60s list) — **no WebSocket/SSE/push**
- **Nothing deployed yet** — local development only

**i18n** (8 locales): `app.notifications.loading`, `emptyTitle`, `emptyBody`, `loadFailed`, `retry`, `refreshing`, `markReadLoading`, `markAllReadLoading`, `refresh`, `markRead`, `markAllRead` (legacy single-line `empty` / `markingRead` keys retained).

### Manual testing checklist (notification bell / popover panel states)

Use KYC-approved users on `/app`:

- [ ] Open bell popover → initial load shows **Loading notifications…** + skeleton (not empty)
- [ ] User with no notifications → **No notifications yet** title + body (order/request/access/delivery updates)
- [ ] Trigger order/payment/chat/dispute/access/request event → notification card(s) appear in popover
- [ ] Simulate list load failure (stop API) on empty popover → error + **Retry**; dashboard stable; no empty state
- [ ] With cached notifications, simulate failure → error banner + **stale cards still visible**; **Retry** restores
- [ ] **Refresh** with cached notifications → cards stay visible; button shows **Refreshing…** while loading
- [ ] **Mark as read** on unread non-order notification → works; button shows **Updating…**; duplicate clicks blocked while busy
- [ ] **Mark all read** → works; button shows **Marking all read…** while processing; unread badge clears
- [ ] Unread badge count correct after single mark and mark-all
- [ ] Click **`relatedOrderId`** notification → marks read, closes popover, focuses accepted card, opens drawer
- [ ] Notification **without** `relatedOrderId` → no navigation; mark-as-read only
- [ ] **Accepted panel** + **View details** drawer still work independently
- [ ] Normal `/app` load — no crash

### Order-linked notification click behavior

When a notification includes **`relatedOrderId`**, the bell treats it as an order link. **`relatedOrderId` is always `DeliveryOrder.id`** — for posted-order accept, lifecycle updates, mock payment, chat, dispute dispatch, and **converted availability-request accept**. It is **never** `availabilityRequestId`.

**Supported notification cases (clickable when `relatedOrderId` is set):**

| Case                                  | `NotificationType` (typical)                             | Recipient         | `relatedOrderId`                                |
| ------------------------------------- | -------------------------------------------------------- | ----------------- | ----------------------------------------------- |
| Posted OPEN order accepted            | `ORDER_ACCEPTED`                                         | Sender            | `DeliveryOrder.id`                              |
| Converted availability-request accept | `ORDER_ACCEPTED`                                         | Sender            | Created **`DeliveryOrder.id`** (not request id) |
| Transit / proof / delivered lifecycle | `ORDER_IN_TRANSIT`, `PROOF_SUBMITTED`, `ORDER_DELIVERED` | Sender            | `DeliveryOrder.id`                              |
| Mock payment events                   | `SYSTEM`                                                 | Wayler            | `DeliveryOrder.id`                              |
| Chat / dispute on order               | `SYSTEM`                                                 | Other participant | `conversation.orderId` / dispute order          |

**Click sequence (`NotificationBell` → `useFocusAcceptedOrder` on `/app`):**

1. **Mark as read** — if `readAt` is null, `api.notifications.markRead(id)`; already-read items skip the API call
2. **Close popover** — bell dropdown closes immediately
3. **Choose panel** — `getAcceptedPanelForNotification(type)` picks Sender vs Wayler Accepted panel (e.g. `ORDER_ACCEPTED` → Sender; mock payment → Wayler); tries the other panel if the order is not found
4. **Reload Accepted lists** — `loadSenderAcceptedOrders()` or `loadAcceptedOrders()` so the card exists in DOM (shows panel loading skeleton only when list was empty; **stale cards stay visible** on refresh when cached)
5. **Scroll + highlight** — smooth scroll to `#accepted-order-{DeliveryOrder.id}`; temporary primary ring on the card (~2.5s). If the order is not in either list, scrolls to the Accepted panel header only — **no drawer**, no crash, no retry loop.
6. **Open details drawer** — when the order is found, opens the **Accepted Order Details drawer** (including **Delivery progress** timeline, **loading skeleton / refreshing+stale detail / error+Retry / missing-detail empty**, and **Copy reference** + **Copied** feedback) for that same **`DeliveryOrder.id`** (same component/state as **View details** on the card). Drawer enriches via existing **`GET /orders/:id`** (`DeliveryOrder.id` only). **Not** opened when the order is missing from both Accepted lists. If detail fetch fails, drawer still opens with row summary + timeline + localized error + **Retry** — no crash. **Copy reference** works independently of detail fetch success/failure.

**Frontend modules:** `notification-bell.tsx`, `notification-order-focus.ts`, `use-focus-accepted-order.ts` (`openDetails` + `onOpenDetails` callback), wired from `apps/web/src/app/(app)/app/page.tsx` (`NotificationBell onFocusOrder={focusAcceptedOrderFromNotification}`). Accepted order cards expose `id={acceptedOrderElementId(order.id)}` on both Sender and Wayler panels.

**Notifications without `relatedOrderId`:**

- **No click navigation** — e.g. Wayler daily access activate/cancel, availability request create/decline/cancel
- **No drawer** — bell does not open Accepted Order Details drawer
- **Existing mark-as-read** button remains for unread items
- **No broken routes** — the bell does not invent order or request URLs

**Safe behavior when order not found:**

- Accepted panel still switches and scrolls to panel header
- **No drawer** opens (avoids broken/empty drawer state)
- No infinite retry; single load attempt per panel (primary hint, then fallback panel)

**Normal `/app` load:**

- Does **not** auto-open the drawer
- Optional URL focus `?focusOrderId={DeliveryOrder.id}&focusPanel=sender|wayler` scrolls/highlights only — **does not** open drawer (notification click and **View details** are the drawer entry points today)

**Current limitations:**

- **No dedicated order detail page/route** — notification click opens frontend drawer after focus; no full `/app/orders/:id` page
- **No URL deep link to drawer** — `?focusOrderId=` highlights card only
- **No deep link for decline/cancel availability requests** — no order id to link
- **No email/SMS/mobile push/Firebase/APNs**
- **No WebSocket/realtime notification delivery** — polling + manual Refresh/Retry only (see **Notification bell / popover panel states**)
- **Nothing deployed yet** — local development only

Optional URL focus on `/app` load: `?focusOrderId={DeliveryOrder.id}&focusPanel=sender|wayler` (consumed once, then stripped from the URL; highlight only — no drawer).

### Polling behavior

| Behavior              | Detail                                                                                                                                                                                                      |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unread count**      | `api.notifications.unreadCount()` on mount, then every **30 seconds** while user is on `/app` and tab is **visible**                                                                                        |
| **List refresh**      | Every **60 seconds** while dropdown is **open** and tab is **visible** (`api.notifications.list({ page: 1, limit: 10 })`)                                                                                   |
| **Tab hidden**        | Polling **paused** when `document.visibilityState` is `hidden` (intervals cleared)                                                                                                                          |
| **Tab visible**       | Polling **resumed** when tab becomes visible again (immediate unread fetch + intervals restart)                                                                                                             |
| **Overlap guard**     | Skips a new unread-count or list request if the same request type is already in flight                                                                                                                      |
| **Also refreshes**    | Unread count after dropdown open, mark read, mark all read, and manual Refresh                                                                                                                              |
| **Background errors** | Silent — badge/list keep last known values; main app unaffected                                                                                                                                             |
| **Foreground errors** | Dropdown list loads show **PanelErrorState** + **Retry** (see **Notification bell / popover panel states**); mark-read / mark-all errors show translated message in popover; stale cards remain when cached |

No WebSocket/SSE, email, push (Firebase/APNs), or notification preferences in the current version. **Nothing has been deployed** — local development only.

### Manual testing checklist (notifications)

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User A** publishes an order
- [ ] **User B** accepts → **User A** receives `ORDER_ACCEPTED` (check bell badge / dropdown)
- [ ] **User B** starts transit → **User A** receives `ORDER_IN_TRANSIT`
- [ ] **User B** submits proof → **User A** receives `PROOF_SUBMITTED`
- [ ] **User B** marks delivered → **User A** receives `ORDER_DELIVERED`
- [ ] **User A** opens bell → sees notifications with title, body (if any), timestamps
- [ ] Bell popover initial load → **Loading notifications…** + skeleton (not empty) — see **Notification bell / popover panel states**
- [ ] User with **no notifications** → friendly empty title + body (order/request/access/delivery updates)
- [ ] Simulate list load failure → error + **Retry**; stale cards when cached; **Refresh** / **Refreshing…** keeps cards visible
- [ ] **User A** marks **one** notification read → unread badge count decreases; **Updating…** label while processing; duplicate clicks blocked
- [ ] **User A** marks **all** read → unread badge disappears; **Marking all read…** while processing
- [ ] **User B** does **not** receive notifications for own accept/transit/proof/deliver actions
- [ ] User with **no notifications** sees empty state (title + body — not single-line legacy copy)
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

**Mock payment notifications:**

- [ ] **User A** creates order with reward/currency; **User B** accepts
- [ ] **User A** mock-authorizes → **User B** receives `SYSTEM` notification (“Payment was authorized”) with `relatedOrderId`
- [ ] **User A** mock-holds escrow → **User B** receives “Escrow is held”
- [ ] **User B** delivers with proof; **User A** mock-releases → **User B** receives “Mock payout created”
- [ ] **User A** does **not** receive notifications for own authorize/hold actions
- [ ] Re-clicking authorize when already `AUTHORIZED`/`HELD_IN_ESCROW` does **not** create duplicate notifications
- [ ] **User B**'s unread badge updates within **30 seconds** via existing bell polling (no frontend changes)

**Dispute notifications:**

- [ ] **User A** publishes order; **User B** accepts
- [ ] **User A** opens dispute → **User B** sees `SYSTEM` notification (“Dispute opened”) with `relatedOrderId`
- [ ] **User A** does **not** receive a notification for own open action
- [ ] **User B** adds dispute message → **User A** sees “New dispute message” (with preview when body is non-empty)
- [ ] **User B** does **not** receive a notification for own message
- [ ] **User A** adds evidence metadata → **User B** sees “New dispute evidence”
- [ ] **User A** does **not** receive a notification for own evidence submission
- [ ] Duplicate open attempt (**409**) does **not** create a second notification
- [ ] **User B**'s unread badge updates within **30 seconds** via existing bell polling (no frontend changes)

**Wayler daily work access notifications:**

Use a **KYC-approved Wayler** on `/app` (Wayler mode):

- [ ] **Mock activate** today's access → bell/dropdown shows `SYSTEM` notification — title **"Wayler work access active"**, body **"Your Wayler work access is active for today."**
- [ ] **Mock activate again** while already active → **no duplicate** activation notification
- [ ] **Cancel access** (from **ACTIVE**) → cancellation notification — title **"Wayler work access cancelled"**, body **"Your Wayler work access for today was cancelled."**
- [ ] **Cancel again** (already **CANCELLED**) → **409**; **no duplicate** cancellation notification
- [ ] Unread badge updates within **30 seconds** via existing bell polling (no frontend changes)
- [ ] Accept/chat gating still works after activate/cancel (see **Daily Wayler work access foundation**)

**Availability request notifications:**

Use two **KYC-approved** users (**S** = Sender, **W** = Wayler):

- [ ] **User W** publishes availability; **User S** sends request → **User W** bell shows `SYSTEM` — title **"New delivery request"**, body **"A Sender sent you a delivery request for your Wayler availability."**
- [ ] **User S** does **not** receive a notification for own create action
- [ ] **User W** accepts request → **User S** sees **`ORDER_ACCEPTED`** — title **"Your delivery request was accepted"**, body mentions **delivery order was created** (includes request title)
- [ ] **User S** accept notification **`relatedOrderId`** equals created **`DeliveryOrder.id`** (not `availabilityRequestId`)
- [ ] **User W** does **not** receive a notification for own accept action
- [ ] New **PENDING** request → **User W** declines → **User S** sees **`SYSTEM`** — **"Delivery request declined"** / **"Your delivery request was declined by the Wayler."**
- [ ] **User S** cancels another **PENDING** request → **User W** sees **`SYSTEM`** — **"Delivery request cancelled"** / **"A Sender cancelled a delivery request."**
- [ ] Double **accept**, **decline**, or **cancel** on non-`PENDING` request → **409**; **no duplicate** notification
- [ ] **Regression:** **User A** publishes order → **User B** accepts from OPEN feed → **User A** still receives **`ORDER_ACCEPTED`** with **`relatedOrderId`** (posted-order flow unchanged)
- [ ] Recipient unread badge updates within **30 seconds** via existing bell polling (no frontend changes)
- [ ] Existing notification bell/list, mark-read, mark-all-read, and popover panel states (loading/empty/error/retry/refresh) still work

**Order-linked notification click (posted order):**

Use **User A** (Sender) and **User B** (Wayler), KYC-approved:

- [ ] **User B** accepts **User A**’s posted OPEN order → **User A** receives **`ORDER_ACCEPTED`** with **`relatedOrderId`** = **`DeliveryOrder.id`**
- [ ] **User A** opens bell → clicks the **`ORDER_ACCEPTED`** notification
- [ ] Notification marks as **read** (unread badge decreases)
- [ ] Bell **popover closes**
- [ ] Dashboard switches to **Sender mode** and **Accepted delivery requests** panel is in view
- [ ] Matching accepted order card **scrolls into view** and shows a **temporary highlight ring**
- [ ] **Accepted Order Details drawer opens** for the same **`DeliveryOrder.id`** with **Delivery progress** timeline visible; loading/error/retry + **Copy reference** same as **View details**
- [ ] **Copy reference** in notification-opened drawer → full **`DeliveryOrder.id`** copied; **Copied** feedback appears
- [ ] Simulate detail fetch failure after notification open → row summary + timeline remain; error + **Retry** work; Close / Escape / backdrop still work
- [ ] Drawer closes via **Close** / **Escape** / **backdrop**
- [ ] Card actions (payment, chat, proof, **View details**) remain usable after closing drawer

**Order-linked notification click (converted availability request):**

- [ ] **User S** sends availability request → **User W** accepts → **User S** receives **`ORDER_ACCEPTED`** with **`relatedOrderId`** = created **`DeliveryOrder.id`** (not `availabilityRequestId`)
- [ ] **User S** clicks that notification → same behavior as posted-order case (read, close bell, focus Sender Accepted panel, scroll/highlight converted order card, open drawer with timeline)

**Notifications without `relatedOrderId` (safe behavior):**

- [ ] **User W** receives **`SYSTEM`** “New delivery request” (create) — **not** a full-row order link; unread shows **Mark as read** only
- [ ] Clicking the notification body does **not** navigate away, open a broken route, or open a drawer
- [ ] **Mark as read** still works; unread count updates correctly
- [ ] **Wayler access** activate/cancel notifications behave the same — no order navigation

**Regression:**

- [ ] Normal `/app` load **without** `focusOrderId` / `focusPanel` query params works unchanged — **no drawer** auto-open
- [ ] Manual Refresh, mark-all-read, and polling still work after using order-linked clicks
- [ ] **View details** on accepted card still opens drawer independently of notification flow

### Future milestones (notifications)

- **Dedicated payment notification types** — e.g. `PAYMENT_AUTHORIZED`, `ESCROW_HELD`, `PAYOUT_CREATED` (replace `SYSTEM` for payment dispatch)
- **Dedicated `CHAT_MESSAGE` type** — replace `SYSTEM` for chat dispatch (schema enum addition)
- **WebSocket/SSE real-time delivery** — instant unread count and list updates (lightweight **polling + popover Refresh/Retry exists today** — see **Notification bell / popover panel states**)
- **Email / push notifications** — FCM, transactional email for offline users
- **Notification preferences** — per-type opt-in/out, quiet hours
- **Localized notification templates** — server-side title/body per user locale (order, payment, chat, Wayler access)
- **Real Stripe/payment notifications** — checkout, capture, webhook-driven status updates (order escrow and **daily access purchase confirmation**)
- **Payout failure notifications** — Wayler/Sender alerts when payout processing fails
- **Dedicated dispute notification types** — e.g. `DISPUTE_OPENED`, `DISPUTE_MESSAGE`, `DISPUTE_EVIDENCE` (replace `SYSTEM` for dispute dispatch)
- **Dispute resolution notifications** — arbitrator assignment, resolve/reject outcomes
- **Admin/arbitrator dispute notifications** — queue assignment, escalation alerts
- **Payment/refund notifications after dispute resolution** — holds, reversals, payout blocks
- **KYC notifications** — `KYC_APPROVED`, `KYC_REJECTED` on provider/mock outcomes
- **Cancellation notifications** — `ORDER_CANCELLED` if post-accept cancellation is added later; notify Wayler when OPEN order is cancelled (see **Order cancellation**)
- **Admin / system notifications** — operator broadcasts (separate from chat `SYSTEM` dispatch today)
- **Push/email for chat** — offline chat alerts
- **Scheduled Wayler access expiry notification** — alert when daily pass expires (end of access window)
- **Dedicated `WAYLER_ACCESS` notification type** — replace `SYSTEM` for access dispatch (schema enum addition; optional entity link when schema supports it)
- **Dedicated availability-request notification types** — e.g. `AVAILABILITY_REQUEST_CREATED`, `DECLINED`, `CANCELLED` (replace `SYSTEM` for create/decline/cancel; accept already uses **`ORDER_ACCEPTED`**)
- **Dedicated order detail page/route + bell deep link** — full order detail route from notification (today: Accepted panel/card focus + drawer with **Delivery progress** timeline + **Copy reference** opens from bell click and **View details**; no dedicated route yet)
- **Public share link / backend share token** — shareable URL for orders (today: drawer **Copy reference** copies **`DeliveryOrder.id`** to clipboard only)
- **Realtime delivery progress / detail refresh in drawer** — live updates while drawer open (today: snapshot on open/retry)
- **Realtime accepted-order panel updates** — WebSocket/SSE for new accepts and status changes (today: Refresh, Retry, notification reload, accept callbacks)
- **Related entity link for availability requests** — optional `relatedAvailabilityRequestId` or generic entity reference for decline/cancel deep links
- **Push/email for availability requests** — offline alerts for new/accepted/declined/cancelled requests

## Chat / contact between Sender and Wayler

Chat lets the **Sender** and **accepted Wayler** coordinate delivery details for an order. The current version is **order-based in-app chat** — one conversation per accepted order, opened from Accepted panels on `/app`. **Waylers must have active daily work access** before opening a conversation or sending messages (part of the monetization/paywall foundation — see **Daily Wayler work access foundation**); **Senders are not blocked** by Wayler access rules. The open chat modal has **polished panel states** — loading skeleton, friendly empty, error + **Retry**, **Refresh** / **Refreshing…** (stale messages on error when cached), **Sending…** with duplicate-send prevention, and send-failure banner that preserves the draft (see **Accepted order chat modal panel states**). The modal **polls for new messages every 10 seconds** (visibility-aware). When a message is sent, the **other participant** receives an **in-app notification** in the shared bell/dropdown (`SYSTEM` type until `CHAT_MESSAGE` exists). **WebSocket/SSE realtime chat delivery, push/email for chat, attachments, and read-receipt UI** are not implemented yet.

### Current chat flow

```text
Accepted order (ACCEPTED / IN_TRANSIT / DELIVERED)
        ↓
Open chat  (Sender or Wayler Accepted panel → api.conversations.forOrder)
        ↓
Wayler acting as accepted Wayler? → require active daily access (403 WAYLER_ACCESS_REQUIRED if missing)
        ↓
Send / read messages  (detail + send + markRead)
        ↓
Wayler send message? → require active daily access again (403 if pass cancelled mid-session)
        ↓
Chat modal polling  (detail every 10s while open + tab visible → markRead)
        ↓
Other participant notified  (in-app bell/dropdown via SYSTEM notification — only after successful send)
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

| Method | Path                                   | Description                                                                                      |
| ------ | -------------------------------------- | ------------------------------------------------------------------------------------------------ |
| POST   | `/api/v1/conversations/order/:orderId` | Create or fetch conversation for an eligible order (Wayler contact requires active daily access) |
| GET    | `/api/v1/conversations`                | Paginated list for current user (`page`, `limit`) — not gated by Wayler access                   |
| GET    | `/api/v1/conversations/:id`            | Conversation detail + message history (latest 100, asc) — not gated by Wayler access             |
| POST   | `/api/v1/conversations/:id/messages`   | Send message — body `{ body: string }` (Wayler send requires active daily access)                |
| POST   | `/api/v1/conversations/:id/read`       | Mark unread messages from the other participant as read — not gated by Wayler access             |

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
- **Wayler daily access (monetization)** — when the current user is the **accepted Wayler** on the order/conversation:
  - **`POST /conversations/order/:orderId`** (open/create conversation) requires an **active** `WaylerAccessPass` for today (`status=ACTIVE`, `startsAt <= now`, `expiresAt > now`) → **403** `WAYLER_ACCESS_REQUIRED` with message _"Active Wayler work access is required before contacting Senders"_.
  - **`POST /conversations/:id/messages`** requires the same active pass → **403** `WAYLER_ACCESS_REQUIRED` with message _"Active Wayler work access is required before sending messages"_.
  - **Sender participants** are never blocked by Wayler access rules.
  - **Read/list/detail/markRead** are **not** gated in the current batch — Waylers can still read existing messages when access is inactive; only contact (open) and send are blocked.
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

| Behavior              | Detail                                                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Detail refresh**    | `api.conversations.detail(id)` every **10 seconds** while modal is **open** and tab is **visible**                                                                                                                         |
| **Mark read**         | `api.conversations.markRead(id)` after each **successful** background poll (and on open / Refresh / send)                                                                                                                  |
| **Tab hidden**        | Polling **paused** when `document.visibilityState` is `hidden` (interval cleared)                                                                                                                                          |
| **Tab visible**       | Polling **resumed** when tab becomes visible again (immediate catch-up poll + interval restarts)                                                                                                                           |
| **Overlap guard**     | Skips a new detail request if one is already in flight; `markRead` skipped if already in flight                                                                                                                            |
| **Manual Refresh**    | Still available — foreground reload with translated errors on failure; **Refreshing…** label when cached messages exist (see **Accepted order chat modal panel states**)                                                   |
| **After send**        | Immediate foreground refresh after successful `sendMessage` (unchanged)                                                                                                                                                    |
| **Background errors** | Silent — existing messages stay visible; input draft is not cleared                                                                                                                                                        |
| **Foreground errors** | Open/Refresh load failures → `PanelErrorState` + **Retry**; send failures → separate localized banner (`sendFailed`); mark-read failures → inline note (`markReadFailed`) — see **Accepted order chat modal panel states** |
| **Typing**            | Background polls do **not** set loading state — message input stays enabled while polling                                                                                                                                  |

No WebSocket/SSE in the current version.

### Accepted order chat modal panel states

The compact **chat modal** on `/app` (`ConversationPanel` in `apps/web/src/components/app/conversation-panel.tsx`) — opened from **Open chat** on Sender/Wayler **Accepted delivery requests** panels — shares polished loading, empty, error, refresh, and send UX with other marketplace panels. Frontend-only (shared `PanelEmptyState`, `PanelErrorState`, `RequestsListSkeleton` from `apps/web/src/components/app/panel-status-states.tsx`). **No backend/schema changes.** **10s detail polling**, Wayler daily-access gating, and chat in-app notifications are unchanged.

| State             | Behavior                                                                                                                                                                                                                                                                                                                                        |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**       | Visible **“Loading messages…”** (`app.chat.loading`, `role="status"`, `aria-live="polite"`) + compact message skeleton (`RequestsListSkeleton`, 3 rows, `h-12`) on **initial load when no cached messages** (`loading && messages.length === 0`). **Does not show empty state while loading.** Modal remains usable; `/app` does **not** crash. |
| **Success**       | You/Other message bubbles with `body`, `createdAt`; message list scrolls in modal body.                                                                                                                                                                                                                                                         |
| **Empty**         | When `!loading && !loadError && messages.length === 0` — bordered empty state with **title** (`app.chat.emptyTitle`: **“No messages yet”**) + **body** (`app.chat.emptyBody`): messages between the **Sender** and **Wayler** will appear here; user can send the first message below.                                                          |
| **Error (load)**  | Localized **“Could not load conversation.”** (`app.chat.loadFailed`) + **Retry** (`app.chat.retry`) → re-runs foreground `refreshConversation(true)`. Retry **disabled while loading**.                                                                                                                                                         |
| **Error + cache** | If messages were loaded previously, **stale message bubbles remain visible** below the load-error banner (messages are **not** cleared on load failure; no empty state).                                                                                                                                                                        |
| **Refresh**       | Header **Refresh** → foreground `refreshConversation(true)`; label **Refreshing…** (`app.chat.refreshing`) while loading **when cached messages exist** (`loading && messages.length > 0`); button disabled while loading or sending. Refresh with cached messages **keeps bubbles visible** during reload.                                     |
| **Sending**       | **Send** button shows **Sending…** (`app.chat.sending`) while `sendMessage` is in flight; **Send** disabled (`canSend` false) — prevents duplicate sends; textarea disabled while sending.                                                                                                                                                      |
| **Send failure**  | Separate localized error banner (`app.chat.sendFailed` or access-specific copy) — **does not clear existing messages**; **draft text preserved** in textarea; user can edit and retry send.                                                                                                                                                     |

**Unchanged chat behavior:** **Sender** can open/send chat for accepted orders (no Wayler access gate). **Wayler** can open/send chat **only with active daily access** — disabled **Open chat** + access note when inactive; `waylerSendBlocked` disables textarea/send in modal when access lapses; **403** `WAYLER_ACCESS_REQUIRED` on API bypass. **Converted orders** use **`DeliveryOrder.id`** via `api.conversations.forOrder(orderId)` — **not** `availabilityRequestId`. **Accepted Order Details drawer**, **notification bell / popover panel states**, order-linked notification click (focus accepted card + open drawer), mock payment, proof, dispute, and order lifecycle behavior — all unchanged.

**Current limitations:**

- **Frontend-only panel reliability** — Retry/Refresh re-call existing conversation API; **no new backend endpoints**
- **No realtime chat delivery** — modal refreshes on open, **Refresh**, Retry, successful send, and **10s polling** while open — **no WebSocket/SSE**
- **No push notifications for chat** — in-app bell only (`SYSTEM` type today)
- **Nothing deployed yet** — local development only

**i18n** (8 locales): `app.chat.loading`, `emptyTitle`, `emptyBody`, `loadFailed`, `retry`, `refreshing`, `sending`, `sendFailed`, `refresh`, `send`, `close`, plus existing access-required keys.

### Manual testing checklist (accepted order chat modal panel states)

Use two KYC-approved users (**A** = Sender, **B** = Wayler) on `/app`:

- [ ] **User A** (Sender Accepted panel) → **Open chat** on accepted order → modal opens
- [ ] **User B** with **active daily access** (Wayler Accepted panel) → **Open chat** → modal opens
- [ ] **User B** **without active access** → **Open chat** disabled + access note; API bypass → **403** `WAYLER_ACCESS_REQUIRED`
- [ ] Initial open with no cached messages → **Loading messages…** + skeleton (not empty)
- [ ] Conversation with no messages after load → **No messages yet** title + body (Sender/Wayler messages; send first below)
- [ ] Conversation with existing messages → You/Other bubbles render
- [ ] Simulate load failure (stop API) on empty modal → error + **Retry**; no empty state; `/app` stable
- [ ] With cached messages, simulate load failure → error banner + **stale bubbles still visible**; **Retry** restores
- [ ] **Refresh** with cached messages → bubbles stay visible; button shows **Refreshing…** while loading
- [ ] Send message success → input clears; messages reload; other participant notified (see chat notifications)
- [ ] While sending → **Sending…** label; duplicate **Send** clicks blocked; textarea disabled
- [ ] Simulate send failure → send-error banner; **existing messages not cleared**
- [ ] After send failure → **draft text preserved** in textarea; user can retry
- [ ] Converted order (`WAYLER_AVAILABILITY_REQUEST`) → **Open chat** uses **`DeliveryOrder.id`** (not `availabilityRequestId`)
- [ ] **Accepted Order Details drawer** (**View details**) still works independently of chat modal
- [ ] Click order-linked notification → focus accepted card + open drawer (unchanged)
- [ ] Normal `/app` load — no crash

### Frontend behavior (`/app`)

| Feature               | Behavior                                                                                                                                 |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Open chat**         | Button on **Sender Accepted Orders** and **Wayler Accepted** panels                                                                      |
| **Wayler access**     | Wayler **Open chat** disabled + access note when no active pass; Sender chat always enabled                                              |
| **Eligible orders**   | `ACCEPTED`, `IN_TRANSIT`, `DELIVERED` only — no button on DRAFT/OPEN                                                                     |
| **Open flow**         | `api.conversations.forOrder(order.id)` → opens compact chat modal with **panel states** (see **Accepted order chat modal panel states**) |
| **On open**           | Foreground `api.conversations.detail(id)` + `api.conversations.markRead(id)` — initial loading skeleton when no cached messages          |
| **Polling**           | Background detail refresh every **10s** while open + tab visible (see **Polling behavior**) — does not trigger loading skeleton          |
| **Message list**      | You/Other bubbles, `createdAt`; **PanelEmptyState** when load finished and no messages                                                   |
| **Load error**        | `PanelErrorState` + **Retry**; stale messages remain when cached                                                                         |
| **Send**              | Textarea max 2000 chars; **Sending…** while in flight; Send disabled when empty/whitespace, loading, sending, or Wayler access inactive  |
| **Send failure**      | Localized banner; draft preserved; existing messages not cleared                                                                         |
| **Wayler send block** | When access inactive while modal open: textarea/send disabled + access note                                                              |
| **After send**        | Clear input on success, immediate foreground reload + mark read                                                                          |
| **Refresh**           | Manual foreground reload detail + mark read; **Refreshing…** when cached messages exist                                                  |
| **Close**             | Dismiss modal; click outside to close; polling stops                                                                                     |
| **Access refresh**    | Mock activate/cancel in Wayler access panel updates accept/chat state via `onAccessChanged`                                              |

i18n keys under `app.chat.*` (8 locales), including `emptyTitle`, `emptyBody`, `retry`, `refreshing`, `loading`, `loadFailed`, `sending`, `sendFailed`, `accessRequired*`, `accessRequiredForContact`, `accessRequiredForMessage`, `accessRequiredContactFailed`, `accessRequiredMessageFailed`.

### Converted DeliveryOrders (chat)

Orders created from **`WAYLER_AVAILABILITY_REQUEST`** accept use the **same chat UI and API** as Sender-posted accepted orders:

- **Open chat** passes **`DeliveryOrder.id`** to `api.conversations.forOrder(orderId)` — never `availabilityRequestId`.
- **Sender** — chat always enabled on Accepted panel (no Wayler access gate).
- **Wayler** — same daily-access gate as posted orders (disabled **Open chat** + note when inactive; send blocked in modal when access lapses).
- **Conversation** is created **lazily** on first open — not during availability-request accept.
- **Chat modal panel states** (loading/empty/error/retry/refresh/sending) apply to converted orders the same as posted orders — see **Accepted order chat modal panel states**.
- After Wayler accepts a request, **Accepted panels auto-refresh** so the converted order row (with **Open chat**) appears without manual page reload (see **DeliveryOrder conversion** → **Accepted-panel refresh**).

Normal posted-order chat behavior is unchanged.

### Manual testing checklist (chat)

Use two KYC-approved users (**A** = Sender, **B** = Wayler) and optional **User C**:

- [ ] **User A** publishes an order
- [ ] **User B** mock-activates today's Wayler access → accepts order
- [ ] **User B** cancels today's access (Wayler access panel)
- [ ] **User B** (Wayler Accepted): **Open chat** disabled + access note; `POST /conversations/order/:orderId` → **403** `WAYLER_ACCESS_REQUIRED`
- [ ] **User B** mock-activates access again → **Open chat** enabled
- [ ] **User A** (Sender Accepted panel) → **Open chat** → conversation created (Sender not blocked by Wayler access)
- [ ] **User A** sends a message
- [ ] **User B** (Wayler Accepted panel) → **Open chat** → sees **User A**'s message
- [ ] **User B** cancels access while chat modal open → send disabled + access note; `POST /conversations/:id/messages` → **403** `WAYLER_ACCESS_REQUIRED`
- [ ] **User B** mock-activates access → can send reply
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

**Converted DeliveryOrders (availability-request accept):**

- [ ] **User S** sends availability request → **User W** mock-activates daily access → **User W** accepts
- [ ] Converted order appears in **both** Accepted panels **without manual page refresh**
- [ ] **User S**: **Open chat** on converted order → succeeds (`POST /conversations/order/{deliveryOrderId}`)
- [ ] **User W** with active access: **Open chat** → succeeds; can send message
- [ ] **User W** without active access: **Open chat** disabled + access note; API → **403** `WAYLER_ACCESS_REQUIRED`
- [ ] Chat endpoint uses **`DeliveryOrder.id`**, not availability request id
- [ ] No conversation exists until first **Open chat** (lazy create)
- [ ] Normal Sender-posted order → accept → chat still works (regression)

### Future milestones (chat)

- **Dedicated `CHAT_MESSAGE` notification type** — replace `SYSTEM` for chat dispatch
- **WebSocket/SSE** — instant message delivery (lightweight **10s polling + modal Refresh/Retry exists today** — see **Accepted order chat modal panel states**)
- **Push / email notifications** for chat — offline alerts beyond in-app bell
- **Notification preferences** — per-type opt-in/out for chat vs order events
- **Typing indicators** — show when the other party is composing
- **Read receipt UI** — visual read state beyond backend `readAt` + `markRead`
- **File / image attachments** — proof photos, location pins, etc.
- **Moderation / reporting** — flag abusive messages
- **Admin / arbitrator access** — visibility during disputes
- **Localized system messages** — server-side templates for automated chat events

### Future milestones (marketplace)

- **Two-sided discovery (Wayler side)** — Waylers publish local availability and trip routes via API/SDK + **Wayler management UI** on `/app` + **My listings panel states** (complete — see **Wayler availability and trip listings foundation** → **Wayler availability/trips panel states**)
- **Two-sided discovery (Sender side)** — Senders browse active Waylers/trips, **send delivery requests**, and manage **“My requests to Waylers”** via **Sender browse UI** on `/app` + **Sender browse discovery Results list panel states** (complete — see **Sender ↔ Wayler availability requests** → **Sender browse Wayler availability / discovery panel states**)
- **Wayler incoming requests** — Waylers review and accept/decline Sender requests on `/app` (complete — see **Sender ↔ Wayler availability requests**)
- **Location filters for orders and Waylers** — shared country/city/region selectors on both sides
- **Sender Published Orders realtime updates** — WebSocket/SSE when Sender publishes/cancels (today: panel load, Refresh, Retry, publish/cancel — see **Sender Published Orders panel states**)
- **Matching recommendations** — suggest Sender requests that fit a Wayler trip or local availability window
- **Map-based availability visualization** — trip routes and local coverage on dashboard maps
- **Stripe checkout & real payout processing** — provider integration (mock/manual API + Sender/Wayler payment UI complete — see **Payment and escrow foundation**)
- **Dispute resolution workflow** — arbitrator assignment, resolve/reject, `DisputeResolution` outcomes (schema + API + SDK + Sender/Wayler UI complete — see **Dispute and arbitration foundation**)
- **Payment hold/refund/release on dispute outcome** — tie `PaymentIntent` / ledger to arbitrator resolution
- **Dedicated dispute notification types** — replace `SYSTEM` for dispute dispatch; localized templates; push/email
- **Production geocoding** — backend geocoding cache / Mapbox (or other provider); lat/lng on create
- **Admin / arbitrator panel** — assignment, review queue, resolution actions, audit visibility
- **Daily work access fee / Wayler paywall** — schema + API + SDK + panel UI + **accept gating** (posted orders + incoming Sender requests) + **contact/message gating + activate/cancel notifications complete** (see **Daily Wayler work access foundation**); Stripe checkout for real paid daily access is future — e.g. ~€1/day before taking jobs, contact, or chat
- **Mobile / PWA polish** and premium redesign (see **Premium dashboard UI foundation** — foundation pass complete)

## Payment and escrow foundation

Wayly is preparing for **monetization** with a database foundation, shared types, a **mock/manual payment API**, and **two-sided payment UI** on `/app` — **Sender Accepted payment controls** plus **Wayler Accepted read-only payout visibility** — for **payments**, **escrow**, **platform fees**, **payouts**, **refunds**, and an **audit ledger**. The current version uses provider **`MANUAL` only** — **no Stripe**, **no checkout**, **no card forms**, **no webhooks**, and **no real money movement**. Suitable for **local and business-flow testing** only. **Scope today is `DeliveryOrder`-based** — mock authorize/hold/release applies to any **accepted** order, including orders created from availability-request accept — but **accept does not auto-create a `PaymentIntent` or start escrow**; the Sender must still trigger mock payment actions manually (see **Sender ↔ Wayler availability requests**).

### Purpose

- Prepare the data model for Sender → platform → Wayler money flows tied to `DeliveryOrder`.
- Exercise **authorize → hold escrow → release** transitions via mock API and Sender UI before Stripe integration.
- Let Waylers **observe** payment/payout status on accepted jobs (read-only) while Senders control mock actions.
- Notify **Waylers in-app** when mock payment state changes (authorize / hold / release) via existing notification bell.
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
        ↓  In-app notification → Wayler ("Payment was authorized")
Sender: mock-hold-escrow (UI or POST)  →  HELD_IN_ESCROW
        ↓  LedgerEntry: ESCROW_HELD, PLATFORM_FEE_CHARGED (10% mock fee)
        ↓  In-app notification → Wayler ("Escrow is held")
Wayler: transit → submit proof → mark DELIVERED
        ↓
Sender: mock-release (UI or POST)  →  RELEASED + Payout PENDING (MANUAL)
        ↓  LedgerEntry: PAYOUT_CREATED
        ↓  In-app notification → Wayler ("Mock payout created")
```

Sender Accepted panel buttons call the same SDK methods as the API routes above. Wayler Accepted panel loads the same intent read-only via `api.payments.forOrder(order.id)`. Wayler notifications flow through the existing bell/dropdown (see **Notifications**).

**Fee split (mock):** `amount` = `offeredRewardAmount`; `platformFeeAmount` = 10%; `escrowAmount` = remainder.

### Two-sided mock payment UI flow

```text
User A (Sender)                          User B (Wayler)
        │                                        │
        │ creates order (reward + currency)      │
        │                                        │ accepts
        │ mock authorize → AUTHORIZED            │ sees "Payment not authorized yet"
        │                                        │ bell: "Payment was authorized"
        │ mock hold escrow → HELD_IN_ESCROW      │ refreshes → HELD_IN_ESCROW + amounts
        │                                        │ bell: "Escrow is held"
        │                                        │ transit → proof → DELIVERED
        │ mock release → RELEASED + Payout PENDING │ refreshes → RELEASED / mock payout created
        │                                        │ bell: "Mock payout created"
```

- **Sender** controls mock **authorize**, **hold escrow**, and **release** from **Accepted Orders**.
- **Wayler** **observes** status in Accepted panel and via **in-app notifications** — **no payment action buttons**.
- **Sender payment actions** auto-refresh the Sender **Accepted delivery requests** panel after authorize / hold / release — **unchanged**.
- **Wayler payment status** does **not** update in real time — use panel **Refresh** (see **Wayler Accepted panel payment refresh** below).
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

### Accepted payment panel states (Sender + Wayler Accepted cards)

Frontend-only polish on per-order **Payment** sections (`apps/web/src/app/(app)/app/page.tsx`). **No backend/schema/SDK changes.** Wayler view remains **read-only** (no authorize/hold/release buttons). Converted orders use **`DeliveryOrder.id`** for `api.payments.forOrder(order.id)`.

| State                      | Sender behavior                                                                                       | Wayler behavior                |
| -------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------ |
| **Loading payment**        | **Loading payment…** while `forOrder` in flight — no misleading authorized/released label             | Same read-only loading copy    |
| **Refreshing payment**     | **Refreshing payment…** on re-fetch with known intent — **stale amounts/status stay visible**         | Same                           |
| **Load error**             | Localized failure + **Retry payment status** for that card only                                       | Same                           |
| **Action processing**      | Button labels **Authorizing…**, **Capturing…** (hold escrow), **Releasing…**, generic **Processing…** | N/A (read-only)                |
| **Duplicate action**       | Second click on authorize/hold/release **blocked** while in-flight                                    | N/A                            |
| **Missing intent (`404`)** | **Not authorized** — not a scary error; authorize when eligible                                       | **Payment not authorized yet** |

Panel-level **Refresh** on Wayler Accepted still reloads orders + all per-order payment rows (see **Wayler Accepted panel payment refresh**). **No WebSocket/SSE** realtime payment updates.

**i18n** (8 locales): `app.senderPanel.payment.loading`, `refreshing`, `loadFailed`, `retry`, `authorizing`, `capturing`, `releasing`, `processing`; `app.waylerFeed.acceptedPanel.payment.*` equivalents.

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

i18n keys: `app.waylerFeed.acceptedPanel.payment.*` (8 locales).

### Wayler Accepted panel payment refresh

Waylers do **not** see Sender payment updates automatically in the Accepted panel. After the Sender mock-authorizes, holds escrow, or releases payout, the Wayler must click **Refresh** on **Accepted delivery requests** to reload payment/escrow status.

| Topic               | Behavior                                                                                                                                                               |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Refresh button**  | Header **Refresh** on Wayler **Accepted delivery requests** → calls `loadAcceptedOrders()`                                                                             |
| **While loading**   | Button label **Refreshing…**; button disabled (same as other in-flight panel actions)                                                                                  |
| **What reloads**    | `api.orders.accepted()` **and** `api.payments.forOrder(order.id)` per row — orders + payment status together                                                           |
| **Applies to**      | Normal Sender-posted accepted orders **and** converted availability-request orders (`sourceType` irrelevant)                                                           |
| **Panel hint**      | When at least one accepted order is shown: _“Use Refresh to update payment status after Sender payment actions.”_ (`app.waylerFeed.acceptedPanel.payment.refreshHint`) |
| **Sender side**     | Sender **Payment** actions still call `loadSenderAcceptedOrders()` after success — **no change**                                                                       |
| **Not implemented** | No WebSocket/SSE, no payment-panel polling, no auto-refresh when another user pays                                                                                     |

**i18n:** `app.waylerFeed.acceptedPanel.refresh`, `app.waylerFeed.acceptedPanel.refreshing`, `app.waylerFeed.acceptedPanel.payment.refreshHint` (8 locales).

See **Converted DeliveryOrders (mock payment compatibility)** and **Sender ↔ Wayler availability requests** → **Mock payment for converted DeliveryOrders** — same Refresh flow for converted orders.

### Converted DeliveryOrders (mock payment compatibility)

Orders created from **`WAYLER_AVAILABILITY_REQUEST`** accept use the **same mock payment UI and API** as Sender-posted accepted orders — **verified compatible; no code changes required** for this batch.

| Topic                         | Behavior                                                                                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Payment endpoints**         | `POST /api/v1/payments/orders/:orderId/mock-authorize`, `GET /api/v1/payments/orders/:orderId`, hold/release by `paymentIntentId` — **`orderId` = `DeliveryOrder.id`**, **not** `availabilityRequestId`                                                       |
| **No `sourceType` filter**    | `PaymentsService` authorizes/views by `senderId`, `acceptedWaylerId`, order status, and reward/currency — **no** check for `SENDER_POSTED_ORDER` vs `WAYLER_AVAILABILITY_REQUEST`                                                                             |
| **Sender UI**                 | Same **Payment** panel on **Accepted delivery requests** (Sender mode) — **Mock authorize payment**, **Mock hold escrow**, **Mock release payout** when eligible                                                                                              |
| **Wayler UI**                 | Same read-only **Payment / payout** section on **Accepted delivery requests** (Wayler mode) — **no authorize buttons**                                                                                                                                        |
| **Reward/currency**           | Converted orders map `proposedRewardCents` ÷ 100 and `currency` from the availability request — required for mock authorize                                                                                                                                   |
| **No auto payment on accept** | **`PaymentIntent` is not created** during availability-request accept; Sender triggers mock actions manually (same as posted orders)                                                                                                                          |
| **Wayler refresh**            | Click panel **Refresh** after Sender payment actions — reloads orders + `api.payments.forOrder(order.id)` per row (see **Wayler Accepted panel payment refresh**); same for posted and converted orders                                                       |
| **Drawer timeline**           | **Delivery progress** in Accepted Order Details drawer shows **Payment** step when payment status was loaded on the accepted card; step **omitted** on payment load failure (see **Delivery lifecycle after acceptance** → **Accepted Order Details drawer**) |

See **Sender ↔ Wayler availability requests** → **Mock payment for converted DeliveryOrders** for conversion context and manual test steps.

### Mock payment notifications (Wayler dispatch)

After each **successful** mock payment state change, `PaymentsService` dispatches an in-app notification to the **Wayler** (`payeeId`). Dispatch uses `NotificationsService.createForUser()` — failures are logged and do **not** roll back the payment action.

| Payment action   | Recipient  | `NotificationType` | Title                  | Body                                                |
| ---------------- | ---------- | ------------------ | ---------------------- | --------------------------------------------------- |
| mock-authorize   | **Wayler** | `SYSTEM`           | Payment was authorized | The Sender authorized payment for your delivery.    |
| mock-hold-escrow | **Wayler** | `SYSTEM`           | Escrow is held         | Payment is now held in escrow for your delivery.    |
| mock-release     | **Wayler** | `SYSTEM`           | Mock payout created    | A mock/manual payout was created for your delivery. |

- **`relatedOrderId`** is set on every mock payment notification.
- **Sender is not notified** for their own authorize/hold actions (release also notifies Wayler only in the current batch).
- **`SYSTEM` type** is used because no payment-specific `NotificationType` exists yet — dedicated types are a future milestone.
- **No duplicate notifications** on idempotent calls — e.g. re-authorize when already `AUTHORIZED`/`HELD_IN_ESCROW` returns existing state without notifying.

**End-to-end flow (no frontend changes required for dispatch):**

```text
Sender mock payment action (UI or API)
        ↓
PaymentsService state change + ledger
        ↓
NotificationsService.createForUser()  →  Wayler notification row
        ↓
GET /notifications*  +  api.notifications.*
        ↓
NotificationBell polling  →  unread badge + dropdown
```

See **Notifications** for bell polling, mark-read, and full manual test steps.

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
- **No realtime Wayler payment panel updates** — Accepted panel payment status refreshes on manual **Refresh** only (no WebSocket/SSE/polling on payment rows); Wayler may still see **bell** notifications for authorize/hold/release.
- **For local/business-flow testing only** — not production payment processing.

### Current scope

| Included                                                                                        | Not included (yet)                                  |
| ----------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Prisma enums + models + migration                                                               | Stripe / Connect integration                        |
| `@wayly/types` payment summaries                                                                | Real Wayler payout dashboard                        |
| Mock/manual payment API + SDK                                                                   | Checkout flow / card forms                          |
| Sender Accepted mock payment UI (authorize / hold / release)                                    | Payout method setup                                 |
| Wayler Accepted read-only payment/payout visibility                                             | Payout processing (`PAID`)                          |
| Escrow release rules (mock, proof-gated)                                                        | Refund workflow                                     |
| Ledger on authorize/hold/release                                                                | Payment webhooks                                    |
| Two-sided mock payment UI (Sender acts, Wayler observes)                                        | Payout history / failure handling                   |
| Mock payment in-app notifications (Wayler, `SYSTEM` type)                                       | Dedicated payment notification types                |
| Converted-order mock payment (verified — same `DeliveryOrder.id` flow; no sourceType filter)    | Auto `PaymentIntent` on availability-request accept |
| Wayler Accepted payment refresh helper (Refresh + hint; reloads orders + payment status)        | Realtime payment status in Accepted panel           |
| Wayler access panel UI (mock/manual daily access — see **Daily Wayler work access foundation**) | Stripe checkout for daily access                    |
| Accept / contact / message gating behind active daily Wayler access                             | Real paid subscription / auto-renew                 |
| Wayler access activate/cancel in-app notifications (`SYSTEM`)                                   | Stripe payment-confirmation notification            |
|                                                                                                 | Real money movement                                 |

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
- [ ] Per-card **Loading payment…** / **Refreshing payment…** / **Retry payment status** on load failure
- [ ] Sender **Authorizing…** / **Capturing…** / **Releasing…** labels during mock actions; **duplicate payment clicks blocked**

### Manual visual testing checklist (Wayler Accepted payout visibility)

On `/app` in **Wayler mode** with the same two users (**A** = Sender, **B** = Wayler):

- [ ] **User A** creates order with **reward** and **currency**; **User B** accepts
- [ ] **User B** opens **Accepted delivery requests** → helper text: _“Use Refresh to update payment status after Sender payment actions.”_
- [ ] **User B** sees **Payment not authorized yet**
- [ ] **User A** mock-authorizes and mock-holds escrow
- [ ] **User B** clicks **Refresh** → button shows **Refreshing…** while loading
- [ ] After load: status **Held in escrow** with **amount**, **platform fee**, **escrow amount**, **currency**, **provider**
- [ ] **User B** delivers with proof; **User A** mock-releases payout
- [ ] **User B** clicks **Refresh** again → status **Released** / **mock payout created** note
- [ ] **User B** panel has **no** payment action buttons (authorize / hold / release)
- [ ] No Stripe, checkout, or card-form UI on Wayler panel

### Manual testing checklist (Wayler Accepted payment refresh)

Use two **KYC-approved** users (**S** = Sender, **W** = Wayler):

**Posted order:**

- [ ] **User S** creates/publishes order → **User W** accepts
- [ ] **User S** mock-authorizes payment (Sender Accepted panel auto-refreshes)
- [ ] **User W**: payment still shows **not authorized** until **Refresh**
- [ ] **User W** clicks **Refresh** → updated **Authorized** (or **Held in escrow** after hold)
- [ ] **User S** mock payment actions still work (regression)

**Converted availability-request order:**

- [ ] **User S** sends request → **User W** accepts → converted order in **Accepted delivery requests**
- [ ] **User S** mock-authorizes payment
- [ ] **User W** clicks **Refresh** → updated payment status on converted order row
- [ ] Same helper text and **Refreshing…** button behavior as posted orders

### Manual testing checklist (converted DeliveryOrders — mock payment)

Use two **KYC-approved** users (**S** = Sender, **W** = Wayler):

- [ ] **Regression:** **User S** creates/publishes a normal order → **User W** accepts → mock authorize / hold / release still works
- [ ] **User S** sends availability request (with reward + currency) → **User W** mock-activates daily access → **User W** accepts
- [ ] Converted order appears in **Sender Accepted** panel (with **“From Wayler request”** badge)
- [ ] **User S**: **Payment** panel shows **Not authorized** → **Mock authorize payment** succeeds
- [ ] Network: `POST /api/v1/payments/orders/{deliveryOrderId}/mock-authorize` — uses **`DeliveryOrder.id`**, not availability request id
- [ ] **User S**: **Mock hold escrow** → **Held in escrow**; amounts match `offeredRewardAmount` from request
- [ ] **User W**: refresh **Accepted delivery requests** → **Payment / payout** shows **Authorized** or **Held in escrow** (read-only); **Refresh** button shows **Refreshing…** while loading
- [ ] **User W** panel has **no** payment action buttons
- [ ] **User W** delivers with proof; **User S** mock-releases → **User W** refreshes → **Released** / mock payout note
- [ ] Posted-order mock payment flow unchanged (regression)

### Manual testing checklist (mock payment notifications)

Use two KYC-approved users (**A** = Sender, **B** = Wayler) on `/app`:

- [ ] **User A** creates order with reward/currency; **User B** accepts
- [ ] **User A** mock-authorizes → **User B** sees “Payment was authorized” in bell (`SYSTEM`, `relatedOrderId` set)
- [ ] **User A** mock-holds escrow → **User B** sees “Escrow is held”
- [ ] **User B** delivers with proof; **User A** mock-releases → **User B** sees “Mock payout created”
- [ ] **User A** receives **no** notification for own authorize/hold actions
- [ ] Re-click authorize when already authorized → **no** duplicate Wayler notification
- [ ] **User B** unread badge updates within **30s** via existing bell polling (no frontend changes)
- [ ] Payment action still succeeds if notification insert fails (logged server-side only)

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

Mock API, two-sided payment UI, and Wayler in-app notifications today exercise the middle lifecycle without a payment processor.

### Future milestones (payments & monetization)

- **Realtime Wayler payment status in Accepted panel** — WebSocket/SSE or lightweight polling (today: manual **Refresh** + bell notifications only)
- **Dedicated payment notification types** — replace `SYSTEM` for authorize/hold/release dispatch
- **Localized payment notification templates** — per-user locale for title/body
- **Push/email for payment events** — offline Wayler/Sender alerts
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
- **Platform fee settings** — configurable percentage/fixed (today: hard-coded **10% mock**; stakeholder direction: move toward **~5%** platform commission)
- **Daily work access fee** — Wayler must activate **today's work access** (e.g. **~€1/day**) before **accepting jobs** (posted orders or incoming Sender availability requests), contact, or chat; separate from per-order escrow and platform commission (~5% direction) — **`WaylerAccessPass` schema + API + SDK + panel UI + accept/contact/message gating + activate/cancel in-app notifications complete** (see **Daily Wayler work access foundation**); mock/manual activate/cancel on `/app` today; **Stripe checkout for real payment not implemented yet**
- **Stripe checkout for daily access** — replace mock activate with real payment; webhooks confirm `WaylerAccessPass` activation
- **Admin / arbitrator payout review** — ledger + intent + payout visibility during disputes

## Dispute and arbitration foundation

Wayly is building a **safety structure for order problems** before real payments go live. The current implementation includes **database schema**, **shared types**, **`DisputesModule` API + SDK**, **Sender/Wayler Accepted dispute UI** on `/app`, and **in-app dispute notifications** to the other participant (open, message, evidence — via `SYSTEM` until dedicated types exist). **No admin/arbitrator panel, resolution workflow, payment hold/refund integration, or file upload yet.**

### Purpose

- Give Wayly a **safety structure for order problems** before real payments.
- Support future **refund/release decisions**, **evidence review**, **chat/evidence context**, and **arbitrator/admin workflow**.
- Let **Senders and Waylers** open and participate in disputes on accepted jobs today via API and `/app` UI.

### Schema

**Enums** (mirror `@wayly/types`):

| Enum                | Values                                                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `DisputeStatus`     | `OPEN`, `UNDER_REVIEW`, `RESOLVED`, `REJECTED`, `CANCELLED`                                    |
| `DisputeReason`     | `ITEM_NOT_DELIVERED`, `ITEM_DAMAGED`, `WRONG_ITEM`, `PAYMENT_ISSUE`, `SAFETY_CONCERN`, `OTHER` |
| `DisputeResolution` | `REFUND_SENDER`, `RELEASE_TO_WAYLER`, `PARTIAL_REFUND`, `NO_ACTION`, `OTHER`                   |

**`Dispute`** (`disputes`) — one dispute record per order problem case

| Field                    | Description                                    |
| ------------------------ | ---------------------------------------------- |
| `orderId`                | Linked `DeliveryOrder` (cascade delete)        |
| `openedById`             | User who opened the dispute (Sender or Wayler) |
| `assignedArbitratorId`   | Optional assigned admin/arbitrator (`User`)    |
| `status`                 | Dispute lifecycle (default `OPEN`)             |
| `reason`                 | `DisputeReason` category                       |
| `description`            | Opening explanation from the opener            |
| `resolution`             | Optional `DisputeResolution` when closed       |
| `resolutionNote`         | Optional arbitrator note                       |
| `resolvedAt`             | When resolved/rejected                         |
| `createdAt`, `updatedAt` | Audit timestamps                               |

**`DisputeMessage`** (`dispute_messages`) — threaded discussion on a dispute

| Field       | Description                     |
| ----------- | ------------------------------- |
| `disputeId` | Parent dispute (cascade delete) |
| `senderId`  | Message author (`User`)         |
| `body`      | Message text                    |
| `createdAt` | When posted                     |

**`DisputeEvidence`** (`dispute_evidence`) — evidence items attached to a dispute

| Field           | Description                                    |
| --------------- | ---------------------------------------------- |
| `disputeId`     | Parent dispute (cascade delete)                |
| `submittedById` | Submitter (`User`)                             |
| `title`         | Short evidence label                           |
| `description`   | Optional detail                                |
| `fileUrl`       | Optional file URL (upload not implemented yet) |
| `createdAt`     | When submitted                                 |

**Relations:**

- `User` — `disputesOpened`, `disputesAssigned`, `disputeMessages`, `disputeEvidence`
- `DeliveryOrder` — `disputes[]`
- `Dispute` — `messages[]`, `evidence[]`

**Shared types** (`@wayly/types`): `DisputeSummary`, `DisputeDetail`, `DisputeMessageSummary`, `DisputeEvidenceSummary`, `DisputeListResponse`.

Migration: `apps/api/prisma/migrations/20260605170814_dispute_arbitration_foundation/migration.sql`

### Current dispute flow

```text
Accepted order (ACCEPTED / IN_TRANSIT / DELIVERED)
        ↓
Sender or Wayler: Open dispute (reason + description) on /app
        ↓
View dispute detail (status, reason, description, createdAt)
        ↓
Parties add messages (OPEN or UNDER_REVIEW only)
        ↓
Parties add evidence metadata — title, optional description, optional fileUrl
        ↓
Other participant notified in-app (bell/dropdown via SYSTEM + relatedOrderId)
        ↓
Arbitrator/admin review + resolution (future)
        ↓
Payment/escrow handling depends on dispute result (future)
```

### API routes (`/api/v1/disputes`, Swagger tag **disputes**)

| Method | Route                    | Action                                           |
| ------ | ------------------------ | ------------------------------------------------ |
| `POST` | `/disputes`              | Open dispute → `DisputeDetail`                   |
| `GET`  | `/disputes`              | List user disputes → `DisputeListResponse`       |
| `GET`  | `/disputes/:id`          | Dispute detail → `DisputeDetail`                 |
| `POST` | `/disputes/:id/messages` | Add message → `DisputeMessageSummary`            |
| `POST` | `/disputes/:id/evidence` | Add evidence metadata → `DisputeEvidenceSummary` |

All routes require **JWT + KYC approval** (`VerificationGuard` + `requireKycApproved`).

### SDK (`api.disputes`)

| Method                                                        | Usage                                                                              |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `disputes.list({ limit: 100 })`                               | Load user disputes once per Accepted panel refresh; match by `orderId` client-side |
| `disputes.open({ orderId, reason, description })`             | Open dispute from modal                                                            |
| `disputes.detail(id)`                                         | Load detail with messages + evidence                                               |
| `disputes.addMessage(id, { body })`                           | Post thread message                                                                |
| `disputes.addEvidence(id, { title, description?, fileUrl? })` | Post evidence metadata                                                             |

Validation: `@wayly/validation` — `openDisputeSchema`, `disputesListQuerySchema`, `addDisputeMessageSchema`, `addDisputeEvidenceSchema`.

### Frontend dispute UI (`/app`)

**Component:** `apps/web/src/components/app/dispute-panel.tsx` — compact modal (same pattern as chat).

**Placement:**

| Panel                                 | Controls                                             |
| ------------------------------------- | ---------------------------------------------------- |
| **Sender Accepted Orders**            | **Open dispute** / **View dispute** per order        |
| **Wayler Accepted delivery requests** | **Open dispute** / **View dispute** per accepted job |

Shown only for orders in **ACCEPTED**, **IN_TRANSIT**, or **DELIVERED**. **DRAFT**, **OPEN**, and **CANCELLED** orders do not show dispute buttons.

**Data loading:** `api.disputes.list({ limit: 100 })` when Sender/Wayler Accepted panels refresh; build `orderId → DisputeSummary` map client-side (latest per order). List load failure shows a small translated note; **Open dispute** remains available (backend 409 handled in modal).

**Open mode:**

- Order title/reference in header
- Reason select (`DisputeReason`)
- Description textarea (client min 10 / max 3000)
- Submit → `api.disputes.open(...)` → switches to detail view and refreshes dispute map

**Detail mode:**

- `api.disputes.detail(id)` — status, reason, description, `createdAt`
- Messages list (asc) + add message form
- Evidence list (desc) + add evidence metadata form (`title`, optional `description`, optional `fileUrl`)
- Manual **Refresh** button
- **No file upload** — metadata only

**Duplicate active dispute:** second open on same order → **409** with `duplicateActive` message, or **View dispute** after refresh when dispute already exists.

**Support reference:** Users can copy the full **`DeliveryOrder.id`** from the **Accepted Order Details drawer** (**Copy reference** — see **Delivery lifecycle after acceptance** → **Accepted Order Details drawer**) when opening a dispute or contacting support. Dispute modal shows order title/reference in header; clipboard copy uses the same **`DeliveryOrder.id`** as disputes API `orderId`.

i18n keys: `app.disputes.*` (8 locales), including reason and status labels.

### Dispute panel states on Accepted cards

Frontend-only polish on Sender/Wayler **Accepted delivery requests** cards + `DisputePanel` modal (`apps/web/src/components/app/dispute-panel.tsx`, `page.tsx`). **No backend/schema changes.**

| State                     | Behavior                                                                                                                    |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Disputes list loading** | Compact loading while `api.disputes.list` in flight on panel refresh — does not hide Open dispute when list fails partially |
| **Disputes refreshing**   | Refreshing label when reloading dispute map with cached data                                                                |
| **No dispute**            | Friendly empty/helper when eligible but no dispute yet — **Open dispute** still available                                   |
| **Existing dispute**      | **View dispute** shows status, reason, opened date on card; modal detail unchanged                                          |
| **Submit processing**     | **Submit dispute** shows processing label; **duplicate submit blocked** while open request in flight                        |
| **Submit failure**        | Error alert in modal; **reason + description draft preserved**                                                              |
| **List load failure**     | Small panel note; per-order open still attempts; modal handles **409** duplicate                                            |

**i18n** (8 locales): dispute loading/empty/submit keys under `app.disputes.*` and accepted-panel helpers.

### Dispute notification behavior

After each successful dispute write, `DisputesService` notifies the **other order participant** via `NotificationsService.createForUser()`. Dispute notifications appear in the **same bell/dropdown** as order, payment, and chat notifications — existing **30s unread polling** picks them up without frontend changes.

| Actor action                  | Recipient notified | Self-notification |
| ----------------------------- | ------------------ | ----------------- |
| Sender opens dispute          | **Wayler**         | No                |
| Wayler opens dispute          | **Sender**         | No                |
| Sender adds dispute message   | **Wayler**         | No                |
| Wayler adds dispute message   | **Sender**         | No                |
| Sender adds evidence metadata | **Wayler**         | No                |
| Wayler adds evidence metadata | **Sender**         | No                |

| Event        | Title                  | Body (summary)                                     |
| ------------ | ---------------------- | -------------------------------------------------- |
| Open dispute | `Dispute opened`       | `A dispute was opened for one of your deliveries.` |
| Add message  | `New dispute message`  | Preview up to 80 characters when available         |
| Add evidence | `New dispute evidence` | `New evidence was added to a dispute.`             |

- **Type:** `NotificationType.SYSTEM` (no dispute-specific enum yet)
- **`relatedOrderId`:** set on every dispute notification
- **Failure handling:** notification insert failures are logged; dispute action still succeeds
- **No duplicates on failure:** notifications only after successful DB writes; validation/**409** does not notify

See **Notifications** for bell polling, API routes, and full manual test steps.

### Rules

| Rule                    | Behavior                                                                                                                        |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**                | JWT + KYC required on all dispute routes and UI actions                                                                         |
| **Participants**        | `openedById`, order **Sender**, accepted **Wayler**, or `assignedArbitratorId` (arbitrator access reserved for future admin UI) |
| **Privacy**             | Non-participants receive **404**                                                                                                |
| **Eligible orders**     | **ACCEPTED**, **IN_TRANSIT**, or **DELIVERED** only                                                                             |
| **Ineligible orders**   | **DRAFT**, **OPEN**, **CANCELLED** → **409** on open                                                                            |
| **One active dispute**  | At most one **OPEN** or **UNDER_REVIEW** dispute per order → duplicate returns **409**                                          |
| **Messages / evidence** | Only while dispute is **OPEN** or **UNDER_REVIEW**                                                                              |

### Current scope

| Included                                                            | Not included (yet)                          |
| ------------------------------------------------------------------- | ------------------------------------------- |
| Prisma enums + models + migration                                   | Admin/arbitrator dashboard                  |
| `@wayly/types` dispute summaries                                    | Assign arbitrator workflow                  |
| `DisputesModule` API + Swagger                                      | Resolve/reject dispute workflow             |
| `@wayly/validation` dispute schemas                                 | Payment hold/refund/release on outcome      |
| SDK `api.disputes.*`                                                | File/photo evidence upload                  |
| Sender/Wayler Accepted **Open/View dispute** buttons                | Dispute timeline UI                         |
| `DisputePanel` modal (open + detail + messages + evidence metadata) | Dedicated dispute `NotificationType` values |
| Dispute in-app notifications (other-participant, `SYSTEM`)          | Push/email dispute alerts                   |
| Duplicate active dispute handling                                   | Arbitration notes / audit log UI            |
| i18n `app.disputes.*` (8 locales)                                   |                                             |

### Current limitations

- **No admin/arbitrator workflow** — `assignedArbitratorId` exists on schema but no admin UI or assignment API yet
- **No payment/refund/release integration** — dispute outcome does not block or change `PaymentIntent` / ledger
- **No file upload** — `fileUrl` is optional metadata string only
- **No dedicated dispute notification types** — `SYSTEM` used for open/message/evidence dispatch; no localized templates or push/email
- **No resolution notifications** — arbitrator assignment and resolve/reject outcomes not dispatched yet
- **No resolution workflow** — `DisputeResolution`, `resolutionNote`, `resolvedAt` not settable via API yet

### Manual verification (schema + API)

- [ ] Prisma migration applied (`dispute_arbitration_foundation`)
- [ ] Prisma client generated
- [ ] `pnpm build`, `pnpm lint`, `pnpm typecheck` pass
- [ ] Swagger tag **disputes** visible at `/docs`

### Manual visual testing checklist (dispute UI on `/app`)

Use two KYC-approved users (**A** = Sender, **B** = Wayler):

- [ ] **User A** publishes order; **User B** accepts
- [ ] **User A** opens **Sender Accepted** panel → **Open dispute** on accepted order
- [ ] **User A** selects reason and submits description (≥ 10 chars)
- [ ] Modal switches to **detail view** (status, reason, description, `createdAt`)
- [ ] **User B** opens **Wayler Accepted** panel → **View dispute** on same order
- [ ] **User B** adds a message in dispute modal
- [ ] **User A** clicks **Refresh** in detail view → sees **User B**'s message
- [ ] **User A** adds evidence metadata (title + optional description / fileUrl)
- [ ] Second **Open dispute** on same order → `duplicateActive` message or **View dispute** after refresh
- [ ] **DRAFT** / **OPEN** orders do **not** show dispute button
- [ ] No file-upload UI appears in dispute modal
- [ ] Dispute **loading/refreshing** on Accepted panel does not break Open/View dispute
- [ ] **Submit dispute** shows processing label; **duplicate submit blocked**; **submit failure preserves draft**
- [ ] **No dispute yet** empty/helper state on eligible order; existing dispute shows status/reason/opened date on card

### Manual testing checklist (dispute notifications)

Use two KYC-approved users (**A** = Sender, **B** = Wayler) on `/app`:

- [ ] **User A** publishes order; **User B** accepts
- [ ] **User A** opens dispute → **User B** sees “Dispute opened” in bell (`SYSTEM`, `relatedOrderId` set)
- [ ] **User A** does **not** receive notification for own open action
- [ ] **User B** adds dispute message → **User A** sees “New dispute message” with preview
- [ ] **User B** does **not** receive notification for own message
- [ ] **User A** adds evidence metadata → **User B** sees “New dispute evidence”
- [ ] **User A** does **not** receive notification for own evidence submission
- [ ] Duplicate open attempt (**409**) does **not** create a second notification
- [ ] Recipient unread badge updates within **30s** via existing bell polling (no frontend changes)

### Future milestones (disputes & arbitration)

- **Dedicated dispute notification types** — replace `SYSTEM` for open/message/evidence dispatch
- **Localized dispute notification templates** — per-user locale for title/body
- **Push/email dispute notifications** — offline alerts beyond in-app bell
- **Admin/arbitrator notifications** — assignment, queue, escalation
- **Dispute resolution notifications** — resolve/reject outcomes to parties
- **Payment/refund/release notifications after resolution** — holds, reversals, payout blocks
- **Notification preferences** — per-type opt-in/out for dispute events
- **Admin/arbitrator dashboard** — review queue, order/payment context, resolution actions
- **Assign arbitrator** — set `assignedArbitratorId`; queue for `ADMIN`/`ARBITRATOR` roles
- **Resolve dispute** — set `resolution`, `resolutionNote`, `resolvedAt`; transition `DisputeStatus`
- **Payment hold/refund/release integration** — block payout during dispute; execute outcome on `PaymentIntent` / ledger
- **File/photo evidence upload** — storage + signed URLs for `DisputeEvidence.fileUrl`
- **Dispute timeline** — chronological activity view for parties and arbitrators
- **Arbitration notes** — internal arbitrator commentary separate from party messages
- **Audit logs** — immutable record of dispute state changes for compliance

## Wayler availability and trip listings foundation

Wayly is evolving from a **Sender-initiated order marketplace** into a **two-sided P2P delivery marketplace**. Stakeholders require that **Waylers and Senders discover each other from both directions** — not only via Sender-created delivery requests. The current implementation includes **database schema**, **shared types**, **`WaylerAvailabilitiesModule` API + SDK**, **`WaylerAvailabilityRequestsModule` API + SDK**, **KYC-gated business rules**, a **Wayler management UI** on `/app` (create/publish/pause/cancel own listings; **My listings** panel states — loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale listing cards on error when cached — see **Wayler availability/trips panel states**), a **Sender browse UI** on `/app` (search public active listings, active courier counts, **Results list panel states** — loading skeleton, true empty vs filter-empty, error + Retry, Refresh/Refreshing…; stale listing cards on error when cached — see **Sender browse Wayler availability / discovery panel states**; **request delivery from a listing**, **“My requests to Waylers”**, cancel pending), a **Wayler incoming requests UI** on `/app` (accept/decline pending requests with optional response message), **polished availability-request panel states** on both sides (loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale request cards on error when cached — see **Availability request panel states**), **in-app notifications** on request create/decline/cancel (`SYSTEM`) and accept (`ORDER_ACCEPTED` + `relatedOrderId` = `DeliveryOrder.id` — see **Notifications**), **backend DeliveryOrder conversion on accept** (transactional — `ACCEPTED` order with `sourceType=WAYLER_AVAILABILITY_REQUEST` + `availabilityRequestId`), **converted-order UI on request panels** (“Converted to order” + order reference), **order source badge on Accepted panels** (“From Wayler request” + request reference), **Accepted-panel auto-refresh** after Wayler accept (converted order + **Open chat** + **Payment** panel appear without manual page refresh), **converted-order chat** via the existing order conversation flow (`DeliveryOrder.id` — see **Chat / contact**), and **converted-order mock payment** via the existing order payment flow (`DeliveryOrder.id` — verified compatible; see **Payment and escrow foundation**). **No automatic `PaymentIntent` on accept, automatic chat creation on accept, Stripe/real payment, clickable detail navigation, expiry automation, request detail page, admin moderation, realtime availability-listing or request-list updates, or production deployment yet.** **Daily work access** gating applies when a Wayler **accepts a job** — posted OPEN orders **or** incoming Sender availability requests — plus order contact/chat (see **Daily Wayler work access foundation**); **declining** incoming requests and **viewing** the incoming list do **not** require active access.

### Purpose

- Support **two-sided marketplace discovery** — complement Sender-created `DeliveryOrder` posts with Wayler-published availability.
- Let Waylers publish **local availability** (“I am available today in Bishkek / this region from date X to Y”).
- Let Waylers publish **trip routes** (“I fly Madrid → Jakarta on June 5”, one-way / return / flexible).
- Let Senders browse **active couriers and trips** via `GET /wayler-availabilities/public` — e.g. filter by country/city.
- Expose **active courier counts** by origin country, city, and region via `GET /wayler-availabilities/active-counts`.
- Preserve today’s **Wayler browse of Sender OPEN orders** by country/city/region — both discovery directions coexist.
- Prepare for later **monetization**: daily work access fee before **taking jobs** (accept posted orders or incoming Sender requests) and before contact/chat is **enforced for Waylers** (see **Daily Wayler work access foundation** — mock/manual activation today; Stripe checkout later), and platform fee direction toward **~5%** (not implemented yet).

### Current feature flow

**API flow:**

```text
Wayler (KYC-approved)
        ↓
POST /wayler-availabilities → DRAFT, isPublic=false
        ↓
POST /wayler-availabilities/:id/publish → ACTIVE, isPublic=true, expiresAt set
        ↓
Sender (KYC-approved)
        ↓
GET /wayler-availabilities/public?originCountry=...&originCity=...
GET /wayler-availabilities/active-counts?country=...&city=...
        ↓
Sender (KYC-approved) — optional reverse lane
        ↓
POST /wayler-availability-requests → PENDING (links to published ACTIVE listing)
        ↓
Wayler (KYC-approved)
        ↓
GET /wayler-availability-requests/mine/wayler → review incoming
POST /wayler-availability-requests/:id/accept|decline → ACCEPTED|DECLINED (+ optional responseMessage)
        ↓ (on accept only)
Backend creates DeliveryOrder (status ACCEPTED, sourceType WAYLER_AVAILABILITY_REQUEST, availabilityRequestId)
        ↓
Wayler can POST /pause or POST /cancel to hide listing
```

**UI flow (Wayler mode on `/app`):**

```text
Wayler mode → “Your Wayler availability” panel
        ↓
Create LOCAL_AVAILABILITY or TRIP_ROUTE (form) → DRAFT in My listings
        ↓
Publish → ACTIVE / public
        ↓
Pause → PAUSED / private (Publish again → ACTIVE)
        ↓
Cancel → CANCELLED
```

**UI flow (Sender mode on `/app`):**

```text
Sender mode → “Browse active Waylers” panel
        ↓
Set filters (type, origin, destination, date) → Search / Refresh
        ↓
publicList(query) → active public listings
activeCounts(query) → active courier count cards by location
        ↓
“Request this Wayler” on a listing → inline request form (package, pickup/dropoff, dates, reward, message)
        ↓
api.waylerAvailabilityRequests.create → success; appears in “My requests to Waylers”
        ↓
Cancel while PENDING → api.waylerAvailabilityRequests.cancel
```

**UI flow (Wayler mode on `/app`, incoming requests):**

```text
Wayler mode → “Incoming Sender requests” panel (below “Your Wayler availability”)
        ↓
mineAsWayler({ limit: 10 }) → list title, package, route, reward, status, sender message
        ↓
PENDING only → optional response textarea + Accept request / Decline request
        ↓
Refresh → ACCEPTED / DECLINED visible; action buttons hidden for non-PENDING
```

**Two-sided marketplace today:**

| Lane                               | Flow                                                                                                                                                                                                           |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sender → Wayler (orders)**       | Sender publishes `DeliveryOrder` → Wayler browses OPEN feed → accept → lifecycle (M4)                                                                                                                          |
| **Wayler → Sender (availability)** | Wayler publishes availability/trip → Sender browses → **sends request** → Wayler **accepts** (active daily access required) or **declines** → **backend creates `ACCEPTED` `DeliveryOrder`** linked to request |

The **reverse discovery lane** (Wayler publishes → Sender requests → Wayler responds) has **API + SDK + both-side UI + in-app notifications on request lifecycle** (`SYSTEM` on create/decline/cancel; **`ORDER_ACCEPTED`** + **`relatedOrderId`** on accept) **+ backend DeliveryOrder conversion on accept**. **Accepting** an incoming Sender request is **taking a job** — gated behind the same daily Wayler work access as posted order accept (see **Daily Wayler work access foundation**). Converted orders enter the existing M4 lifecycle at **ACCEPTED** — **mock payment**, **chat**, and **dispute** use the same Accepted-panel flows as posted orders (**manual** — no auto `PaymentIntent`, conversation, or dispute on accept; see **Mock payment for converted DeliveryOrders** and **Chat for converted DeliveryOrders**).

### UI placement (`/app`, Wayler mode only)

| Item            | Detail                                                                                                                                           |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Panel title** | “Your Wayler availability” (`app.waylerAvailability.title`)                                                                                      |
| **Location**    | `/app` — **Wayler mode only**, placed alongside the existing **Wayler OPEN feed** and **Accepted delivery requests** area (after Accepted panel) |
| **KYC gate**    | Non-approved Waylers see the standard KYC notice; create form and listings load only when KYC is **APPROVED**                                    |
| **i18n**        | All form labels, actions, statuses, and messages in **8 locales** under `app.waylerAvailability.*`                                               |
| **Unchanged**   | Wayler order feed, accepted jobs, Sender panels, chat, notifications, payments, disputes, maps                                                   |

**Incoming Sender requests panel** (`wayler-incoming-requests-panel.tsx`): **Wayler mode only**, placed **below** **“Your Wayler availability”**; loads `api.waylerAvailabilityRequests.mineAsWayler`; **panel states** — loading text + skeleton on initial load (no empty while loading), friendly empty when none, error + **Retry** on load failure (stale cards + error banner when cached), **Refresh** / **Loading…** button unchanged; **Accept request** while `PENDING` requires **active daily Wayler access** (disabled + note when inactive); **Decline request** works without access; when **`deliveryOrderId`** is set, shows **“Converted to order”** badge + short order reference (no link). i18n: `app.availabilityRequests.*`. **Wayler availability create/My listings** panel states unchanged (see **Wayler availability/trips panel states**).

Implementation: `apps/web/src/components/app/wayler-availability-panel.tsx` + `wayler-incoming-requests-panel.tsx` wired in `apps/web/src/app/(app)/app/page.tsx`.

### Create form behavior (Wayler management UI)

Compact form to create a **DRAFT** listing. Simple text and `datetime-local` inputs — **no maps or geocoding** in this batch.

| Type                   | Fields                                                                                                                                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **LOCAL_AVAILABILITY** | `originCountry` (required, 2-letter), `originCity` or `originRegion` (at least one), `availableFrom` (required), optional `availableTo`, `maxPackages`, `maxWeightKg`, `notes`                                                                                         |
| **TRIP_ROUTE**         | `originCountry` + `originCity` (required), `destinationCountry` + `destinationCity` (required), `departureDate` (required), `tripDirection` (`ONE_WAY` / `RETURN` / `FLEXIBLE`), `returnDate` (required when `RETURN`), optional `maxPackages`, `maxWeightKg`, `notes` |

On submit:

1. Client-side validation (including `returnDateRequired` for `RETURN` trips)
2. `api.waylerAvailabilities.create(body)`
3. Success or error alert
4. Refresh **My listings**
5. Reset form on success

**KYC-approved Waylers only** — same gate as other marketplace panels.

### My listings behavior (Wayler management UI)

| Behavior         | Detail                                                                                                                                                                                 |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Load**         | `api.waylerAvailabilities.mine({ limit: 20 })` on mount when KYC-approved                                                                                                              |
| **Display**      | Type, status badge, origin location, destination (trips), available/departure dates, `tripDirection`, `maxPackages` / `maxWeightKg`, `notes`, `publishedAt` / `expiresAt` when present |
| **Publish**      | Shown for **DRAFT** or **PAUSED** → `api.waylerAvailabilities.publish(id)`                                                                                                             |
| **Pause**        | Shown for **ACTIVE** → `api.waylerAvailabilities.pause(id)`                                                                                                                            |
| **Cancel**       | Shown for **DRAFT**, **ACTIVE**, or **PAUSED** → `api.waylerAvailabilities.cancel(id)`                                                                                                 |
| **After action** | List refreshes; buttons disabled while action runs                                                                                                                                     |
| **States**       | **My listings** panel states — see **Wayler availability/trips panel states**; create/publish/pause/cancel success messages unchanged                                                  |

### Wayler availability/trips panel states (My listings)

The **My listings** section inside **“Your Wayler availability”** on `/app` (Wayler mode) — **`loadListings()`** via `api.waylerAvailabilities.mine({ limit: 20 })` — shares polished loading, empty, error, and refresh UX with other marketplace panels. Frontend-only (shared `PanelEmptyState`, `PanelErrorState`, `RequestsListSkeleton` from `apps/web/src/components/app/panel-status-states.tsx`, wired in `apps/web/src/components/app/wayler-availability-panel.tsx`). **No backend/schema changes.**

| State             | Behavior                                                                                                                                                                                                                                                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**       | Visible **“Loading your availability…”** (`app.waylerAvailability.availabilityLoading`, `role="status"`, `aria-live="polite"`) + listing-card skeleton (`RequestsListSkeleton`) on **initial load when no cached listings**. **Does not show empty state while loading.**                                                                                              |
| **Success**       | Availability/trip listing cards render (type, status badge, origin/destination, dates, `tripDirection`, capacity, notes, publish/pause/cancel actions).                                                                                                                                                                                                                |
| **Empty**         | When `!loading && !error && listings.length === 0` — bordered empty state with **title** (`app.waylerAvailability.availabilityEmptyTitle`) + **body** (`app.waylerAvailability.availabilityEmptyBody`): published availability and trip routes appear here after the Wayler creates and publishes them; this helps Senders find the Wayler and send delivery requests. |
| **Error**         | Localized **“Could not load your availability.”** (`app.waylerAvailability.availabilityLoadFailed`) + **Retry** (`app.waylerAvailability.retryAvailability`) → re-runs `loadListings()`. Retry **disabled while loading**. Dashboard does **not** crash.                                                                                                               |
| **Error + cache** | If listings were loaded previously, **stale listing cards remain visible** below the error banner (no empty state).                                                                                                                                                                                                                                                    |
| **Refresh**       | Header **Refresh** → `loadListings()`; label **Refreshing…** (`app.waylerAvailability.refreshing`) while loading **when cached listings exist**; button disabled while loading or during listing actions. Refresh with cached listings **keeps cards visible** during reload.                                                                                          |

**Unchanged My listings behavior:** **Create availability** form (draft create), **Publish** / **Pause** / **Cancel** on listing cards, status badges, **Sender browse availability** (`publicList` — Senders see published **ACTIVE** listings; **Results list panel states** — see **Sender browse Wayler availability / discovery panel states**), **Sender request-to-Wayler** flow, **Wayler incoming Sender requests** panel, **DeliveryOrder conversion on accept**, **Accepted delivery requests panel refresh**, **Accepted Order Details drawer**, and **order-linked notification click** (focus accepted card + open drawer via **`DeliveryOrder.id`**) — all unchanged.

**Current limitations:**

- **Frontend-only panel reliability** — Retry re-calls existing `GET /wayler-availabilities/mine`; **no new backend endpoints**
- **No realtime availability listing panel updates** — list refreshes on panel load, **Refresh**, Retry, and after create/publish/pause/cancel success — **no WebSocket/SSE**
- **Nothing deployed yet** — local development only

**i18n** (8 locales): `app.waylerAvailability.availabilityLoading`, `availabilityEmptyTitle`, `availabilityEmptyBody`, `availabilityLoadFailed`, `retryAvailability`, `refresh`, `refreshing` (legacy single-line `empty` / `loadFailed` keys retained).

### Manual testing checklist (Wayler availability/trips panel states)

Use a **KYC-approved Wayler** on `/app` (Wayler mode):

- [ ] **My listings** initial load shows **Loading your availability…** + skeleton (not empty)
- [ ] With no listings → **No availability or trips yet** title + body (create/publish via form above; helps Senders find you)
- [ ] Create draft → **Publish** → listing card(s) appear with status badge and actions
- [ ] Simulate load failure (stop API) on empty panel → error + **Retry**; dashboard stable; no empty state
- [ ] With cached listings, simulate failure → error banner + **stale cards still visible**; **Retry** restores
- [ ] **Refresh** with cached listings → cards stay visible; button shows **Refreshing…** while loading
- [ ] **Create availability** (LOCAL + TRIP) still works
- [ ] **Publish** / **Pause** / **Cancel** on listing cards still work
- [ ] **User S** (Sender mode): **Browse active Waylers** still shows published listing
- [ ] **User S**: **Request this Wayler** still works
- [ ] **Incoming Sender requests** panel still works (loading/empty/error/retry unchanged)
- [ ] Accept request → **Accepted delivery requests** panel refresh + conversion still works
- [ ] Order-linked notification click → focus accepted card + open drawer still works
- [ ] Normal `/app` load — no crash

### SDK methods used by Wayler management UI

| Method                                         | Usage                  |
| ---------------------------------------------- | ---------------------- |
| `api.waylerAvailabilities.create(body)`        | Create DRAFT from form |
| `api.waylerAvailabilities.mine({ limit: 20 })` | Load own listings      |
| `api.waylerAvailabilities.publish(id)`         | Publish DRAFT/PAUSED   |
| `api.waylerAvailabilities.pause(id)`           | Pause ACTIVE           |
| `api.waylerAvailabilities.cancel(id)`          | Cancel listing         |

### UI placement (`/app`, Sender mode only)

| Item            | Detail                                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Panel title** | “Browse active Waylers” (`app.senderWaylers.title`)                                                                                     |
| **Location**    | `/app` — **Sender mode only**, placed after **Accepted Orders** panel, alongside existing Sender create/drafts/published/accepted flows |
| **KYC gate**    | Non-approved Senders see the standard KYC notice; browse UI loads only when KYC is **APPROVED** (`canViewSenderOrders`)                 |
| **i18n**        | All filter labels, counts, results, and messages in **8 locales** under `app.senderWaylers.*`                                           |
| **Unchanged**   | Sender order creation, drafts, published, accepted, payment, dispute, chat, proof; Wayler feed/availability panels; notifications, maps |

Implementation: `apps/web/src/components/app/sender-waylers-panel.tsx` wired in `apps/web/src/app/(app)/app/page.tsx`.

### Search/filter behavior (Sender browse UI)

| Filter          | Values                                                       |
| --------------- | ------------------------------------------------------------ |
| **Type**        | All / `LOCAL_AVAILABILITY` / `TRIP_ROUTE`                    |
| **Origin**      | `originCountry` (2-letter), `originCity`, `originRegion`     |
| **Destination** | `destinationCountry`, `destinationCity`, `destinationRegion` |
| **Date**        | `date` (`type="date"` input)                                 |

- **Search** and **Refresh** both call `api.waylerAvailabilities.publicList(query)` and `api.waylerAvailabilities.activeCounts(query)` with current filters
- Initial load on KYC approval: `publicList({ limit: 20 })` with no filters + `activeCounts()` with no filters
- Simple text/date inputs — **no maps or geocoding**

### Active courier count behavior (Sender browse UI)

| Behavior          | Detail                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------- |
| **API**           | `api.waylerAvailabilities.activeCounts(query)`                                         |
| **Query mapping** | Origin filters → `country` / `city` / `region` / `date` (when provided)                |
| **Backend scope** | `LOCAL_AVAILABILITY` only — public **ACTIVE**, not expired, grouped by origin location |
| **Display**       | Small count cards: country / city / region + `activeCount`                             |
| **Empty state**   | “No active local couriers for these filters.”                                          |
| **States**        | Separate loading skeleton and error handling from results list                         |

### Results list behavior (Sender browse UI)

| Behavior        | Detail                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **API**         | `api.waylerAvailabilities.publicList(query)` — public **ACTIVE** listings only                                                                                                                                                                                                                                                                                                                                                                                                 |
| **Display**     | Type, status badge, origin, destination (trips), `availableFrom` / `availableTo`, `departureDate` / `returnDate`, `tripDirection`, `maxPackages` / `maxWeightKg`, `notes`, `publishedAt` / `expiresAt`                                                                                                                                                                                                                                                                         |
| **Request**     | **“Request this Wayler”** opens inline form; prefills pickup/dropoff from listing when available; reward entered as decimal (e.g. `15.00 EUR`) → `proposedRewardCents`                                                                                                                                                                                                                                                                                                         |
| **My requests** | **“My requests to Waylers”** — `api.waylerAvailabilityRequests.mineAsSender({ limit: 5 })`; title, route, reward, status, created date, `responseMessage`; **“Converted to order”** badge + short order reference when `deliveryOrderId` is set; **Cancel request** while `PENDING`; **panel states** — loading text + skeleton on initial load (no empty while loading), friendly empty when none, error + **Retry** on load failure (stale cards + error banner when cached) |
| **States**      | **Results list** (browse/discovery): see **Sender browse Wayler availability / discovery panel states**. **My requests** section: see **Availability request panel states**                                                                                                                                                                                                                                                                                                    |

### Sender browse Wayler availability / discovery panel states (Results list)

The **Results list** section inside **“Browse active Waylers”** on `/app` (Sender mode) — **`loadListings()`** via `api.waylerAvailabilities.publicList(buildPublicQuery(filters))` — shares polished loading, empty, error, and refresh UX with other marketplace panels. Frontend-only (shared `PanelEmptyState`, `PanelErrorState`, `RequestsListSkeleton` from `apps/web/src/components/app/panel-status-states.tsx`, wired in `apps/web/src/components/app/sender-waylers-panel.tsx`). **No backend/schema changes.** The **Active courier counts** subsection and **My requests to Waylers** section are unchanged (counts keep separate loading/error; my-requests uses **Availability request panel states**).

| State              | Behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**        | Visible **“Loading Wayler availability…”** (`app.senderWaylers.waylersLoading`, `role="status"`, `aria-live="polite"`) + listing-card skeleton (`RequestsListSkeleton`) on **initial load when no cached listings** (`listingsLoading && listings.length === 0`). **Does not show empty state while loading.**                                                                                                                                                                     |
| **Success**        | Wayler availability/trip listing cards render (type, status badge, origin/destination, dates, `tripDirection`, capacity, notes, **Request this Wayler** action).                                                                                                                                                                                                                                                                                                                   |
| **Empty (true)**   | When `!loading && !error && listings.length === 0` **and no active filters** on the last successful load — bordered empty state with **title** (`app.senderWaylers.waylersEmptyTitle`: **“No Wayler availability yet”**) + **body** (`app.senderWaylers.waylersEmptyBody`): Wayler trips and local availability appear here when Waylers publish routes; Sender can check again later or post a delivery request from the Sender order form above. **Distinct from filter-empty.** |
| **Empty (filter)** | When `!loading && !error && listings.length === 0` **and active filters/search** on the last successful load — separate empty state with **title** (`app.senderWaylers.waylersFilterEmptyTitle`: **“No Waylers match your filters”**) + **body** (`app.senderWaylers.waylersFilterEmptyBody`): adjust or clear filters to see more active Wayler availability. **Must not be confused with true empty.**                                                                           |
| **Error**          | Localized **“Could not load Wayler availability.”** (`app.senderWaylers.waylersLoadFailed`) + **Retry** (`app.senderWaylers.retryWaylers`) → re-runs `loadListings(filters)`. Retry **disabled while loading**. Dashboard does **not** crash.                                                                                                                                                                                                                                      |
| **Error + cache**  | If listings were loaded previously, **stale listing cards remain visible** below the error banner (listings are **not** cleared on failure; no empty state).                                                                                                                                                                                                                                                                                                                       |
| **Refresh**        | Filter bar **Refresh** → `runSearch(filters)` (reloads listings + counts + my-requests); label **Refreshing…** (`app.senderWaylers.refreshing`) while loading **when cached listings exist**; button disabled while busy. Refresh with cached listings **keeps cards visible** during reload.                                                                                                                                                                                      |

**Unchanged Results list behavior:** **Search** / filter inputs, **Active courier counts** subsection, **Request this Wayler** inline form + send, **My requests to Waylers** section (loading/empty/error/retry — see **Availability request panel states**), cancel pending request, **Wayler incoming Sender requests** panel, **DeliveryOrder conversion on accept**, **Accepted delivery requests panel refresh**, **Accepted Order Details drawer**, and **order-linked notification click** (focus accepted card + open drawer via **`DeliveryOrder.id`**) — all unchanged.

**Current limitations:**

- **Frontend-only discovery panel-state improvement** — Retry re-calls existing `GET /wayler-availabilities/public`; **no new backend endpoints**
- **No realtime Sender discovery updates** — Results list refreshes on panel load, **Search**, **Refresh**, Retry, and after Wayler publish/pause/cancel (manual reload only) — **no WebSocket/SSE**
- **Nothing deployed yet** — local development only

**i18n** (8 locales): `app.senderWaylers.waylersLoading`, `waylersEmptyTitle`, `waylersEmptyBody`, `waylersFilterEmptyTitle`, `waylersFilterEmptyBody`, `waylersLoadFailed`, `retryWaylers`, `refreshing` (legacy single-line `empty` / `loadFailed` keys retained).

### Manual testing checklist (Sender browse Wayler availability / discovery panel states)

Use **KYC-approved** users (**W** = Wayler, **S** = Sender):

- [ ] **User S**: **Sender mode** → **Browse active Waylers** → **Results list** initial load shows **Loading Wayler availability…** + skeleton (not empty)
- [ ] With no published listings and no filters → **No Wayler availability yet** title + body (trips/local availability when Waylers publish; check later or post delivery request)
- [ ] **User W**: publish **LOCAL_AVAILABILITY** and/or **TRIP_ROUTE** → **User S** Results list shows Wayler availability cards
- [ ] Apply filters/search with no matches → **No Waylers match your filters** title + body (distinct from true empty)
- [ ] Clear filters after filter-empty → true empty or listings return as expected
- [ ] Simulate Results list load failure (stop API) on empty panel → error + **Retry**; dashboard stable; no empty state
- [ ] With cached listings, simulate failure → error banner + **stale listing cards still visible**; **Retry** restores
- [ ] **Refresh** with cached listings → cards stay visible; button shows **Refreshing…** while loading
- [ ] **Request this Wayler** still works from a listing card
- [ ] **My requests to Waylers** section still updates after send (loading/empty/error/retry unchanged)
- [ ] **User W**: **Incoming Sender requests** panel still works
- [ ] **User W**: **Accept request** (with active daily access) → converted `DeliveryOrder`; **Converted to order** badge
- [ ] **Accepted delivery requests** panel refresh/conversion still works
- [ ] **ORDER_ACCEPTED** notification click → focus accepted card + open drawer via **`DeliveryOrder.id`**
- [ ] Normal `/app` load — no crash

### SDK methods used by Sender browse UI

| Method                                                      | Usage                                            |
| ----------------------------------------------------------- | ------------------------------------------------ |
| `api.waylerAvailabilities.publicList(query)`                | Search/filter active public listings             |
| `api.waylerAvailabilities.activeCounts(query)`              | Active local courier counts by origin location   |
| `api.waylerAvailabilityRequests.create(body)`               | Sender creates request against published listing |
| `api.waylerAvailabilityRequests.mineAsSender({ limit: 5 })` | Sender’s recent requests                         |
| `api.waylerAvailabilityRequests.cancel(id)`                 | Sender cancels own `PENDING` request             |

Not used in Sender browse UI: availability `create`, `mine`, `publish`, `pause`, `cancel`, `detail`.

### Sender ↔ Wayler availability requests

Senders can request delivery through a **published, active, public** Wayler availability or trip listing. Waylers review **incoming** requests and accept or decline while **PENDING**. This is the **reverse lane** of the two-sided marketplace (complementing Sender-posted OPEN orders).

#### Two-sided marketplace flows

| Direction           | Who initiates                     | Mechanism today                                                                                   |
| ------------------- | --------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Sender → Wayler** | Sender                            | Create/publish `DeliveryOrder` → Wayler accepts from OPEN feed (M4)                               |
| **Wayler → Sender** | Wayler publishes; Sender requests | Publish `WaylerAvailability` → Sender sends `WaylerAvailabilityRequest` → Wayler accepts/declines |

#### Sender flow (`/app`, Sender mode)

1. **Browse** active Waylers/trips — **“Browse active Waylers”** panel (`sender-waylers-panel.tsx`); **Results list** uses loading/true-empty/filter-empty/error/retry/refresh panel states (see **Sender browse Wayler availability / discovery panel states**).
2. Click **“Request this Wayler”** on a listing → inline request form opens (prefills origin/destination when available).
3. Fill **title**, **package description**, **pickup/dropoff** (country, city, optional address), optional **desired pickup/delivery** datetimes, **proposed reward** (decimal, e.g. `15.00` → `proposedRewardCents`), optional **currency** (default **EUR**), optional **message to Wayler**.
4. **Send request** → `api.waylerAvailabilityRequests.create(...)` → success alert **“Request sent to Wayler.”**
5. View in **“My requests to Waylers”** — `api.waylerAvailabilityRequests.mineAsSender({ limit: 5 })` — shows title, route, reward, status badge, created date, Wayler `responseMessage` when present; when **`deliveryOrderId`** is set after accept, shows **“Converted to order”** badge and a short **order reference** (first 8 hex chars — not a clickable link). Section uses **loading/empty/error/retry** panel states (see **Availability request panel states**).
6. **Cancel request** while `PENDING` → `api.waylerAvailabilityRequests.cancel(id)` → list refreshes.

**KYC-approved Senders only** — same gate as other marketplace panels.

#### Wayler flow (`/app`, Wayler mode)

1. Open **Wayler mode** → **“Incoming Sender requests”** panel below **“Your Wayler availability”** (`wayler-incoming-requests-panel.tsx`).
2. Loads `api.waylerAvailabilityRequests.mineAsWayler({ limit: 10 })` with **loading/empty/error/retry** panel states (see **Availability request panel states**); footer **Refresh** reloads the list.
3. Each card shows: **title**, **package description**, **route** (pickup city/country → dropoff city/country), **proposed reward**, **status badge**, **created date**, **“Sender request”** label (no sender profile UI yet), **sender message**, existing **response message** if any; when **`deliveryOrderId`** is set, **“Converted to order”** badge + short **order reference** (shared `AvailabilityRequestConvertedOrder` component).
4. For **`PENDING`** only: optional **response message** textarea + **Accept request** / **Decline request** (accept requires **active daily Wayler access** — see below).
5. **Accept** → `api.waylerAvailabilityRequests.accept(id, { responseMessage? })` → **“Request accepted.”** → refresh → status **ACCEPTED** + **`deliveryOrderId`** in response (blocked without active pass — **403** `WAYLER_ACCESS_REQUIRED`).
6. **Decline** → `api.waylerAvailabilityRequests.decline(id, { responseMessage? })` → **“Request declined.”** → refresh → status **DECLINED** (no daily access required).
7. **Non-PENDING** requests: no accept/decline buttons; status badge only.

**KYC-approved Waylers only.** **Daily Wayler work access is required to accept** an incoming Sender request (same monetization gate as posted order accept). **Not required** to publish/manage availability listings, **view** incoming requests, **decline** pending requests, or list/detail API calls.

#### DeliveryOrder conversion (accept → order)

When a Wayler **accepts** a `PENDING` `WaylerAvailabilityRequest`, `WaylerAvailabilityRequestsService.accept()` runs in a **transaction**:

1. Re-checks request is still `PENDING` (and Wayler has active daily access — pre-transaction).
2. Updates request → **ACCEPTED** + `acceptedAt` + optional `responseMessage`.
3. Creates exactly one **`DeliveryOrder`** (unless one already exists for this request — idempotent via unique `availabilityRequestId`).

**Order fields (mapped from request):**

| DeliveryOrder field                         | Source                                                                |
| ------------------------------------------- | --------------------------------------------------------------------- |
| `senderId`                                  | `request.senderId`                                                    |
| `acceptedWaylerId`                          | `request.waylerId`                                                    |
| `status`                                    | **`ACCEPTED`** (Sender and Wayler already matched — skips DRAFT/OPEN) |
| `acceptedAt`                                | same timestamp as request accept                                      |
| `title`                                     | `request.title`                                                       |
| `description`                               | `request.packageDescription`                                          |
| `pickupCountry/City`, `pickupAddressText`   | request pickup fields (`pickupAddress` → `pickupAddressText`)         |
| `dropoffCountry/City`, `dropoffAddressText` | request dropoff fields                                                |
| `pickupDateFrom/To`                         | `desiredPickupFrom/To`                                                |
| `deliveryDeadline`                          | `desiredDeliveryTo` (fallback `desiredDeliveryFrom`)                  |
| `offeredRewardAmount`                       | `proposedRewardCents` ÷ 100                                           |
| `currency`                                  | `request.currency`                                                    |
| `notes`                                     | `request.message`                                                     |
| `sourceType`                                | **`WAYLER_AVAILABILITY_REQUEST`**                                     |
| `availabilityRequestId`                     | **`request.id`**                                                      |
| `type`                                      | `LOCAL` if same pickup/dropoff country, else `INTERNATIONAL`          |

**Traceability:**

- `DeliveryOrder.sourceType` — `SENDER_POSTED_ORDER` (default) vs `WAYLER_AVAILABILITY_REQUEST`
- `DeliveryOrder.availabilityRequestId` — optional unique FK back to the request
- `WaylerAvailabilityRequest.deliveryOrder` — optional 1:1 back-relation
- **One request → at most one order** — unique constraint + transactional duplicate handling

**Response:** accept returns `WaylerAvailabilityRequestDetail` with **`deliveryOrderId`** (null while pending/declined/cancelled). List/detail endpoints also include `deliveryOrderId` when linked.

**Order visibility:** converted orders appear in existing lists where applicable — e.g. Wayler **`GET /orders/accepted`**, Sender **`GET /orders/mine`** (filter by status as needed). Same post-accept lifecycle (transit, delivered, proof, mock payment UI, disputes, **chat when opened manually**) as Sender-posted orders. **Accepted panels** use the same **loading/empty/error/retry/refresh** states as posted-order accepts (see **Delivery lifecycle after acceptance** → **Accepted delivery requests panel states**). **Request panels** surface conversion via **`deliveryOrderId`** (see **Converted order UI** below); **Accepted order panels** surface origin via **`sourceType`** (see **Order source badge** below) and expose **View details** (drawer), **Open chat**, and **Payment** actions like posted orders. Sender **`ORDER_ACCEPTED`** notification uses **`relatedOrderId`** = created **`DeliveryOrder.id`**; bell click focuses the card and **opens Accepted Order Details drawer** (see **Notifications** → **Order-linked notification click behavior**). Draft, published, and OPEN feed cards are unchanged.

**Accepted-panel refresh (after request accept):** when a Wayler accepts an incoming Sender request, the UI refreshes Accepted order lists so the converted `DeliveryOrder` and its actions (including **Open chat** and **mock payment**) appear **without manual page refresh**:

| Trigger                                             | Callback                                            | Panel refreshed                                                    |
| --------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------ |
| Wayler **Accept request** succeeds                  | `WaylerIncomingRequestsPanel` → `onRequestAccepted` | Wayler **Accepted delivery requests** (`loadAcceptedOrders`)       |
| Sender **My requests** load finds `deliveryOrderId` | `SenderWaylersPanel` → `onAcceptedOrdersRefresh`    | Sender **Accepted delivery requests** (`loadSenderAcceptedOrders`) |

Implementation: `wayler-incoming-requests-panel.tsx`, `sender-waylers-panel.tsx`, wired in `apps/web/src/app/(app)/app/page.tsx`. Compare: OPEN-feed accept already called `loadAcceptedOrders()` — availability-request accept now matches that behavior.

**Duplicate prevention:** second accept on non-`PENDING` → **409** `AVAILABILITY_REQUEST_NOT_PENDING`; unique `availabilityRequestId` prevents two orders per request; race-safe via transaction + `P2002` fallback fetch.

**Sender acceptance notification** (after successful accept **and** `DeliveryOrder` creation — notification failures do **not** roll back the transaction):

| Field                  | Value                                                                                                                                                                                                                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Recipient**          | **Sender** only — Wayler is **not** notified for their own accept                                                                                                                                                                                                                                                |
| **`NotificationType`** | **`ORDER_ACCEPTED`** (same as posted-order accept — not `SYSTEM`)                                                                                                                                                                                                                                                |
| **Title**              | Your delivery request was accepted                                                                                                                                                                                                                                                                               |
| **Body**               | `Your delivery request "{title}" was accepted and a delivery order was created.`                                                                                                                                                                                                                                 |
| **`relatedOrderId`**   | Created **`DeliveryOrder.id`** — **not** `availabilityRequestId`                                                                                                                                                                                                                                                 |
| **Click from bell**    | Sender can click the notification → marks read, closes bell, focuses **Sender Accepted delivery requests** panel, scrolls/highlights the converted order card, **opens Accepted Order Details drawer** for created **`DeliveryOrder.id`** (see **Notifications** → **Order-linked notification click behavior**) |
| **Duplicates**         | Re-accept on non-`PENDING` → **409** before notification; exactly **one** notification per successful accept                                                                                                                                                                                                     |

Not sent when daily access check fails (**403** `WAYLER_ACCESS_REQUIRED` before accept runs).

#### Converted order UI (request panels)

When a request has a linked **`deliveryOrderId`** (typically after Wayler **accept**), both **Sender** and **Wayler** request panels show a compact conversion notice — implemented in `availability-request-converted-order.tsx`, used by `sender-waylers-panel.tsx` and `wayler-incoming-requests-panel.tsx`.

| Panel      | Location                                                              | When shown                    | UI                                                                                                                                      |
| ---------- | --------------------------------------------------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Sender** | **“My requests to Waylers”** (`sender-waylers-panel.tsx`)             | `deliveryOrderId` is non-null | **“Converted to order”** badge + **“Linked delivery order · Order reference: `abc12345…`”** (short id — dashes stripped, first 8 chars) |
| **Wayler** | **“Incoming Sender requests”** (`wayler-incoming-requests-panel.tsx`) | `deliveryOrderId` is non-null | Same badge + reference block                                                                                                            |

**Behavior:**

- **Pending / declined / cancelled** requests without `deliveryOrderId` → **no** conversion badge (status badge only).
- **Accepted** with `deliveryOrderId` → conversion notice shown; **no accept/decline** buttons (non-`PENDING` — unchanged).
- **Accepted** without `deliveryOrderId` (legacy or edge) → status badge only; no conversion block.
- **Not clickable** — no navigation to order detail; users find the job in **Accepted delivery requests** / **Sender Accepted** order panels separately.
- **Does not** start payment, chat, or disputes — informational only.

**i18n** (`app.availabilityRequests.*`, 8 locales): `convertedToOrder`, `linkedOrder`, `orderReference`.

**Not implemented (converted-order UI — future):**

- Clickable link from badge to order detail page
- Auto-open chat or payment from the conversion notice

#### Availability request panel states

Both **Sender** **“My requests to Waylers”** (`sender-waylers-panel.tsx`) and **Wayler** **“Incoming Sender requests”** (`wayler-incoming-requests-panel.tsx`) share polished loading, empty, error, and refresh UX — frontend-only. Reuses shared **`PanelEmptyState`**, **`PanelErrorState`**, and **`RequestsListSkeleton`** from `apps/web/src/components/app/panel-status-states.tsx` (same pattern as **Accepted delivery requests panel states**). **No backend/schema changes.**

**Sender “My requests to Waylers”** (`loadMyRequests()` — `api.waylerAvailabilityRequests.mineAsSender({ limit: 5 })`):

| State             | Behavior                                                                                                                                                                                                                                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**       | Visible **“Loading your requests…”** (`app.availabilityRequests.senderLoading`, `role="status"`, `aria-live="polite"`) + compact request-card skeleton (`RequestsListSkeleton`) on **initial load when no cached requests**. **Does not show empty state while loading.**                                 |
| **Success**       | Request cards render (title, route, reward, status badge, created date, Wayler `responseMessage`, **“Converted to order”** badge when `deliveryOrderId` set, **Cancel request** while `PENDING`).                                                                                                         |
| **Empty**         | When `!loading && !error && requests.length === 0` — bordered empty state with **title** (`app.availabilityRequests.senderEmptyTitle`) + **body** (`app.availabilityRequests.senderEmptyBody`): requests sent to Waylers appear here; Sender can browse Wayler availability above and request a delivery. |
| **Error**         | Localized **“Could not load your requests.”** (`app.availabilityRequests.senderLoadFailed`) + **Retry** (`app.availabilityRequests.retrySenderRequests`) → re-runs `loadMyRequests()`. Retry **disabled while loading**. Dashboard does **not** crash.                                                    |
| **Error + cache** | If requests were loaded previously, **stale request cards remain visible** below the error banner (no empty state).                                                                                                                                                                                       |
| **Refresh**       | Loads on KYC approval and after send/cancel success; browse **Search** / **Refresh** does **not** replace my-requests reload (my-requests reloads independently on mount and after actions).                                                                                                              |

**Wayler “Incoming Sender requests”** (`loadRequests()` — `api.waylerAvailabilityRequests.mineAsWayler({ limit: 10 })`):

| State             | Behavior                                                                                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Loading**       | Visible **“Loading incoming requests…”** (`app.availabilityRequests.waylerLoading`) + taller skeleton (`RequestsListSkeleton`, `h-28`) on **initial load when no cached requests**. **Does not show empty while loading.**                                          |
| **Success**       | Incoming request cards with package, route, reward, sender message, optional response textarea, **Accept request** / **Decline request** while `PENDING`, conversion badge when `deliveryOrderId` set.                                                              |
| **Empty**         | When `!loading && !error && requests.length === 0` — **title** (`app.availabilityRequests.waylerEmptyTitle`) + **body** (`app.availabilityRequests.waylerEmptyBody`): Sender delivery requests appear here when users request delivery through Wayler availability. |
| **Error**         | **“Could not load incoming requests.”** (`app.availabilityRequests.waylerLoadFailed`) + **Retry** (`app.availabilityRequests.retryWaylerRequests`) → re-runs `loadRequests()`. Retry disabled while loading.                                                        |
| **Error + cache** | Stale incoming request cards remain visible with error banner when previously loaded.                                                                                                                                                                               |
| **Refresh**       | Footer **Refresh** button → `loadRequests()`; label **Loading…** (`app.senderWaylers.loading`) while loading; button **disabled while loading**. Refresh with cached requests **keeps cards visible** during reload.                                                |

**Unchanged request-panel behavior:** **Cancel request** (Sender, `PENDING` only), **Accept request** / **Decline request** (Wayler, `PENDING` only), **Wayler daily-access gating on accept** (decline/view not gated), **DeliveryOrder conversion on accept**, **“Converted to order”** badge + short order reference, **Accepted-panel auto-refresh** after accept (`onRequestAccepted` / `onAcceptedOrdersRefresh`), **Sender browse Wayler availability / discovery Results list panel states** (see **Sender browse Wayler availability / discovery panel states**), **Wayler availability/trips My listings panel** (create/publish/pause/cancel + panel states — see **Wayler availability/trips panel states**), **Accepted delivery requests panel states**, **Accepted Order Details drawer**, and **order-linked notification click** (focus accepted card + open drawer via **`DeliveryOrder.id`**) — all unchanged.

**Current limitations:**

- **Frontend-only panel reliability** — Retry re-calls existing list APIs; **no new backend endpoints**
- **No realtime availability-request updates** — lists refresh on panel load, **Refresh**, Retry, and after accept/decline/cancel/send actions — **no WebSocket/SSE**
- **Nothing deployed yet** — local development only

**i18n** (8 locales): `app.availabilityRequests.senderLoading`, `senderEmptyTitle`, `senderEmptyBody`, `senderLoadFailed`, `retrySenderRequests`, `waylerLoading`, `waylerEmptyTitle`, `waylerEmptyBody`, `waylerLoadFailed`, `retryWaylerRequests` (legacy single-line `noRequestsYet` / `noIncomingRequests` / `requestsLoadFailed` / `incomingLoadFailed` keys retained).

#### Order source badge (accepted panels)

When a **`DeliveryOrder`** in an **Accepted** list has `sourceType = WAYLER_AVAILABILITY_REQUEST`, both **Sender** and **Wayler** accepted panels show a compact source notice — implemented in `delivery-order-source-badge.tsx`, wired in `apps/web/src/app/(app)/app/page.tsx`.

| Panel      | Location                                       | When shown                                 | UI                                                                                                                                                     |
| ---------- | ---------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Sender** | **“Accepted delivery requests”** (Sender mode) | `sourceType = WAYLER_AVAILABILITY_REQUEST` | **“From Wayler request”** badge + **“Request reference: `abc12345…`”** when `availabilityRequestId` is set (short id — dashes stripped, first 8 chars) |
| **Wayler** | **“Accepted delivery requests”** (Wayler mode) | `sourceType = WAYLER_AVAILABILITY_REQUEST` | Same badge + reference block                                                                                                                           |

**Behavior:**

- **`SENDER_POSTED_ORDER`** (or missing `sourceType`) → **no** source badge — avoids clutter on normal posted orders.
- **`WAYLER_AVAILABILITY_REQUEST`** → badge shown; request reference when `availabilityRequestId` is non-null.
- **Draft / published / OPEN feed** cards → **unchanged** — converted orders never appear there (they enter at **ACCEPTED**).
- **Not clickable from badge** — no navigation to order detail or request detail; use **View details** on the accepted card or click the **`ORDER_ACCEPTED`** notification to open the drawer; **order-linked notifications** focus the card and open the drawer via **`DeliveryOrder.id`** (see **Notifications** → **Order-linked notification click behavior**).
- **Does not** start payment, chat, or disputes — informational only; existing card content (status, route, reward, proof, payment, chat actions) unchanged.

**i18n** (`app.orders.*`, 8 locales): `fromWaylerRequest`, `requestReference` (`postedOrder` reserved for future use).

**Not implemented (order source badge — future):**

- Clickable link from badge to dedicated order detail page/route (drawer via **View details** exists today)
- Auto-open chat or payment from the source badge

#### Chat for converted DeliveryOrders

Converted orders (`sourceType = WAYLER_AVAILABILITY_REQUEST`) use the **same order-based chat flow** as Sender-posted accepted orders — no separate request chat and **no backend changes** required for this polish.

| Topic                   | Behavior                                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chat endpoint**       | `POST /api/v1/conversations/order/:orderId` where **`orderId` = `DeliveryOrder.id`** — **not** `availabilityRequestId`                                                     |
| **UI entry**            | **Open chat** on Sender / Wayler **Accepted delivery requests** panels (`handleOpenChat(order.id, …)` → `api.conversations.forOrder(orderId)`)                             |
| **Conversation create** | **Lazy** — first open creates `Conversation` linked to `DeliveryOrder`; **not** created automatically during availability-request accept                                   |
| **Sender**              | Can open chat for converted orders (no daily-access gate)                                                                                                                  |
| **Wayler**              | Can open chat **only with active daily access** — disabled button + `app.chat.accessRequiredForContact` note when inactive; **403** `WAYLER_ACCESS_REQUIRED` on API bypass |
| **Wayler send**         | Same access gate on `POST /conversations/:id/messages`; `waylerSendBlocked` in chat modal when access inactive; **accepted order chat modal panel states** unchanged       |
| **Eligible status**     | `ACCEPTED`, `IN_TRANSIT`, `DELIVERED` — converted orders enter at **ACCEPTED**                                                                                             |
| **Participants**        | `senderId` and `acceptedWaylerId` from converted `DeliveryOrder` — same authorization as posted orders                                                                     |

**Not implemented (converted-order chat — future):**

- Automatic `Conversation` creation on availability-request accept
- Chat notification specifically tied to conversion (only normal message-send notifications after first message)
- Dedicated order/request detail page from chat context

See **Chat / contact between Sender and Wayler** for full API, SDK, polling, **accepted order chat modal panel states**, and access rules.

#### Mock payment for converted DeliveryOrders

Converted orders (`sourceType = WAYLER_AVAILABILITY_REQUEST`) use the **same order-based mock payment flow** as Sender-posted accepted orders — **verified compatible; no backend or frontend changes required** for this batch.

| Topic                           | Behavior                                                                                                                                                                          |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Authorize endpoint**          | `POST /api/v1/payments/orders/:orderId/mock-authorize` where **`orderId` = `DeliveryOrder.id`** — **not** `availabilityRequestId`                                                 |
| **Read endpoint**               | `GET /api/v1/payments/orders/:orderId` — same `DeliveryOrder.id`                                                                                                                  |
| **Hold / release**              | `POST /api/v1/payments/:id/mock-hold-escrow` and `mock-release` by `paymentIntentId` after authorize (same as posted orders)                                                      |
| **No `sourceType` restriction** | `PaymentsService` checks `senderId`, `acceptedWaylerId`, status (`ACCEPTED` / `IN_TRANSIT`), and reward/currency only                                                             |
| **Sender UI**                   | **Payment** panel on Sender **Accepted delivery requests** — **Mock authorize payment**, hold, release when eligible (`handleMockAuthorizePayment(order.id)`)                     |
| **Wayler UI**                   | Read-only **Payment / payout** on Wayler **Accepted delivery requests** — status + amounts; **no payment action buttons**                                                         |
| **No auto payment on accept**   | No `PaymentIntent` created during conversion — Sender mock-authorizes manually from Accepted panel                                                                                |
| **Wayler refresh**              | Panel **Refresh** reloads orders + payment status (see **Payment and escrow foundation** → **Wayler Accepted panel payment refresh**); applies to converted orders same as posted |

**Not implemented (converted-order payment — future):**

- Automatic `PaymentIntent` creation on availability-request accept
- Stripe / real payment provider
- Automatic escrow capture or release on conversion
- Payment notification specifically tied to conversion (only standard mock payment notifications after Sender actions)

See **Payment and escrow foundation** → **Converted DeliveryOrders (mock payment compatibility)** for API routes, UI rules, and manual test steps.

#### Daily access gating (accept incoming requests)

Accepting an incoming Sender request means the Wayler is **taking a job** — it belongs behind the **daily work-access paywall**, separate from browsing or declining.

| Action                                      | Active daily access required? |
| ------------------------------------------- | ----------------------------- |
| Accept posted OPEN order                    | **Yes**                       |
| Accept incoming Sender availability request | **Yes**                       |
| Open order chat / send message as Wayler    | **Yes**                       |
| Browse OPEN order feed                      | No                            |
| View incoming Sender requests (list/detail) | No                            |
| Decline incoming Sender request             | No                            |
| Read conversations                          | No                            |
| Sender create/cancel availability requests  | No (Sender actions)           |

**Backend:** `WaylerAvailabilityRequestsService.accept` calls `WaylerAccessService.requireActiveAccess()` before `PENDING` → `ACCEPTED`. Without a pass → **403** `WAYLER_ACCESS_REQUIRED`, message _"Active Wayler work access is required before accepting Sender requests"_. **Decline**, **mine/wayler**, **get detail**, and Sender **cancel** are unchanged.

**Frontend:** `WaylerIncomingRequestsPanel` receives `waylerHasActiveAccess` from `/app`; **Accept request** disabled + `app.availabilityRequests.accessRequiredForAcceptRequest` note when inactive; **Decline request** stays enabled. `WaylerAccessPanel` `onAccessChanged` toggles accept immediately after mock activate/cancel. API bypass shows `app.availabilityRequests.accessRequiredAcceptRequestFailed`.

**Accepted notification** — **`ORDER_ACCEPTED`** to Sender with **`relatedOrderId`** = **`DeliveryOrder.id`**; see **DeliveryOrder conversion** → **Sender acceptance notification**; not sent when access check fails.

#### Request status lifecycle

| Status      | Meaning                        | Who can act                                                 |
| ----------- | ------------------------------ | ----------------------------------------------------------- |
| `PENDING`   | Awaiting Wayler response       | Sender may **cancel**; Wayler may **accept** or **decline** |
| `ACCEPTED`  | Wayler accepted                | No further accept/decline/cancel via current UI             |
| `DECLINED`  | Wayler declined                | Terminal for this batch                                     |
| `CANCELLED` | Sender cancelled while pending | Terminal                                                    |
| `EXPIRED`   | Enum exists in schema          | **Not automated yet** — no cron/job sets this status        |

#### API routes (`/api/v1/wayler-availability-requests`, Swagger tag **wayler-availability-requests**)

| Method | Route                                       | Action                                                                                                                   |
| ------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `POST` | `/wayler-availability-requests`             | Sender creates request → `WaylerAvailabilityRequestDetail`                                                               |
| `GET`  | `/wayler-availability-requests/mine/sender` | Sender lists own requests                                                                                                |
| `GET`  | `/wayler-availability-requests/mine/wayler` | Wayler lists incoming requests                                                                                           |
| `GET`  | `/wayler-availability-requests/:id`         | Detail (sender or wayler participant only)                                                                               |
| `POST` | `/wayler-availability-requests/:id/accept`  | Wayler accepts `PENDING` request (**active daily Wayler access required** — `403` `WAYLER_ACCESS_REQUIRED` when missing) |
| `POST` | `/wayler-availability-requests/:id/decline` | Wayler declines `PENDING` request                                                                                        |
| `POST` | `/wayler-availability-requests/:id/cancel`  | Sender cancels own `PENDING` request                                                                                     |

All routes require **JWT + KYC approval**.

#### SDK (`api.waylerAvailabilityRequests`)

| Method                                            | Usage                              |
| ------------------------------------------------- | ---------------------------------- |
| `waylerAvailabilityRequests.create(input)`        | Sender creates request             |
| `waylerAvailabilityRequests.mineAsSender(query?)` | Sender lists own requests          |
| `waylerAvailabilityRequests.mineAsWayler(query?)` | Wayler lists incoming requests     |
| `waylerAvailabilityRequests.get(id)`              | Request detail (participants only) |
| `waylerAvailabilityRequests.accept(id, input?)`   | Wayler accepts                     |
| `waylerAvailabilityRequests.decline(id, input?)`  | Wayler declines                    |
| `waylerAvailabilityRequests.cancel(id)`           | Sender cancels                     |

Validation: `@wayly/validation` — `createWaylerAvailabilityRequestSchema`, `respondWaylerAvailabilityRequestSchema`, `waylerAvailabilityRequestsListQuerySchema`.

i18n: **`app.availabilityRequests.*`** (8 locales) for request form, my requests, incoming panel, accept/decline, errors, status labels, and **converted-order** strings (`convertedToOrder`, `linkedOrder`, `orderReference`); **`app.orders.fromWaylerRequest`**, **`app.orders.requestReference`** for accepted-panel source badge (see **Order source badge**).

#### In-app notifications (availability requests)

After each successful request write, `WaylerAvailabilityRequestsService` notifies the **other participant** via `NotificationsService.createForUser()`. **Create**, **decline**, and **cancel** use **`SYSTEM`**; **accept** uses **`ORDER_ACCEPTED`** with **`relatedOrderId`** = created **`DeliveryOrder.id`**. Notifications appear in the **same bell/dropdown** as order, payment, chat, dispute, and Wayler access alerts. See **Notifications** for full dispatch table, duplicate prevention, and manual test steps.

| Event           | Recipient  | Type             | Title                              | Body                                                                             |
| --------------- | ---------- | ---------------- | ---------------------------------- | -------------------------------------------------------------------------------- |
| Sender creates  | **Wayler** | `SYSTEM`         | New delivery request               | A Sender sent you a delivery request for your Wayler availability.               |
| Wayler accepts  | **Sender** | `ORDER_ACCEPTED` | Your delivery request was accepted | `Your delivery request "{title}" was accepted and a delivery order was created.` |
| Wayler declines | **Sender** | `SYSTEM`         | Delivery request declined          | Your delivery request was declined by the Wayler.                                |
| Sender cancels  | **Wayler** | `SYSTEM`         | Delivery request cancelled         | A Sender cancelled a delivery request.                                           |

**Duplicate prevention:** notifications only after successful DB writes; **409** on repeat accept/decline/cancel (`AVAILABILITY_REQUEST_NOT_PENDING`) does not notify; notification failures are logged and do not block the request action.

**Current notification limitations:**

- **Accept uses `ORDER_ACCEPTED`** — create/decline/cancel remain plain **`SYSTEM`** (no dedicated availability-request enum values yet)
- **`relatedOrderId` on accept only** — links to **`DeliveryOrder.id`**, not `availabilityRequestId`; decline/cancel have no order to link
- **Order-linked click on accept** — Sender **`ORDER_ACCEPTED`** notifications focus Accepted panel, highlight card, and **open Accepted Order Details drawer** via **`DeliveryOrder.id`** (see **Notifications** → **Order-linked notification click behavior**); create/decline/cancel remain display + mark-read only
- **No push/email** — in-app bell polling only (no Firebase/APNs)
- **No localized backend templates** — hard-coded English title/body

#### Current limitations (availability requests)

- **No automatic payment / escrow on accept** — `DeliveryOrder` is created, but **`PaymentIntent` is not auto-created**; Sender must mock-authorize manually on Accepted panel (see **Payment and escrow foundation**)
- **Converted orders use the same mock payment UI/API as posted orders** — verified compatible; endpoints use **`DeliveryOrder.id`**, not `availabilityRequestId`; **`PaymentsService` has no `sourceType` filter** (see **Mock payment for converted DeliveryOrders**)
- **No Stripe / real payment** — mock/manual `MANUAL` provider only
- **No automatic chat on accept** — no `Conversation` is created during conversion; parties open chat manually from Accepted panel (**Wayler** needs active daily access)
- **No chat notification on conversion** — only standard chat message notifications after a user sends a message
- **No automatic dispute** — disputes open manually on eligible orders like any other accepted order
- **No clickable order/request detail from badges** — request-panel badge references are display-only; accepted cards use **View details** drawer (see **Accepted Order Details drawer**)
- **Source badge does not start payment or chat** — informational only; parties use existing Accepted panel actions manually
- **No dedicated order detail page/route** — drawer inspection on accepted cards today (not a full route)
- **No expiry automation** — `EXPIRED` status exists but nothing sets it yet
- **No request detail page** — list/card views only; `get(id)` exists in API/SDK but no dedicated UI route
- **No admin moderation** for availability requests

Mock payment UI and **Payment and escrow foundation** apply to **accepted `DeliveryOrder` rows** (including converted orders) — Sender-initiated mock authorize/hold/release only; not triggered automatically on accept.

### Schema

**Enums** (mirror `@wayly/types`):

| Enum                              | Values                                                    |
| --------------------------------- | --------------------------------------------------------- |
| `WaylerAvailabilityStatus`        | `DRAFT`, `ACTIVE`, `PAUSED`, `EXPIRED`, `CANCELLED`       |
| `WaylerAvailabilityType`          | `LOCAL_AVAILABILITY`, `TRIP_ROUTE`                        |
| `TripDirection`                   | `ONE_WAY`, `RETURN`, `FLEXIBLE`                           |
| `WaylerAvailabilityRequestStatus` | `PENDING`, `ACCEPTED`, `DECLINED`, `CANCELLED`, `EXPIRED` |
| `DeliveryOrderSource`             | `SENDER_POSTED_ORDER`, `WAYLER_AVAILABILITY_REQUEST`      |

**`WaylerAvailability`** (`wayler_availabilities`) — Wayler-published local coverage or travel route

| Field group     | Fields                                                                                         |
| --------------- | ---------------------------------------------------------------------------------------------- |
| **Identity**    | `id`, `waylerId` → `User` (cascade delete)                                                     |
| **Type/status** | `type` (`WaylerAvailabilityType`), `status` (default `DRAFT`)                                  |
| **Origin**      | `originCountry`, `originCity`, `originRegion` (all optional)                                   |
| **Destination** | `destinationCountry`, `destinationCity`, `destinationRegion` (optional — used for trip routes) |
| **Dates**       | `availableFrom`, `availableTo`, `departureDate`, `returnDate`                                  |
| **Trip**        | `tripDirection` (`TripDirection`, optional)                                                    |
| **Capacity**    | `maxPackages`, `maxWeightKg` (`Decimal(8,2)`), `notes`                                         |
| **Discovery**   | `isPublic` (default `false`), `publishedAt`, `pausedAt`, `cancelledAt`, `expiresAt`            |
| **Timestamps**  | `createdAt`, `updatedAt`                                                                       |

**Indexes:** `waylerId`, `type`, `status`, `isPublic`, origin/destination country/city/region, `availableFrom`, `availableTo`, `departureDate`, `expiresAt`, `createdAt`.

**Relations:**

- `User` — `waylerAvailabilities` (`@relation("WaylerAvailabilities")`)

**`WaylerAvailabilityRequest`** (`wayler_availability_requests`) — Sender request against a published Wayler availability/trip

| Field group    | Fields                                                                                                           |
| -------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Identity**   | `id`, `availabilityId` → `WaylerAvailability` (cascade), `senderId` → `User`, `waylerId` → `User` (both cascade) |
| **Status**     | `status` (`WaylerAvailabilityRequestStatus`, default `PENDING`)                                                  |
| **Package**    | `title`, `packageDescription`                                                                                    |
| **Route**      | `pickupCountry`, `pickupCity`, `pickupAddress`, `dropoffCountry`, `dropoffCity`, `dropoffAddress`                |
| **Dates**      | `desiredPickupFrom`, `desiredPickupTo`, `desiredDeliveryFrom`, `desiredDeliveryTo`                               |
| **Reward**     | `proposedRewardCents`, `currency` (default `EUR`)                                                                |
| **Messages**   | `message` (Sender → Wayler), `responseMessage` (Wayler on accept/decline)                                        |
| **Timestamps** | `acceptedAt`, `declinedAt`, `cancelledAt`, `expiresAt`, `createdAt`, `updatedAt`                                 |

**Indexes:** `availabilityId`, `senderId`, `waylerId`, `status`, `createdAt`, composite `(waylerId, status)`, `(senderId, status)`, `(availabilityId, status)`.

**Relations:**

- `WaylerAvailability` — `availabilityRequests`
- `User` — `sentAvailabilityRequests` (sender), `receivedAvailabilityRequests` (wayler)
- `DeliveryOrder` — optional `deliveryOrder` back-relation (1:1 via `availabilityRequestId`)

Migration: `apps/api/prisma/migrations/20260611150447_add_wayler_availability_requests/migration.sql`

**`DeliveryOrder` source link** (on `delivery_orders` — migration `add_delivery_order_source_for_availability_requests`):

| Field                   | Description                                                            |
| ----------------------- | ---------------------------------------------------------------------- |
| `sourceType`            | `DeliveryOrderSource` — default `SENDER_POSTED_ORDER`                  |
| `availabilityRequestId` | Optional `@unique` FK → `WaylerAvailabilityRequest` (converted orders) |

**Shared types** (`@wayly/types`):

| Type                                    | Description                                                 |
| --------------------------------------- | ----------------------------------------------------------- |
| `WaylerAvailabilitySummary`             | Compact listing for feeds and discovery                     |
| `WaylerAvailabilityDetail`              | Full payload (same fields as summary for now)               |
| `WaylerAvailabilityListResponse`        | Paginated list — `items`, `page`, `limit`, `total`          |
| `ActiveWaylerCountSummary`              | `country`, `city`, `region`, `activeCount`                  |
| `WaylerAvailabilityRequestSummary`      | Compact request for list views (includes `deliveryOrderId`) |
| `WaylerAvailabilityRequestDetail`       | Full request payload (includes `deliveryOrderId`)           |
| `WaylerAvailabilityRequestListResponse` | Paginated list — `items`, `page`, `limit`, `total`          |

Dates serialize as `ISODateString`; `maxWeightKg` as `DecimalString`; request reward as integer cents.

Migration: `apps/api/prisma/migrations/20260602143000_wayler_availability_foundation/migration.sql`

### Intended marketplace flows

| Flow                   | Example                                                                                |
| ---------------------- | -------------------------------------------------------------------------------------- |
| **Local availability** | “I am available today in Bishkek / this region.”                                       |
| **Trip route**         | “I fly Madrid → Jakarta on June 5.”                                                    |
| **Return / flexible**  | “I travel there and back between these dates.” (`ONE_WAY` / `RETURN` / `FLEXIBLE`)     |
| **Sender discovery**   | “There are 20 active couriers today in this city.”                                     |
| **Sender request**     | “I want this Wayler to carry my package on their published route.”                     |
| **Wayler discovery**   | “Here are open Sender orders in my selected country/city/region.” (M4 today)           |
| **Wayler response**    | “Incoming Sender requests — accept or decline; accept creates linked `DeliveryOrder`.” |

Today’s M4 loop (Sender publishes → Wayler browses OPEN orders → accept → lifecycle) remains unchanged. The **reverse discovery lane** (Wayler publishes → Sender browses → **sends `WaylerAvailabilityRequest`** → Wayler **accepts or declines**) has **API + SDK + both-side UI + backend DeliveryOrder conversion on accept**. Automatic payment, chat, and dedicated conversion UI land in later batches.

### API routes (`/api/v1/wayler-availabilities`, Swagger tag **wayler-availabilities**)

| Method | Route                                  | Action                                                            |
| ------ | -------------------------------------- | ----------------------------------------------------------------- |
| `POST` | `/wayler-availabilities`               | Create DRAFT listing → `WaylerAvailabilityDetail`                 |
| `GET`  | `/wayler-availabilities/mine`          | List current Wayler’s listings → `WaylerAvailabilityListResponse` |
| `GET`  | `/wayler-availabilities/public`        | Public discovery list → `WaylerAvailabilityListResponse`          |
| `GET`  | `/wayler-availabilities/active-counts` | Active courier counts → `ActiveWaylerCountSummary[]`              |
| `GET`  | `/wayler-availabilities/:id`           | Detail → `WaylerAvailabilityDetail`                               |
| `POST` | `/wayler-availabilities/:id/publish`   | Publish DRAFT/PAUSED → `WaylerAvailabilityDetail`                 |
| `POST` | `/wayler-availabilities/:id/pause`     | Pause ACTIVE → `WaylerAvailabilityDetail`                         |
| `POST` | `/wayler-availabilities/:id/cancel`    | Cancel listing → `WaylerAvailabilityDetail`                       |

All routes require **JWT + KYC approval** (`VerificationGuard` + `requireKycApproved`).

### SDK (`api.waylerAvailabilities`)

| Method                                      | Usage                                                 |
| ------------------------------------------- | ----------------------------------------------------- |
| `waylerAvailabilities.create(body)`         | Create DRAFT listing                                  |
| `waylerAvailabilities.mine(query?)`         | List current Wayler’s listings                        |
| `waylerAvailabilities.publicList(query?)`   | Public discovery list with location/type/date filters |
| `waylerAvailabilities.activeCounts(query?)` | Active courier counts by origin location              |
| `waylerAvailabilities.detail(id)`           | Get listing detail                                    |
| `waylerAvailabilities.publish(id)`          | Publish DRAFT/PAUSED listing                          |
| `waylerAvailabilities.pause(id)`            | Pause ACTIVE listing                                  |
| `waylerAvailabilities.cancel(id)`           | Cancel listing                                        |

Validation: `@wayly/validation` — `createWaylerAvailabilitySchema`, `waylerAvailabilitiesMineQuerySchema`, `waylerAvailabilitiesPublicQuerySchema`, `activeWaylerCountsQuerySchema`.

### Rules

| Rule                   | Behavior                                                                                                                         |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**               | JWT + KYC required on all routes (`403` `KYC_REQUIRED` when unapproved)                                                          |
| **Create**             | Always `DRAFT`, `isPublic=false`, `waylerId=current user`                                                                        |
| **LOCAL_AVAILABILITY** | `originCountry` required; `originCity` or `originRegion` required; `availableFrom` required; destination fields ignored on write |
| **TRIP_ROUTE**         | Origin/destination country+city required; `departureDate`, `tripDirection` required; `returnDate` required when `RETURN`         |
| **Date ordering**      | `availableTo >= availableFrom`; `returnDate >= departureDate` when provided                                                      |
| **Publish**            | Owner only; status must be `DRAFT` or `PAUSED`; sets `ACTIVE`, `isPublic=true`, `publishedAt`, `expiresAt`                       |
| **Pause**              | Owner only; status must be `ACTIVE`; sets `PAUSED`, `isPublic=false`, `pausedAt`                                                 |
| **Cancel**             | Owner only; cannot already be `CANCELLED`; sets `CANCELLED`, `isPublic=false`, `cancelledAt`                                     |
| **Public list**        | Only `ACTIVE` + `isPublic` + not expired (`expiresAt` null or `>= now`); optional type/location/date filters                     |
| **Active counts**      | `LOCAL_AVAILABILITY` only; `ACTIVE` + public + not expired; grouped by `originCountry`/`originCity`/`originRegion`               |
| **Detail privacy**     | Owner sees any status; others only `ACTIVE` + public + not expired → else **404**                                                |

### Current scope

| Included                                                                                                                                                      | Not included (yet)                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Prisma enums + `WaylerAvailability` + `WaylerAvailabilityRequest` models + migrations                                                                         | Auto payment/escrow on accept                                                            |
| `DeliveryOrderSource` + `availabilityRequestId` on `DeliveryOrder` + conversion on accept                                                                     | Automatic chat on accept                                                                 |
| `@wayly/types` summaries + list/count types (+ `deliveryOrderId` on requests)                                                                                 | Request expiry automation (`EXPIRED`)                                                    |
| `WaylerAvailabilitiesModule` + `WaylerAvailabilityRequestsModule` API + Swagger                                                                               | Request detail page UI                                                                   |
| SDK `api.waylerAvailabilities.*` + `api.waylerAvailabilityRequests.*`                                                                                         | Admin moderation for requests                                                            |
| Create / mine / public / active-counts / detail / publish / pause / cancel                                                                                    | Dedicated availability-request notification types for create/decline/cancel              |
| Request create / mine / accept / decline / cancel / detail + **in-app notifications**                                                                         | Dedicated availability-request notification types for create/decline/cancel              |
| **Order-linked notification click** from bell (`relatedOrderId` → Accepted panel focus/highlight + open details drawer)                                       | Dedicated order detail page/route from bell (full `/app/orders/:id`; drawer opens today) |
| **Notification bell / popover panel states** (loading/empty/error/retry/refresh; mark-read loading/disabled)                                                  | Realtime notification delivery (WebSocket/SSE/push)                                      |
| **Accepted delivery requests panel states** (Sender + Wayler; loading/empty/error/retry/refresh)                                                              | Realtime accepted-order panel updates (WebSocket/SSE)                                    |
| **Sender Published Orders panel states** (loading/empty/error/retry/refresh)                                                                                  | Realtime published-order panel updates (WebSocket/SSE)                                   |
| **Wayler open orders feed panel states** (loading/empty/error/retry/refresh)                                                                                  | Realtime open-order feed updates (WebSocket/SSE)                                         |
| **Availability request panel states** (Sender “My requests” + Wayler incoming; loading/empty/error/retry/refresh)                                             | Realtime availability-request panel updates (WebSocket/SSE)                              |
| **Wayler availability/trips panel states** (My listings; loading/empty/error/retry/refresh)                                                                   | Realtime Wayler availability listing panel updates (WebSocket/SSE)                       |
| **Sender browse Wayler availability / discovery panel states** (Results list; loading/true-empty/filter-empty/error/retry/refresh)                            | Realtime Sender browse Wayler discovery panel updates (WebSocket/SSE)                    |
| **Accepted Order Details drawer** (View details; Sender + Wayler; frontend-only; **Delivery progress timeline**; **loading/error/retry**; **Copy reference**) | Full order detail page/route + public share link                                         |
| **DeliveryOrder conversion on accept** (transactional backend)                                                                                                | Auto payment/chat from source badge                                                      |
| **Converted-order UI** on request panels (badge + short order reference)                                                                                      | Platform fee change (mock 10% → planned ~5%)                                             |
| **Availability request panel states** (Sender **My requests** + Wayler incoming; loading/empty/error/retry/refresh)                                           | Auto payment/chat from source badge                                                      |
| **Order source badge** on Accepted panels (`fromWaylerRequest` + request reference)                                                                           | Auto payment/chat from source badge                                                      |
| **Accepted-panel auto-refresh** after availability-request accept                                                                                             | Production deployment                                                                    |
| **Converted-order chat** (existing `DeliveryOrder.id` flow; lazy conversation create)                                                                         | Chat notification on conversion                                                          |
| **Accepted order chat modal panel states** (loading/empty/error/retry/refresh; sending/duplicate-send prevention; send-failure preserves draft)               | Realtime chat delivery (WebSocket/SSE/push)                                              |
| **Converted-order mock payment** (existing `DeliveryOrder.id` flow; verified compatible)                                                                      | Realtime payment status in Accepted panel                                                |
| **Wayler Accepted payment refresh helper** (Refresh + hint; reloads orders + payment)                                                                         | Stripe / real payment provider                                                           |
| KYC-gated access + owner/privacy rules                                                                                                                        | Matching recommendations engine                                                          |
| `@wayly/validation` availability + request schemas                                                                                                            | Map-based availability visualization                                                     |
| **Wayler management UI** — create, my listings, publish/pause/cancel + **My listings panel states**                                                           | Matching recommendations engine                                                          |
| **Sender browse UI** — filters, public listings, active counts, request form, my requests, cancel + **Results list panel states**                             | Map-based availability visualization                                                     |
| **Wayler incoming requests UI** — accept/decline + optional response + **panel states**                                                                       | Edit availability form / edit API                                                        |
| i18n `app.waylerAvailability.*`, `app.senderWaylers.*`, `app.availabilityRequests.*` (8 locales)                                                              | Active count widgets on landing/dashboard                                                |
| Two-sided discovery + request flow (both lanes documented above)                                                                                              | Location filters for Wayler order feed (UI)                                              |

### Current limitations

- **No automatic payment / escrow on accept** — converted `DeliveryOrder` exists, but **`PaymentIntent` is not auto-created**; Sender mock-authorizes manually (see **Payment and escrow foundation**)
- **No Stripe / real payment provider** — mock/manual `MANUAL` only; no checkout, webhooks, or real money movement
- **No automatic escrow capture/release on conversion** — Sender must mock hold/release manually like posted orders
- **No realtime accepted-order panel updates** — lists refresh on load, **Refresh**, **Retry**, notification reload, or accept callbacks; no WebSocket/SSE (see **Accepted delivery requests panel states**)
- **No realtime notification bell delivery** — popover refreshes on open, **Refresh**, **Retry**, mark-read actions, and polling (30s unread / 60s list); no WebSocket/SSE/push (see **Notification bell / popover panel states**)
- **No realtime published-order panel updates** — Sender **Published Orders** panel refreshes on load, **Refresh**, **Retry**, and after publish/cancel success; no WebSocket/SSE (see **Sender Published Orders panel states**)
- **No realtime open-order feed updates** — Wayler **Available delivery requests** feed refreshes on load, filter change, **Refresh**, **Retry**, and after accept; no WebSocket/SSE (see **Wayler open orders feed panel states**)
- **No realtime availability-request panel updates** — Sender **My requests** and Wayler **Incoming Sender requests** refresh on load, **Refresh**, **Retry**, and after send/cancel/accept/decline; no WebSocket/SSE (see **Availability request panel states**)
- **No realtime Wayler availability listing panel updates** — Wayler **My listings** refreshes on load, **Refresh**, **Retry**, and after create/publish/pause/cancel success; no WebSocket/SSE (see **Wayler availability/trips panel states**)
- **No realtime Sender browse Wayler discovery updates** — Sender **Browse active Waylers** Results list refreshes on load, **Search**, **Refresh**, **Retry**, and after manual reload; no WebSocket/SSE (see **Sender browse Wayler availability / discovery panel states**)
- **No realtime Wayler payment panel updates** — payment/escrow status updates on manual **Refresh** only (see **Wayler Accepted panel payment refresh**)
- **No realtime chat delivery** — modal refreshes on open, **Refresh**, **Retry**, successful send, and **10s polling** while open; no WebSocket/SSE/push (see **Accepted order chat modal panel states**)
- **No push notifications for chat** — in-app bell only today
- **No automatic chat on accept** — converted orders use existing chat UI; conversation created lazily on first **Open chat**
- **No chat notification on conversion** — only after first message is sent
- **No production deployment** — local development only (see **Deployment** when added)
- **No automatic dispute** — disputes open manually on eligible orders
- **No clickable order/request detail from badges** — badge references are display-only; accepted cards have **View details** drawer (see **Delivery lifecycle after acceptance** → **Accepted Order Details drawer**)
- **Source badge does not trigger payment or chat**
- **No dedicated order detail page/route** — drawer with **Delivery progress** timeline, **loading/error/retry**, and **Copy reference** on accepted cards today; not a full `/app/orders/:id` route
- **No public share link or backend share token** — **Copy reference** copies **`DeliveryOrder.id`** to clipboard only; not a shareable URL
- **No realtime delivery progress / detail refresh in drawer** — timeline and detail fields reflect snapshot on open/retry; no WebSocket while drawer stays open
- **Availability-request accept notification uses `ORDER_ACCEPTED`** — create/decline/cancel remain **`SYSTEM`**; **`relatedOrderId`** = **`DeliveryOrder.id`** on accept only (not `availabilityRequestId`); **accept notifications are clickable** — focus Accepted panel, highlight card, **open details drawer** (see **Notifications**); push/email and localized backend templates are future
- **No expiry automation** — `EXPIRED` status exists but no cron/job sets it yet
- **No request detail page** — list/card views only; `get(id)` exists in API/SDK but no dedicated UI route
- **No admin moderation** for availability requests
- **Decline incoming requests is not access-gated** — only **accept** requires active daily pass (see **Daily access gating** above)
- **No matching / recommendation algorithm** — Senders search public listings manually via filters
- **No map/geocoding for availability** — simple text/date inputs only; no Leaflet on availability browse or create forms
- **No edit endpoint or edit form** — create new DRAFT or pause/cancel/re-publish; full edit is a future batch
- **No landing/dashboard count widgets** — active counts appear in Sender browse panel only (not on marketing home yet)

### Manual verification (schema + API)

- [ ] Migration applied (`wayler_availability_foundation`)
- [ ] Prisma client generated
- [ ] `pnpm build`, `pnpm lint`, `pnpm typecheck` pass
- [ ] Swagger tag **wayler-availabilities** visible at `/docs`

### Manual visual testing checklist (Sender browse UI)

Use two **KYC-approved** users (**W** = Wayler, **S** = Sender):

- [ ] **User W**: create and **publish** `LOCAL_AVAILABILITY` for Bishkek
- [ ] **User W**: create and **publish** `TRIP_ROUTE` Madrid → Jakarta (`ONE_WAY`)
- [ ] **User S**: switch to **Sender mode** → **“Browse active Waylers”** panel loads (after Accepted Orders)
- [ ] **Results list** initial load shows **Loading Wayler availability…** + skeleton (not empty)
- [ ] With no published listings and no filters → **No Wayler availability yet** true empty (not filter-empty)
- [ ] Initial load shows public listings (limit 20) when Waylers have published availability; active count section loads
- [ ] Search Bishkek local availability → listing appears; **active count** shows Bishkek courier count
- [ ] Search with filters that match nothing → **No Waylers match your filters** (distinct from true empty)
- [ ] Search Madrid → Jakarta trip → trip listing appears
- [ ] **“Request this Wayler”** opens inline form on a listing
- [ ] Submit request → success alert; request appears in **“My requests to Waylers”** with **PENDING** status
- [ ] **“My requests to Waylers”** initial load shows **Loading your requests…** + skeleton (not empty)
- [ ] With no sent requests → friendly empty title + body (browse Wayler availability above)
- [ ] Simulate my-requests load failure (stop API) on empty section → error + **Retry**; no empty state; dashboard stable
- [ ] With cached requests, simulate my-requests failure → error banner + **stale request cards still visible**; **Retry** restores
- [ ] **Cancel request** while **PENDING** → status **CANCELLED** after refresh
- [ ] Simulate Results list load failure → error + **Retry**; stale listing cards when cached; **Refresh** / **Refreshing…** keeps cards visible
- [ ] Existing Sender **order create**, **drafts**, **published**, **accepted**, **payment**, **dispute**, and **chat** flows still work
- [ ] Non-approved Sender sees KYC notice; browse UI hidden

### Manual visual testing checklist (Wayler management UI)

Use a **KYC-approved Wayler** on `/app` (Wayler mode):

- [ ] Login as KYC-approved Wayler → switch to **Wayler mode**
- [ ] **“Today’s Wayler work access”** panel visible at top of Wayler stack (before order feed)
- [ ] **“Your Wayler availability”** panel visible after Accepted delivery requests area
- [ ] **My listings** initial load → **Loading your availability…** + skeleton (not empty)
- [ ] With no listings → **No availability or trips yet** title + body
- [ ] Simulate My listings load failure → error + **Retry**; stale cards when cached; **Refresh** / **Refreshing…** works
- [ ] Create **LOCAL_AVAILABILITY** for Bishkek → appears as **DRAFT** in My listings
- [ ] **Publish** → status **ACTIVE**
- [ ] **Pause** → status **PAUSED** (private)
- [ ] **Publish** again → status **ACTIVE**
- [ ] **Cancel** → status **CANCELLED**
- [ ] Create **TRIP_ROUTE** Madrid → Jakarta, **ONE_WAY** → **Publish**
- [ ] **RETURN** trip without `returnDate` → client validation (`returnDateRequired`)
- [ ] Existing **Wayler OPEN feed** and **Accepted delivery requests** still work (unchanged)
- [ ] Non-approved user sees KYC notice; form hidden

### Manual API testing checklist

Use two KYC-approved users (**W** = Wayler, **S** = Sender) and Swagger or SDK:

- [ ] **User W** creates `LOCAL_AVAILABILITY` draft (`originCountry`, `originCity` or `originRegion`, `availableFrom`)
- [ ] **User W** publishes draft → status `ACTIVE`, `isPublic=true`
- [ ] **User S** calls `publicList({ originCountry, originCity })` → sees published listing
- [ ] **User S** calls `activeCounts({ country, city })` → count includes listing
- [ ] **User W** creates `TRIP_ROUTE` draft (Madrid → Jakarta, `departureDate`, `tripDirection`)
- [ ] **User W** publishes trip → **User S** finds it via `publicList` with destination filters
- [ ] **User S** calls `detail(draftId)` for **User W**’s unpublished draft → **404**
- [ ] **User W** calls `detail(ownDraftId)` → succeeds
- [ ] **User W** pauses ACTIVE listing → hidden from `publicList`
- [ ] **User W** cancels listing → status `CANCELLED`, hidden from public
- [ ] KYC-unapproved user on any route → **403** `KYC_REQUIRED`

### Manual testing checklist (Sender ↔ Wayler availability requests)

Use two **KYC-approved** users (**W** = Wayler, **S** = Sender):

- [ ] **User W**: create and **publish** `LOCAL_AVAILABILITY` or `TRIP_ROUTE` listing
- [ ] **User S**: **Sender mode** → **Browse active Waylers** → sees published listing
- [ ] **User S**: click **“Request this Wayler”** → fill package, pickup/dropoff, optional dates, reward, message → **Send request**
- [ ] **User S**: **“My requests to Waylers”** shows request with **PENDING** status
- [ ] **User S**: **“My requests to Waylers”** initial load → loading text + skeleton (not empty); empty state only when load succeeds with zero requests
- [ ] **User W**: **“Incoming Sender requests”** initial load → loading text + skeleton (not empty); empty state only when load succeeds with zero incoming requests
- [ ] Simulate Sender my-requests load failure → localized error + **Retry**; stale cards when cached
- [ ] Simulate Wayler incoming load failure → localized error + **Retry**; stale cards when cached; footer **Refresh** still works after restore
- [ ] **User W**: **Wayler mode** → **“Incoming Sender requests”** panel shows title, package, route, reward, sender message
- [ ] **User W** with **active daily access**: **Accept request** (optional response message) → success alert → status **ACCEPTED** after refresh → response includes **`deliveryOrderId`**
- [ ] **User S**: refresh **“My requests to Waylers”** → sees **ACCEPTED** and Wayler `responseMessage` if provided

**Converted order UI (request panels):**

- [ ] After **User W** accepts, **`deliveryOrderId`** is non-null on request API response
- [ ] **User S**: **“My requests to Waylers”** shows **“Converted to order”** badge + short **order reference**
- [ ] **User W**: **“Incoming Sender requests”** shows **“Converted to order”** badge + short **order reference**
- [ ] **PENDING** / **DECLINED** / **CANCELLED** requests (no `deliveryOrderId`) → **no** conversion badge
- [ ] Conversion notice is **not** a link — no navigation to order detail
- [ ] **Accepted** converted requests: **no** accept/decline buttons on Wayler panel

**Order source badge (accepted panels):**

- [ ] **User S**: create/publish a normal order → **User W** accepts from OPEN feed → **no** source badge on either **Accepted delivery requests** panel
- [ ] **User S** sends availability request → **User W** accepts → converted order appears in **Sender Accepted** and **Wayler Accepted** panels
- [ ] Both panels show **“From Wayler request”** badge + short **request reference** (`availabilityRequestId`)
- [ ] Badge is **not** a link — no navigation to order or request detail; use **View details** on accepted card for inspection (drawer)
- [ ] **View details** on converted accepted card opens drawer with **From Wayler request** badge + request reference + **Delivery progress** timeline
- [ ] Existing order card content (status, route, reward, proof, payment, chat, disputes) still renders correctly
- [ ] Draft, published, and OPEN feed cards unchanged (no source badge)

**Converted order chat + Accepted-panel refresh:**

- [ ] **User S** sends availability request → **User W** mock-activates daily access → **User W** accepts
- [ ] Converted order appears in **Sender Accepted** and **Wayler Accepted** panels **without manual page refresh**
- [ ] Both panels show **Open chat** on converted order row
- [ ] **User S**: **Open chat** works (`POST /conversations/order/{deliveryOrderId}`)
- [ ] **User W** with active access: **Open chat** + send message works
- [ ] **User W** without active access: **Open chat** disabled + access note; API **403** on bypass
- [ ] Chat uses **`DeliveryOrder.id`**, not `availabilityRequestId`
- [ ] No `Conversation` until first open (lazy create — not on accept)
- [ ] Normal posted-order accept → chat still works

**Converted order mock payment:**

- [ ] **Regression:** normal posted order → accept → mock authorize / hold / release still works
- [ ] **User S** sends availability request (reward + currency) → **User W** accepts → converted order in **Sender Accepted** panel
- [ ] **User S**: **Payment** panel → **Mock authorize payment** succeeds
- [ ] Network: `POST /payments/orders/{deliveryOrderId}/mock-authorize` — **`DeliveryOrder.id`**, not availability request id
- [ ] **User S**: **Mock hold escrow** → **Held in escrow**
- [ ] **User W**: click **Refresh** on **Accepted delivery requests** → read-only payment status (authorized / held / released); helper text + **Refreshing…** visible
- [ ] **User W** has **no** payment action buttons on converted order
- [ ] Posted-order payment flow unchanged (regression)

**DeliveryOrder conversion on accept** (API/DB verification):

- [ ] **User W** publishes availability/trip; **User S** sends **PENDING** request
- [ ] **User W** **mock-activates** today's daily access (if not already active)
- [ ] **User W** accepts request → request **ACCEPTED**; accept response **`deliveryOrderId`** is non-null
- [ ] Exactly **one** `DeliveryOrder` row: `sourceType = WAYLER_AVAILABILITY_REQUEST`, `availabilityRequestId = request.id`, `senderId = request.senderId`, `acceptedWaylerId = request.waylerId`, `status = ACCEPTED`
- [ ] **User W**: `GET /orders/accepted` (or Accepted panel refresh) includes the converted order
- [ ] **User S**: `GET /orders/mine` (status filter as needed) includes the converted order
- [ ] Double **accept** on same request → **409** `AVAILABILITY_REQUEST_NOT_PENDING`; **no second order**
- [ ] **User S** posted-order flow (draft → publish → Wayler accept from OPEN feed) still works unchanged

- [ ] New **PENDING** request from **User S** → **User W** **Decline request** → **User S** refresh → **DECLINED**
- [ ] **User S** creates another **PENDING** request → **Cancel request** → status **CANCELLED**
- [ ] **ACCEPTED**, **DECLINED**, and **CANCELLED** requests: **no** accept/decline/cancel buttons on either side
- [ ] **User W** cannot accept/decline own availability’s requests as Sender on same account (use separate users)
- [ ] KYC-unapproved user → request/incoming panels hidden or blocked

**Availability request notifications** (see **Notifications**):

- [ ] **User S** creates request → **User W** bell shows **`SYSTEM`** — **"New delivery request"**
- [ ] **User W** with active daily access accepts → **User S** receives exactly **one** **`ORDER_ACCEPTED`** — title **"Your delivery request was accepted"**, body mentions **delivery order was created**
- [ ] **User S** accept notification **`relatedOrderId`** equals **`DeliveryOrder.id`** (verify via API list — not `availabilityRequestId`)
- [ ] **User W** does **not** receive a notification for own accept
- [ ] **User W** declines another request → **User S** bell shows **`SYSTEM`** — **"Delivery request declined"**
- [ ] **User S** cancels **PENDING** request → **User W** bell shows **`SYSTEM`** — **"Delivery request cancelled"**
- [ ] Re-accept on same request → **409**; **no second** acceptance notification
- [ ] Double decline/cancel on non-`PENDING` → **409**; no duplicate notification
- [ ] **Regression:** posted-order accept → **User A** still receives **`ORDER_ACCEPTED`** with **`relatedOrderId`** (unchanged)
- [ ] Bell shows entries + unread count; clicking a notification does **not** navigate to an order yet
- [ ] Existing notification bell/list, mark-read, mark-all-read, and popover panel states still work

**Daily access gating (accept incoming requests)** — see **Daily Wayler work access foundation**:

- [ ] **User W** with **no active pass**: incoming requests **still visible** in **“Incoming Sender requests”**
- [ ] **PENDING** request: **Accept request** disabled + access-required note; **Decline request** still works
- [ ] `POST /wayler-availability-requests/:id/accept` without access → **403** `WAYLER_ACCESS_REQUIRED`
- [ ] **Mock activate** today's access → **Accept request** enabled → accept succeeds → **User S** sees **ACCEPTED** + accepted notification
- [ ] **Cancel access** again → another **PENDING** request: accept blocked (UI + **403** on API)

### Manual visual testing checklist (Wayler incoming requests UI)

Use **User W** (Wayler) and **User S** (Sender), both KYC-approved:

- [ ] **User S** sends request against **User W**’s published listing
- [ ] **User W**: **Wayler mode** → **“Incoming Sender requests”** below **“Your Wayler availability”**
- [ ] Initial load shows **Loading incoming requests…** + skeleton (not empty)
- [ ] With no incoming requests → friendly empty title + body
- [ ] Simulate incoming load failure → error + **Retry**; stale cards when cached
- [ ] Footer **Refresh** / **Loading…** button reloads list (unchanged)
- [ ] Card shows title, package, route, reward, status badge, created date, sender message
- [ ] **PENDING** only: response textarea + **Accept request** (disabled without active access) / **Decline request**
- [ ] After accept with `deliveryOrderId`: **“Converted to order”** badge + order reference visible; accept/decline hidden
- [ ] After decline: buttons hidden; **no** conversion badge
- [ ] **Sender cancel**, **Wayler accept/decline**, **Accepted-panel refresh/conversion**, and **order-linked notification → drawer** still work after panel-state changes
- [ ] Existing **Wayler OPEN feed**, **Accepted delivery requests**, and **availability management** still work

### Manual testing checklist (Availability request panel states)

Use two **KYC-approved** users (**W** = Wayler, **S** = Sender):

**Sender “My requests to Waylers”:**

- [ ] Open `/app` in **Sender mode** → **Browse active Waylers** panel → **My requests** section shows **Loading your requests…** + skeleton on first load (not empty)
- [ ] With no sent requests → **No requests yet** title + body (requests appear here; browse availability above)
- [ ] Send a request → card appears with **PENDING** status
- [ ] Simulate load failure (stop API) with no cached requests → error + **Retry**; dashboard stable
- [ ] With cached requests, simulate failure → error banner + **stale cards visible**; **Retry** restores
- [ ] **Cancel request** while **PENDING** still works

**Wayler “Incoming Sender requests”:**

- [ ] Open `/app` in **Wayler mode** → **Incoming Sender requests** shows loading text + skeleton on first load (not empty)
- [ ] With no incoming requests → friendly empty title + body
- [ ] **User S** sends request → incoming card appears
- [ ] Simulate load failure → error + **Retry**; stale cards when cached
- [ ] Footer **Refresh** / **Loading…** unchanged

**Cross-panel compatibility (unchanged):**

- [ ] **Sender browse Results list** loading/true-empty/filter-empty/error/retry/refresh do not break request or accepted flows
- [ ] **User W** **Accept request** (with active daily access) → creates converted `DeliveryOrder`; **Converted to order** badge on request panels
- [ ] **Wayler My listings** loading/empty/error states do not break request or accepted flows
- [ ] **Accepted delivery requests** panels refresh; **View details** drawer works
- [ ] **ORDER_ACCEPTED** notification click → focus accepted card + open drawer via **`DeliveryOrder.id`**
- [ ] **User W** **Decline request** still works without daily access
- [ ] Normal `/app` load — no crash

### Future milestones (Wayler availability & two-sided marketplace)

- **Realtime Wayler availability listing panel updates** — WebSocket/SSE push when Wayler publishes/pauses/cancels listings (today: panel load, **Refresh**, Retry, create/publish/pause/cancel success — see **Wayler availability/trips panel states**)
- **Realtime Sender browse Wayler discovery panel updates** — WebSocket/SSE push when new Wayler availability is published or listing status changes (today: Results list load, **Search**, **Refresh**, Retry — see **Sender browse Wayler availability / discovery panel states**)
- **Realtime availability-request panel updates** — WebSocket/SSE push when new requests arrive or status changes (today: load, Refresh, Retry, action callbacks only)

- **Clickable order/request detail from badges** — deep-link to dedicated order detail page/route (drawer via **View details** on accepted cards exists today)
- **Dedicated converted-order detail page/route** — unified view linking request ↔ order (drawer covers accepted-order inspection today)
- **Auto payment / escrow on accept** — create or prompt `PaymentIntent` when availability request converts to order
- **Automatic chat on accept** — open `Conversation` when request converts (may tie to daily work access rules)
- **Dedicated availability-request notification types** — replace `SYSTEM` for create/decline/cancel; accept already uses **`ORDER_ACCEPTED`**
- **Dedicated order detail page/route + bell deep link** — full route from notification (Accepted panel/card focus + drawer with **Delivery progress** timeline opens from bell click and **View details** today; no dedicated route or URL deep link to drawer yet)
- **Live carrier tracking on timeline** — real GPS/provider events (today: status-based progress only)
- **Request expiry automation** — cron/job sets `EXPIRED`; UI handling
- **Request detail page** — dedicated route using `api.waylerAvailabilityRequests.get(id)`
- **Admin moderation** for availability requests
- **Platform fee adjustment** — move from mock **10%** toward planned **~5%** commission (see **Payment and escrow foundation**)
- **Matching Sender requests to Wayler trips** — recommend orders that fit a published route or local availability window
- **Map-based availability visualization** — routes and local coverage on Wayler/Sender maps (geocoding integration)
- **Active count widgets on landing/dashboard** — e.g. “20 couriers active today in this city” on marketing home or dashboard hero
- **Location filters for Wayler order feed** — unified country/city/region selectors shared with availability discovery
- **Edit availability form** — update DRAFT/PAUSED listings without cancel-and-recreate
- **Availability notifications** — publish, pause, expiry, and match alerts via in-app bell (and later push/email)

## Daily Wayler work access foundation

Wayly stakeholders require that **Waylers can browse the marketplace** (OPEN order feed, filters, maps), **view incoming Sender availability requests**, and **decline** those requests without a pass, but **cannot accept posted orders, accept incoming Sender requests, contact/chat with Senders, or send messages** until they have **active daily work access** — e.g. **€1 for today’s access**. This is **separate from platform commission** on completed deliveries (stakeholder direction: move from mock **10%** toward **~5%**) and **separate from KYC verification** — a Wayler must pass **both** checks for paid work actions: **approved KYC** (see **M2 KYC mock testing** → **KYC marketplace access gate UI**) **and** active daily access when required. The current implementation includes **database schema**, **shared types**, **`WaylerAccessModule` API + SDK**, **Wayler access panel UI** on `/app` (Wayler mode), **mock/manual activation**, **backend + frontend enforcement** of accept (orders + incoming availability requests) / contact / message gating, and **in-app notifications on activate/cancel** — part of the **monetization / paywall foundation**. **No Stripe, real paid subscription, admin pricing controls, scheduled expiry notifications, or Stripe payment-confirmation notifications yet.**

### Purpose

- Support the **stakeholder monetization rule**: browse freely and review/decline incoming Sender requests; **accept jobs** (posted orders or incoming availability requests), contact, and chat only with an active daily pass.
- Model **one access pass per Wayler per calendar day** (`accessDate` normalized to day-start).
- **Enforce paywall today** via mock/manual activation (local/business testing); **Stripe checkout** will replace/confirm the access purchase in production.
- Keep daily access **independent** of per-order escrow (`PaymentIntent`) and platform fee ledger lines.

### Enforced today (accept / contact / message)

| Action                                              | Wayler without active pass       | Sender                  |
| --------------------------------------------------- | -------------------------------- | ----------------------- |
| Browse OPEN order feed                              | **Allowed**                      | N/A (Sender mode)       |
| View accepted orders                                | **Allowed**                      | Allowed                 |
| List/view incoming Sender availability requests     | **Allowed**                      | N/A                     |
| Decline incoming Sender availability request        | **Allowed**                      | N/A                     |
| `POST /orders/:id/accept`                           | **403** `WAYLER_ACCESS_REQUIRED` | N/A                     |
| `POST /wayler-availability-requests/:id/accept`     | **403** `WAYLER_ACCESS_REQUIRED` | N/A                     |
| `POST /conversations/order/:orderId` (open/contact) | **403** `WAYLER_ACCESS_REQUIRED` | **Allowed**             |
| `POST /conversations/:id/messages` (send as Wayler) | **403** `WAYLER_ACCESS_REQUIRED` | **Allowed** (as Sender) |
| Read conversation / list / mark read                | **Allowed**                      | **Allowed**             |
| Sender availability-request create / cancel         | N/A                              | **Allowed** (KYC)       |

**Active pass criteria:** `waylerId = current user`, `status = ACTIVE`, `startsAt <= now`, `expiresAt > now`, today's `accessDate` (UTC day start).

Frontend (Wayler mode): posted-order accept button, **incoming Accept request** button, **Open chat**, and message send disabled with translated access notes; `WaylerAccessPanel` `onAccessChanged` refreshes gating state immediately after mock activate/cancel.

### Schema

**Enums** (mirror `@wayly/types`):

| Enum                       | Values                                                            |
| -------------------------- | ----------------------------------------------------------------- |
| `WaylerAccessPassStatus`   | `PENDING`, `ACTIVE`, `EXPIRED`, `CANCELLED`, `REFUNDED`, `FAILED` |
| `WaylerAccessPassProvider` | `MANUAL`, `STRIPE`, `OTHER`                                       |

**`WaylerAccessPass`** (`wayler_access_passes`) — daily work access fee record

| Field group       | Fields                                                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Identity**      | `id`, `waylerId` → `User` (cascade delete)                                                                                               |
| **Payment**       | `status` (default `PENDING`), `provider` (default `MANUAL`), `currency` (default `EUR`), `amount` (default `1.00`), `providerPaymentId?` |
| **Access window** | `accessDate` (normalized calendar day), `startsAt`, `expiresAt`                                                                          |
| **Lifecycle**     | `activatedAt?`, `cancelledAt?`, `refundedAt?`, `failedAt?`                                                                               |
| **Audit**         | `createdAt`, `updatedAt`                                                                                                                 |

**Uniqueness:** `@@unique([waylerId, accessDate])` — at most one pass per Wayler per normalized `accessDate`.

**Indexes:** `waylerId`, `status`, `provider`, `accessDate`, `startsAt`, `expiresAt`, `createdAt`.

**Relations:**

- `User` — `waylerAccessPasses` (`@relation("WaylerAccessPasses")`)

**Shared types** (`@wayly/types`):

| Type                           | Description                                           |
| ------------------------------ | ----------------------------------------------------- |
| `WaylerAccessPassSummary`      | Full pass payload for lists and detail                |
| `WaylerAccessPassListResponse` | Paginated list — `items`, `page`, `limit`, `total`    |
| `WaylerAccessState`            | `hasActiveAccess`, `activePass`, `checkedAt` (gating) |

Dates serialize as `ISODateString`; `amount` as `DecimalString`.

Migration: `apps/api/prisma/migrations/20260602150000_wayler_access_pass_foundation/migration.sql`

### Current access flow (API + SDK)

```text
Wayler (KYC-approved) checks today's access state
        ↓
GET /wayler-access/today → WaylerAccessState (hasActiveAccess, activePass, checkedAt)
        ↓
If inactive → POST /wayler-access/mock-activate-today (MANUAL, EUR 1.00, no real payment)
        ↓
Pass becomes ACTIVE → SYSTEM notification to Wayler ("Wayler work access active")
        ↓
GET /wayler-access/today → hasActiveAccess true → accept OPEN orders / accept incoming Sender requests / open chat / send enabled (Wayler)
        ↓
GET /wayler-access/mine → access history (paginated)
        ↓
POST /wayler-access/:id/cancel → CANCELLED (owner, ACTIVE/PENDING, non-expired)
        ↓
If was ACTIVE → SYSTEM notification to Wayler ("Wayler work access cancelled")
        ↓
GET /wayler-access/today → inactive again → accept / contact / send blocked again
```

Repeated `mock-activate-today` returns the **existing active pass** — no duplicate row and **no duplicate activation notification** (unique `[waylerId, accessDate]`). **Mock/manual only** — future **Stripe checkout** will create/confirm the same `WaylerAccessPass` record after real payment (Stripe confirmation notification is future).

### Current UI flow (`/app`, Wayler mode)

Component: `apps/web/src/components/app/wayler-access-panel.tsx` — wired in `apps/web/src/app/(app)/app/page.tsx`.

```text
Wayler switches to Wayler mode on /app
        ↓
“Today’s Wayler work access” panel loads (top of Wayler stack)
        ↓
If KYC-unapproved → KYC required notice only (no access API calls)
        ↓
If KYC-approved → api.waylerAccess.today() + api.waylerAccess.mine({ limit: 10 })
        ↓
If inactive → inactive note + “Mock activate today’s access (€1)” button
        ↓
Click mock activate → ACTIVE pass (EUR 1.00 / MANUAL) → success alert → refresh → order accept + incoming request accept + chat enabled
        ↓
If active → Active badge, active until (expiresAt), amount/currency, provider, active note
        ↓
“Cancel access” when activePass.status === ACTIVE → inactive again → order accept / incoming accept / chat/send disabled
        ↓
Recent access history list (status, provider, amount, dates, activatedAt, cancelledAt)
```

`onAccessChanged` callback updates `waylerHasActiveAccess` on `/app` so posted-order accept, **incoming Accept request**, and chat UI react without full page reload.

i18n: `app.waylerAccess.*`, `app.waylerFeed.accessRequired*` (posted order accept), `app.availabilityRequests.accessRequired*` (incoming request accept), and `app.chat.accessRequired*` (contact/message) — 8 locales each.

### UI placement

| Item      | Detail                                                                                       |
| --------- | -------------------------------------------------------------------------------------------- |
| **Route** | `/app`                                                                                       |
| **Mode**  | Wayler only (not shown in Sender mode)                                                       |
| **Panel** | **“Today’s Wayler work access”** card                                                        |
| **Order** | Near top of Wayler stack — **before** OPEN order feed, accepted jobs, and availability panel |

### SDK methods used by UI

| Method                                   | Usage in panel                              |
| ---------------------------------------- | ------------------------------------------- |
| `api.waylerAccess.today()`               | Load current active/inactive state on mount |
| `api.waylerAccess.mine({ limit: 10 })`   | Recent access history list                  |
| `api.waylerAccess.mockActivateToday()`   | Mock activate button (inactive state)       |
| `api.waylerAccess.cancel(activePass.id)` | Cancel access button (active state)         |

All calls gated behind KYC approval in the panel (same pattern as Wayler availability).

### Product flow (browse vs work)

```text
Wayler opens /app in Wayler mode
        ↓
System checks today's WaylerAccessPass (status ACTIVE, now between startsAt and expiresAt)
        ↓
Always: browse OPEN feed / filters / maps; view accepted orders; list/view incoming Sender requests; decline incoming requests; read conversations
        ↓
If ACTIVE → accept OPEN orders, accept incoming Sender requests, open chat, send messages as Wayler
        ↓
If not ACTIVE → accept (orders + incoming requests) / Open chat / send disabled (403 on API if bypassed)
        ↓
Wayler activates today's access via panel (mock/manual today; Stripe checkout later)
        ↓
Pass activated → status ACTIVE, activatedAt set → work actions enabled
        ↓
Access expires at end of configured window (e.g. end of calendar day) or user cancels
```

Example product rule: **€1/day** default (`currency=EUR`, `amount=1.00`) — admin-configurable pricing is a future batch.

### API routes (`/api/v1/wayler-access`, Swagger tag **wayler-access**)

| Method | Route                                | Action                                              |
| ------ | ------------------------------------ | --------------------------------------------------- |
| `GET`  | `/wayler-access/today`               | Current user's `WaylerAccessState` for today        |
| `GET`  | `/wayler-access/mine`                | Paginated list of user's passes                     |
| `POST` | `/wayler-access/mock-activate-today` | Mock/manual activate today's pass (no real payment) |
| `POST` | `/wayler-access/:id/cancel`          | Cancel own ACTIVE/PENDING non-expired pass          |

All routes require **JWT + KYC approval** (`VerificationGuard` + `requireKycApproved`).

### SDK (`api.waylerAccess`)

| Method                             | Usage                                     |
| ---------------------------------- | ----------------------------------------- |
| `waylerAccess.today()`             | Get current `WaylerAccessState` for today |
| `waylerAccess.mine(query?)`        | List user's access passes (paginated)     |
| `waylerAccess.mockActivateToday()` | Mock/manual activate today's pass         |
| `waylerAccess.cancel(id)`          | Cancel own access pass                    |

Validation: `@wayly/validation` — `waylerAccessPassesListQuerySchema` (`page`, `limit`, optional `status`).

### Business / access rules

| Rule                                  | Behavior                                                                                            |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Auth**                              | JWT + KYC required on all routes (`403` `KYC_REQUIRED` when unapproved)                             |
| **Today normalization**               | `accessDate` = UTC day start; `expiresAt` = next UTC day start on mock activate                     |
| **Active pass**                       | `status=ACTIVE`, `startsAt <= now`, `expiresAt > now`, matches today's `accessDate`                 |
| **mockActivateToday**                 | `provider=MANUAL`, `currency=EUR`, `amount=1.00`; upsert on `[waylerId, accessDate]`                |
| **Idempotent activate**               | If valid ACTIVE pass exists for today → return existing; no duplicate row                           |
| **Cancel**                            | Owner only; status must be `ACTIVE` or `PENDING`; pass must not be expired                          |
| **No real payment**                   | Mock/manual only — no Stripe, checkout, webhooks, or money movement in this batch                   |
| **Accept gating (orders)**            | `OrdersService.accept` + Wayler OPEN feed accept button require active pass                         |
| **Accept gating (incoming requests)** | `WaylerAvailabilityRequestsService.accept` + incoming **Accept request** button require active pass |
| **Contact gating**                    | `ConversationsService.forOrder` when user is accepted Wayler                                        |
| **Message gating**                    | `ConversationsService.sendMessage` when user is conversation Wayler                                 |
| **Read not gated**                    | List/detail/markRead conversations unchanged for Waylers without active pass                        |
| **Sender unaffected**                 | Sender accept N/A; Sender chat open/send never blocked by Wayler access                             |
| **Activate notification**             | `SYSTEM` to Wayler after successful mock activate (not on idempotent re-activate)                   |
| **Cancel notification**               | `SYSTEM` to Wayler only when **ACTIVE → CANCELLED** (not for PENDING cancel)                        |

### Access notification behavior

When `POST /wayler-access/mock-activate-today` creates or re-activates a pass to **ACTIVE** (not when returning an already-active pass):

| Field         | Value                                          |
| ------------- | ---------------------------------------------- |
| **type**      | `SYSTEM`                                       |
| **title**     | `Wayler work access active`                    |
| **body**      | `Your Wayler work access is active for today.` |
| **recipient** | Current Wayler (`user.id`)                     |

When `POST /wayler-access/:id/cancel` succeeds and the pass was **ACTIVE**:

| Field         | Value                                              |
| ------------- | -------------------------------------------------- |
| **type**      | `SYSTEM`                                           |
| **title**     | `Wayler work access cancelled`                     |
| **body**      | `Your Wayler work access for today was cancelled.` |
| **recipient** | Current Wayler (`user.id`)                         |

Notifications use `NotificationsService.createForUser` (same as mock payment/chat/dispute dispatch). Failures are logged and do **not** block activate/cancel. The existing **notification bell** on `/app` displays title + body — **no frontend changes required**.

**Duplicate prevention:** idempotent `mock-activate-today` (already active) skips notification; repeat `cancel` on **CANCELLED** returns **409** before notification.

**Not implemented:** scheduled expiry alerts, Stripe payment confirmation, admin-configured templates, dedicated `WAYLER_ACCESS` notification type (see **Notifications**).

### Current scope

| Included                                                                                                                                                          | Not included (yet)                       |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Prisma enums + `WaylerAccessPass` model + migration                                                                                                               | Stripe checkout / webhooks               |
| `User.waylerAccessPasses` relation                                                                                                                                | Real money movement                      |
| `@wayly/types` summaries + list/state types                                                                                                                       | Real paid subscription                   |
| `WaylerAccessModule` API + Swagger                                                                                                                                | Admin pricing configuration              |
| SDK `api.waylerAccess.*`                                                                                                                                          | Configurable daily price UI              |
| Mock/manual activate + today state + list + cancel                                                                                                                | Access history detail page               |
| **Wayler access panel UI** — active/inactive, mock activate, cancel, history                                                                                      | Refund workflow beyond cancel            |
| **Accept gating** — posted orders + incoming Sender requests (API + Wayler accept buttons)                                                                        | Scheduled expiry notification            |
| **Contact/chat gating** — API + Wayler Open chat button                                                                                                           | Stripe payment confirmation notification |
| **Message gating** — API + chat modal send/input + **accepted order chat modal panel states** (Sending…, duplicate-send prevention, send-failure preserves draft) | Realtime chat delivery (WebSocket/SSE)   |
| **Activate/cancel in-app notifications** — `SYSTEM` to Wayler on state change (idempotent-safe)                                                                   |                                          |
| Unique one pass per Wayler per `accessDate`                                                                                                                       |                                          |
| KYC-gated access (API + UI)                                                                                                                                       |                                          |
| i18n `app.waylerAccess.*`, `app.waylerFeed.accessRequired*`, `app.availabilityRequests.accessRequired*`, `app.chat.accessRequired*` (8 locales)                   |                                          |

### Current limitations

- **No real Stripe/checkout** — panel uses mock/manual activate only; `STRIPE` provider reserved for later
- **No real money movement** — no payment capture, webhooks, or provider payment IDs in normal flow
- **No scheduled expiry notification** — pass expiry at end of day does not auto-alert the Wayler
- **No Stripe payment-confirmation notification** — mock activate only; webhook-driven alerts are future
- **No admin-configured notification templates** — activate/cancel stored as plain English `SYSTEM` messages
- **No admin pricing controls** — hard-coded EUR 1.00 default; no per-market configuration
- **No configurable pricing UI** — daily price not editable in admin or Wayler settings
- **Read paths not gated** — Waylers without access can still list/read conversations (send/contact blocked only)

### Manual verification (schema foundation)

- [ ] Migration applied (`wayler_access_pass_foundation`)
- [ ] Prisma client generated (`pnpm --filter @wayly/api db:generate`)
- [ ] `pnpm build`, `pnpm lint`, `pnpm typecheck` pass

### Manual API testing checklist

Use a **KYC-approved Wayler** and Swagger or SDK:

- [ ] `GET /wayler-access/today` → `hasActiveAccess: false`, `activePass: null`
- [ ] `POST /wayler-access/mock-activate-today` → `ACTIVE` pass, `provider: MANUAL`, `amount: 1.00`, `currency: EUR`
- [ ] `GET /wayler-access/today` → `hasActiveAccess: true`, `activePass` populated
- [ ] Repeat `POST /wayler-access/mock-activate-today` → same pass returned, no duplicate notification
- [ ] `GET /wayler-access/mine` → pass appears in list
- [ ] `POST /wayler-access/:id/cancel` → status `CANCELLED`; `GET /notifications` includes cancellation alert for Wayler
- [ ] Repeat cancel on same pass → **409**; no second cancellation notification
- [ ] `GET /wayler-access/today` → `hasActiveAccess: false` after cancel
- [ ] KYC-unapproved user on any route → **403** `KYC_REQUIRED`

### Manual visual testing checklist (Wayler access panel UI)

Use a **KYC-approved Wayler** on `/app` (Wayler mode):

- [ ] Login as KYC-approved Wayler → switch to **Wayler mode**
- [ ] **“Today’s Wayler work access”** panel loads near top of Wayler stack (before order feed)
- [ ] No pass → **Inactive** state + mock activate button visible
- [ ] Click **mock activate** → **Active** with EUR 1.00 / MANUAL; success message shown; bell shows activation notification
- [ ] Click **mock activate** again while active → **no second** activation notification
- [ ] Refresh page → **Active** state persists
- [ ] **Recent access history** lists the pass (status, provider, amount, dates)
- [ ] Click **Cancel access** → **Inactive** again; history shows `CANCELLED`; bell shows cancellation notification
- [ ] Without active pass: OPEN feed still visible; **Accept** and **Open chat** disabled + notes
- [ ] Mock activate → **Accept** and **Open chat** enabled; Wayler can send chat message
- [ ] Cancel access again → send disabled in open chat modal; accept/chat blocked
- [ ] **Sender mode** chat open/send still works (not blocked by Wayler access)
- [ ] KYC-unapproved user → KYC required notice only; no access API calls from panel

### Manual testing checklist (access gating — Wayler)

Use a **KYC-approved Wayler** (`demo.wayler@wayly.app` if seeded) and a **KYC-approved Sender** with an OPEN then ACCEPTED order:

- [ ] Wayler mode, **no active pass**: browse OPEN orders ✓; posted-order accept blocked (UI + **403** `WAYLER_ACCESS_REQUIRED`)
- [ ] Wayler mode, **no active pass**: **Incoming Sender requests** visible; **Accept request** disabled + note; **Decline** works; `POST /wayler-availability-requests/:id/accept` → **403**
- [ ] Wayler mode, **no active pass**: on accepted order, **Open chat** disabled; `POST /conversations/order/:orderId` → **403**
- [ ] Wayler mode, **no active pass**: `POST /conversations/:id/messages` → **403** (if conversation exists from prior session)
- [ ] **Mock activate** today's access → posted-order accept, incoming request accept, open chat, and send message succeed
- [ ] **Cancel access** → posted-order accept, incoming accept, chat/send blocked again; read conversation + incoming list still work
- [ ] **Sender mode**: open chat and send messages without Wayler access check

### Future milestones (daily Wayler work access)

- **Stripe checkout for real daily access** — `WaylerAccessPassProvider.STRIPE`, webhooks confirm activation + payment-confirmation notification
- **Scheduled access expiry notification** — alert Wayler when daily pass expires (end of access window)
- **Dedicated `WAYLER_ACCESS` notification type** — replace `SYSTEM` for access dispatch (optional schema link to pass id)
- **Localized access notification templates** — server-side title/body per user locale
- **Access history detail page** — full paginated pass history beyond panel preview
- **Refund / cancellation handling** — `REFUNDED` lifecycle beyond simple cancel
- **Admin pricing controls** — support visibility and per-market price configuration
- **Configurable daily price** — e.g. €1/day default, per-market overrides in admin UI
- **Real paid subscription / auto-renew** — recurring daily access product (future)
- **Platform fee adjustment** — move from mock **10%** toward planned **~5%** (see **Payment and escrow foundation**)

## Premium dashboard UI foundation

The authenticated **`/app` dashboard** has a **premium visual foundation** so the product feels like a real commercial global P2P delivery marketplace — not a prototype wireframe. The pass improves **visual hierarchy**, **readability**, **mobile layout**, and **user confidence** while keeping all **business logic unchanged**.

### Purpose

- Make `/app` feel like a serious, modern delivery product users can trust.
- Strengthen section hierarchy, card separation, and status clarity across Sender and Wayler modes.
- Improve mobile spacing and prevent horizontal overflow on narrow viewports.
- **No changes** to data loading, API calls, KYC gates, chat, notifications, maps, or form validation.

### Current UI improvements

| Area               | What shipped                                                                                                                                                                       |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **App shell**      | Premium background — subtle radial gradients + faint dot grid (`wayly-app-shell`)                                                                                                  |
| **Header**         | Glass-style header with backdrop blur; wrapping language, notification bell, and sign-out actions                                                                                  |
| **Panels / cards** | Consistent glass-style panels on Sender/Wayler, KYC, Account, and order sections (`wayly-app-panel`)                                                                               |
| **Order cards**    | Unified order list cards across feed, drafts, published, and accepted panels (`wayly-order-card`); **source badge** on accepted rows when `sourceType=WAYLER_AVAILABILITY_REQUEST` |
| **Status badges**  | Color-coded pills for **DRAFT**, **OPEN**, **ACCEPTED**, **IN_TRANSIT**, **DELIVERED**, **CANCELLED**                                                                              |
| **Alerts**         | Standardized success / danger / info alert styles for errors, KYC notices, and success messages                                                                                    |
| **KYC gate**       | Shared **KYC marketplace access gate** notices on marketplace panels (`kyc-marketplace-gate.tsx`) — loading/error/missing/pending/rejected; separate from daily access             |
| **Actions**        | Consistent action button grouping (`wayly-action-group`) — primary, secondary, outline/danger patterns                                                                             |
| **Mobile**         | Tighter responsive spacing, `min-w-0` / `truncate` / `flex-wrap`, `overflow-x: clip` on shell                                                                                      |

Implementation: `apps/web/src/app/(app)/app/page.tsx` + utility classes in `apps/web/src/app/globals.css`.

### Scope note

- **Frontend visual polish only** — CSS/className and presentational structure on `/app`.
- **No API, SDK, Prisma, backend, or business logic changes** in this batch.
- Not a full design system or landing-page redesign — a focused dashboard foundation pass.

### Manual visual checklist

- [ ] `/app` loads normally after sign-in
- [ ] **Sender mode** — create draft, drafts/published/accepted panels, **Browse active Waylers** panel render with new cards and badges
- [ ] **Wayler mode** — **Today’s Wayler work access** panel, OPEN feed, accepted panel, **Your Wayler availability** panel, **Incoming Sender requests** panel, maps, and filters render correctly
- [ ] **Notification bell** opens and dropdown works
- [ ] **Chat modal** opens from Accepted panels; loading/empty/error/retry/refresh/sending states work (see **Accepted order chat modal panel states**)
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

## Combined manual testing checklist (recent UI polish)

Use after `pnpm build`, `pnpm lint`, and `pnpm typecheck` pass. **Frontend UI-state batches** unless noted — **backend contracts unchanged**; **nothing pushed/deployed**; local dev only.

**Payment (Sender + Wayler Accepted cards):**

- [ ] **Loading payment…** / **Refreshing payment…** / **Retry payment status** on per-card load failure
- [ ] Sender **Authorizing…**, **Capturing…**, **Releasing…**, **Processing…** during mock actions
- [ ] **Duplicate payment action clicks blocked** while in-flight
- [ ] Wayler payment view **read-only** (no action buttons)
- [ ] Converted order mock payment uses **`DeliveryOrder.id`**

**Proof (Wayler + Sender Accepted cards):**

- [ ] **Loading proof…** / **Refreshing proof…** / **Retry proof status**
- [ ] Empty states for no proof yet / missing delivered proof
- [ ] Wayler **submit failure preserves draft**; duplicate submit blocked
- [ ] Per-card **Start transit** / **Mark delivered** / **Submit proof** errors isolated per card
- [ ] **Stale proof** preserved on transient errors

**Dispute (Accepted cards + modal):**

- [ ] Dispute list **loading/refreshing** on panel refresh
- [ ] **No dispute** empty/helper on eligible orders
- [ ] **Submit dispute** processing label; duplicate submit blocked; **submit failure preserves draft**
- [ ] Existing dispute shows **status / reason / opened date**; view modal works

**Accepted Order Details drawer:**

- [ ] **Loading skeleton** + loading banner on initial fetch; row summary + timeline stay visible
- [ ] **Refreshing…** with stale detail visible on re-fetch
- [ ] Load failure + **Retry**; **missing full details** empty handling
- [ ] **Copy reference** copies **`DeliveryOrder.id` only**; **Copied** feedback
- [ ] Notification click → focus accepted card + **open same drawer**

**KYC marketplace access gate:**

- [ ] **Loading** — no wrong approved/blocked message before load finishes
- [ ] **Load failure** + Retry on KYC panel and gated marketplace panels
- [ ] **Missing / pending / rejected** gates with friendly copy; actions disabled safely
- [ ] **Approved KYC** — no extra friction; demo accounts work
- [ ] **Wayler daily access** still required separately for accept/chat when KYC approved

**App dashboard shell:**

- [ ] **`/app` loading shell** during profile/mode/KYC bootstrap (not blank)
- [ ] **Profile/bootstrap error** + Retry + Return to login
- [ ] **No wrong role flash** before `modeReady`

**KYC identity panel:**

- [ ] **Missing / pending / rejected / approved** phase notices render correctly
- [ ] **Country validation** (required + invalid ISO)
- [ ] **Submit success** refreshes KYC status; **submit failure preserves draft**

**Production-safety demo tools gate:**

- [ ] **`pnpm dev`** — demo/mock controls visible where expected
- [ ] **Production build (default)** — KYC mock, Wayler mock activate, Sender mock payment buttons **hidden**
- [ ] **`NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true`** — demo tools visible on production-like build

**Regression / stability:**

- [ ] Payment / proof / dispute / chat / drawer / notification flows still work end-to-end
- [ ] `/app` loads normally
- [ ] `pnpm build`, `pnpm lint`, `pnpm typecheck` pass (Turbo serial build/lint on Windows)

## Common scripts

| Command                          | Description                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------------- |
| `pnpm dev`                       | Run all apps in dev mode (Turbo).                                                             |
| `pnpm build`                     | Build all workspaces (**Turbo `--concurrency=1`** — serial; stabilizes Windows local builds). |
| `pnpm lint`                      | Lint all workspaces (**Turbo `--concurrency=1`** — serial; stabilizes Windows local lint).    |
| `pnpm typecheck`                 | Type-check all workspaces (unchanged Turbo concurrency).                                      |
| `pnpm test`                      | Run tests across workspaces.                                                                  |
| `pnpm format`                    | Format the repo with Prettier.                                                                |
| `pnpm docker:up` / `docker:down` | Start/stop local Postgres + Redis.                                                            |

## Conventions

- **Commits:** Conventional Commits (enforced by commitlint), e.g. `feat(api): add health module`.
- **Line endings:** LF everywhere (`.gitattributes`), enforced for cross-platform consistency.
- **Versions:** shared dependency versions live in the pnpm **catalog** (`pnpm-workspace.yaml`).

## Milestone roadmap

- **M0 — Foundation:** monorepo, tooling, shared config, design tokens, Docker Compose; **repo stability** — root `pnpm build` / `pnpm lint` use Turbo **`--concurrency=1`** for reliable Windows local builds (product behavior unchanged). ✅
- **M1 — Auth & Users:** JWT auth, refresh sessions (httpOnly cookie), users profile, SDK + frontend auth, password toggle, basic i18n. ✅ (foundation complete; polish ongoing)
- **M2 — KYC gate (mocked):** schema + mock backend, SDK, `/app` status panel, dev-only mock approve/reject, **KYC marketplace access gate UI** on marketplace panels (`kyc-marketplace-gate.tsx`). ✅ (mock flow + marketplace gate UI complete; real Sumsub/provider swap later)
- **M3 — Design system & app shell:** Sender/Wayler mode switcher on `/app` (frontend-only, localStorage). ✅
- **M4 — Marketplace (Sender → Wayler):** `DeliveryOrder` schema, draft/create/publish/**cancel**, **Sender Published Orders panel states** (loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale cards on error when cached; shared `panel-status-states.tsx`), Wayler OPEN feed (filters, sort, Leaflet map previews), **Wayler open orders feed panel states** (loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale cards on error when cached; shared `panel-status-states.tsx`), accept, **ACCEPTED → IN_TRANSIT → DELIVERED** progression, **metadata proof-of-delivery** (submit + read-only Sender view) + **proof panel states on Accepted cards** (loading/refreshing/error/retry/empty/submit-failure/stale proof), Wayler accepted panel controls, Sender lifecycle visibility + cancel UI, private `GET /orders/mine`, **Accepted delivery requests panel states** (Sender + Wayler — loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…), **in-app notifications** (schema, API, SDK, order lifecycle dispatch, **chat message dispatch** via `SYSTEM`, bell/dropdown, **notification bell / popover panel states** (loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale notification cards on error when cached; mark-read loading/disabled; shared `panel-status-states.tsx`), polling, **order-linked notification click navigation** — mark read, close bell, focus Accepted panel, scroll/highlight, open drawer via **`DeliveryOrder.id`**), **Accepted Order Details drawer** (View details on Sender/Wayler accepted cards — frontend-only; existing `GET /orders/:id`; **Delivery progress timeline**; **loading skeleton / refreshing+stale detail / error+Retry / missing-detail empty**; **Copy reference** + **Copied** feedback for **`DeliveryOrder.id`**; no route), **KYC marketplace access gate UI** (`kyc-marketplace-gate.tsx` — loading/error+Retry/missing/pending/rejected + action hints; daily access separate), **order-based chat** (schema, API, SDK, Sender/Wayler Accepted panel UI, modal on `/app`, **10s chat modal polling**, **accepted order chat modal panel states** (loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale messages on error when cached; Sending… + duplicate-send prevention; send-failure banner preserves draft; shared `panel-status-states.tsx`)), **premium `/app` dashboard UI foundation** (shell, cards, badges, alerts). ✅ (core loop + cancellation + lifecycle + metadata proof + proof panel states + published-panel loading/empty/error/retry + open-feed loading/empty/error/retry + accepted-panel loading/empty/error/retry + notifications + notification-bell panel states + order-linked bell click + accepted-order details drawer polish + delivery progress timeline + drawer loading/refreshing/error/retry/missing-detail + drawer Copy reference + Copied feedback + KYC marketplace gate + chat + chat in-app alerts + chat polling + **accepted-order chat modal panel states** + dashboard visual foundation complete; photo/signature proof, WebSocket/SSE/push/email, **realtime published-order panel**, **realtime open-order feed**, **realtime notification bell delivery**, **realtime chat delivery**, `CHAT_MESSAGE` type, payment processing/disputes later)
- **M5 — Payments & escrow:** **payment/escrow schema** (`PaymentIntent`, `Payout`, `LedgerEntry`, enums), shared types, **mock/manual payment API + SDK** (`MANUAL` provider — authorize, hold escrow, release, read by order), **Sender Accepted mock payment UI** (authorize / hold / release, proof-gated release; auto-refresh after actions), **Accepted payment panel states** (per-card Loading/Refreshing payment…, Retry, Sender Authorizing…/Capturing…/Releasing…/Processing… labels, duplicate action blocked; Wayler read-only unchanged), **Wayler Accepted read-only payment/payout visibility** (status + amounts, no action buttons), **Wayler Accepted payment refresh helper** (panel **Refresh** reloads orders + per-order payment via `loadAcceptedOrders()`; hint `payment.refreshHint`; button **Refreshing…** while loading), **mock payment in-app notifications** (Wayler dispatch on authorize/hold/release via `SYSTEM` + `relatedOrderId`; no Sender self-notify; idempotent-safe). ✅ (schema + mock API + two-sided UI + per-card payment panel states + Wayler refresh polish + Wayler notifications complete; no Stripe/real money/realtime payment panel). Next: realtime payment status in Accepted panel, dedicated payment notification types, real Wayler payout dashboard, Stripe checkout, Connect/payout processing, webhooks, refunds.
- **M6 — Disputes & arbitration:** **dispute schema** (`Dispute`, `DisputeMessage`, `DisputeEvidence`, enums), shared types, **`DisputesModule` API + SDK** (open, list, detail, messages, evidence metadata), **Sender/Wayler Accepted dispute UI** on `/app` (`DisputePanel` modal — open/view, reason + description, messages, evidence metadata, duplicate-active handling; i18n 8 locales), **dispute panel states on Accepted cards** (loading/refreshing, no-dispute empty, submit processing, duplicate submit blocked, submit failure preserves draft, existing dispute summary), **dispute in-app notifications** (other-participant dispatch on open/message/evidence via `SYSTEM` + `relatedOrderId`; no self-notify; failure-safe). ✅ (schema + API + SDK + two-sided UI + dispute panel states + in-app notifications complete; no admin, resolution, dedicated notification types, payment hooks, file upload). Next: dedicated dispute notification types, admin/arbitrator dashboard, assign arbitrator, resolve dispute, payment hold/refund/release integration, file/photo upload, dispute timeline, arbitration notes, audit logs, push/email.
- **M7 — Wayler availability & two-sided discovery:** **`WaylerAvailability` + `WaylerAvailabilityRequest` schemas**, migrations `wayler_availability_foundation` + `add_wayler_availability_requests` + `add_delivery_order_source_for_availability_requests`, **`WaylerAvailabilitiesModule` + `WaylerAvailabilityRequestsModule` API + SDK**, **Wayler management UI** + **Wayler availability/trips panel states** (My listings — loading skeleton, friendly empty, error + Retry, Refresh/Refreshing…; stale listing cards on error when cached; shared `panel-status-states.tsx`), **Sender browse + request UI** (“Request this Wayler”, “My requests to Waylers”, cancel) + **Sender browse Wayler availability / discovery panel states** (Results list — loading skeleton, true empty vs filter-empty, error + Retry, Refresh/Refreshing…; stale listing cards on error when cached; shared `panel-status-states.tsx`), **Wayler incoming accept/decline UI**, **availability-request panel states** (Sender **My requests** + Wayler **Incoming Sender requests** — loading/empty/error/retry/refresh; shared `panel-status-states.tsx`), **availability-request in-app notifications** (`SYSTEM` on create/decline/cancel; **`ORDER_ACCEPTED`** + **`relatedOrderId`** = **`DeliveryOrder.id`** on accept), **DeliveryOrder conversion on accept** (transactional — `ACCEPTED` order, `sourceType=WAYLER_AVAILABILITY_REQUEST`, `availabilityRequestId`, `deliveryOrderId` in response), **converted-order UI on request panels** (“Converted to order” badge + short order reference; i18n `convertedToOrder` / `linkedOrder` / `orderReference`), **order source badge on Accepted panels** (“From Wayler request” + short request reference; i18n `fromWaylerRequest` / `requestReference`; `delivery-order-source-badge.tsx`), **Accepted-panel auto-refresh after request accept** (`onRequestAccepted` / `onAcceptedOrdersRefresh`), **Accepted delivery requests panel states** (loading/empty/error/retry on converted + posted accepted lists), **converted-order chat** (existing `DeliveryOrder.id` flow — lazy conversation create; Wayler daily-access gate unchanged; **accepted order chat modal panel states**), **converted-order mock payment** (existing `DeliveryOrder.id` flow — authorize/hold/release; no `sourceType` filter; verified compatible — no code changes), **order-linked notification click** for accept notifications (`ORDER_ACCEPTED` + `relatedOrderId` = `DeliveryOrder.id` → Accepted panel focus/highlight + open drawer), **Accepted Order Details drawer** (View details + **Delivery progress timeline** + **loading/error/retry** + **Copy reference** on converted + posted accepted cards). ✅ (schema + API + SDK + two-sided discovery + Wayler My listings panel states + Sender browse discovery Results list panel states + request flow + request-panel states + notifications + order conversion + request-panel + accepted-panel source UI + accepted-panel states + refresh + chat + **accepted-order chat modal panel states** + payment + bell click + details drawer + timeline + drawer reliability + Copy reference polish complete). Next: dedicated order detail page/route from bell/badges, public share link, dedicated notification types for create/decline/cancel, auto payment/chat on convert, expiry automation, request detail page, admin moderation, matching, map visualization, availability listing notifications, live carrier tracking on timeline, **realtime Wayler availability listing + Sender browse discovery + availability-request + accepted-order panel + chat delivery updates**, Stripe/real payment, production deployment.
- **M8 — Daily Wayler work access:** **`WaylerAccessPass` schema** (`WaylerAccessPassStatus`, `WaylerAccessPassProvider` enums), `User.waylerAccessPasses`, shared types, migration `wayler_access_pass_foundation`, **`WaylerAccessModule` API + SDK** (`api.waylerAccess.*` — today, mine, mockActivateToday, cancel; KYC-gated; `MANUAL` mock only; unique one pass per Wayler per UTC `accessDate`; default **EUR / €1.00**), **Wayler access panel UI** on `/app` (active/inactive, mock activate/cancel, recent history; i18n 8 locales), **accept gating** (`POST /orders/:id/accept` + Wayler OPEN feed accept button; **`POST /wayler-availability-requests/:id/accept` + incoming Accept request button** — `WAYLER_ACCESS_REQUIRED`), **contact/chat/message gating** (`ConversationsService` + Wayler Open chat / send — `WAYLER_ACCESS_REQUIRED`; Sender chat unaffected; read not gated; decline incoming requests not gated), **activate/cancel in-app notifications** (`SYSTEM` to Wayler on mock activate/cancel — idempotent-safe; plain English title/body; bell picks up via existing polling). ✅ (schema + API + SDK + panel UI + paywall enforcement + access notifications complete — mock/manual activation only). Next: **Stripe checkout for real daily access**, scheduled expiry notification, access history detail page, refunds, admin pricing, **platform fee toward ~5%**.
- **M9–M15:** photo/signature proof, confirmation-code verification, cancellation reasons, pickup timestamps, production geocoding, `CHAT_MESSAGE` type, WebSocket/SSE chat, push/email, moderation, **Stripe checkout + webhooks + payout processing + refunds** (order escrow), offline + PDF agreements, WebSocket/SSE notification preferences, real-provider KYC swap, **full landing/onboarding UI redesign**, world-map hero, empty-state illustrations, design system expansion, hardening, launch.

### Reserved for a future milestone — Reputation System

Architecture space is **reserved** (not implemented) for a future `ReputationModule` (backend) + reputation surfaces (frontend) supporting:

- ratings
- reviews
- delivery success rate
- reputation score

It will plug into the existing Users/Orders modules and shared `types`/`validation`/`sdk` packages without restructuring.
