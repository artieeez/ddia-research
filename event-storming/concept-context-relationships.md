# Concept: Context Relationship Patterns

> Strategic DDD defines formal patterns for how bounded contexts relate to each other.
> Choosing the right pattern determines how much coupling you accept between teams and systems.

---

## The Context Map

A **Context Map** is a diagram showing how bounded contexts connect. Each connection has a
**relationship pattern** — a label describing the nature of the dependency, power dynamic, and
technical coupling. These patterns come from Eric Evans' *Domain-Driven Design* (2004).

---

## Relationship Patterns

### 1. Partnership

Two contexts collaborate closely, with mutual influence and shared success criteria. Both teams
coordinate changes and adapt together.

| Aspect | Description |
|--------|-------------|
| **Coupling** | High coordination, low technical coupling |
| **Power dynamic** | Equal — neither dominates |
| **Change impact** | Negotiated between teams |
| **Contract style** | Jointly evolved |

**Example:** The Ordering and Pricing teams work together to define how discounts are calculated.
Neither imposes on the other. They meet weekly to align.

**When to use:** Teams with shared goals, co-located, or in the same value stream.

**When NOT to use:** When teams have different priorities, different release cadences, or are in
different organizations.

---

### 2. Shared Kernel

Two contexts share a subset of the domain model — literally sharing code or a library for a common
concept. Both teams maintain it together.

| Aspect | Description |
|--------|-------------|
| **Coupling** | High — changes to the kernel affect both contexts |
| **Power dynamic** | Equal — both teams must agree on kernel changes |
| **Change impact** | Requires coordination for every kernel change |
| **Contract style** | Shared code (library, package, module) |

**Example:** Shopping and Ordering both use a shared `Money` value object and `Address` value
object. They agree these concepts mean the same thing in both contexts and maintain them together.

**Danger:** The shared kernel is the **easiest pattern to abuse**. It's tempting to share
everything, but every shared concept is a coordination point. If you find yourself sharing
entities with behavior, you're probably creating a monolith wearing DDD clothing.

**When to use:** Only for very stable, small, truly shared concepts (value objects, identifiers,
standard types). Narrow scope is key.

**When NOT to use:** If teams can't easily coordinate, or if the shared concept is likely to
diverge in meaning across contexts.

---

### 3. Customer/Supplier

One context (the Supplier) provides a service to another (the Customer). The Supplier determines
the interface. The Customer consumes what's available.

| Aspect | Description |
|--------|-------------|
| **Coupling** | Customer depends on Supplier's contract |
| **Power dynamic** | Supplier has more power — sets the contract |
| **Change impact** | Supplier changes may break Customer; Customer requests influence Supplier's roadmap |
| **Contract style** | API, event schema, or published language defined by Supplier |

**Example:** Fulfillment (Supplier) provides a `ShipmentStatusChanged` event. Ordering (Customer)
subscribes to it to trigger `CapturePayment`. Ordering must adapt to whatever Fulfillment
publishes.

**When to use:** When one context naturally depends on another, and the upstream has the domain
expertise to define what it exposes.

**When NOT to use:** When the downstream has strict needs the upstream can't or won't accommodate.

**Variants:**

- **Open Host Service:** The Supplier exposes a rich, well-documented API designed for multiple
  consumers. Think REST APIs with versioning, or event streams with well-defined schemas.
- **Published Language:** The Supplier publishes events or documents in a standardized format
  (JSON Schema, Avro, Protobuf). Consumers interpret the language without direct coupling to
  the Supplier's internals.

Most Event Storming-based systems use **Customer/Supplier with Published Language** — contexts
communicate via domain events with well-defined schemas.

---

### 4. Conformist

The downstream context has no influence over the upstream. It simply adapts to whatever the
upstream provides, exactly as-is.

| Aspect | Description |
|--------|-------------|
| **Coupling** | Asymmetric — downstream fully coupled to upstream |
| **Power dynamic** | Upstream has all power; downstream conforms |
| **Change impact** | Any upstream change may break the downstream |
| **Contract style** | The upstream's exact model (no translation layer) |

**Example:** An analytics context consuming events from a legacy monolith it can't change. It
accepts the monolith's event schema verbatim, even if the naming is awkward or the payload is
bloated.

**When to use:** When the upstream is a third-party system, an unchangeable legacy system, or a
team with no incentive to accommodate you. Also useful when the cost of translation exceeds the
benefit.

**When NOT to use:** When you have the ability to influence the upstream contract — you're
accepting unnecessary coupling.

**Trade-off:** Low implementation cost (no translation), high fragility (upstream changes hit you
directly).

---

### 5. Anti-Corruption Layer (ACL)

The downstream context translates the upstream's model into its own model through an explicit
translation layer. The ACL "cleanses" the upstream's concepts and protects the downstream from
upstream changes.

| Aspect | Description |
|--------|-------------|
| **Coupling** | Low — only the ACL touches the upstream model |
| **Power dynamic** | Upstream has power; downstream protects itself |
| **Change impact** | Upstream changes only affect the ACL, not the downstream domain |
| **Contract style** | Upstream model (raw) → ACL translates → downstream's own model |

**Example:** A modern Returns context consuming events from a legacy ERP. The ERP publishes
`ERP_ORDER_FULFILLMENT_COMPLETED` with 57 fields. The ACL translates this into `OrderDelivered`
with only the 4 fields Returns actually needs.

**When to use:** When consuming from legacy systems, third-party APIs with unstable contracts,
or contexts with incompatible models.

**When NOT to use:** When you control both sides of the relationship — use a Published Language
instead. ACLs add cost and latency.

**Implementation:** The ACL is often a separate service or module with:
- Adapters that consume upstream events/DTOs
- Translation logic that maps upstream concepts to downstream concepts
- Its own tests that verify translation correctness

---

### 6. Separate Ways

The two contexts have no relationship at all. They don't communicate. They solve similar problems
independently with their own models.

| Aspect | Description |
|--------|-------------|
| **Coupling** | None |
| **Power dynamic** | None |
| **Change impact** | None |
| **Contract style** | None |

**Example:** The Shopping context's product catalog and the Returns context's "returnable item"
checklist. They both reference products, but they don't share data — they duplicate what they need.

**When to use:** When the cost of integration exceeds the benefit of coordination. Duplication is
often cheaper than the wrong integration.

**When NOT to use:** When the contexts depend on the same truth (e.g., order state, payment status)
— going Separate Ways on transactional data creates inconsistency.

---

## Choosing the Right Pattern

| Situation | Pattern |
|-----------|---------|
| Both teams willing to collaborate closely | Partnership |
| Small, stable concept both sides need | Shared Kernel |
| Upstream provides, downstream consumes; upstream sets contract | Customer/Supplier |
| Upstream won't change; downstream just deals with it | Conformist |
| Upstream model is toxic/legacy; downstream needs protection | Anti-Corruption Layer |
| Integration cost > integration benefit | Separate Ways |

---

## Patterns in Our E-Commerce System

| Relationship | Pattern | Why |
|-------------|---------|-----|
| Shopping → Ordering | Customer/Supplier + Published Language | Shopping publishes `CheckoutInitiated` event. Ordering consumes it. Shopping defines the event schema. |
| Ordering → Fulfillment | Customer/Supplier + Published Language | Ordering publishes `OrderConfirmed`. Fulfillment reacts. Ordering defines the event schema. |
| Returns → Ordering | Customer/Supplier + Published Language | Returns reads `OrderDelivered` from Ordering and sends `RefundIssued` back. Bidirectional event flow. |

None of our contexts need a Conformist or ACL at this scale — they're all within the same system
and can agree on event schemas. If we were integrating with a third-party payment processor with
an awkward API, that's where an ACL would appear.

---

## Anti-Patterns

- **Shared Kernel sprawl:** Sharing everything. You've lost the point of bounded contexts — now
  you have a distributed monolith with coordination overhead.
- **ACL without need:** Building translation layers between contexts you control. Just agree on a
  contract — the ACL is for things you can't change.
- **Conformist by default:** Accepting upstream contracts without questioning whether you can
  influence them. Always try Partnership or Customer/Supplier first.
- **Published Language as an ACL:** An event schema is a contract, not an ACL. It doesn't translate
  — it defines. An ACL translates an *existing* foreign model into your own.

---

## References

- Evans, Eric. *Domain-Driven Design: Tackling Complexity in the Heart of Software*. 2004.
- Vernon, Vaughn. *Implementing Domain-Driven Design*. 2013.
- Brandolini, Alberto. *Introducing Event Storming*. 2013.
