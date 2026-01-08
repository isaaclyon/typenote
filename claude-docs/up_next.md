# Up Next

## Custom Object Types with Inheritance

**Status:** In Progress (Day 1 Complete)
**Plan:** `docs/plans/2026-01-07-custom-object-types-design.md`

Capacities-style type inheritance enabling `Book` → `Media`, `Employee` → `Person`, etc.

### Implementation Phases (TDD)

- [x] Day 1: API schema tests → implementation (`packages/api/src/objectType.ts`) ✅
- [x] Day 1: Drizzle schema + migration (`0004_add_object_type_inheritance.sql`) ✅
- [ ] Day 2: Inheritance validation tests → `validateInheritance()`
- [ ] Day 2: Schema resolution tests → `resolveTypeSchema()` + cache
- [ ] Day 2: Update CRUD with validation + cache invalidation
- [ ] Day 3: Property validation tests with inheritance
- [ ] Day 3: Integration tests (object creation with inherited types)
- [ ] Day 4: Polish, manual testing, built-in type defaults

### Key Changes

| File                                         | Lines |
| -------------------------------------------- | ----- |
| `packages/api/src/objectType.ts`             | ~30   |
| `packages/storage/src/schema.ts`             | ~10   |
| `drizzle/0004_*.sql`                         | ~10   |
| `packages/storage/src/objectTypeService.ts`  | ~200  |
| `packages/storage/src/propertyValidation.ts` | ~20   |
| Tests                                        | ~400  |

---

## Backlog

### Quality & Performance

- [ ] Improve mutation testing scores (currently: storage 79.9%, api 52.1%)
- [x] ~~Add architectural boundary tests (dependency-cruiser)~~ ✅
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future Phases)

- [ ] Add Markdown export (in addition to JSON)
- [ ] Relations semantics finalization

---

## Attachments/Media System

**Status:** Ready for Implementation (Plan Approved)
**Plan:** `.claude/plans/mellow-cuddling-thacker.md`

Images + Documents support with content-addressed storage, global deduplication, and 30-day orphan cleanup.

### Implementation Phases (TDD) — 31-41 hours total

- [ ] Phase 1: API Contracts (2-3h) — Zod schemas, error codes, block type
- [ ] Phase 2: Database Schema (1h) — `attachments` + `block_attachments` tables
- [ ] Phase 3: File Service (2-3h) — FileService interface + implementations
- [ ] Phase 4: Attachment Service (8-10h) — CRUD, link/unlink, cleanup
- [ ] Phase 5: Block Patch Integration (3-4h) — Handle attachment blocks
- [ ] Phase 6: IPC Layer (2-3h) — Upload/get/list handlers
- [ ] Phase 7: CLI Commands (2-3h) — attachment upload/list/cleanup
- [ ] Phase 8: Renderer Integration (10-12h) — TipTap node, upload UI
- [ ] Phase 9: Garbage Collection (1-2h) — Daily cleanup scheduler

### Key Files to Create

| File                                                | Purpose          |
| --------------------------------------------------- | ---------------- |
| `packages/api/src/attachment.ts`                    | Zod schemas      |
| `packages/storage/src/fileService.ts`               | File abstraction |
| `packages/storage/src/attachmentService.ts`         | Business logic   |
| `packages/storage/drizzle/0004_add_attachments.sql` | Migration        |

---

## Recently Completed

### Task Management ✅ (2026-01-07)

Task as 6th built-in type with taskService. TDD implementation: 36 API tests, 24 taskService tests, 3 built-in type tests. Full query suite (today's tasks, overdue, upcoming, inbox, by status/priority) + Daily Note integration via `getTasksByDueDate()`.

### Global Tags System ✅ (2026-01-07)

Full implementation with 5 phases: API contracts (53 tests), database schema, tagService (37 tests), getObject() integration (4 tests), full verification. Junction table pattern for many-to-many relationships. All objects now have implicit `tags` property.

### Wiki-Link & Mention Suggestions ✅ (2026-01-07)

TipTap autocomplete extension with `[[` and `@` triggers. Includes search filtering, create-new option, click navigation, keyboard nav. 21 new tests (14 SuggestionPopup + 4 RefSuggestion + 3 RefNode).

### Architectural Boundary Tests ✅ (2026-01-07)

Added dependency-cruiser with 8 rules enforcing package hierarchy. Run `pnpm deps:check`.

### Template Integration Tests ✅ (2026-01-07)

6 new tests verifying template application (5 integration + 1 E2E).

### Template System ✅ (2026-01-06)

Complete 7-phase implementation with 85 new tests + 2 bug fixes.
