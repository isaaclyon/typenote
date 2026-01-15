# Recent Work

## Latest Session (2026-01-14 - Pinning Feature + Trash Service)

Completed two backend features: object pinning/favorites and restore from trash functionality.

**Key accomplishments:**

1. **Object Pinning Feature** — Full pinning system for sidebar quick access
   - `pinnedObjects` table with manual sorting via `order` column
   - `pinnedObjectsService` with pin/unpin/reorder/isPinned functions
   - IPC handlers and preload API integration
   - `SidebarPinnedItem` and `SidebarPinnedSection` design-system components
   - Right-click context menu for pin/unpin on object cards
   - 54 tests (31 API + 23 storage service)
   - Commit: `ae7ca66`

2. **Trash Service (TDD)** — Restore soft-deleted objects with full re-indexing
   - `listDeletedObjects()` — Query deleted objects with limit/typeKey filters
   - `restoreObject()` — Clear deletedAt, restore blocks, re-index FTS and refs atomically
   - `TrashServiceError` with OBJECT_NOT_FOUND error code
   - `object:restored` event type for UI notifications
   - 14 comprehensive tests covering FTS/refs re-indexing edge cases
   - Commit: `0f39751`

**Other commits:**

- `ab37f42` test(storage): add Phase 6 edge case tests for duplicateObject
- `b9dd229` feat(storage): add error validation for duplicateObject (Phase 5)
- `cecfe19` feat(storage): add internal ref remapping to duplicateObject
- `4a7ad56` fix(storage): handle null properties in duplicateObject service
- `9dddd91` feat(storage): add duplicateObject service (Phase 3 - TDD happy path)
- `4596648` feat(api): add INVARIANT_DAILY_NOTE_NOT_DUPLICABLE error code

---

## Previous Session (2026-01-14 - TypeBrowser Phase 2 Complete)

Implemented row virtualization and sticky column pinning for TypeBrowser.

**Key accomplishments:**

1. **Row virtualization** — @tanstack/react-virtual integration
   - Renders only visible rows + overscan buffer (ROW_HEIGHT=40, OVERSCAN=5)
   - Handles 10,000+ rows smoothly
   - CSS Grid layout with absolute positioned rows using translateY

2. **Column pinning** — TanStack Table column pinning state
   - `getColumnPinningStyles()` utility for sticky positioning
   - `buildInitialPinningState()` converts column defs to TanStack format
   - Checkbox column auto-pinned left when selection enabled
   - Visual shadow separator on pinned group edges

3. **Dynamic pinning UI** — ColumnPinMenu component
   - Dropdown menu with "Pin Left" / "Pin Right" / "Unpin"
   - Pin icon appears on header hover, accent color when pinned
   - Floating UI for dropdown positioning

4. **7 new Ladle stories**
   - VirtualizedManyRows (1,000 rows), VirtualizedHugeDataset (10,000 rows)
   - ColumnPinning, ColumnPinningWithSelection, DynamicColumnPinning
   - VirtualizedWithColumnPinning (combined), HorizontalScroll

**New files:**

- `pinningStyles.ts` — Column pinning CSS utilities
- `ColumnPinMenu.tsx` — Pin/unpin dropdown component

**Commits:** `b15a096`→`b332714` (8 commits for Phase 2)

---

## Previous Session (2026-01-14 - Color Centralization Complete)

Completed color centralization: fixed swatch color bug and updated all story files.

**Key accomplishments:**

1. **Fixed swatch color picker** — Color picker was only showing one blue swatch
   - Root cause: Tailwind can't detect dynamically-constructed class names (`bg-${variable}`)
   - Solution: Created `SWATCH_COLORS` object with explicit static class strings
   - Commit: `54fb16b`

2. **Story files updated** — All story files now use `DEMO_TYPE_COLORS` constants
   - Added new colors: projects, resources, success, ideas, dailyNote, page
   - Updated: Sidebar, AppShell, NotesCreatedList, EditorBottomSections, WikiLinks stories
   - Commit: `eca6846`

---

## Previous Session (2026-01-13 evening - Color Centralization Phase 1)

Implemented high+medium priority tasks from color centralization plan.

**Key accomplishments:**

1. **CSS token improvements** — Added dark variants for semantic colors in `tokens/index.css`
   - `--color-success-dark`, `--color-error-dark`, `--color-warning-dark`, `--color-info-dark`

2. **New constant files** — Created 3 new files in `constants/`:
   - `semanticColors.ts` — TypeScript constants matching CSS tokens
   - `demoColors.ts` — Color palette for Ladle story mock data
   - `defaults.ts` — `DEFAULT_ICON_COLOR` for consistent fallbacks

3. **Component updates**
   - Toast: Replaced hardcoded hex with CSS variable references (`bg-success/10 text-success-dark`)
   - Badge: Updated success/warning variants to use semantic colors
   - mockTags.ts: Now uses `DEMO_TYPE_COLORS` constants
   - BacklinkItem + NotesCreatedList: Share `DEFAULT_ICON_COLOR`

**Commit:** `208609f` refactor(design-system): centralize color constants

---

## Previous Session (2026-01-13 evening - MultiselectDropdown Actions Menu)

Enhanced MultiselectDropdown with actions menu and color picker. Audited hardcoded colors across design system.

**Key accomplishments:**

1. **Actions menu** — "..." button on option rows with Edit/Delete/Change Color
   - Nested Floating UI menu with proper z-index stacking
   - 12-color picker (6 colors × 2 variants) derived from pill text colors
   - `onOptionsChange` callback for option mutations

2. **Color system improvements**
   - Derived swatch colors from pill text colors (single source of truth)
   - Audited 40+ hardcoded hex values across 12 component files
   - Created implementation plan for centralization

**Files changed:**

- `MultiselectDropdown.tsx` — OptionActionsMenu component, color picker
- `optionColors.ts` — `getSwatchColorClass()` derives from text colors
- `MultiselectDropdown.stories.tsx` — WithActionsMenu, FullFeatured stories

**Plan created:** `docs/plans/2026-01-13-color-centralization.md`

**Commit:** `e74ad09` feat(design-system): add actions menu to MultiselectDropdown

---

## Previous Session (2026-01-13 - TypeBrowser Phase 3 Complete)

Added rich cell types to TypeBrowser for full inline editing support across all 7 cell types.

**Key accomplishments:**

1. **Rich cell components** — 3 new editable cell types in `cells/` subfolder
   - DateCell: Native date/datetime picker with formatted display (Jan 15, 2026)
   - SelectCell: Dropdown using existing Select component
   - MultiselectCell: Checkbox dropdown with colored pills, "+N" overflow

2. **Colored option pills** — 12-color palette for multiselect options
   - New `optionColors.ts` constants file (6 colors × 2 variants)
   - MultiselectDropdown now renders colored pills instead of plain text
   - Tailwind safelist + CSS tokens for dynamic color classes

3. **4 new Ladle stories** — Focused demos for rich cell editing
   - RichCellEditing, DateCellEditing, SelectCellEditing, MultiselectCellEditing

**New files:**

```
packages/design-system/src/components/TypeBrowser/cells/
├── DateCell.tsx, SelectCell.tsx, MultiselectCell.tsx
packages/design-system/src/constants/optionColors.ts
```

**Commit:** `a8c6768` feat(design-system): add rich cell types to TypeBrowser (Phase 3)

---

## Previous Session (2026-01-13 - TypeBrowser Phase 1 Complete)

Built the TypeBrowser data table component using TanStack Table. Phase 1: sorting, row selection, inline editing for text/number/boolean. 17+ Ladle stories. Commits: `d5412b5`→`9de1cad`

---

## Previous Sessions (2026-01-13)

- **E2E Test Fixes** — Fixed empty search query, Toast selectors (Sonner 2.x), flaky timeouts. Commit: `ce89df4`
- **MultiselectDropdown** — Floating UI + @dnd-kit drag-and-drop. Commit: `ded86c9`
- **Select Component** — Size prop + fixed positioning for PropertyItem. Commit: `70ec931`

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
| TypeBrowser | Phase 1: Data table with sort/select/edit       | 2026-01-13 |
| TypeBrowser | Phase 3: Rich cell types (date/select/multi)    | 2026-01-13 |
| TypeBrowser | Phase 2: Virtualization + column pinning        | 2026-01-14 |
| Colors      | Color centralization (semantic + demo colors)   | 2026-01-14 |
| Pinning     | Object pinning/favorites for sidebar (54 tests) | 2026-01-14 |
| Trash       | Restore from trash with FTS/refs re-index (TDD) | 2026-01-14 |
| Duplicate   | duplicateObject service (6 phases, edge cases)  | 2026-01-14 |
