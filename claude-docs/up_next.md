# Up Next

## Attachments/Media System

**Status:** In Progress (Phases 1-4 Complete, 119 new tests)
**Plan:** `~/.claude/plans/mellow-cuddling-thacker.md`

Images + Documents support with content-addressed storage, global deduplication, and 30-day orphan cleanup.

### Implementation Phases (TDD) — 31-41 hours total

- [x] Phase 1: API Contracts (2-3h) — Zod schemas, error codes, block type ✅
- [x] Phase 2: Database Schema (1h) — `attachments` + `block_attachments` tables ✅
- [x] Phase 3: File Service (2-3h) — FileService interface + implementations ✅
- [x] Phase 4: Attachment Service (8-10h) — CRUD, link/unlink, cleanup ✅
- [ ] Phase 5: Block Patch Integration (3-4h) — Handle attachment blocks ⬅️ NEXT
- [ ] Phase 6: IPC Layer (2-3h) — Upload/get/list handlers
- [ ] Phase 7: CLI Commands (2-3h) — attachment upload/list/cleanup
- [ ] Phase 8: Renderer Integration (10-12h) — TipTap node, upload UI
- [ ] Phase 9: Garbage Collection (1-2h) — Daily cleanup scheduler

### Key Files Created

| File                                                | Purpose          | Tests |
| --------------------------------------------------- | ---------------- | ----- |
| `packages/api/src/attachment.ts`                    | Zod schemas      | 49    |
| `packages/storage/drizzle/0005_add_attachments.sql` | Migration        | 17    |
| `packages/storage/src/fileService.ts`               | File abstraction | 24    |
| `packages/storage/src/attachmentService.ts`         | Business logic   | 29    |

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

## Recently Completed

### Object Type Inheritance ✅ (2026-01-08)

Capacities-style type inheritance with 2-level max hierarchy. 4-day TDD implementation:

- `validateInheritance()`: parent exists, cycle detection, depth check
- `getResolvedSchema()`: merges parent + child properties with caching
- `validatePropertiesForType()`: validates against resolved schema
- Built-in types with `pluralName` and `color` metadata
- CLI commands: `dev list-types`, `dev create-child-type`, `dev show-resolved-schema`

56 new tests. Commit: `367752c`

### Task Management ✅ (2026-01-08)

Task as 6th built-in type with complete integration: 36 API tests, 24 taskService tests, 10 IPC handlers, 9 CLI commands.

### Global Tags System ✅ (2026-01-07)

Full implementation with junction table pattern. 94+ tests.

### Wiki-Link & Mention Suggestions ✅ (2026-01-07)

TipTap autocomplete extension with `[[` and `@` triggers. 21 tests.

### Template System ✅ (2026-01-06)

Complete 7-phase implementation with 85 new tests.
