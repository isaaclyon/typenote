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
- [x] TypeBrowser integration — Fully wired with useObjectType/useObjectsByType hooks
- [x] InteractiveEditor — Replaced NoteEditor with design-system component + callback props
- [x] Resizable sidebars — Drag handles with snap-to-collapse (43 tests)

### Tier 3.5 CommandPalette Enhancement ✅ COMPLETE (2026-01-15)

- [x] Design system CommandPalette enhancement — Compound components, keyboard navigation hook
- [x] Desktop CommandPalette migration — Replaced cmdk with design-system components
- [x] Remove cmdk dependency — Deleted wrapper, removed from package.json

### Tier 3.6 Toast Migration ✅ COMPLETE (2026-01-15)

- [x] Wrap Sonner in design-system Toaster component
- [x] Re-export toast function from design-system
- [x] Update desktop imports to use @typenote/design-system
- [x] Remove Sonner from desktop package.json

### Tooling

- [x] Design system audit script — `just audit-design-system` scans exports and finds usage
- [x] Updated migration checklist to 29/33 (88%) — Corrected stale entries

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

- [x] **InteractiveEditor migration** — ✅ COMPLETE (2026-01-15)
  - Design-system owns editor with callback props for IPC integration
  - Desktop's DocumentEditor wraps InteractiveEditor
  - ~30 extension files deleted from desktop

- [ ] **EditorPreview component** — Read-only editor for object previews (~1-2 days)
  - Component exists, needs integration into object list views

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

- [x] Improve mutation testing scores (api: 86.92%, core: 96.50%, storage: 77.51%)
- [x] Mutation testing parallel agent experiment — ~80 tests added, +16% on duplicateObjectService.ts
- [ ] Enable `ignoreStatic: true` in Stryker configs for more accurate scores
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future)

- [ ] Markdown export (in addition to JSON)
- [ ] Relations semantics finalization
- [ ] Unlinked mentions (design spec: `docs/plans/2026-01-10-unlinked-mentions-design.md`)

---

## Recently Completed

| Feature                          | Date       | Commits              |
| -------------------------------- | ---------- | -------------------- |
| Resizable Sidebars               | 2026-01-15 | `31ddc7c`            |
| Toast Migration                  | 2026-01-15 | `0738017`            |
| Design System Audit Script       | 2026-01-15 | `e8b0ddd`, `f642e67` |
| InteractiveEditor Migration      | 2026-01-15 | `260c23c`            |
| CommandPalette DS Migration      | 2026-01-15 | `09f280a`, `73b1a7c` |
| Mutation Testing Parallel Agents | 2026-01-15 | `d60ac2a`            |
| Design System Tier 2 Migration   | 2026-01-15 | `ec8748b`, `47749a3` |
| AppShell Full Migration          | 2026-01-15 | `ae451b0`            |

See `recent_work.md` Milestones table for full history.
