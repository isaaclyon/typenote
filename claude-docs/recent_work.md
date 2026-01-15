# Recent Work

## Latest Session (2026-01-15 - AppShell Full Migration)

Implemented full AppShell migration using full-feature-workflow (brainstorming → feature-dev → TDD → implementation).

**Key accomplishments:**

1. **Design Phase** — Brainstormed scope with user:
   - Full 3-column AppShell with collapsible sidebars
   - Left sidebar: design-system Sidebar components (Search, Calendar, TypesList, Pinned, Settings)
   - Right sidebar: Properties panel (notes view only, no backlinks)
   - Type-based navigation (TypeBrowser integration deferred)

2. **TDD Implementation** (12 new tests)
   - `useTypeCounts` hook (5 tests) — Computes type counts from listObjects
   - `useSelectedObject` hook (7 tests) — Fetches ObjectDetails for properties panel

3. **New Components**
   - `LeftSidebar.tsx` — Wraps design-system Sidebar with app-specific content
   - `PropertiesPanel.tsx` — Right sidebar showing Created, Modified, Type, Tags

4. **App.tsx Refactor**
   - Replaced inline `<aside>` with AppShell
   - Collapsible sidebars with localStorage persistence
   - Conditional right sidebar (only when viewing notes)

5. **Documentation**
   - Created `docs/design-system-migration.md` — Checklist tracking component migration status

**Files created:**
- `hooks/useTypeCounts.ts` + test (5 tests)
- `hooks/useSelectedObject.ts` + test (7 tests)
- `components/LeftSidebar.tsx`
- `components/PropertiesPanel.tsx`
- `docs/design-system-migration.md`

**Verification:** 368 tests pass, typecheck passes

**Not committed yet** — Session ended before commit

---

## Previous Session (2026-01-14 - updateObject() Service Implementation)

Implemented the missing CRUD "Update" operation using full-feature-workflow with TDD.

**Key accomplishments:**

1. **Design Phase** — Brainstormed and documented design at `docs/plans/2026-01-14-update-object-design.md`
   - Capacities-style property migration for type changes
   - Optional optimistic concurrency via `baseDocVersion`
   - Partial property updates (merge, not replace)

2. **TDD Implementation** (17 new tests, 808 total)
   - Title updates, property updates, both together
   - Type change with auto-mapping (same key names transfer)
   - Explicit mapping via `propertyMapping` param
   - Type compatibility checking (text↔richtext, date↔datetime)
   - Validation against new schema after migration
   - Default value population for new type
   - Dropped properties tracking in response

3. **Code Review & Bug Fixes**
   - Fixed: Property updates were ignored during type change
   - Fixed: Missing validation after migration
   - Now allows atomic type change + property update in one call

4. **IPC Layer Wiring**
   - API contracts (`UpdateObjectRequest/Response` schemas)
   - IPC handler with Zod validation
   - Preload binding

**Files created/modified:**

- `packages/storage/src/objectService.ts` — `updateObject()` + helpers
- `packages/storage/src/objectService.test.ts` — 17 new tests
- `packages/api/src/object.ts` — Zod schemas
- `apps/desktop/src/main/ipc.ts` — Handler
- `apps/desktop/src/preload/index.ts` — Binding

**Commits:**

- `8a7d881 docs: add updateObject() service design`
- `6dff951 feat(storage): add updateObject() service for CRUD update operations`

---

## Completed Milestones

| Phase       | Description                                     | Date       |
| ----------- | ----------------------------------------------- | ---------- |
| 0-7         | Core Bootstrap Phases                           | 2026-01-04 |
| Template    | Template System (7 phases)                      | 2026-01-06 |
| Tags        | Global Tags System (5 phases)                   | 2026-01-07 |
| Tasks       | Task Management (built-in + service)            | 2026-01-08 |
| Inheritance | Object Type Inheritance (4 days)                | 2026-01-08 |
| CLI         | Full CLI command coverage                       | 2026-01-08 |
| E2E Fixes   | Fixed 21 test failures (blockIds)               | 2026-01-08 |
| Design      | Left Sidebar Navigation organism                | 2026-01-10 |
| Recent      | Recent Objects Tracking (LRU cache)             | 2026-01-10 |
| Testing     | Mutation testing improvements                   | 2026-01-10 |
| Attachments | Complete system - Phases 1-9 (190+ tests)       | 2026-01-10 |
| CLI Gaps    | Daily/calendar/template/move commands           | 2026-01-10 |
| HTTP API    | REST API for local integrations (10 endpoints)  | 2026-01-11 |
| AppShell    | Full experience stories + RefNode/slash fixes   | 2026-01-12 |
| TypeBrowser | Phases 1-3 (sort/virtualize/rich cells)         | 2026-01-14 |
| Colors      | Color centralization (semantic + demo colors)   | 2026-01-14 |
| Pinning     | Object pinning/favorites for sidebar (54 tests) | 2026-01-14 |
| Trash       | Restore from trash with FTS/refs re-index (TDD) | 2026-01-14 |
| Duplicate   | Object duplication (7 TDD phases, 39 tests)     | 2026-01-15 |
| Settings    | Settings persistence (React hook, 12 tests)     | 2026-01-15 |
| Update      | updateObject() service (17 tests, TDD)          | 2026-01-14 |
| Tier 1 DS   | Design System Tier 1 migration                  | 2026-01-14 |
