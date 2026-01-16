# Recent Work

## Latest Session (2026-01-15 night - Auto-Hide Scrollbars)

Implemented macOS-style auto-hide scrollbars using Radix ScrollArea.

**Problem:**

- Design spec required "scrollbars only visible on scroll" but they were always visible
- Tried CSS-only approaches with `::-webkit-scrollbar` pseudo-elements — failed due to CSS variable inheritance limitations in pseudo-elements
- Native scrollbar `:hover` detection doesn't work when thumb is transparent

**Solution:**

- Radix ScrollArea with `type="scroll"` provides native JS-based show-on-scroll behavior
- Set `type="scroll"` as default in ScrollArea component
- Wrapped scrollable areas (DailyNoteLayout, standalone DocumentEditor) in ScrollArea
- Removed nested scroll contexts (DocumentEditor no longer has overflow-auto)
- ContentArea changed from `overflow-auto` to `overflow-hidden` (children handle scroll)

**Files changed:**

- `packages/design-system/src/components/ScrollArea/ScrollArea.tsx` — Added `type="scroll"` default
- `packages/design-system/src/components/ScrollArea/ScrollArea.stories.tsx` — Updated stories
- `packages/design-system/src/tokens/index.css` — Cleaned up scrollbar CSS
- `packages/design-system/src/components/AppShell/ContentArea.tsx` — `overflow-hidden`
- `apps/desktop/src/renderer/components/DailyNoteLayout.tsx` — Wrapped in ScrollArea
- `apps/desktop/src/renderer/components/DocumentEditor.tsx` — Removed overflow-auto
- `apps/desktop/src/renderer/App.tsx` — Wrapped standalone DocumentEditor in ScrollArea

**Commit:**

- `960bca2 feat(ui): add macOS-style auto-hide scrollbars using Radix ScrollArea`

---

## Previous Session (2026-01-15 evening - Backlinks Collapse Fix)

Fixed persistent bug where backlinks/unlinked mentions would not stay collapsed.

**Root Cause (Systematic Debugging):**

- Empty state path didn't pass `defaultExpanded={false}`, fell back to component default `true`
- Wrote `localStorage["editor.backlinks.expanded"] = "true"` immediately
- When user navigated to document WITH backlinks, localStorage value overrode prop
- Multiple failed attempts to fix by only setting prop on content path

**Solution:**

- Added `defaultExpanded={false}` to ALL code paths (loading, error, empty, content)
- Changed storageKey to `"editor.sections.backlinks"` to reset polluted values
- Added `localStorage.clear()` to test setup to prevent cross-test pollution
- Updated tests to expand sections before asserting on collapsed content

**Other changes:**

- Added click-to-focus: clicking empty space below editor content focuses the editor
- Removed blue focus ring from InteractiveEditor (overrides global `*:focus-visible` box-shadow)

**Files changed:**

- `BacklinksSection.tsx` + test — `defaultExpanded={false}` on all paths
- `UnlinkedMentionsSection.tsx` + test — `defaultExpanded={false}` on all paths
- `EditorBottomSections.test.tsx` — localStorage.clear() in beforeEach
- `InteractiveEditor.tsx` — onClick handler for focus, CSS for removing focus ring

**Commits:**

- `c6bdb3d feat(editor): collapse backlinks by default and add click-to-focus`
- `5a50e50 fix(editor): ensure all backlinks section states start collapsed`

---

## Previous Session (2026-01-15 - Resizable Sidebars)

Implemented resizable sidebars for the AppShell component with drag-to-resize and snap-to-collapse functionality.

**Architecture (Clean 3-Layer Design):**

- `useResizablePanel` — Generic resize hook with localStorage, clamping, callbacks (reusable for any panel)
- `useResizableSidebar` — Sidebar-specific hook adding snap-to-collapse behavior
- `ResizeHandle` — Visual component with hover/active states

**Features:**

- Width constraints: 180-400px (default 240px)
- Snap-to-collapse: Drag below 120px to collapse to 48px rail
- Independent left/right persistence to localStorage
- Invisible handle by default, 2px accent line on hover
- 43 tests (16 for useResizablePanel, 17 for useResizableSidebar)

**Files Created:**

- `packages/design-system/src/hooks/useResizablePanel.ts` (+ test)
- `packages/design-system/src/components/AppShell/useResizableSidebar.ts` (+ test)
- `packages/design-system/src/components/AppShell/ResizeHandle.tsx` (+ stories)

**Quality Review Fixes:**

- Added try-catch around all localStorage operations (Safari private browsing)
- Created ResizeHandle.stories.tsx per design system rules

**Commit:**

- `31ddc7c feat(design-system): add resizable sidebars to AppShell`

---

## Previous Session (2026-01-15 - Toast Migration & Audit Script)

Built a deterministic design-system audit script and migrated Toast/Toaster from Sonner to design-system.

**Design System Audit Script:**

- `scripts/audit-design-system.ts` — Scans design-system exports, finds usage in desktop app
- `just audit-design-system` — Justfile command to run scanner
- Discovered migration checklist was stale (27/33 migrated, not 26/33)
- Found orphaned components: KeyboardKey (command.tsx deleted), Toast (Sonner used directly)

**Toast Migration:**

- Wrapped Sonner in `packages/design-system/src/components/Toast/Toaster.tsx`
- Re-exported `toast` function from design-system
- Updated all desktop imports: App.tsx, useImageUpload.ts, ipc.ts
- Deleted `apps/desktop/src/renderer/components/ui/sonner.tsx`
- Removed Sonner from desktop package.json (now in design-system)

**Migration Checklist Corrections:**

- Updated `docs/design-system-migration.md` to 29/33 (88%)
- Marked Sidebar, RightSidebar, TypeBrowser as complete (were incorrectly marked incomplete)

**Commits:**

- `0738017 feat(design-system): migrate Toast/Toaster from Sonner to design-system`
- `642251f docs: add Toast migration design`
- `e8b0ddd feat: add design system audit script`
- `f642e67 docs: add design system audit script design`

---

## Previous Session (2026-01-15 - InteractiveEditor Migration)

Replaced desktop's NoteEditor with design-system's InteractiveEditor. Design-system owns editor with callback props (`refSuggestionCallbacks`, `tagSuggestionCallbacks`), desktop's DocumentEditor wraps it with IPC. ~30 extension files deleted.

**Commit:** `260c23c feat(desktop): replace NoteEditor with InteractiveEditor from design-system`

---

## Previous Session (2026-01-15 - CommandPalette DS Migration)

Enhanced CommandPalette with 8 compound components + keyboard navigation hook. Replaced cmdk dependency with design-system components.

**Commits:** `09f280a`, `73b1a7c`

---

## Previous Session (2026-01-15 - Mutation Testing)

Ran Stryker across all packages. Key result: storage/duplicateObjectService.ts improved 58% → 74% (+16%). Most "unkillable" mutants are static (break at module load).

**Commit:** `d60ac2a`

---

## Completed Milestones

| Phase        | Description                                     | Date                |
| ------------ | ----------------------------------------------- | ------------------- |
| (Earlier)    | Phases 0-7 + Templates + Tags + CLI + E2E       | 2026-01-04 to 01-12 |
| TypeBrowser  | Phases 1-3 (sort/virtualize/rich cells)         | 2026-01-14          |
| Pinning      | Object pinning/favorites for sidebar (54 tests) | 2026-01-14          |
| Trash        | Restore from trash with FTS/refs re-index       | 2026-01-14          |
| Tier 1 DS    | Design System Tier 1 migration                  | 2026-01-14          |
| Duplicate    | Object duplication (7 TDD phases, 39 tests)     | 2026-01-15          |
| Tier 2 DS    | Design System Tier 2 migration                  | 2026-01-15          |
| AppShell     | 3-column layout + sidebars + hooks              | 2026-01-15          |
| CmdPalette   | CommandPalette DS migration (replaced cmdk)     | 2026-01-15          |
| IntEditor    | InteractiveEditor migration (~30 files deleted) | 2026-01-15          |
| Toast        | Toast/Toaster wrapped Sonner in DS              | 2026-01-15          |
| ResizeSB     | Resizable sidebars with snap-to-collapse        | 2026-01-15          |
| BacklinksFix | Systematic debug: localStorage pollution bug    | 2026-01-15          |
| Scrollbars   | macOS-style auto-hide via Radix ScrollArea      | 2026-01-15          |
