# Recent Work

## Latest Session (2026-01-10 evening - CLI Critical Gaps Implementation)

### CLI Commands for Backend Coverage

Completed all 4 critical gaps identified in CLI coverage analysis. Added ~90 lines of new CLI code (patch-move command) to complete the implementation started in commit `f9748e5`.

**Implementation completed this session:**

- `apps/cli/src/commands/core.ts` (+90 lines) — Added `patch-move` command
  - Supports 4 placement modes: `--where start|end`, `--before <siblingId>`, `--after <siblingId>`
  - Validates conflicting placement options
  - Full error handling and database lifecycle management

**Previously committed (commit `f9748e5`):**

- `apps/cli/src/commands/daily.ts` (NEW, 173 lines) — 4 daily note commands
- `apps/cli/src/commands/calendar.ts` (NEW, 205 lines) — 5 calendar query commands
- `apps/cli/src/commands/template.ts` (+60 lines) — `template apply` command

**Key technical patterns:**

- exactOptionalPropertyTypes compliance via conditional object building
- Index signature access for dynamic properties (`obj.properties['date_key']`)
- Extracted `parseDateKey()` helper for YYYY-MM-DD validation
- Service-layer tests only (66 tests passing: dailyNoteService, calendarService, applyTemplateToObject)

**Quality verification:**

- ✅ Typecheck: All packages pass
- ✅ Lint: CLI package clean
- ✅ Build: All packages build successfully

**Documentation:**

- Updated `CLAUDE.md` with CLI commands section

**Commits:**

- Pending: `feat(cli): add patch-move command for block repositioning`

**Manual smoke tests pending:** Daily notes, calendar queries, template apply, block move operations

---

## Previous Session (2026-01-10 afternoon - Attachments Phase 9 Complete)

### Daily Garbage Collection Scheduler

Completed Phase 9 (final phase) of the attachments system with automated cleanup of orphaned attachments. Used TDD approach with comprehensive testing.

**Implementation:**

- `apps/desktop/src/main/lifecycle.ts` — Scheduler module with start/stop functions
  - Runs cleanup immediately on app startup
  - Schedules daily cleanup via setInterval (24-hour interval)
  - Configurable grace period (default: 30 days)
  - Graceful shutdown on app quit
- Main process integration in `apps/desktop/src/main/index.ts`
  - Starts scheduler after database initialization
  - Stops scheduler in before-quit handler

**Testing:**

- 8 comprehensive unit tests covering all scheduler behavior
- Tests startup cleanup, grace period config, start/stop lifecycle
- End-to-end integration test
- All 1685 tests passing across entire codebase
- Full typecheck and build verification

**Design decisions:**

- Used setInterval for simplicity over cron-style scheduling
- Module-level singleton prevents duplicate intervals
- Graceful error handling (logs, doesn't crash app)
- Cleanup errors logged but don't fail app startup

**Commits:**

- `cda52e4 feat(recent-objects): implement 100-entry LRU cache with command palette integration`
- `5a07f5f feat(attachments): Phase 9 - Daily garbage collection scheduler`
- `f9748e5 chore: session work - CLI commands, design system components, docs`

**Attachments system now complete** — All 9 phases finished with 180+ tests, content-addressed storage, global deduplication, and automated 30-day orphan cleanup.

---

## Previous Session (2026-01-10 - Mutation Testing Coverage Improvements)

### Incremental Stryker Mutation Testing + Coverage Analysis

Analyzed mutation testing infrastructure and improved test coverage for API package schemas. Learned about incremental mutation testing and killed additional mutants in blockPatch.ts.

**Work completed:**

- Verified incremental mutation testing is enabled across api, core, storage packages
- Analyzed mutation test results: api 87.42%, core 96.30%, storage 78.30%
- Improved blockPatch.ts from 52.63% → 57.89% (+5.26% improvement)
- Added 14 targeted tests for ObjectLiteral mutations
- Documented equivalent mutant pattern in schemas with all-optional fields

**Key insights:**

- Incremental mode tracks which mutants were tested using git HEAD comparison
- Cache reuse: 40-63% of mutants reused on subsequent runs (massive speedup)
- Equivalent mutants exist when `z.object({ optional: ... })` → `z.object({})` behaves identically
- notateDoc.ts improvements didn't kill mutants due to equivalent mutant pattern

**Files changed:**

- `packages/api/src/blockPatch.test.ts` — Added 14 tests for required/optional field validation
- `packages/api/src/notateDoc.test.ts` — Added 13 tests (discovered equivalent mutants)

**Commit:** `c3ba9b2 test: improve blockPatch.ts mutation coverage`

---

## Previous Session (2026-01-10 - Recent Objects Feature Complete)

### Recent Objects Tracking - Full Implementation

Completed end-to-end recent objects tracking feature with 100-entry LRU cache, backend service, IPC layer, and command palette integration. Feature fully tested and committed.

**Backend Implementation:**

- Database: `recent_objects` table with CASCADE delete on objectId FK
- Migration: `0007_add_recent_objects.sql` with proper SQL breakpoints
- Service: `recentObjectsService.ts` with silent failure pattern (logs, doesn't throw)
  - `recordView(db, objectId)` — UPSERT with LRU cleanup (100 max)
  - `getRecentObjects(db, limit)` — Ordered by viewedAt DESC, filters soft-deleted
  - `clearRecentObjects(db)` — Deletes all entries
- Tests: 13/13 passing unit tests with deterministic timestamps

**IPC Layer:**

- Main process: `recordView` and `getRecentObjects` handlers
- Preload: Exposed API with TypeScript types
- Types: Added `RecentObjectSummary` interface

**Frontend Integration:**

- `useRecentObjects` hook - Fetches recent objects from backend
- CommandPalette "Recent" section - Shows when query is empty
- Auto-tracking: Records views on navigation and object creation
- UI: Clock icon, type badge, ordered by most recent first

**Testing:**

- 13 unit tests (service layer)
- 3 E2E tests (IPC wiring, ordering with 1s delay for SQLite second precision, limit parameter)
- All 1677 tests passing across entire codebase
- Full typecheck, build verification

**Key files:**

- `packages/storage/src/schema.ts` — recentObjects table
- `packages/storage/drizzle/0007_add_recent_objects.sql` — migration
- `packages/storage/src/recentObjectsService.ts` — service implementation (150 lines)
- `packages/storage/src/recentObjectsService.test.ts` — TDD test suite
- `apps/desktop/src/renderer/hooks/useRecentObjects.ts` — React hook
- `apps/desktop/src/renderer/components/CommandPalette/index.tsx` — UI integration
- `apps/desktop/src/renderer/hooks/useCommandActions.ts` — view tracking
- `tests/e2e/specs/ipc-wiring.spec.ts` — E2E tests
- `tests/e2e/types/global.d.ts` — TypeScript types

**Commit:** `b8cb7d6 feat(recent-objects): implement 100-entry LRU cache with command palette integration`

---

## Previous Session (2026-01-10 - Left Sidebar Navigation Organism)

### Built and Committed First Organism Component

Implemented comprehensive left sidebar navigation organism in Ladle sandbox with 8 compound components, 9 interactive stories, and full design system adherence. Verified with full test suite before committing.

**Components created:**

- `Sidebar.tsx` — Main 240px container (nav element)
- `SidebarTypeItem.tsx` — Type row with CVA variants, CSS hover count
- `SidebarSection.tsx` — Layout section wrapper
- `SidebarTypesList.tsx` — ScrollArea integration for scrollable types
- `SidebarSearchTrigger.tsx` — ⌘K search trigger with KeyboardKey
- `SidebarCalendarButton.tsx` — Today's note access
- `SidebarActionButton.tsx` — Settings/Archive with divider support
- `SidebarNewTypeButton.tsx` — "+ New Type" button

**Stories coverage:**

- AllVariants, Default, Interactive (state management), WithManyItems (25 items, scroll test), Empty, Loading, TypeItemVariants, SearchTriggerVariants, ActionButtonVariants

**Design system adherence:**

- 240px width (w-60), 28px type items (h-7), 14px icons
- CSS group hover for count visibility (no React state)
- CVA for selected variant
- 4px spacing grid throughout
- Lucide React icons (consistent with existing components)

**Key patterns established:**

- Compound component architecture (flexibility for composition)
- CSS-first interactivity (performance over React state)
- Bottom-up build sequence (simple → complex → container)

**Verification:**

- Typecheck: All 6 packages pass
- Lint: design-system clean
- Tests: 1652 tests pass (565 api, 91 core, 697 storage, 1 cli, 298 desktop)
- Build: All packages build successfully

**Commit:** `d8c01d3 feat(design-system): add left sidebar navigation organism`

---

## Completed Milestones

| Phase       | Description                               | Date       |
| ----------- | ----------------------------------------- | ---------- |
| 0-7         | Core Bootstrap Phases                     | 2026-01-04 |
| Template    | Template System (7 phases)                | 2026-01-06 |
| Tags        | Global Tags System (5 phases)             | 2026-01-07 |
| Tasks       | Task Management (built-in + service)      | 2026-01-08 |
| Inheritance | Object Type Inheritance (4 days)          | 2026-01-08 |
| CLI         | Full CLI command coverage                 | 2026-01-08 |
| E2E Fixes   | Fixed 21 test failures (blockIds)         | 2026-01-08 |
| Design      | Left Sidebar Navigation organism          | 2026-01-10 |
| Recent      | Recent Objects Tracking (LRU cache)       | 2026-01-10 |
| Testing     | Mutation testing improvements             | 2026-01-10 |
| Attachments | Complete system - Phases 1-9 (190+ tests) | 2026-01-10 |
| CLI Gaps    | Daily/calendar/template/move commands     | 2026-01-10 |
