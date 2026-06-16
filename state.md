# State

> **Keep this file updated** as reading progress, implementation, or plans change. Agents should read it at the start of substantive work and patch it before finishing.

**Last updated:** 2026-06-16

## DDIA reading

| Item | Status |
|------|--------|
| Chapter 3 (2nd ed.) — Data Models and Query Languages | 📖 Next session — see [docs/book-club/next-session.md](docs/book-club/next-session.md) |
| Chapter 4 (2nd ed.) — Storage and Retrieval | ⏭️ Read after Ch. 3 discussion |
| 1st ed. chapter numbering | May differ; always note edition when citing |

Chapter 3 motivated the current direction: experiment with **event sourcing** and **read models** on a concrete domain.

## Domain modeling

| Item | Status |
|------|--------|
| Event Storming workshop (4 phases) | ✅ Complete |
| 4 bounded contexts defined | Shopping, Ordering, Fulfillment, Returns |
| Workshop artifacts | See [event-storming/WORKSHOP_STATE.md](event-storming/WORKSHOP_STATE.md) |

## Implementation (`ecommerce/`)

Nx + NestJS monorepo scaffolded from the Event Storming output.

| Item | Status |
|------|--------|
| NestJS API shell | ✅ `apps/api` |
| Bounded-context libs | ✅ shopping, ordering, fulfillment, returns |
| Domain aggregates & value objects | ✅ In progress / scaffolded per context |
| Repository interfaces | ✅ Defined, no adapters yet |
| Event store | ❌ Not started |
| Read-model projections | ❌ Not started |
| HTTP / application layer | ❌ Not started |

## Planned experiments

- **Event sourcing** — command handling, event store, projections per bounded context.
- **Multiple storage backends** — compare implementations across databases (NoSQL; possibly a graph DB for relationship-heavy read models).
- **Additional repo folders** — other domains or isolated storage experiments; none yet beyond `ecommerce/`.

## Current focus

Translate DDIA chapter 3 ideas (read models, storage/query trade-offs) into the e-commerce lab: design event stores and projections, then try the same patterns on different databases.

## Open questions

- Which event store / message bus for the first vertical slice?
- Which NoSQL (and graph?) stores to compare for read models?
- Happy-path only for now — payment failures and other hotspots deferred in the workshop.

## Related docs

- [INDEX.md](INDEX.md) — repository map
- [obsidian-vault/](obsidian-vault/) — Obsidian meeting logs and study notes
- [event-storming/](event-storming/) — full domain workshop
- [docs/book-club/next-session.md](docs/book-club/next-session.md) — next book club discussion prep
