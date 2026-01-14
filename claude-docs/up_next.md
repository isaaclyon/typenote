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

### Recently Completed

- [x] PropertyItem with all 8 property types + UX improvements ✅ Commit: `ded86c9`
  - `resolveRefs` prop shows titles instead of IDs for ref/refs types
  - DateTime blur fix (clicking between date/time inputs no longer triggers premature save)
  - MultiselectDropdown integration (dropdown replaces inline toggle buttons)
- [x] MultiselectDropdown component ✅ Commit: `ded86c9`
  - Dropdown UI with Floating UI positioning
  - Search/filter input, checkbox rows with drag handles
  - @dnd-kit integration for drag-and-drop reordering

### Recently Completed

- [x] MultiselectDropdown actions menu ✅ Commit: `e74ad09`
  - OptionActionsMenu component with Edit/Delete/Change Color
  - 12-color picker derived from pill text colors
  - `onOptionsChange` callback for mutations
- [x] TypeBrowser Phase 1 (data table with TanStack Table) ✅ Commits: `d5412b5`→`9de1cad`
  - Sorting, row selection, inline editing (text/number/boolean)
  - 17+ Ladle stories, 8 new component files
- [x] TypeBrowser Phase 3: Rich cell types ✅ Commit: `a8c6768`
  - DateCell, SelectCell, MultiselectCell components
  - Colored option pills (12-color palette)
  - 4 new Ladle stories for rich cell editing

### Recently Completed

- [x] TypeBrowser Phase 2: Virtualization + Column Pinning ✅ Commits: `b15a096`→`b332714`
  - Row virtualization with @tanstack/react-virtual (handles 10,000+ rows)
  - Sticky column pinning with CSS position: sticky
  - ColumnPinMenu for dynamic pin/unpin via dropdown
  - 7 new Ladle stories for virtualization and pinning demos

### Next Steps

- [ ] Integrate Sidebar + AppShell into desktop app with real data (wire up IPC)
- [ ] Add InteractiveEditor integration tests for all extensions

---

## Color Centralization

**Status:** ✅ High+Medium Priority COMPLETE (2026-01-13)
**Plan:** `docs/plans/2026-01-13-color-centralization.md`

Centralized hardcoded hex values into semantic tokens and shared constants.

### Completed

- [x] Add CSS custom properties for semantic color dark variants ✅ Commit: `208609f`
- [x] Create `semanticColors.ts` (success/error/warning/info) ✅
- [x] Update Toast component to use CSS variable references ✅
- [x] Update Badge component to use semantic colors ✅
- [x] Create `demoColors.ts` for story mock data ✅
- [x] Update mockTags.ts to use demo colors ✅
- [x] Create `defaults.ts` with DEFAULT_ICON_COLOR ✅

### Low Priority (Optional)

- [ ] Extract InteractiveEditor inline styles to CSS file
- [ ] Update story files to use DEMO_TYPE_COLORS

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

**Status:** Mostly resolved — 231+ passing, flaky tests handled with retry

- [x] Fix blockId lengths (28 invalid ULIDs) ✅ Commit: `b5a9382`
- [x] Add `sourceObjectTitle` to backlinks API ✅
- [x] Fix templates-workflow tests (`type` → `blockType`) ✅
- [x] Fix empty search query returning error ✅ Commit: `ce89df4`
- [x] Fix Toast tests (Sonner 2.x selector change) ✅ Commit: `ce89df4`
- [x] Fix flaky Electron startup timeouts (increased timeout + retry) ✅ Commit: `ce89df4`
- [ ] Fix RefNode rendering — `span[data-ref]` not appearing in editor (investigate if still failing)
- [ ] Fix autocomplete popup — `[[` trigger not showing `.bg-popover` (investigate if still failing)

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
