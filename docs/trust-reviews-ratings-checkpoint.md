# Trust Reviews & Ratings checkpoint

**Last updated:** June 2026  
**Scope:** Post-delivery user-submitted reviews and ratings — schema, API, SDK, user UI, admin moderation queue, in-app notifications, and demo seed samples. **Trust signals only** — not verified identity, safety guarantees, or payment/dispute outcomes.

This checkpoint records the foundation added in commit `cd3be87` (`feat(api): add trust reviews foundation`) for demos, operator walkthroughs, and future development.

---

## 1. Overview

Wayly now supports **post-delivery reviews and ratings** between marketplace participants.

| Concept              | Detail                                                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Who reviews whom** | After a **DELIVERED** order, the **Sender** can review the accepted **Wayler**, and the **Wayler** can review the **Sender** |
| **Purpose**          | User-submitted **trust signals** to help others understand past coordination experiences                                     |
| **Not included**     | Verified identity proof, item legality checks, delivery guarantees, refund/payout decisions, insurance, or legal judgments   |

**Explicitly not changed by this foundation:** payment execution, dispute resolution logic, order lifecycle transitions, KYC provider integration, support ticket behavior, or general notification infrastructure beyond new review-specific dispatch hooks.

---

## 2. Review model

**Prisma model:** `Review` (`apps/api/prisma/schema.prisma`)

| Field                     | Type              | Notes                                 |
| ------------------------- | ----------------- | ------------------------------------- |
| `id`                      | UUID              | Primary key                           |
| `orderId`                 | UUID              | FK → `DeliveryOrder` (cascade delete) |
| `reviewerId`              | UUID              | FK → `User`                           |
| `revieweeId`              | UUID              | FK → `User`                           |
| `reviewerRole`            | `ReviewPartyRole` | `SENDER` or `WAYLER`                  |
| `revieweeRole`            | `ReviewPartyRole` | Opposite party role                   |
| `rating`                  | `Int`             | **1–5** (validated in API)            |
| `comment`                 | `String?`         | Optional, max 1000 chars              |
| `tags`                    | `String[]`        | Optional preset tags (see below)      |
| `isHidden`                | `Boolean`         | Default `false` — admin moderation    |
| `hiddenAt`                | `DateTime?`       | Set when hidden                       |
| `hiddenById`              | `UUID?`           | FK → admin `User`                     |
| `adminNote`               | `String?`         | Operator moderation note              |
| `createdAt` / `updatedAt` | `DateTime`        | Audit timestamps                      |

**Enum:** `ReviewPartyRole` — `SENDER`, `WAYLER`

**Unique constraint:** `(orderId, reviewerId, revieweeId)` — one review per reviewer→reviewee pair per order.

**Preset tags** (`REVIEW_TAG_VALUES` in `@wayly/types`): `communicative`, `careful`, `on_time`, `clear_details` (max 5 tags per review).

---

## 3. Review creation rules

Enforced in `ReviewsService.createForOrder` (`apps/api/src/modules/reviews/reviews.service.ts`):

| Rule                         | Behavior                                                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Authentication**           | JWT required (`JwtAuthGuard`)                                                                                   |
| **Verification**             | Email/account verification required (`VerificationGuard` + `@RequiresVerification()`)                           |
| **Order status**             | Order must be **`DELIVERED`** — rejects draft, open, accepted, in-transit, cancelled, and **disputed** statuses |
| **Party membership**         | Reviewer must be the order **Sender** or **accepted Wayler**                                                    |
| **Reviewee resolution**      | Reviewee is automatically the **other party** (Sender → Wayler, Wayler → Sender)                                |
| **No self-review**           | `revieweeId` cannot equal `reviewerId`                                                                          |
| **No duplicates**            | Unique `(orderId, reviewerId, revieweeId)` — second submit returns **409 Conflict**                             |
| **Accepted Wayler required** | Sender cannot review if order has no `acceptedWaylerId`                                                         |

User UI additionally hides the review form unless `orderStatus === DELIVERED` (`order-review-panel.tsx`).

---

## 4. API / SDK

### User endpoints (`ReviewsController` — tag `reviews`)

| Method | Path                                    | Auth           | SDK                                         |
| ------ | --------------------------------------- | -------------- | ------------------------------------------- |
| `POST` | `/api/v1/reviews/orders/:orderId`       | JWT + verified | `api.reviews.createForOrder(orderId, body)` |
| `GET`  | `/api/v1/reviews/users/:userId/summary` | JWT            | `api.reviews.getUserSummary(userId)`        |
| `GET`  | `/api/v1/reviews/users/:userId`         | JWT            | `api.reviews.listForUser(userId, query?)`   |
| `GET`  | `/api/v1/reviews/orders/:orderId/mine`  | JWT            | `api.reviews.getMineForOrder(orderId)`      |

**Create body:** `{ rating: 1–5, comment?: string, tags?: ReviewTag[] }`

**List query:** `limit` (default 10, max 30)

**Summary response:** average rating (visible only), total count, visible count, rating breakdown, recent tag highlights — **hidden reviews excluded** from averages/lists.

### Admin endpoints (`AdminReviewsController` — tag `admin`, **ADMIN only**)

| Method  | Path                                   | SDK                                  |
| ------- | -------------------------------------- | ------------------------------------ |
| `GET`   | `/api/v1/admin/reviews`                | `api.admin.listReviews(query?)`      |
| `PATCH` | `/api/v1/admin/reviews/:id/moderation` | `api.admin.moderateReview(id, body)` |

**Admin list filters:** `page`, `limit`, `isHidden`, `rating`, `reviewerId`, `revieweeId`, `orderId`

**Moderation body:** `{ isHidden: boolean, adminNote?: string }`

Swagger: `http://localhost:4000/docs` (tags `reviews`, `admin`).

---

## 5. User UI

| Component                | Location                                          | Behavior                                                 |
| ------------------------ | ------------------------------------------------- | -------------------------------------------------------- |
| `order-review-panel.tsx` | Integrated in `accepted-order-details-drawer.tsx` | Shown for **DELIVERED** orders when reviewee is known    |
| `UserReviewSummaryLine`  | Same drawer (counterparty header area)            | Loads `getUserSummary` — stars + average + visible count |

**Review form features:**

- Star rating selector (1–5)
- Optional comment textarea
- Toggle preset tags (`communicative`, `careful`, `on_time`, `clear_details`)
- **Already reviewed** state via `getMineForOrder`
- Submit calls `createForOrder`; success disables re-submit

**Honest notice** (`app.reviews.notice` in i18n): reviews are user-submitted trust signals — they do **not** guarantee safety, delivery quality, item legality, refund, payout, insurance, or future behavior.

---

## 6. Admin UI

| Component                       | Location                             | Behavior                                              |
| ------------------------------- | ------------------------------------ | ----------------------------------------------------- |
| `admin-reviews-queue-panel.tsx` | `AdminOperationsDashboard` on `/app` | **ADMIN** only (panel hidden for non-admin operators) |

**Queue features:**

- Paginated list (50 per page)
- Filters: hidden status, rating, reviewer ID, reviewee ID, order ID
- Per-row **Hide / Unhide** moderation with optional admin note
- Shows rating, tags, comment snippet, roles, timestamps, moderation metadata

**Moderation semantics:**

- Hidden reviews remain in the database — **not deleted**
- Hidden reviews are **excluded** from normal user summary/list endpoints (`isHidden: false` filter)
- Admin list can show all reviews including hidden (`isHidden` filter)

---

## 7. Notifications

In-app only — **no email, SMS, or push**.

| Event                      | Recipient    | Type                                    |
| -------------------------- | ------------ | --------------------------------------- |
| New visible review created | **Reviewee** | `INFO` — “New delivery review received” |
| Admin hides review         | **Reviewer** | `INFO` — “Your review was hidden”       |
| Admin unhides review       | **Reviewer** | `INFO` — “Your review is visible again” |

Entity type: `SYSTEM`. Links to `/app`. Copy explicitly frames reviews as user-submitted trust signals / content moderation — not legal judgment.

Demo seed **does not** dispatch review notifications (reviews inserted directly). Live API creates notifications on submit and moderation.

---

## 8. Demo seed

**Script:** `apps/api/scripts/seed-demo.ts` → `seedDemoReviews()`  
**Command:** `pnpm --dir apps/api seed:demo` (local/dev only)

| Item             | Detail                                                                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Count**        | Up to **5 reviews** on fresh seed (3 delivered demo orders)                                                                                 |
| **Order status** | **DELIVERED only** — query filters `DeliveryOrderStatus.DELIVERED`                                                                          |
| **Layout**       | Order 1: bidirectional visible (Sender↔Wayler) · Order 2: bidirectional visible · Order 3: one **hidden** moderation sample (Sender→Wayler) |
| **Tags**         | Includes `communicative`, `careful`, `on_time`, `clear_details` across visible rows                                                         |
| **Idempotency**  | Skips rows matching unique `(orderId, reviewerId, revieweeId)`                                                                              |
| **Safety**       | Refuses production; requires env passwords; demo marker text on all rows                                                                    |

Console summary prints `reviews:` count after seed completes.

---

## 9. Migration / deploy note

| Migration                                 | Purpose                                                            |
| ----------------------------------------- | ------------------------------------------------------------------ |
| `20260628190000_review_rating_foundation` | `Review` model, `ReviewPartyRole` enum, indexes, unique constraint |

**Deploy / Render:**

- Apply migrations **before** review endpoints are usable: `pnpm --dir apps/api db:deploy` (or `prisma migrate deploy`)
- If Render start command already runs `prisma migrate deploy` before `node dist/main.js`, **no change required** for this migration alone
- Local dev: `pnpm --dir apps/api db:migrate`

---

## 10. Safety / honesty limits

Repeat for every demo and investor walkthrough:

1. **Reviews are user-submitted trust signals** — not verified facts about identity, safety, or delivery outcomes.
2. **Wayly does not verify item legality** from review content or tags.
3. **Reviews do not guarantee** safety, delivery quality, punctuality, or future behavior.
4. **Reviews do not guarantee** refund, payout, insurance, escrow resolution, or legal protection.
5. **Admin moderation is content moderation** — hide/unhide and notes are operational records, **not legal judgments** or automatic account enforcement.
6. **Hidden reviews** are omitted from public summary/list views but remain in the database for operator audit.

See also: [payment-and-dispute-safety-checkpoint.md](./payment-and-dispute-safety-checkpoint.md), [public-guidance-and-safety-checkpoint.md](./public-guidance-and-safety-checkpoint.md)

---

## 11. Manual verification checklist

- [ ] Verified user can submit a review on a **DELIVERED** order they participated in
- [ ] User **cannot** submit a review on draft / open / accepted / in-transit / cancelled / **disputed** orders
- [ ] Duplicate review for same order + reviewee returns conflict
- [ ] Self-review is blocked server-side
- [ ] Reviewee receives in-app notification after new review (live API, not seed)
- [ ] `GET .../users/:id/summary` and `GET .../users/:id` return aggregates/lists (hidden excluded)
- [ ] Hidden reviews do not appear in user summary average or public list
- [ ] Admin can list, filter, hide, and unhide reviews with optional admin note
- [ ] Reviewer receives in-app notification on hide/unhide
- [ ] `pnpm --dir apps/api seed:demo` creates up to **5** reviews on DELIVERED demo orders (re-run idempotent)
- [ ] Payment, dispute, order lifecycle, KYC, and support ticket behavior unchanged

---

## Related docs

- [marketplace-product-checkpoint.md](./marketplace-product-checkpoint.md) — accepted order drawer, trust UX
- [admin-operations-checkpoint.md](./admin-operations-checkpoint.md) — Operations Center panels
- [support-notifications-demo-checkpoint.md](./support-notifications-demo-checkpoint.md) — in-app notifications + demo seed
- [admin-operations-center.md](./admin-operations-center.md) — full admin reference
- [README.md](../README.md) — milestone history and local dev setup
