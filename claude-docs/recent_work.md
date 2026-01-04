# Recent Work

## Latest Session (2026-01-04 - Phase 4 Indexing Side Effects)

### Phase 4 Complete — Refs and FTS Indexing

Wired up reference extraction and FTS updates within `applyBlockPatch()` transactions.

**Key changes:**

- `db.ts` — Added `atomic()` transaction wrapper using better-sqlite3 native transactions
- `indexing.ts` — Helpers for updating refs/FTS on block insert/update/delete
- `applyBlockPatch.ts` — Refactored to wrap all mutations in `db.atomic()`, call indexing functions
- `backlinks.ts` — Query inbound references to an object (`getBacklinks()`)
- `search.ts` — Full-text search for blocks (`searchBlocks()`)
- Added integration tests verifying refs/FTS consistency after patch operations

**Stats:** 229 tests in storage package, 231 total across all packages

---

## Previous Session (2026-01-04 - Phase 3 applyBlockPatch)

Phase 3: Implemented `applyBlockPatch()`, `getDocument()`, order keys, cycle detection, content extraction.

---

## Previous Session (2026-01-04 - Phase 2 Schema Fixes)

Fixed 4 critical schema issues after code review: idempotency composite PK, unique sibling order keys, FTS5 delete support, removed self-referential FK.

---

## Previous Session (2026-01-04 - Phases 1 & 2)

Phase 1: Core contracts (errors, blockPatch, notateDoc, patchValidation, ids). Phase 2: Storage schema (6 tables, migrations, db helpers).

---

## Completed Milestones

| Phase | Description                       | Date       |
| ----- | --------------------------------- | ---------- |
| 0     | Day 0 Setup                       | 2026-01-04 |
| 1     | Core Contracts                    | 2026-01-04 |
| 2     | Storage Schema + Migrations       | 2026-01-04 |
| 3     | applyBlockPatch() + getDocument() | 2026-01-04 |
| 4     | Indexing Side Effects (Refs/FTS)  | 2026-01-04 |
