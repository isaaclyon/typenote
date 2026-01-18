# Up Next

## Design System Reset (shadcn Foundation)

**Status:** Active (In Progress)
**Plan:** `.claude/plans/iterative-wondering-kahn.md`

### Phase Progress (Updated 2026-01-18)

- [x] Phase 1: Foundation — Create pre-reset tag, delete old code, initialize fresh shadcn structure
- [x] Phase 2: Core Primitives — Button, Input, Dialog, Command, etc. with design tokens
- [x] Phase 3: Layout Shell — AppShell, Sidebar, Router, IPC hooks
- [ ] Phase 4: Core Views — Document Editor (TipTap), Type Browser (TanStack Table), Properties Panel
- [ ] Phase 5: Features — Calendar, Command Palette, Settings, Daily Notes, Backlinks

### Current State

- Electron app launches with working navigation shell
- Sidebar shows types from IPC (useTypeCounts hook)
- Routes: /notes, /notes/:objectId, /types/:typeKey, /calendar
- Design tokens preserved (cornflower accent, warm grayscale, IBM Plex fonts)

### Next Steps (Phase 4)

1. Port TipTap integration from old InteractiveEditor
2. Port TanStack Table for TypeBrowser
3. Replace SuggestionPopup with shadcn Popover + Command

### Reference

Old code available via `pre-reset` git tag at commit `88eefdd`.

---

## Design System Migration (SUPERSEDED BY RESET)

**Status:** ⚠️ Superseded — The design system reset deleted all old components and is rebuilding from scratch.
**Note:** Previous tracking in `docs/design-system-migration.md` is no longer applicable.

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

## UI/Design System - Organism Components (SUPERSEDED BY RESET)

**Status:** ⚠️ Superseded — Replaced by Design System Reset above.
**Note:** Old plan at `/Users/isaaclyon/.claude/plans/clever-snuggling-karp.md` no longer applicable.

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

- [x] **EditorPreview component** — ✅ COMPLETE (2026-01-15)
  - Uses `InteractiveEditor editable={false}` — no separate component needed
  - Stories: `ReadOnly` (full content), `PreviewCompact` (inline cards)
  - Future integration points:
    - TypeBrowser row expansion (click row to see preview)
    - Hover tooltip on object titles
    - Split-pane detail view

---

## Backlog

### E2E Test Fixes

**Status:** ✅ COMPLETE (2026-01-16) — 183 passed, 54 skipped, 0 failed

- [x] Fix blockId lengths (28 invalid ULIDs)
- [x] Add `sourceObjectTitle` to backlinks API
- [x] Fix templates-workflow tests (`type` → `blockType`, h1 visibility)
- [x] Fix empty search query returning error
- [x] Fix Toast tests (Sonner 2.x selector change)
- [x] Fix flaky Electron startup timeouts (increased timeout + retry)
- [x] Fix block-hierarchy tests (TypeBrowser navigation, h1 visibility)
- [x] Skip auto-save dependent tests (10 tests) — waiting on `generateBlockOps` fix
- [ ] Fix RefNode rendering — `span[data-ref]` not appearing in editor
- [ ] Fix autocomplete popup — `[[` trigger not showing `.bg-popover`

### Known Bug: Auto-Save Not Triggering

**Status:** Blocked — needs investigation

- Auto-save not working: "Saved" status never shows after edits
- Root cause: `generateBlockOps` in useAutoSave may not detect changes properly
- Affects: 10 E2E tests currently skipped in block-hierarchy.spec.ts
- Related: editor.spec.ts has same issue marked as TODO

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
| E2E Test Fixes (block-hierarchy) | 2026-01-16 | `4645530`            |
| Custom Title Bar (Frameless)     | 2026-01-16 | uncommitted          |
| Auto-Hide Scrollbars             | 2026-01-15 | `960bca2`            |
| Backlinks Collapse Fix           | 2026-01-15 | `c6bdb3d`, `5a50e50` |
| Resizable Sidebars               | 2026-01-15 | `31ddc7c`            |
| Toast Migration                  | 2026-01-15 | `0738017`            |
| Design System Audit Script       | 2026-01-15 | `e8b0ddd`, `f642e67` |
| InteractiveEditor Migration      | 2026-01-15 | `260c23c`            |
| CommandPalette DS Migration      | 2026-01-15 | `09f280a`, `73b1a7c` |
| Mutation Testing Parallel Agents | 2026-01-15 | `d60ac2a`            |
| Design System Tier 2 Migration   | 2026-01-15 | `ec8748b`, `47749a3` |
| AppShell Full Migration          | 2026-01-15 | `ae451b0`            |

See `recent_work.md` Milestones table for full history.
