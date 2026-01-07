# Recent Work

## Latest Session (2026-01-07 - Global Tags System Complete)

### Completed Global Tags System (Phases 3-5)

Finished implementing the tags system following strict TDD. Tests were written first, then implementation built to satisfy them.

**New Files:**

- `packages/storage/src/tagService.ts` — Tag service with 10 functions (CRUD, assign/remove, getObjectTags, findOrCreate)
- `packages/storage/drizzle/0003_add_tags.sql` — Migration for tags + object_tags tables

**Modified Files:**

- `packages/storage/src/objectService.ts` — Added `tags: Tag[]` to ObjectDetails, getObject() now includes tags
- `packages/storage/src/objectService.test.ts` — Added 4 tests for getObject() with tags
- `packages/storage/drizzle/meta/_journal.json` — Added migration entry

**Key Implementation Details:**

- Junction table pattern for many-to-many (object_tags)
- Idempotent assignTags/removeTags operations
- TagWithUsage type for listing with usage counts
- Read-back-from-DB pattern ensures consistent timestamp precision

**Test results:** 710 tests passing (447 storage + 263 API), all typechecks pass.

---

## Previous Session (2026-01-07 - Wiki-Link Suggestions)

Implemented autocomplete for `[[` wiki-links and `@` mentions in TipTap. New components: SuggestionPopup, RefSuggestion extension. 21 new tests.

---

## Previous Session (2026-01-07 - Tags Phase 1-2)

Started tags system with TDD. API contracts (53 tests) and database schema complete.

---

## Previous Session (2026-01-07 - Architectural Boundary Tests)

Added dependency-cruiser with 8 rules enforcing package hierarchy. Run `pnpm deps:check`.

---

## Completed Milestones

| Phase       | Description                       | Date       |
| ----------- | --------------------------------- | ---------- |
| 0           | Day 0 Setup                       | 2026-01-04 |
| 1           | Core Contracts                    | 2026-01-04 |
| 2           | Storage Schema + Migrations       | 2026-01-04 |
| 3           | applyBlockPatch() + getDocument() | 2026-01-04 |
| 4           | Indexing Side Effects (Refs/FTS)  | 2026-01-04 |
| 5           | Object Types + Daily Notes        | 2026-01-04 |
| 6           | Export/Import + Mutation Testing  | 2026-01-04 |
| 7           | Wire Desktop Shell + E2E Tests    | 2026-01-06 |
| Template    | Template System (7 phases)        | 2026-01-06 |
| Tests       | Template Integration Tests        | 2026-01-07 |
| DepCruise   | Architectural Boundary Tests      | 2026-01-07 |
| Suggestions | Wiki-Link & Mention Autocomplete  | 2026-01-07 |
| Tags        | Global Tags System (5 phases)     | 2026-01-07 |
