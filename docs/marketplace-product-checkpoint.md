# Marketplace product checkpoint — local stack ahead of `origin/main`

**Last updated:** June 2026  
**Scope:** User-facing marketplace UX on `/app` (Sender + Wayler). **Local development only** — branch is ahead of `origin/main`; nothing in this doc implies production deployment or live payment/KYC providers.

This checkpoint summarizes recently added marketplace product work so demos, investor walkthroughs, and future development can start from a clear baseline.

---

## Summary

| Area                           | Status | Notes                                                                                                                       |
| ------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------- |
| Discovery & trust signals      | ✅     | Active Wayler counts, trust badges, verified filter                                                                         |
| Shortlist & compare            | ✅     | Browser-local shortlist; side-by-side compare                                                                               |
| Route intelligence             | ✅     | Match badges on browse results; recent route search chips                                                                   |
| Composer helpers               | ✅     | Templates, quality coaches, draft autosave                                                                                  |
| Onboarding & empty states      | ✅     | Guided empty states, next-best-action cards                                                                                 |
| Order lifecycle UX             | ✅     | Timeline, proof guidance, action guidance                                                                                   |
| Safety & guidance              | ✅     | Conversation safety, restricted items, density polish                                                                       |
| Real Stripe / escrow / payouts | ❌     | Mock/manual metadata flow only — see [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md) |

---

## Discovery & trust

### Active Wayler counts

- **UI:** `ActiveWaylersMarketplaceSection` on Sender browse (`active-waylers-marketplace-section.tsx`)
- **API:** `GET /api/v1/marketplace/active-waylers` (authenticated; counts from active public listings)
- **Behavior:** Total active Waylers plus location breakdown; optional country/city filters; click location to pre-fill browse filters
- **Honesty:** Counts reflect **published active listings**, not guaranteed availability or response time

### Trust badges

- **Component:** `MarketplaceTrustBadgeRow` (`marketplace-trust-signals.tsx`)
- **Signals (derived from listing fields only):** public availability, active listing, local vs trip route, recently published/updated, secure-request hint
- **No inferred claims:** badges do not assert insurance, escrow protection, or delivery guarantees

### Verified Wayler badge & filter

- **Badge:** Shown when `listing.isWaylerVerified` (backend KYC-approved Wayler flag on listing payload)
- **Filter:** Sender browse **Verified only** toggle — client-side filter on current result set
- **Honesty:** “Verified” means **Wayly KYC status on record** — not a government ID guarantee or carrier endorsement

---

## Shortlist & compare

- **Shortlist storage:** Browser `localStorage` — see [local-saved-data-checkpoint.md](./local-saved-data-checkpoint.md)
- **UI:** `WaylerShortlistPanel`, star/shortlist controls on listing cards
- **Compare:** `WaylerShortlistCompare` — compact table for route, capacity, trust signals, route match
- **Scope:** Shortlist is **local to the browser**; not synced across devices or accounts

---

## Route match intelligence

- **Component:** `MarketplaceRouteMatchRow` / `getMarketplaceRouteMatchBadges` (`marketplace-route-match.tsx`)
- **Match types:** exact route, origin, destination, same country, local availability, trip route, partial match
- **Usage:** Badges on Sender browse cards when search filters are set
- **Honesty:** Heuristic matching only — not automated booking or guaranteed fit

### Recent route searches

- **UI:** `RecentRouteSearches` chips in Sender filter panel
- **Storage:** `wayly.recentRouteSearches.v1` (max 8) — origin/destination country + city only
- **Trigger:** Saved on Search / Refresh when route fields are useful

---

## Templates & drafts

### Sender request templates

- **UI:** `SenderRequestTemplates` in Sender request form
- **Storage:** `wayly.senderRequestTemplates.v1` (max 5)
- **Fields:** title, package, budget, message, optional route cities — **no full addresses or pickup/delivery dates**

### Wayler availability templates

- **UI:** `WaylerAvailabilityTemplates` in Wayler create form
- **Storage:** `wayly.waylerAvailabilityTemplates.v1` (max 5)
- **Fields:** listing type, route/coverage, capacity, notes — **no date windows**

### Draft autosave

- **Sender request drafts:** per-listing key `wayly.senderRequestDraft.v1.{availabilityId}` — full composer fields including addresses/timing
- **Wayler availability draft:** `wayly.waylerAvailabilityDraft.v1` — full create form
- **UX:** Draft bars with save/clear; autosave on field changes where implemented

---

## Quality coaches

### Sender request quality coach

- **Component:** `SenderRequestQualityCoach`
- **Labels:** Needs details / Almost ready / Ready to send
- **Placement:** Sender request form (after summary)
- **Honesty:** Coaching only — **no guaranteed acceptance**

### Wayler listing quality coach

- **Component:** `ListingQualityCoach`
- **Labels:** Needs details / Almost ready / Ready to publish
- **Placement:** Wayler availability create form (after preview)
- **Honesty:** Coaching only — **no guaranteed inbound requests**

Both coaches are **collapsed by default** (guidance density pass) with status badge visible in the summary row.

---

## Local saved data controls

- **Panel:** `LocalSavedDataPanel` on `/app`
- **Covers:** shortlist, drafts, recent searches, templates — counts + per-scope clear + clear all
- **Details:** [local-saved-data-checkpoint.md](./local-saved-data-checkpoint.md)

---

## Onboarding & empty states

- **Component:** `MarketplaceEmptyState` — role-specific titles, descriptions, helper bullets
- **Guided onboarding:** `MarketplaceHowRequestsWork`, mode-aware empty copy on Sender/Wayler panels
- **Next best actions:** `SenderNextBestActions` — contextual cards (browse, complete KYC, publish order, etc.) from dashboard state

---

## Accepted orders & lifecycle

- **Timeline:** `OrderLifecycleTimeline` (compact on cards) — draft/open → accepted → transit → delivered; honest proof helper when proof flow enabled
- **Proof guidance:** `DeliveryProofGuidance` — sender review / wayler submit hints; collapsible in compact mode
- **Order action guidance:** `OrderActionGuidance` near cancel, start transit, mark delivered (collapsible)
- **Payment transparency:** `PaymentTransparencyNote` at accepted-order panel level (not duplicated per payment button)
- **Dispute guidance:** `DisputeGuidanceNote` in order dispute sections; existing dispute modal unchanged
- **Details drawer:** `AcceptedOrderDetailsDrawer` — timeline, payment transparency, proof guidance, copy order reference

---

## Conversation & chat safety

- **Component:** `ConversationSafetyNote` in chat modal (collapsed by default)
- **Topics:** keep agreements in Wayly, confirm timing, no private payment, restricted items reminder, dispute review tools
- **Dispute status:** `DisputeStatusHelp` banner when order-linked dispute is open/under review/resolved (minimal mode in chat)

**Not implemented:** message moderation, blocking, or automated fraud detection in chat.

---

## Guidance density cleanup (polish pass)

Recent UI-only pass to reduce stacked panels:

- Quality coaches, safety checklists, restricted-items notes → **collapsed by default**
- Duplicate payment/proof action guidance removed where panel-level notes already cover the same honesty rules
- Timeline footer hints hidden when proof guidance is shown on the same card
- Tighter spacing on proof/payment/dispute sub-panels

**No behavior changes** — actions, API calls, and validation unchanged.

---

## Key frontend files (reference)

| Feature          | Primary files                                                          |
| ---------------- | ---------------------------------------------------------------------- |
| Sender browse    | `sender-waylers-panel.tsx`, `active-waylers-marketplace-section.tsx`   |
| Wayler listings  | `wayler-availability-panel.tsx`                                        |
| Trust / safety   | `marketplace-trust-signals.tsx`, `restricted-items-safety-note.tsx`    |
| Orders dashboard | `app/(app)/app/page.tsx`, `accepted-order-details-drawer.tsx`          |
| Chat             | `conversation-panel.tsx`, `conversation-safety-note.tsx`               |
| Local data       | `local-saved-data-panel.tsx`, `*-storage.ts` under `apps/web/src/lib/` |

---

## Related docs

- [local-saved-data-checkpoint.md](./local-saved-data-checkpoint.md)
- [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md)
- [support-notifications-demo-checkpoint.md](./support-notifications-demo-checkpoint.md) — support tickets + in-app activity notifications
- [admin-operations-checkpoint.md](./admin-operations-checkpoint.md)
- [admin-operations-center.md](./admin-operations-center.md) — full admin reference
- [README.md](../README.md) — milestone history and local dev setup

---

## Demo / investor talking points (honest)

1. **Two-sided marketplace** — Senders browse Wayler routes/local availability; Waylers publish listings and accept requests.
2. **Trust without over-claiming** — KYC gate, verified badge, trust badges, and safety copy; no fake escrow or insurance.
3. **Operator-ready admin** — separate admin checkpoint for queues, triage, and metadata-only payment/dispute decisions.
4. **Local-first productivity** — templates, drafts, shortlist, and recent searches speed repeat use without server sync yet.
5. **Clear gap to production** — real Stripe Connect, Sumsub KYC webhooks, realtime, and payout execution remain future work.
