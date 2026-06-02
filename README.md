# Wayly

Cross-platform **P2P delivery platform** connecting Senders and Waylers directly — international/intercity and local city delivery — with mandatory KYC, escrow + offline payment flows, real-time chat, maps, and a premium mobile-first PWA experience.

> **Status:** M1 (Auth & Users foundation) — auth backend/frontend, password visibility toggle, and basic i18n are complete. KYC, orders, payments, chat, and admin are future milestones.

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

cp .env.example .env    # fill local values (see M1 section below)

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
| KYC provider integration                                       | Not started (M2+)               |
| Orders, payments, chat, admin                                  | Not started (future milestones) |

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
- **M2 — KYC gate (mocked):** phone OTP + identity/liveness behind mock providers; `verified` flag.
- **M3 — Design system & app shell:** landing, PWA, main screen (role switch + International toggle).
- **M4–M15:** orders, geo/maps, realtime chat, subscriptions, escrow/Stripe, offline + PDF agreements, disputes, notifications, admin panel, real-provider swap, hardening, launch.

### Reserved for a future milestone — Reputation System

Architecture space is **reserved** (not implemented) for a future `ReputationModule` (backend) + reputation surfaces (frontend) supporting:

- ratings
- reviews
- delivery success rate
- reputation score

It will plug into the existing Users/Orders modules and shared `types`/`validation`/`sdk` packages without restructuring.
