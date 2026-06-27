# Local saved data checkpoint — browser storage on `/app`

**Last updated:** June 2026  
**Scope:** Frontend-only features persisted in **`localStorage`**. **No account sync**, **no server backup**, **no cross-device restore**.

Users control this data via **`LocalSavedDataPanel`** on `/app` (counts, per-scope clear, clear all).

---

## Privacy principles

1. **Local browser only** — data stays on the device; clearing browser storage removes it.
2. **No account sync** — signing in on another device does not restore shortlist, drafts, or templates.
3. **Intentionally limited templates** — templates omit sensitive or high-risk fields (full addresses, exact dates) where noted below.
4. **Not a compliance archive** — not suitable for legal evidence retention; dispute/proof records live on the server when submitted.

---

## Overview table

| Feature                       | localStorage key                               | Max items       | Clear scope              |
| ----------------------------- | ---------------------------------------------- | --------------- | ------------------------ |
| Wayler shortlist              | `wayly.shortlistedAvailabilityIds.v1`          | unbounded IDs   | `shortlist`              |
| Recent route searches         | `wayly.recentRouteSearches.v1`                 | 8               | `recentSearches`         |
| Sender request templates      | `wayly.senderRequestTemplates.v1`              | 5               | `senderRequestTemplates` |
| Wayler availability templates | `wayly.waylerAvailabilityTemplates.v1`         | 5               | `availabilityTemplates`  |
| Sender request drafts         | `wayly.senderRequestDraft.v1.{availabilityId}` | one per listing | `senderDrafts`           |
| Wayler availability draft     | `wayly.waylerAvailabilityDraft.v1`             | single draft    | `waylerDraft`            |

**Clear all** in the panel wipes every scope above.

---

## Wayler shortlist

- **Key:** `wayly.shortlistedAvailabilityIds.v1`
- **Stored:** array of Wayler availability listing IDs (strings)
- **Not stored:** listing snapshots, prices, personal notes, user identity
- **Module:** `apps/web/src/lib/wayler-shortlist-storage.ts`
- **UI:** `WaylerShortlistPanel`, shortlist toggle on browse cards, `WaylerShortlistCompare`

---

## Recent route searches

- **Key:** `wayly.recentRouteSearches.v1`
- **Stored per record:** `id`, `createdAt`, `originCountry`, `originCity`, `destinationCountry`, `destinationCity`
- **Not stored:** street addresses, package details, budgets, messages, dates
- **Module:** `apps/web/src/lib/recent-route-search-storage.ts`
- **UI:** `RecentRouteSearches` chips in Sender filter panel
- **Saved when:** User runs Search or Refresh with useful origin/destination fields

---

## Sender request templates

- **Key:** `wayly.senderRequestTemplates.v1`
- **Stored:** `templateId`, `templateName`, timestamps, `title`, `packageDescription`, `proposedReward`, `currency`, `message`, `pickupCountry`, `pickupCity`, `dropoffCountry`, `dropoffCity`
- **Intentionally NOT stored:** `pickupAddress`, `dropoffAddress`, pickup/delivery date windows
- **Apply behavior:** Template apply overwrites non-empty template route fields; **addresses and timing preserved** from current form
- **Module:** `apps/web/src/lib/sender-request-template-storage.ts`
- **UI:** `SenderRequestTemplates`

---

## Wayler availability templates

- **Key:** `wayly.waylerAvailabilityTemplates.v1`
- **Stored:** `templateId`, `templateName`, timestamps, listing `type`, origin/destination country/region/city, `tripDirection`, `maxPackages`, `maxWeightKg`, `notes`
- **Intentionally NOT stored:** `availableFrom`, `availableTo`, `departureDate`, `returnDate`
- **Module:** `apps/web/src/lib/wayler-availability-template-storage.ts`
- **UI:** `WaylerAvailabilityTemplates`

---

## Sender request drafts (autosave)

- **Key pattern:** `wayly.senderRequestDraft.v1.{availabilityId}` (one draft per Wayler listing being requested)
- **Stored:** full `SenderRequestFormFields` — includes addresses and desired pickup/delivery datetime fields
- **Scope:** Draft is tied to a specific availability listing id
- **Module:** `apps/web/src/lib/sender-request-draft-storage.ts`
- **UI:** `SenderRequestDraftBar` + autosave in request form
- **Clear scope:** `senderDrafts` removes all keys with the draft prefix

---

## Wayler availability draft (autosave)

- **Key:** `wayly.waylerAvailabilityDraft.v1`
- **Stored:** full `WaylerAvailabilityFormFields` including date/time fields for local or trip listings
- **Module:** `apps/web/src/lib/wayler-availability-draft-storage.ts`
- **UI:** `WaylerAvailabilityDraftBar` + autosave on create form
- **Clear scope:** `waylerDraft` removes single key

---

## Local saved data panel

- **Component:** `apps/web/src/components/app/local-saved-data-panel.tsx`
- **Shows:** live counts for all scopes above
- **Actions:** clear per scope; clear all
- **Events:** `LOCAL_SAVED_DATA_CHANGED_EVENT` keeps counts in sync when other components save/clear

### Event scopes (`local-saved-data-events.ts`)

`shortlist` · `senderDrafts` · `waylerDraft` · `recentSearches` · `availabilityTemplates` · `senderRequestTemplates` · `all`

---

## Storage availability

All modules probe `localStorage` before write and fail gracefully when unavailable (private mode, quota exceeded, SSR).

---

## Future work (not implemented)

- Server-side saved preferences / cross-device sync
- Encrypted local storage
- Export/import of templates
- Admin visibility into client-local data (none today — by design)

---

## Related docs

- [marketplace-product-checkpoint.md](./marketplace-product-checkpoint.md)
- [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md)
