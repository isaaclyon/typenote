# Up Next

## Design System Migration

**Status:** Active
**Tracking:** `docs/design-system-migration.md` — Full checklist with 33 components

### Tier 1 Complete ✅

All drop-in replacements done (Skeleton, Badge, KeyboardKey, Card, ScrollArea, etc.)

### Tier 2 ✅ COMPLETE (2026-01-15)

- [x] DailyNoteNav — Replaced with design-system component (icon buttons)
- [x] SaveStatus — Connected to useAutoSave hook
- [x] SettingsModal — Wired to useSettings hook with optimistic updates

### Tier 3 AppShell Migration ✅ COMPLETE (2026-01-15)

- [x] Sidebar full adoption — LeftSidebar component using design-system Sidebar
- [x] AppShell — 3-column layout with collapsible sidebars
- [x] RightSidebar — PropertiesPanel showing Created/Modified/Type/Tags
- [x] useTypeCounts hook — Type counts for sidebar (5 TDD tests)
- [x] useSelectedObject hook — Object details for properties (7 TDD tests)
- [ ] TypeBrowser integration — Clicking types (deferred)
- [ ] InteractiveEditor — Replace NoteEditor + extensions (future)

---

## UI/Design System - Organism Components

**Status:** Active
**Plan:** `/Users/isaaclyon/.claude/plans/clever-snuggling-karp.md`

### Completed

- [x] Left Sidebar Navigation organism (8 components, 9 stories)
- [x] AppShell full experience stories (daily note + regular note)
- [x] TypeBrowser Phases 1-3 (sorting, virtualization, rich cells)
- [x] MultiselectDropdown with actions menu
- [x] **AppShell integration into desktop app** — LeftSidebar + PropertiesPanel wired to IPC

### Next Steps

- [ ] TypeBrowser integration — Clicking type in sidebar opens TypeBrowser
- [ ] Add InteractiveEditor integration tests for all extensions

---

## Backlog

### E2E Test Fixes

**Status:** Mostly resolved — 231+ passing, flaky tests handled with retry

- [x] Fix blockId lengths (28 invalid ULIDs)
- [x] Add `sourceObjectTitle` to backlinks API
- [x] Fix templates-workflow tests (`type` → `blockType`)
- [x] Fix empty search query returning error
- [x] Fix Toast tests (Sonner 2.x selector change)
- [x] Fix flaky Electron startup timeouts (increased timeout + retry)
- [ ] Fix RefNode rendering — `span[data-ref]` not appearing in editor
- [ ] Fix autocomplete popup — `[[` trigger not showing `.bg-popover`

### Quality & Performance

- [x] Improve mutation testing scores (api: 87.42%, core: 96.30%, storage: 78.30%)
- [ ] Further mutation improvements: objectType.ts (84.91%), calendar.ts (86.36%)
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future)

- [ ] Markdown export (in addition to JSON)
- [ ] Relations semantics finalization
- [ ] Unlinked mentions (design spec: `docs/plans/2026-01-10-unlinked-mentions-design.md`)

---

## Recently Completed

| Feature                          | Date       | Commits              |
| -------------------------------- | ---------- | -------------------- |
| Design System Tier 2 Migration   | 2026-01-15 | `ec8748b`, `47749a3` |
| AppShell Full Migration          | 2026-01-15 | `ae451b0`            |
| updateObject() Service           | 2026-01-14 | `6dff951`            |
| Design System Migration (Tier 1) | 2026-01-14 | `d95f1e7`            |
| Settings Persistence             | 2026-01-15 | `9a85158`            |
| Duplicate Object                 | 2026-01-15 | `7856a54`→`7cb8353`  |
| Pinning + Trash                  | 2026-01-14 | `ae7ca66`, `0f39751` |

See `recent_work.md` Milestones table for full history.
