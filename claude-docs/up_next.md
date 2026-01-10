# Up Next

## Attachments/Media System

**Status:** In Progress (Phases 1-8 Complete, Phase 9 remaining)
**Plan:** `~/.claude/plans/mellow-cuddling-thacker.md`

Images + Documents support with content-addressed storage, global deduplication, and 30-day orphan cleanup.

### Implementation Phases (TDD)

- [x] Phase 1: API Contracts — Zod schemas, error codes, block type ✅
- [x] Phase 2: Database Schema — `attachments` + `block_attachments` tables ✅
- [x] Phase 3: File Service — FileService interface + implementations ✅
- [x] Phase 4: Attachment Service — CRUD, link/unlink, cleanup ✅
- [x] Phase 5: Block Patch Integration — Handle attachment blocks ✅
- [x] Phase 6: IPC Layer — Upload/get/list handlers ✅
- [x] Phase 7: CLI Commands — attachment upload/list/cleanup ✅ (with --dry-run)
- [x] Phase 8: Renderer Integration — TipTap node, upload UI ✅
- [ ] Phase 9: Garbage Collection — Daily cleanup scheduler ⬅️ NEXT

---

## Backlog

### E2E Test Fixes

**Status:** Partial — 185 passing, 20 failing (was 164/41)

- [x] Fix blockId lengths (28 invalid ULIDs) ✅ Commit: `b5a9382`
- [x] Add `sourceObjectTitle` to backlinks API ✅
- [x] Fix templates-workflow tests (`type` → `blockType`) ✅
- [ ] Fix RefNode rendering (11 failures) — `span[data-ref]` not appearing in editor
- [ ] Fix autocomplete popup (4 failures) — `[[` trigger not showing `.bg-popover`
- [ ] Fix block rendering (2 failures) — blockquote/HR not rendering
- [ ] Fix editor persistence (3 failures) — content not persisting after reload

### Quality & Performance

- [ ] Improve mutation testing scores (storage 79.9%, api 52.1%)
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future)

- [ ] Markdown export (in addition to JSON)
- [ ] Relations semantics finalization

---

## Recently Completed

### CLI Command Suite ✅ (2026-01-08)

Full CLI coverage for all backend services: tag (10), backlinks (1), template (6), attachment (9), export/import (5). Added `--dry-run` to 4 commands. 31 total commands. Commit: `1a469cf`

### Object Type Inheritance ✅ (2026-01-08)

Capacities-style type inheritance with 2-level max. 56 tests. Commit: `367752c`

### Task Management ✅ (2026-01-08)

Task as 6th built-in type. 10 IPC handlers, 9 CLI commands.

### Global Tags System ✅ (2026-01-07)

Junction table pattern. 94+ tests.
