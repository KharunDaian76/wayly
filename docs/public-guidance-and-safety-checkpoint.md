# Public guidance & in-app safety checkpoint — local stack ahead of `origin/main`

**Last updated:** June 2026  
**Scope:** Public marketing/help pages, SEO/discoverability metadata, and in-app safety/onboarding UI on `/app`. **Documentation only in this checkpoint** — describes shipped frontend work. **Local development only**; nothing here implies production deployment or changed backend contracts.

Use this doc for demos, handoff, and support scripts when explaining what Wayly publishes publicly vs. what the in-app dashboard shows before high-intent actions.

---

## Summary

| Area                          | Status | Notes                                                                                                                  |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| Public guidance pages         | ✅     | 8 dedicated routes + landing cross-links; honest limits in copy                                                        |
| Help Center hub               | ✅     | `/help` centralizes links to all public guides                                                                         |
| SEO / discoverability         | ✅     | Sitemap, robots, page metadata helper, OG/Twitter defaults, JSON-LD WebSite                                            |
| In-app Help & Safety card     | ✅     | Link hub on `/app` dashboard — informational only                                                                      |
| In-app Role Starter checklist | ✅     | Sender/Wayler/general steps on `/app` — non-blocking                                                                   |
| In-app Safety Preflight       | ✅     | Collapsible checklist near Sender request + Wayler publish — non-blocking                                              |
| Real payment provider         | ❌     | Mock/manual metadata only — see [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md) |
| Real escrow / guarantees      | ❌     | No fund holding, refunds, payouts, insurance, or legal protection                                                      |

---

## Public guidance pages

All routes live under `apps/web/src/app/(marketing)/` with page components in `apps/web/src/components/marketing/`. Copy is i18n-backed (`marketing.*` keys in `apps/web/src/lib/i18n/dictionaries.ts`).

**Honesty rule for every page:** content is **general platform guidance**, not legal advice. Wayly does **not** verify item legality, guarantee outcomes, or hold funds in real escrow.

### `/help` — Help Center hub

|                      |                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Single entry point to all public guides and safety resources.                                                                                     |
| **What it explains** | Card grid linking to how-it-works, trust, FAQ, restricted items, fees, privacy/local data, support/disputes; cross-links from landing nav/footer. |
| **Honesty limits**   | Hub copy states guides are informational; points users to honest limits on payments and guarantees elsewhere.                                     |

**Files:** `help/page.tsx`, `help-center-page.tsx`, `help-center-landing-link.tsx`

### `/how-it-works` — Sender/Wayler flow

|                      |                                                                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Explain the two-sided marketplace journey for Senders and Waylers.                                                               |
| **What it explains** | Browse/publish, requests, orders, chat, proof-of-delivery, and where payment/dispute tools fit in the workflow.                  |
| **Honesty limits**   | Does not promise delivery success, response times, or real money movement; references mock/manual payment status where relevant. |

**Files:** `how-it-works/page.tsx`, `how-it-works-page.tsx`

### `/trust` — Trust Center

|                      |                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Trust & safety overview for marketplace participants.                                                                 |
| **What it explains** | KYC gate concept, chat expectations, dispute review as coordination, local data boundaries, links to deeper guides.   |
| **Honesty limits**   | “Verified” and trust signals are **on-platform status**, not government endorsement, insurance, or escrow protection. |

**Files:** `trust/page.tsx`, `trust-center-page.tsx`

### `/faq` — Common questions

|                      |                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| **Purpose**          | FAQ for Senders and Waylers on safety, payments, disputes, and data.                              |
| **What it explains** | Expandable Q&A aligned with other public pages; links to Help Center and Support & Disputes.      |
| **Honesty limits**   | Answers describe **current** product behavior; no guaranteed refunds, payouts, or legal outcomes. |

**Files:** `faq/page.tsx`, `faq-page.tsx`

### `/restricted-items` — Responsible use & restricted items

|                      |                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Responsible-use guidance before sending or carrying items.                                                |
| **What it explains** | User responsibility for laws, customs, airline/carrier rules, prohibited categories, and when to decline. |
| **Honesty limits**   | **General guidance only — not legal advice.** Wayly does **not** verify item legality or contents.        |

**Files:** `restricted-items/page.tsx`, `restricted-items-page.tsx`

### `/fees` — Fees & payment transparency

|                      |                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Honest payment and fee transparency for the current stack.                                                          |
| **What it explains** | Mock/manual payment flow, status labels, platform fee direction, admin review concept, what is **not** implemented. |
| **Honesty limits**   | **No real escrow**, no guaranteed refund/payout, no Stripe/production provider integration today.                   |

**Files:** `fees/page.tsx`, `fees-page.tsx`

### `/privacy-local-data` — Browser-local saved data transparency

|                      |                                                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Public explanation of browser-local saved data on `/app`.                                                                                                             |
| **What it explains** | Shortlist, templates, drafts, recent searches — stored in `localStorage` only; user controls; not synced to account.                                                  |
| **Honesty limits**   | Not a compliance archive; server-side dispute/proof records are separate when submitted. Links to [local-saved-data-checkpoint.md](./local-saved-data-checkpoint.md). |

**Files:** `privacy-local-data/page.tsx`, `privacy-local-data-page.tsx`

### `/support-disputes` — Support & dispute help

|                      |                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | First steps when a delivery needs attention.                                                                              |
| **What it explains** | Stay in chat, gather evidence, open disputes, admin review concept, escalation expectations.                              |
| **Honesty limits**   | Disputes **organize evidence and records**; they do **not** guarantee refund, payout, or legal outcome. Not legal advice. |

**Files:** `support-disputes/page.tsx`, `support-disputes-page.tsx`

### Landing `/` (home)

Marketing home remains the primary acquisition page. Nav/footer link to Help Center (replacing separate Trust + FAQ nav entries in the consolidated help UX). Included in sitemap at priority `1.0`.

---

## SEO & discoverability

### `/sitemap.xml`

- **File:** `apps/web/src/app/sitemap.ts`
- **Source of truth:** `publicMarketingPaths` in `apps/web/src/lib/seo/metadata.ts`
- **Included routes (public only):** `/`, `/help`, `/how-it-works`, `/trust`, `/faq`, `/restricted-items`, `/fees`, `/privacy-local-data`, `/support-disputes`
- **Excluded:** `/app/*`, `/login`, `/register`, `/health`, admin routes, API routes
- **Base URL:** `getSiteUrl()` — `NEXT_PUBLIC_APP_URL` or `siteConfig.url` (`https://wayly-web.vercel.app`)

### `/robots.txt`

- **File:** `apps/web/src/app/robots.ts`
- **Allow:** `/`
- **Disallow:** `/app/`, `/login`, `/register`, `/health`
- **Sitemap reference:** `{siteUrl}/sitemap.xml`

### Page metadata helper

- **File:** `apps/web/src/lib/seo/metadata.ts` — `createPageMetadata({ title, description, path, noIndex? })`
- **Provides:** title, description, canonical URL, Open Graph (`type: website`, locale, title, description, url, siteName), Twitter card (`summary`, title, description)
- **Used by:** each public marketing page’s `export const metadata`
- **No OG image invented:** helper and root layout set OG/Twitter text fields only — **no `og:image` or Twitter image** was added

### Root layout defaults

- **File:** `apps/web/src/app/layout.tsx`
- **Provides:** default title template, `metadataBase`, site-wide OG/Twitter defaults, `robots: { index: true, follow: true }` for pages without overrides

### JSON-LD WebSite metadata

- **Component:** `apps/web/src/components/marketing/website-json-ld.tsx`
- **Injected in:** `apps/web/src/app/(marketing)/layout.tsx`
- **Schema:** `WebSite` with `name`, `url`, `description` from `siteConfig` + `getSiteUrl()`

### Auth & health noindex behavior

| Route area                        | Behavior                                                              |
| --------------------------------- | --------------------------------------------------------------------- |
| `(auth)/login`, `(auth)/register` | `(auth)/layout.tsx` sets `robots: { index: false, follow: false }`    |
| `/health`                         | `health/layout.tsx` uses `createPageMetadata({ ..., noIndex: true })` |
| `/app/*`                          | Disallowed in `robots.txt`; authenticated app — not in sitemap        |

### Site URL helper

- **File:** `apps/web/src/lib/seo/site-url.ts` — `getSiteUrl()` strips trailing slash
- **Config:** `apps/web/src/config/site.ts` — honest default description mentioning documented payment/KYC limits

---

## In-app safety & onboarding layer

All components are **frontend-only**, **informational**, and **non-blocking**. No API calls, no `localStorage` writes, no validation changes, and no submit/publish gating.

### `HelpSafetyCenterCard`

|              |                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------- |
| **File**     | `apps/web/src/components/app/help-safety-center-card.tsx`                                                            |
| **Location** | `/app` dashboard — responsive 2-column grid with Role Starter, **after** mode dashboard card (`app/page.tsx`)        |
| **Purpose**  | In-app link hub to all public guidance pages                                                                         |
| **Links**    | `/help`, `/how-it-works`, `/trust`, `/faq`, `/restricted-items`, `/fees`, `/privacy-local-data`, `/support-disputes` |
| **Behavior** | Card with link grid + amber honesty notice; opens public pages in same tab; does not block any action                |

### `RoleStarterChecklistCard`

|              |                                                                                                                                                                                            |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **File**     | `apps/web/src/components/app/role-starter-checklist-card.tsx`                                                                                                                              |
| **Location** | `/app` dashboard — same grid as Help & Safety (left column on `lg` breakpoints)                                                                                                            |
| **Purpose**  | Role-aware onboarding checklist (Sender / Wayler / general when mode not ready)                                                                                                            |
| **Links**    | Sender: how-it-works, restricted-items, fees, support-disputes. Wayler: how-it-works, trust, restricted-items, support-disputes. General: how-it-works, restricted-items, support-disputes |
| **Behavior** | Numbered steps from i18n (`app.roleStarter.*`); role badge from `useAppMode()`; honesty notice; non-blocking                                                                               |

### `SafetyPreflightChecklist`

|                       |                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **File**              | `apps/web/src/components/app/safety-preflight-checklist.tsx`                                                                                           |
| **Variants**          | `senderRequest`, `waylerAvailability`, `general` (general available for reuse)                                                                         |
| **Location — Sender** | `sender-waylers-panel.tsx` — in request composer guidance stack, after summary, before quality coach / restricted-items note / submit                  |
| **Location — Wayler** | `wayler-availability-panel.tsx` — after preview + listing quality coach, before restricted-items note / publish button                                 |
| **Purpose**           | Compact preflight checks before high-intent create/publish actions                                                                                     |
| **Links — Sender**    | `/restricted-items`, `/fees`, `/support-disputes`                                                                                                      |
| **Links — Wayler**    | `/restricted-items`, `/trust`, `/support-disputes`                                                                                                     |
| **Links — General**   | `/restricted-items`, `/support-disputes`                                                                                                               |
| **Behavior**          | Collapsible `<details>`; **default collapsed** in dense form areas; checklist rows + link pills + honesty notice; does **not** block submit or publish |

**i18n keys:** `app.helpSafetyCenter.*`, `app.roleStarter.*`, `app.safetyPreflight.*` (8 locales)

---

## Local saved data transparency

Browser-local features on `/app` are documented in depth here:

**[local-saved-data-checkpoint.md](./local-saved-data-checkpoint.md)**

Short summary for this checkpoint:

- **Browser-local only** — shortlist, templates, drafts, recent route searches use `localStorage`
- **No account sync** — data does not follow the user across devices or sessions after storage clear
- **User controls** — `LocalSavedDataPanel` on `/app` shows counts and per-scope / clear-all actions
- **Public page** — `/privacy-local-data` explains the same boundaries for non-technical users
- **Not a compliance archive** — server-side orders, chat, disputes, and submitted proof metadata are separate

---

## Current product limitations

Use this section verbatim in demos and external copy when describing what Wayly **does not** do today:

1. **Real payment provider integration is not implemented** — mock/manual status fields and demo buttons only (hidden in production unless `NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true`).
2. **No real escrow guarantee** — “escrow” labels simulate workflow; no funds held with a provider.
3. **No guaranteed refunds or payouts** — admin payment review updates metadata only.
4. **No insurance** — Wayly does not provide shipment insurance or carrier liability coverage.
5. **No legal advice or legal protection** — public pages and in-app cards are general guidance only.
6. **Item legality is not verified by Wayly** — users must follow local laws, customs, and transport rules.
7. **Disputes organize evidence and records; they do not guarantee outcome** — resolution may be manual/metadata-only depending on environment.
8. **KYC / demo / provider pieces may still be mock or manual** — mock KYC approve/reject and demo tools depend on environment flags; Sumsub/production webhooks not assumed live.

For payment/dispute wording detail, see [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md).

---

## Key file reference

| Concern                    | Path                                                        |
| -------------------------- | ----------------------------------------------------------- |
| Public routes              | `apps/web/src/app/(marketing)/*/page.tsx`                   |
| Marketing page UI          | `apps/web/src/components/marketing/*-page.tsx`              |
| Sitemap                    | `apps/web/src/app/sitemap.ts`                               |
| Robots                     | `apps/web/src/app/robots.ts`                                |
| Metadata helper            | `apps/web/src/lib/seo/metadata.ts`                          |
| Site URL                   | `apps/web/src/lib/seo/site-url.ts`                          |
| JSON-LD                    | `apps/web/src/components/marketing/website-json-ld.tsx`     |
| App dashboard placement    | `apps/web/src/app/(app)/app/page.tsx`                       |
| Sender preflight placement | `apps/web/src/components/app/sender-waylers-panel.tsx`      |
| Wayler preflight placement | `apps/web/src/components/app/wayler-availability-panel.tsx` |
| Local data panel           | `apps/web/src/components/app/local-saved-data-panel.tsx`    |

---

## Related docs

- [marketplace-product-checkpoint.md](./marketplace-product-checkpoint.md) — discovery, templates, coaches, in-app guidance components
- [local-saved-data-checkpoint.md](./local-saved-data-checkpoint.md) — `localStorage` keys and privacy boundaries
- [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md) — honest payment/dispute language
- [admin-operations-checkpoint.md](./admin-operations-checkpoint.md) — operator queues and metadata-only reviews
- [README.md](../README.md) — milestone history and local dev setup

---

## Manual verification checklist

- [ ] `docs/public-guidance-and-safety-checkpoint.md` exists and matches current routes
- [ ] README links to this checkpoint (if docs table present)
- [ ] All 8 public guidance routes render (`/help` through `/support-disputes`)
- [ ] `/sitemap.xml` lists public routes only
- [ ] `/robots.txt` disallows `/app/`, `/login`, `/register`, `/health`
- [ ] `/app` shows Help & Safety + Role Starter cards
- [ ] Sender request area shows Safety Preflight (collapsed by default)
- [ ] Wayler publish area shows Safety Preflight (collapsed by default)
- [ ] Preflight and cards do not block submit/publish
- [ ] Public guide links from in-app cards resolve
- [ ] Copy contains no false escrow/guarantee/insurance/legal-protection claims
- [ ] No backend, migration, or app-behavior changes required for this doc checkpoint
