# Payment & dispute safety checkpoint — honesty rules for demos and docs

**Last updated:** June 2026  
**Scope:** User-facing copy, admin operator tools, and mock API behavior. **Not legal advice.** **Not production payment compliance.**

Use this doc when preparing demos, investor materials, or support scripts so Wayly is described accurately.

---

## Core honesty rules

| Claim                                            | Allowed today?                    |
| ------------------------------------------------ | --------------------------------- |
| Mock/manual payment flow for testing             | ✅ Yes — clearly labeled in UI    |
| Payment status records in database               | ✅ Yes — metadata/status tracking |
| Admin payment **review decisions** (notes/enums) | ✅ Yes — **metadata only**        |
| Real Stripe escrow holding funds                 | ❌ No                             |
| Real refund or payout execution                  | ❌ No                             |
| Guaranteed refund to Sender                      | ❌ No                             |
| Guaranteed payout to Wayler                      | ❌ No                             |
| Insurance or carrier liability                   | ❌ No                             |
| Automated fraud detection                        | ❌ No                             |
| Message moderation / blocking in chat            | ❌ No                             |
| Legal advice in product copy                     | ❌ No                             |

---

## Payment flow (current)

### User-facing (Sender / Wayler)

- **Mock buttons** (when `demoToolsEnabled`): authorize, hold escrow, release — update **payment intent status fields** only
- **Production default:** mock payment controls hidden unless `NEXT_PUBLIC_ENABLE_DEMO_TOOLS=true`
- **Transparency UI:** `PaymentTransparencyNote` (collapsed by default) — states mock/manual flow, no real provider money movement, no guaranteed refund/payout
- **Wayler view:** read-only payment status on accepted orders; no payout execution

### Admin-facing

- **Payment review v1:** mark manual review, clear review, record refund decision, record release decision
- **Effect:** updates `adminReview*` metadata on payment intent — **does not** call Stripe or move funds
- **UI:** admin payments queue includes transparency note; action labels emphasize decision-only

### What “escrow” means in the product today

- Schema/UI may use escrow **labels** and timestamps for workflow simulation
- **No funds** are held with a payment provider
- Future real provider integration is explicitly **out of scope** for the current local stack

---

## Dispute flow (current)

### User-facing

- Senders/Waylers can **open disputes**, send messages, add evidence metadata (title, description, optional URL)
- **Guidance only:** `DisputeGuidanceNote`, `DisputeEvidenceGuidance`, `DisputeEvidenceFormHints`, `ConversationSafetyNote`
- Guidance encourages: chat first, keep evidence in Wayly, no private payment details, clear facts
- **No automated settlement** — opening a dispute does not trigger refund/release

### Admin-facing

- **Resolve dispute v1:** resolution note + optional outcome enum stored on dispute record
- Outcome labels (e.g. sender favored / wayler favored) map to **metadata enums** — **not** payment execution
- **No** order cancel, user ban, or payout side effects from resolve action

### Evidence

- Evidence is **user-submitted metadata** stored server-side when added through the app
- Guidance warns against passwords, payment details, illegal content
- **Not** a certified evidence chain of custody for court proceedings

---

## Order & proof honesty

- **Proof of delivery:** note and/or confirmation code — helps document handoff; not photo/signature capture yet
- **Delivery proof guidance:** reminds users to confirm only after checking details — not a quality guarantee
- **Order action guidance:** explains what buttons mean (start transit, mark delivered, cancel) — does not block actions or add new validation

---

## KYC & verification (related trust boundary)

- User KYC is **mock/manual review** in local dev; admin approve/reject updates status fields
- **Verified Wayler badge** reflects approved KYC on listing payload — not third-party identity certification
- **No Sumsub/Stripe Identity webhooks** in admin operations today

---

## UI components carrying honesty copy

| Component                   | Audience                  | Key message                                           |
| --------------------------- | ------------------------- | ----------------------------------------------------- |
| `PaymentTransparencyNote`   | sender / wayler / admin   | mock flow, no real money, no guaranteed refund/payout |
| `DisputeGuidanceNote`       | sender / wayler / neutral | try chat first, evidence in Wayly                     |
| `DisputeEvidenceGuidance`   | dispute participants      | what to include / exclude                             |
| `DeliveryProofGuidance`     | sender / wayler           | proof helps document; confirm after checking          |
| `OrderActionGuidance`       | order actions             | action meaning + keep communication in Wayly          |
| `RestrictedItemsSafetyNote` | forms                     | restricted categories; no evasion advice              |
| `ConversationSafetyNote`    | chat                      | no off-platform payment; restricted items             |

Recent **guidance density pass** collapsed secondary panels by default — honesty copy remains available on expand.

---

## Future work required for real money

1. Stripe (or other) payment provider integration with idempotent webhooks
2. Connect/payout flows for Waylers with compliance review
3. Dispute outcomes **orchestrated** with payment state (refund/release) — not metadata-only
4. KYC provider integration with document review and audit trail
5. Legal/commercial review of terms, fees, and operator policies
6. Realtime payment/dispute notifications

---

## Demo script snippets (safe wording)

**Payments:**  
“Wayly tracks payment **status** for the delivery workflow. Today’s build uses a **mock manual flow** for development — no real card charges or escrow with a payment provider.”

**Disputes:**  
“Parties can escalate in-app with messages and evidence. Admins can **record a resolution** for operations tracking; that does **not** automatically move money.”

**Verified Wayler:**  
“This badge means the Wayler completed Wayly’s **identity verification step** on the platform — not a government or carrier certification.”

---

## Related docs

- [admin-operations-center.md](./admin-operations-center.md) — payment review endpoints
- [admin-operations-checkpoint.md](./admin-operations-checkpoint.md)
- [marketplace-product-checkpoint.md](./marketplace-product-checkpoint.md)
- [README.md](../README.md) — Payment and escrow foundation; Dispute and arbitration foundation
