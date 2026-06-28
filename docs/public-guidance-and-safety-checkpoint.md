# Public guidance & in-app safety checkpoint — local stack ahead of `origin/main`

**Last updated:** June 2026  
**Scope:** Public marketing/help pages, SEO/discoverability metadata, and in-app safety/onboarding UI on `/app`. **Documentation only in this checkpoint** — describes shipped frontend work. **Local development only**; nothing here implies production deployment or changed backend contracts.

Use this doc for demos, handoff, and support scripts when explaining what Wayly publishes publicly vs. what the in-app dashboard shows before high-intent actions.

---

## Summary

| Area                          | Status | Notes                                                                                                                  |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------- |
| Public guidance pages         | ✅     | Help, trust, fees, support, and related guides; honest limits in copy                                                  |
| Public policy pages           | ✅     | Policy Center hub + draft Terms, Privacy guidance, Community Guidelines — not final legal docs                         |
| Public launch status          | ✅     | `/roadmap` — available vs mock/manual vs planned; no-guarantees section                                                |
| Help Center hub               | ✅     | `/help` centralizes links to guides, Policy Center, and Roadmap                                                        |
| SEO / discoverability         | ✅     | Sitemap (14 public routes), robots, metadata helper, OG/Twitter defaults, JSON-LD WebSite                              |
| In-app Help & Safety card     | ✅     | Link hub on `/app` dashboard — informational only                                                                      |
| In-app Role Starter checklist | ✅     | Sender/Wayler/general steps on `/app` — non-blocking                                                                   |
| In-app Safety Preflight       | ✅     | Collapsible checklist near Sender request + Wayler publish — non-blocking                                              |
| In-app Launch Status notice   | ✅     | Current-state transparency card below Help/Role Starter grid — informational only                                      |
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

## Public policy pages

Draft/general policy guidance — **not legal advice** and **not a lawyer-reviewed final agreement**. Users must follow local laws, customs, transport rules, and platform guidance. i18n: `marketing.policies.*`, `marketing.terms.*`, `marketing.privacy.*`, `marketing.communityGuidelines.*`.

**Shared honesty rule:** every policy page includes a draft-notice banner. Wayly does **not** verify item legality, provide insurance, hold real escrow, or guarantee refunds/payouts.

### `/policies` — Policy Center hub

|                      |                                                                                                                                                                                   |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Central hub for platform rules, privacy guidance, and responsible-use documents.                                                                                                  |
| **What it explains** | Card grid linking to Terms, Privacy guidance, Community Guidelines, Restricted Items, Fees, and Support & Disputes; cross-links from Help Center, footer, and Policy Center hero. |
| **Honesty limits**   | Draft/general guidance only — not legal advice; not a final lawyer-reviewed agreement; future legal review planned before commercial launch.                                      |

**Files:** `policies/page.tsx`, `policy-center-page.tsx`

### `/terms` — Terms of Use (draft guidance)

|                      |                                                                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Lightweight expectations for responsible marketplace use.                                                                                      |
| **What it explains** | Sender/Wayler responsibilities, payments/fees transparency, disputes/evidence, restricted items, current platform limits, no-guarantee notice. |
| **Honesty limits**   | Draft guidance — not a binding contract; no guaranteed delivery, refund, payout, escrow, or legal protection.                                  |

**Files:** `terms/page.tsx`, `policy-page.tsx` (`variant="terms"`)

### `/privacy` — Privacy guidance (draft)

|                      |                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Purpose**          | Draft overview of account/server data vs browser-local saved data — **not a full legal privacy policy**.                                         |
| **What it explains** | Server-side account/marketplace data may exist; localStorage tools; user controls; sensitive info users should not share; future privacy work.   |
| **Honesty limits**   | Does **not** claim full GDPR/CCPA/legal compliance, encryption guarantees, or server-deletion guarantees; lawyer-reviewed policy is future work. |

**Files:** `privacy/page.tsx`, `policy-page.tsx` (`variant="privacy"`)

### `/community-guidelines` — Community Guidelines (draft)

|                      |                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Expected conduct for honest listings, in-platform communication, and respectful dispute use.                                                 |
| **What it explains** | Honest item/route details, keep chat in Wayly, follow laws/customs, no private payment details, decline unsafe requests, prohibited conduct. |
| **Honesty limits**   | General behavior guidance — not legal advice; not a final enforcement policy; users remain responsible for lawful conduct.                   |

**Files:** `community-guidelines/page.tsx`, `policy-page.tsx` (`variant="communityGuidelines"`)

**Public links:** footer (Policy Center, Terms, Privacy, Community Guidelines); Help Center featured card; Trust Center / FAQ footer shortcuts to Policy Center where applicable.

---

## Public Launch Status & Roadmap

Route: **`/roadmap`** — transparent current-state page for demos, investors, and support. i18n: `marketing.roadmap.*`.

|                      |                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Purpose**          | Explain what is available today, what is mock/manual, and what is planned for production — without overstating guarantees. |
| **What it explains** | See sections below; helpful links to Help Center, Policy Center, Fees, Privacy, Support & Disputes, Restricted Items.      |
| **Honesty limits**   | Explicit no-guarantees section; no claim of real escrow, guaranteed refund/payout, insurance, or legal protection today.   |

**Files:** `roadmap/page.tsx`, `roadmap-page.tsx`

### Available today

Documented on `/roadmap` **Available** column:

- Sender and Wayler marketplace/demo app flows
- Wayler availability and trip routes; Sender browse and requests
- Accepted requests can convert to delivery orders
- Order-linked chat, timeline, proof metadata, dispute tools
- Public guidance, Policy Center, Help Center, Trust resources
- In-app Help & Safety, Role Starter, Safety Preflight
- Browser-local tools (drafts, templates, shortlist, recent routes)
- Admin operations/review queues where enabled

Wording: available in the **current app/demo environment** — not a promise of production SLA or guaranteed outcomes.

### Mock / manual today

Documented on `/roadmap` **Mock / manual** column:

- Payment provider flow may be mock or manual — status fields without real provider money movement
- **No real escrow guarantee**, guaranteed refund, or guaranteed payout today
- KYC/provider steps may be mock or manual depending on environment and demo flags
- Admin review records are operational metadata — they do **not** move money by themselves
- Notifications may be in-app polling or demo dispatch — not full production push infrastructure

### Planned production work

Documented on `/roadmap` **Planned** column (future work, not live today):

- Real payment provider integration (e.g. Stripe) and provider webhooks
- Refund, capture, and payout **execution** — not metadata-only decisions
- Production KYC provider with verified webhook processing
- Production notification system (push/email)
- Production monitoring, alerting, and incident response
- Mobile packaging and **app-store distribution** (planned, not complete)
- Lawyer-reviewed terms, privacy policy, and regional compliance review
- Region/currency fee rules and stronger support workflows

### Safety & compliance roadmap

Separate `/roadmap` section (planned):

- Stronger restricted-item workflows and clearer decline paths
- Clearer evidence upload rules when production-ready
- Policy/legal review before real-money launch
- Moderation, fraud signals, and risk tooling improvements
- Compliance review for payments, KYC, and cross-border transport

### No-guarantees section

Public `/roadmap` amber block and in-app notice align on:

- No legal advice, insurance, or legal protection
- No guaranteed delivery, refund, or payout
- No real escrow guarantee today
- No item legality verification by Wayly
- Disputes/admin review organize records — they do not guarantee outcomes

**Public links:** footer; Help Center featured card; Policy Center hero CTA.

---

## SEO & discoverability

### `/sitemap.xml`

- **File:** `apps/web/src/app/sitemap.ts`
- **Source of truth:** `publicMarketingPaths` in `apps/web/src/lib/seo/metadata.ts`
- **Included routes (public only, indexable):** `/`, `/help`, `/how-it-works`, `/trust`, `/faq`, `/restricted-items`, `/fees`, `/privacy-local-data`, `/support-disputes`, `/policies`, `/terms`, `/privacy`, `/community-guidelines`, `/roadmap`
- **All listed routes:** public marketing pages under `(marketing)/` — indexed via `createPageMetadata()` unless explicitly `noIndex`
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

### `LaunchStatusNoticeCard`

|                 |                                                                                                                                                                                                                                              |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **File**        | `apps/web/src/components/app/launch-status-notice-card.tsx`                                                                                                                                                                                  |
| **Location**    | `/app` dashboard — **full-width card directly below** Role Starter + Help & Safety 2-column grid, **before** Wayler/Sender marketplace panels                                                                                                |
| **Purpose**     | Honest current-state transparency inside the app — what works today vs mock/manual vs planned                                                                                                                                                |
| **Status rows** | **Available** — marketplace/demo flows, public guidance, in-app safety tools. **Mock / manual** — payments, KYC/provider, notifications. **Planned** — real payment provider, production KYC, notifications, monitoring, app-store packaging |
| **Links**       | `/roadmap`, `/fees`, `/policies`, `/help`                                                                                                                                                                                                    |
| **Behavior**    | Compact `wayly-app-panel` card with status chips, link pills, amber honesty notice; informational only; no API calls, no `localStorage` writes, non-blocking                                                                                 |

**i18n keys:** `app.helpSafetyCenter.*`, `app.roleStarter.*`, `app.safetyPreflight.*`, `app.launchStatus.*` (8 locales)

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
9. **Policy pages are draft/general guidance** — Terms, Privacy guidance, and Community Guidelines are **not** final lawyer-reviewed legal documents; legal/privacy review is still needed before real commercial launch.
10. **Real-money / payment compliance review still needed** — public Roadmap and Fees pages describe mock/manual status; production payment provider, webhooks, and compliance sign-off are future work.
11. **App-store packaging is planned, not complete** — mobile PWA exists; native app-store distribution and production notification infrastructure are on the Roadmap, not shipped.

For payment/dispute wording detail, see [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md).

---

## Key file reference

| Concern                    | Path                                                        |
| -------------------------- | ----------------------------------------------------------- |
| Public routes              | `apps/web/src/app/(marketing)/*/page.tsx`                   |
| Marketing page UI          | `apps/web/src/components/marketing/*-page.tsx`              |
| Policy pages UI            | `policy-center-page.tsx`, `policy-page.tsx`                 |
| Roadmap page UI            | `roadmap-page.tsx`                                          |
| Launch status in-app card  | `launch-status-notice-card.tsx`                             |
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
- [ ] Public guidance routes render (`/help` through `/support-disputes`)
- [ ] Public policy routes render (`/policies`, `/terms`, `/privacy`, `/community-guidelines`)
- [ ] `/roadmap` renders with Available / Mock-manual / Planned columns and no-guarantees section
- [ ] `/sitemap.xml` lists all 14 public marketing routes (including policy + roadmap)
- [ ] `/robots.txt` disallows `/app/`, `/login`, `/register`, `/health`
- [ ] `/app` shows Help & Safety + Role Starter cards and Launch Status notice below grid
- [ ] Launch Status notice links resolve: `/roadmap`, `/fees`, `/policies`, `/help`
- [ ] Sender request area shows Safety Preflight (collapsed by default)
- [ ] Wayler publish area shows Safety Preflight (collapsed by default)
- [ ] Preflight and cards do not block submit/publish
- [ ] Public guide links from in-app cards resolve
- [ ] Copy contains no false escrow/guarantee/insurance/legal-protection claims
- [ ] Policy pages clearly state draft/general guidance — not final legal documents
- [ ] No backend, migration, or app-behavior changes required for this doc checkpoint
