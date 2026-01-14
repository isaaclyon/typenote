# Up Next

## CLI Critical Gaps Implementation

**Status:** ✅ COMPLETE (2026-01-10 evening)
**Design:** `docs/plans/2026-01-10-cli-critical-gaps-design.md`

All 4 critical gaps from CLI coverage analysis now have full command implementations. Ready for manual smoke testing.

### Completed

- [x] Daily notes CLI (4 commands) — today, get, list, slug ✅ Commit: `f9748e5`
- [x] Calendar CLI (5 commands) — types, on, range, upcoming, list ✅ Commit: `f9748e5`
- [x] Template apply command — Auto-populate context from object ✅ Commit: `f9748e5`
- [x] Block move command — 4 placement modes (start, end, before, after) ✅ Pending commit
- [x] Documentation — Updated CLAUDE.md with CLI commands section ✅

### Manual Smoke Tests (Optional)

- [ ] Test daily note operations (create today, get specific date, list with filters)
- [ ] Test calendar queries (events on date, date ranges, upcoming)
- [ ] Test template apply (verify context auto-population, dateKey extraction)
- [ ] Test block move (verify all 4 placement modes work correctly)

---

## UI/Design System - Organism Components

**Status:** Active
**Plan:** `/Users/isaaclyon/.claude/plans/clever-snuggling-karp.md`

Building organism-level components in the design-system package with Ladle sandbox testing before desktop app integration.

### Completed

- [x] Left Sidebar Navigation organism (8 components, 9 stories) ✅ Commit: `d8c01d3`
- [x] Slash menu keyboard navigation auto-scroll ✅ Commit: `18356b4`
- [x] RefNode styling consistency (clean icon + underline design) ✅ Commit: `44da3b6`
- [x] AppShell full experience stories (daily note + regular note) ✅ Commit: `44da3b6`
- [x] Daily note special layout (DailyNoteNav + MiniCalendar + NotesCreatedList) ✅ Commit: `44da3b6`
- [x] Select component size prop + fixed positioning ✅ Commit: `70ec931`

### In Progress (Uncommitted)

- PropertyItem with all 8 property types + custom Select integration (testing layout shift fix)
- MultiselectDropdown component (new, started)
- BacklinkItem component (already exists, used in stories)
- RightPanel components (partially complete)

### Next Steps

- [ ] Verify Select dropdown layout shift is fixed, then commit PropertyItem
- [ ] Complete MultiselectDropdown component
- [ ] Build Type Browser organism (data table with sort/filter)
- [ ] Integrate Sidebar + AppShell into desktop app with real data (wire up IPC)
- [ ] Add InteractiveEditor integration tests for all extensions

---

## Attachments/Media System

**Status:** ✅ COMPLETE (2026-01-10)
**Plan:** `~/.claude/plans/mellow-cuddling-thacker.md`

Full attachment system with content-addressed storage, global deduplication, and automated 30-day orphan cleanup.

### Implementation Phases (TDD) — All Complete

- [x] Phase 1: API Contracts — Zod schemas, error codes, block type ✅
- [x] Phase 2: Database Schema — `attachments` + `block_attachments` tables ✅
- [x] Phase 3: File Service — FileService interface + implementations ✅
- [x] Phase 4: Attachment Service — CRUD, link/unlink, cleanup ✅
- [x] Phase 5: Block Patch Integration — Handle attachment blocks ✅
- [x] Phase 6: IPC Layer — Upload/get/list handlers ✅
- [x] Phase 7: CLI Commands — attachment upload/list/cleanup ✅ (with --dry-run)
- [x] Phase 8: Renderer Integration — TipTap node, upload UI ✅
- [x] Phase 9: Garbage Collection — Daily cleanup scheduler ✅ Commit: `5a07f5f`

**Total:** 190+ tests, all phases complete

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

- [x] Improve mutation testing scores ✅ Partial (api: 87.42%, core: 96.30%, storage: 78.30%)
  - blockPatch.ts: 52.63% → 57.89% (+5.26%)
  - Identified equivalent mutants in schemas with all-optional fields
  - Incremental mode verified working (40-63% cache reuse)
- [ ] Further mutation improvements: objectType.ts (84.91%), calendar.ts (86.36%)
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future)

- [ ] Markdown export (in addition to JSON)
- [ ] Relations semantics finalization
- [ ] Unlinked mentions (design spec: `docs/plans/2026-01-10-unlinked-mentions-design.md`)

---

## Recently Completed

### HTTP Server REST API ✅ (2026-01-11)

Complete `@typenote/http-server` package with Hono framework. 10 endpoints for local third-party integrations (Raycast, Alfred, scripts). Integrated into Electron main process. 38 tests. Commits: `16f0e21`, `87079b9`, `316abf3`, `d8fc26f`, `cb5eb94`

### Recent Objects Tracking ✅ (2026-01-10)

100-entry LRU cache with command palette integration. Backend service, IPC layer, React hook, UI integration. 13 unit tests + 3 E2E tests. Commit: `b8cb7d6`

### CLI Command Suite ✅ (2026-01-08)

Full CLI coverage for all backend services: tag (10), backlinks (1), template (6), attachment (9), export/import (5). Added `--dry-run` to 4 commands. 31 total commands. Commit: `1a469cf`

### Object Type Inheritance ✅ (2026-01-08)

Capacities-style type inheritance with 2-level max. 56 tests. Commit: `367752c`

### Task Management ✅ (2026-01-08)

Task as 6th built-in type. 10 IPC handlers, 9 CLI commands.

### Global Tags System ✅ (2026-01-07)

Junction table pattern. 94+ tests.
