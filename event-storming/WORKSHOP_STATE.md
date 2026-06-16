# Event Storming Workshop State

> **Domain:** B2C E-Commerce  
> **Scope:** Browsing → Cart → Checkout → Fulfillment → Returns  
> **Status:** Phase 1 ✅, Phase 2 ✅, Phase 3 ✅, Phase 4 ✅  
> **Last updated:** Workshop complete

---

## Completed Phases

### Phase 0 — Methodology Overview ✅
- Established the sticky note legend (orange=event, blue=command, small yellow=actor, green=read model, purple=policy, pink=external system, hot pink=hotspot)
- Defined the 4-phase workshop structure
- Documented in: `event-storming/00-methodology.md`

### Phase 1 — Big Picture: Domain Events ✅
- Discovered 26 domain events across 5 journey phases (ProductBookmarked was merged into ProductLiked)
- All events in past tense ("something that already happened")
- Excalidraw diagram generated

### Phase 2 — Process Modeling ✅
- 26 events: all have command, actor, read model, and external system
- 8 policies defined for automated reactions
- 0 hotspots (clean run)
- Excalidraw process flow diagram generated

### Phase 3 — Design Level: Aggregates ✅
- 6 aggregates extracted from command/event clusters
- 3 events classified as advisory (no transactional aggregate needed)
- Invariants, lifecycle states, and guarded commands defined for each aggregate
- Excalidraw aggregate diagram generated

### Phase 4 — Bounded Contexts ✅
- 6 aggregates grouped into 4 bounded contexts: Shopping, Ordering, Fulfillment, Returns
- Context relationships defined as Customer/Supplier with Published Language
- Subdomain classification: Core (Ordering), Supporting (Shopping, Returns), Generic (Fulfillment)
- Excalidraw bounded context map generated

**Actors discovered:**
- Human: `Customer`, `WarehouseWorker`, `ShippingCarrier`
- Policy: `CartAbandonmentPolicy`, `PaymentAuthorizationPolicy`, `PaymentCapturePolicy`, `OrderConfirmationPolicy`, `FulfillmentTriggerPolicy`, `InventoryReservationPolicy`, `ReturnEvaluationPolicy`, `RefundIssuancePolicy`

**Concepts documented:**
- `event-storming/concept-policy.md` — What a policy is (and isn't)
- `event-storming/concept-intent-vs-state.md` — Why redundant-seeming events have value
- `event-storming/concept-context-relationships.md` — DDD context relationship patterns (Partnership, Shared Kernel, Customer/Supplier, Conformist, ACL, Separate Ways)

---

## Phase 3 Results: 6 Aggregates

| # | Aggregate | Root | Events | Lifecycle |
|---|-----------|------|--------|-----------|
| 1 | Cart | `Cart` | 4 | Active → Abandoned |
| 2 | Order | `Order` | 6 | Draft → Placed → Confirmed |
| 3 | Payment | `Payment` | 2 | Authorized → Captured |
| 4 | Inventory | `InventoryItem` | 1 | (quantity-based) |
| 5 | Shipment | `Shipment` | 5 | Req → Pkd → Shp → Del |
| 6 | Return | `Return` | 5 | Req → Apv → Rcv → Ref |

**Advisory events (no aggregate):** ProductSearchPerformed, ProductViewed, ProductLiked

**Cross-aggregate coordination** (eventual consistency via policies):
- `OrderPlaced` → `AuthorizePayment` → `PaymentAuthorized` → `ConfirmOrder`
- `OrderConfirmed` → `RequestFulfillment` → `ReserveInventory`
- `OrderShipped` → `CapturePayment`
- `OrderDelivered` enables `RequestReturn` → `IssueRefund` → refund via Payment

---

## Phase 4 Results: 4 Bounded Contexts

| Context | Aggregates | Subdomain | Relationships |
|---------|-----------|-----------|---------------|
| **Shopping** | Cart + 3 advisory events | Supporting | → Ordering (Customer/Supplier) |
| **Ordering** | Order, Payment | ★ Core | → Fulfillment, ↔ Returns |
| **Fulfillment** | Shipment, InventoryItem | Generic | |
| **Returns** | Return | Supporting | ↔ Ordering |

All context relationships use **Customer/Supplier with Published Language** via domain events.

**External systems shared across contexts:** PaymentGateway (Ordering, Returns), ShippingCarrier (Fulfillment)

---

## Phase 1 Results: 26 Domain Events

### Browsing & Discovery
1. `ProductSearchPerformed` — Customer searched with keyword/filters
2. `ProductViewed` — Customer opened a product detail page
3. `ProductLiked` — Customer liked/favorited a product (social/algorithmic signal)

### Cart Management
4. `ProductAddedToCart` — Customer added product with quantity to cart
5. `ProductRemovedFromCart` — Customer removed an item from cart
6. `CartItemQuantityChanged` — Customer adjusted quantity of a cart item
7. `CartAbandoned` — Customer left cart inactive without checking out

### Checkout & Payment
8. `CheckoutInitiated` — Customer moved from cart into checkout flow
9. `ShippingAddressProvided` — Customer provided/selected shipping destination
10. `PaymentMethodSelected` — Customer chose payment method
11. `OrderReviewed` — Customer reviewed final order summary
12. `OrderPlaced` — Customer confirmed; order exists as binding commitment
13. `PaymentAuthorized` — Payment gateway confirmed funds available and reserved
14. `PaymentCaptured` — Payment was actually transferred
15. `OrderConfirmed` — All checks passed; order accepted for fulfillment

### Fulfillment
16. `FulfillmentRequested` — Order handed over to warehouse
17. `InventoryReserved` — Stock set aside for this order
18. `OrderPicked` — Warehouse worker collected items from shelves
19. `OrderPacked` — Items boxed and labeled
20. `OrderShipped` — Package handed to carrier; tracking number assigned
21. `OrderDelivered` — Carrier confirmed successful delivery

### Post-Purchase
22. `ReturnRequested` — Customer requested to return an item
23. `ReturnApproved` — Return accepted (meets policy criteria)
24. `ReturnRejected` — Return denied (policy, condition, etc.)
25. `ReturnReceived` — Warehouse confirmed receipt of returned item
26. `RefundIssued` — Money sent back to customer's payment method

---

## Resolved Hotspots

- **Cart vs. Buy Now flow:** Chose standard cart flow (not express/one-click)
- **Failed payments:** Deferred — keeping happy path for now
- **Fulfillment request meaning:** Internal warehouse signal (not external carrier request)

---

## Current Phase: Workshop Complete 🎉

The Event Storming workshop is finished. All 4 phases are documented.

Next steps:
1. Strategic DDD — Refine subdomain classification, identify Core Domains for investment
2. Tactical DDD — Model each aggregate in detail (entities, value objects, domain services)
3. CQRS/ES Architectures — Design event stores, projections, and command handlers per bounded context

---

## Document Map

```
event-storming/
├── 00-methodology.md                       # Legend, workshop phases, domain scope
├── 01-domain-events.md                     # All 26 events + inventory table ✅
├── 02-process-modeling.md                  # Commands, actors, read models, policies, external systems ✅
├── 03-aggregates.md                        # 6 aggregates with invariants, lifecycle, guarded commands ✅
├── 04-bounded-contexts.md                  # 4 contexts with relationship map, subdomain types ✅
├── concept-policy.md                       # What a policy is (and isn't)
├── concept-intent-vs-state.md              # Why segregated events have value
├── concept-context-relationships.md        # DDD context relationship patterns (6 patterns)
└── diagrams/
    ├── big-picture-events.excalidraw       # Phase 1 visual ✅
    ├── process-modeling.excalidraw         # Phase 2 visual ✅
    ├── design-level-aggregates.excalidraw  # Phase 3 visual ✅
    └── bounded-context-map.excalidraw      # Phase 4 visual ✅
```

---

## How to Resume

The Event Storming workshop is complete. To continue the DDD journey:

### Prompt to start Strategic DDD:
> "Let's start Strategic DDD. We have 4 bounded contexts from the Event Storming workshop in `event-storming/04-bounded-contexts.md`. Let's refine subdomain classification and identify which are truly Core, Supporting, and Generic."

### Prompt to start Tactical DDD:
> "Let's do Tactical DDD on the [aggregate name] aggregate. We have the invariants and lifecycle from `event-storming/03-aggregates.md`. Let's model the entities, value objects, and domain services."

## CRITICAL: Facilitation Rules

This is a **facilitated, step-by-step workshop** — not an auto-fill exercise. The user is the domain expert; the agent is the facilitator. Follow these rules strictly:

1. **One section at a time.** Start with Browsing & Discovery. Finish it before moving to Cart, then Checkout, etc.

2. **One event at a time within each section.** Present ONE event's command/actor/read-model/external-system, describe your reasoning, and ASK the user if it looks right. Do NOT fill multiple events in one go.

3. **Let the user drive decisions.** The event names already exist from Phase 1. But commands, actors, read models, and external systems are the user's to define. Propose but don't impose.

4. **Capture hotspots.** When the user is unsure, or there's an ambiguity, mark it as a hotspot and move on. Don't dwell.

5. **Policies come last.** After all events in a section have commands/actors/read-models/external-systems, ask about automated reactions.

6. **Update documents after each section is confirmed** — don't wait until the end.

### Excalidraw Skill Reference
The Excalidraw skill is loaded at `.cursor/skills/excalidraw-studio/SKILL.md`. Use it whenever generating `.excalidraw` files.
