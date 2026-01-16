# Recent Work

## Latest Session (2026-01-15 - Resizable Sidebars)

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

| Phase       | Description                                     | Date                |
| ----------- | ----------------------------------------------- | ------------------- |
| (Earlier)   | Phases 0-7 + Templates + Tags + CLI + E2E       | 2026-01-04 to 01-12 |
| TypeBrowser | Phases 1-3 (sort/virtualize/rich cells)         | 2026-01-14          |
| Pinning     | Object pinning/favorites for sidebar (54 tests) | 2026-01-14          |
| Trash       | Restore from trash with FTS/refs re-index       | 2026-01-14          |
| Tier 1 DS   | Design System Tier 1 migration                  | 2026-01-14          |
| Duplicate   | Object duplication (7 TDD phases, 39 tests)     | 2026-01-15          |
| Tier 2 DS   | Design System Tier 2 migration                  | 2026-01-15          |
| AppShell    | 3-column layout + sidebars + hooks              | 2026-01-15          |
| CmdPalette  | CommandPalette DS migration (replaced cmdk)     | 2026-01-15          |
| IntEditor   | InteractiveEditor migration (~30 files deleted) | 2026-01-15          |
| Toast       | Toast/Toaster wrapped Sonner in DS              | 2026-01-15          |
| ResizeSB    | Resizable sidebars with snap-to-collapse        | 2026-01-15          |
