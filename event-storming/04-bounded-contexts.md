# Phase 4 — Bounded Contexts

> **Goal:** Group the 6 aggregates from Phase 3 into bounded contexts based on ubiquitous
> language and cohesion. Define the context relationships — who depends on whom, and how.

---

## Context Map

| Context | Aggregates | Events | Actors |
|---------|-----------|--------|--------|
| **Shopping** | `Cart` + 3 advisory events | ProductSearchPerformed, ProductViewed, ProductLiked, ProductAddedToCart, ProductRemovedFromCart, CartItemQuantityChanged, CartAbandoned | Customer, CartAbandonmentPolicy |
| **Ordering** | `Order`, `Payment` | CheckoutInitiated, ShippingAddressProvided, PaymentMethodSelected, OrderReviewed, OrderPlaced, PaymentAuthorized, PaymentCaptured, OrderConfirmed | Customer, PaymentAuthorizationPolicy, PaymentCapturePolicy, OrderConfirmationPolicy, PaymentGateway |
| **Fulfillment** | `Shipment`, `InventoryItem` | FulfillmentRequested, InventoryReserved, OrderPicked, OrderPacked, OrderShipped, OrderDelivered | WarehouseWorker, ShippingCarrier, FulfillmentTriggerPolicy, InventoryReservationPolicy |
| **Returns** | `Return` | ReturnRequested, ReturnApproved, ReturnRejected, ReturnReceived, RefundIssued | Customer, WarehouseWorker, ReturnEvaluationPolicy, RefundIssuancePolicy, PaymentGateway |

---

## Context Relationships

```
Shopping ───(Customer/Supplier)──→ Ordering ───(Customer/Supplier)──→ Fulfillment
                                        │                                   │
                                        │                                   │
                                        └────(Customer/Supplier)────────────┤
                                            (Refund execution flows back    │
                                             to Payment aggregate)          │
                                                                            │
                                      Returns ──────────────────────────────┘
                                       (guarded by OrderDelivered)
```

### 1. Shopping → Ordering (Customer/Supplier)

- **Type:** Published Language via domain events
- **Direction:** Shopping is upstream (supplier), Ordering is downstream (consumer)
- **Contract:** `CheckoutInitiated` event carries the cart snapshot. Ordering creates its Order in Draft.
- **Why not Shared Kernel?** Shopping and Ordering have different lifecycles and different teams could own them. Sharing only a well-defined event schema keeps them decoupled.
- **What Shopping provides:** cart contents, customer identity, item quantities
- **What Ordering needs:** the cart as input to `InitiateCheckout`

### 2. Ordering → Fulfillment (Customer/Supplier)

- **Type:** Published Language via domain events
- **Direction:** Ordering is upstream (supplier), Fulfillment is downstream (consumer)
- **Contract:** `OrderConfirmed` triggers `RequestFulfillment` via policy. `OrderShipped` triggers `CapturePayment`.
- **What Ordering provides:** confirmed order details that need to be picked/packed/shipped
- **What Fulfillment provides back:** `OrderShipped` notifies Ordering to capture payment

### 3. Returns → Ordering (Customer/Supplier)

- **Type:** Published Language via domain events
- **Direction:** Bidirectional. Returns validates against Order state. Refund execution flows back through Ordering's Payment aggregate.
- **Contract:** `OrderDelivered` is a prerequisite for `RequestReturn`. `RefundIssued` calls back into `Payment.CaptureRefund` or similar.
- **What Returns needs from Ordering:** order delivery status, original payment info
- **What Returns provides back:** refund instruction to Payment

### 4. Shared External Systems

Both **Ordering** and **Returns** integrate with `PaymentGateway`. Both **Fulfillment** and **Returns** reference the `WarehouseWorker` actor (same role, different context). `ShippingCarrier` is exclusive to Fulfillment.

---

## Communication Flow (Policy-Driven)

Each arrow is a policy reacting to a domain event:

```
Shopping                           Ordering                         Fulfillment
   │                                  │                                 │
   │──InitiateCheckout──────────────→│                                 │
   │                                  │──PlaceOrder                     │
   │                                  │──AuthorizePayment ──→ PG        │
   │                                  │──ConfirmOrder                   │
   │                                  │──RequestFulfillment────────────→│
   │                                  │                                 │──ReserveInventory
   │                                  │                                 │──Pick → Pack → Ship
   │                                  │←──OrderShipped ─────────────────│
   │                                  │──CapturePayment ──→ PG          │
   │                                  │                                 │──Delivery confirmed
   │                                                                     │
   │                               Returns                               │
   │                                  │←──OrderDelivered────────────────│
   │                                  │──RequestReturn                   │
   │                                  │──ApproveReturn / RejectReturn     │
   │                                  │──ReceiveReturn                   │
   │                                  │──IssueRefund ──→ PG              │
```

---

## Subdomain Classification

| Context | Subdomain Type | Why |
|---------|---------------|-----|
| **Shopping** | Supporting | Cart management is standard. Browsing events are analytics. Not a differentiator. |
| **Ordering** | Core | Checkout flow, order lifecycle, payment orchestration — the heart of the business. |
| **Fulfillment** | Generic | Warehouse operations (pick/pack/ship). Could be outsourced or off-the-shelf. |
| **Returns** | Supporting | Return policies are important but not what differentiates the business. |

These are initial judgments — as the business strategy becomes clearer, subdomain types may shift.

---

## Ubiquitous Language by Context

| Term | Shopping | Ordering | Fulfillment | Returns |
|------|---------|----------|-------------|---------|
| **Item** | Product in the catalog | Line item in an order | Physical SKU on shelf | Item being returned |
| **Cart** | Active basket of items | Checkout source | — | — |
| **Order** | — | Binding commitment from customer | Work request for warehouse | Reference for return eligibility |
| **Shipment** | — | — | Physical package journey | — |
| **Return** | — | — | Returned stock | Customer's refund process |
| **Payment** | — | Authorization + capture lifecycle | — | Refund execution |

---

## Design Notes

### Why Ordering and Payment are together

Order and Payment share a tight lifecycle coupling: `OrderPlaced` → `AuthorizePayment` → `PaymentAuthorized` → `ConfirmOrder` → `OrderShipped` → `CapturePayment`. Splitting them would introduce coordination overhead without clear benefit. In a larger system with multiple payment methods, subscriptions, or billing cycles, separating Payment into its own context would make sense — but at this scale, together is simpler.

### Why Returns is separate from Ordering

Returns has its own ubiquitous language (return window, item condition, approval criteria), its own policies, and its own lifecycle that starts *after* delivery. While it references Order data, it doesn't share the Order transaction boundary. The `OrderDelivered` event is the seam.

### Advisory events across contexts

The 3 advisory events (`ProductSearchPerformed`, `ProductViewed`, `ProductLiked`) live in Shopping but are consumed downstream by any context interested in analytics (recommendations, personalization, trending). They're fire-and-forget — no consumer ever blocks on them.

---

## Next Steps (workshop complete)

The Event Storming workshop is now finished. The output serves as input for:

1. **Strategic DDD** — Refine subdomain classification, identify Core Domains for investment
2. **Tactical DDD** — Model each aggregate in detail (entities, value objects, domain services)
3. **CQRS/ES Architectures** — Design event stores, projections, and command handlers per bounded context
