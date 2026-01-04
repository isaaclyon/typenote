# Recent Work

## Latest Session (2026-01-04 - Phase 2 Schema Fixes)

### Schema Critical Issues Fixed (Post Code Review)

After code review identified 4 critical issues, fixed all of them:

1. **Idempotency primary key** — Added composite `primaryKey({ columns: [objectId, key] })` to enforce uniqueness
2. **Unique sibling order keys** — Changed `index()` to `uniqueIndex()` on `(object_id, parent_block_id, order_key)`
3. **FTS5 delete support** — Removed contentless mode (`content=''`) so DELETE by block_id works
4. **Self-referential FK** — Removed (TypeScript circular reference issue); parent validity enforced in app code

**Known limitation:** SQLite unique indexes don't enforce uniqueness on NULL values. Root blocks (parent=NULL) need app-level enforcement in Phase 3.

**Test coverage:** 177 tests total (143 api, 11 core, 21 storage, 2 apps)

---

## Previous Session (2026-01-04 - Phase 2 Storage Schema)

Created storage schema: object_types, objects, blocks, refs, idempotency, fts_blocks tables. Added db.ts with createTestDb(), createFileDb(), closeDb(). Generated initial migration.

---

## Previous Session (2026-01-04 - Phase 1 Core Contracts)

Implemented Phase 1: errors.ts, blockPatch.ts, notateDoc.ts, patchValidation.ts in api; ids.ts in core.

---

## Completed Milestones

| Phase | Description                 | Date       |
| ----- | --------------------------- | ---------- |
| 0     | Day 0 Setup                 | 2026-01-04 |
| 1     | Core Contracts              | 2026-01-04 |
| 2     | Storage Schema + Migrations | 2026-01-04 |
