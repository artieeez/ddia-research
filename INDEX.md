# DDIA Research

Personal lab for experimenting with ideas from [*Designing Data-Intensive Applications*](https://dataintensive.net/) (DDIA). Topics and projects may change over time; the current focus is **CQRS**, **event sourcing**, and **read models** on a deliberately mundane B2C e-commerce domain — so attention stays on data architecture, not business novelty.

External services are expected to run in the author's personal cluster.

## Quick links

| Document | Purpose |
|----------|---------|
| [state.md](state.md) | **Living snapshot** — what we're reading, building, and planning next |
| [readme.MD](readme.MD) | Original repo intent and topics in focus |
| [docs/](docs/) | Deeper write-ups and ADRs (as they accumulate) |
| [docs/book-club/next-session.md](docs/book-club/next-session.md) | Proposed topics for the next book club meeting |
| [obsidian-vault/](obsidian-vault/) | Obsidian notes — meeting logs and study/reading capture |

## Repository map

```
ddia-research/
├── INDEX.md              ← you are here
├── state.md              ← keep updated
├── obsidian-vault/       ← Obsidian notes (meetings, study)
├── event-storming/       ← domain discovery (Event Storming workshop)
└── ecommerce/            ← Nx + NestJS implementation lab
```

More top-level folders may appear later (other domains, storage experiments). For now, `ecommerce/` is the only implementation workspace.

## Topics in focus

1. CQRS
2. Event Sourcing
3. Read models

## Where to drill down

### Domain model — `event-storming/`

Event Storming workshop output: 26 domain events, 6 aggregates, 4 bounded contexts (Shopping, Ordering, Fulfillment, Returns).

| Start here | Then |
|------------|------|
| [WORKSHOP_STATE.md](event-storming/WORKSHOP_STATE.md) | Workshop summary and document map |
| [04-bounded-contexts.md](event-storming/04-bounded-contexts.md) | Context map and relationships |
| [03-aggregates.md](event-storming/03-aggregates.md) | Aggregates, invariants, lifecycles |
| `event-storming/diagrams/` | Excalidraw visuals |

### Implementation — `ecommerce/`

Nx monorepo with a NestJS API and one library per bounded context. Domain layer (aggregates, value objects, repository interfaces) is in place; infrastructure and event sourcing are not yet wired.

| Path | Contents |
|------|----------|
| `ecommerce/apps/api/` | NestJS entrypoint |
| `ecommerce/libs/shopping/` | Cart aggregate |
| `ecommerce/libs/ordering/` | Order, Payment aggregates |
| `ecommerce/libs/fulfillment/` | Shipment, InventoryItem aggregates |
| `ecommerce/libs/returns/` | Return aggregate |
| `ecommerce/libs/shared/` | Shared domain primitives and contracts |

Run the API: `cd ecommerce && npx nx serve api`
