# Recent Work

## Latest Session (2026-01-18 late night - Design System Full Reset)

**Full reset:** Deleted all design system component implementations while preserving documentation, tokens, and configuration.

### What was accomplished

- Deleted component folders: `ui/`, `AppShell/`, `Sidebar/`, `InteractiveEditor/`
- Deleted stories folder
- Reset `src/index.ts` to export only `cn()` utility
- Removed 16 unused dependencies (Radix primitives, TipTap, cmdk, lucide-react, ProseMirror)
- Simplified desktop app files that imported from design-system

### What was preserved

- **Documentation:** `.claude/skills/design-principles/`, `/docs/system/`
- **Tokens:** `tokens.css`, `fonts.css`
- **Utilities:** `cn()` function
- **Config:** Ladle, Tailwind, TypeScript setup
- **Rules:** `.claude/rules/design-system.md`

### Dependencies kept

- @fontsource/ibm-plex-mono, @fontsource/ibm-plex-sans (fonts)
- @radix-ui/react-slot (foundation primitive)
- class-variance-authority, clsx, tailwind-merge (utilities)

### Post-reset state

Design system package is ready for Ladle-first component development.

---

## Previous Session (2026-01-18 night - InteractiveEditor with Wiki-Links) - NOW DELETED

Built InteractiveEditor with TipTap wiki-link support. All code deleted in reset above.
Preserved concepts: Provider pattern, wiki-link trigger, suggestion popover architecture.

---

## Previous Session (2026-01-18 evening - Design System Reset Phase 1-3)

**Major pivot:** Deleted `packages/design-system/` and `apps/desktop/src/renderer/` entirely and rebuilt from scratch using shadcn/ui as the primitive layer. Previous incremental approach (shadcn Sidebar Integration) was abandoned — clean break needed due to 4 parallel sidebar implementations and ~20% of commits being fixes.

**What was accomplished:**

### Phase 1: Foundation

- Created `pre-reset` git tag at `88eefdd` for safety reference
- Deleted both directories completely (42+ components, 48 stories)
- Initialized fresh `packages/design-system/` with shadcn structure
- Ported CSS tokens from old `tokens/index.css` to `src/lib/tokens.css`
- Set up Ladle with proper theming
- Created minimal renderer with empty App.tsx

### Phase 2: Core Primitives

Created shadcn-style UI components:

- Button, Input, ScrollArea, Tooltip, Dialog
- DropdownMenu, Separator, Checkbox, Switch
- Card, Badge, Skeleton, Label, Command

Fixed TypeScript error by adding `lib: ["ES2022", "DOM", "DOM.Iterable"]` to design-system tsconfig.

### Phase 3: Layout Shell

- Created AppShell (3-column layout: sidebar, content, right panel)
- Created Sidebar with SidebarSection and SidebarItem
- Created HashRouter with routes (NotesView, TypesView, CalendarView)
- Created IPC hooks (useTypeCounts, useSettings) using TanStack Query
- Created RootLayout wiring AppShell + Sidebar + Outlet
- Updated main.tsx with QueryClientProvider + RouterProvider

**Key technical decisions:**

- CVA (class-variance-authority) for variant management
- Radix UI primitives for accessibility
- TanStack Query for IPC data fetching
- HashRouter for Electron file:// compatibility

**Preserved from old system:**

- Typography: IBM Plex Sans/Mono
- Colors: Warm stone grayscale, cornflower accent (#6495ED)
- Spacing: 4px grid

**Status:** Uncommitted — Phase 4 (Core Views) pending. Electron launches with working shell.

**Plan file:** `.claude/plans/iterative-wondering-kahn.md`

---

## Previous Session (2026-01-18 - Sidebar Consolidation + Semantic Tokens)

Consolidated legacy Sidebar/RightSidebar into TypeNoteSidebar + shadcn frames while keeping AppShell as contextual demo.

**What was accomplished:**

- **TypeNote Sidebar Frames**
  - Added `TypeNoteSidebarFrame` and `TypeNoteRightSidebarFrame`.
  - Added tests for the new frames and AppShell frame wrapping.
- **AppShell Integration**
  - AppShell now wraps left/right slots in the new frames.
  - Added props to pass title‑bar padding and className to left sidebar frame.
- **Desktop Integration**
  - Updated `LeftSidebar` to render content only (header/content/footer).
  - Updated `PropertiesPanel` + `DailyNoteLayout` to use new right sidebar frame.
  - Added TypeNoteSidebar pinned section (drag + drop) and wired into LeftSidebar.
- **Cleanup**
  - Removed legacy `Sidebar/*` and `RightSidebar/*` components + exports.
  - Updated AppShell stories to use new TypeNoteSidebar primitives.
- **Semantic Colors**
  - Replaced `gray-*`/`bg-white` with semantic tokens in touched stories.

**Outstanding (explicit):**

- Verify collapse button alignment and header spacing in Ladle + desktop app.
- Decide whether to delete unused `DailyNoteHeader` and `EditorPreview` components.

**Notes:**

- Audit rerun: 39/41 used, unused = `DailyNoteHeader`, `EditorPreview`.
- Auto-review warnings about `hasTitleBarPadding` prop were already resolved in worktree.

---

## Completed Milestones

| Phase        | Description                                             | Date                |
| ------------ | ------------------------------------------------------- | ------------------- |
| WikiLinks    | InteractiveEditor with TipTap wiki-link support         | 2026-01-18          |
| DS Reset 1-3 | Design System reset with shadcn foundation              | 2026-01-18          |
| SidebarCon   | Sidebar consolidation + semantic tokens                 | 2026-01-18          |
| DarkModeFix  | TanStack Query migration for useSettings (shared state) | 2026-01-17          |
| DailyNoteFix | Exclude Daily Notes from 'Created on' lists             | 2026-01-17          |
| TanStack+RR  | TanStack Query + React Router refactor                  | 2026-01-17          |
| E2EFixes     | E2E test fixes for TypeBrowser UI changes               | 2026-01-16          |
| DSAlignment  | Design System audit and alignment                       | 2026-01-16          |
| CustomTitle  | Frameless window with macOS traffic lights              | 2026-01-16          |
| Scrollbars   | macOS-style auto-hide via Radix ScrollArea              | 2026-01-15          |
| BacklinksFix | Systematic debug: localStorage pollution bug            | 2026-01-15          |
| ResizeSB     | Resizable sidebars with snap-to-collapse                | 2026-01-15          |
| Toast        | Toast/Toaster wrapped Sonner in DS                      | 2026-01-15          |
| IntEditor    | InteractiveEditor migration (~30 files deleted)         | 2026-01-15          |
| CmdPalette   | CommandPalette DS migration (replaced cmdk)             | 2026-01-15          |
| AppShell     | 3-column layout + sidebars + hooks                      | 2026-01-15          |
| Tier 2 DS    | Design System Tier 2 migration                          | 2026-01-15          |
| Duplicate    | Object duplication (7 TDD phases, 39 tests)             | 2026-01-15          |
| Tier 1 DS    | Design System Tier 1 migration                          | 2026-01-14          |
| Trash        | Restore from trash with FTS/refs re-index               | 2026-01-14          |
| Pinning      | Object pinning/favorites for sidebar (54 tests)         | 2026-01-14          |
| TypeBrowser  | Phases 1-3 (sort/virtualize/rich cells)                 | 2026-01-14          |
| (Earlier)    | Phases 0-7 + Templates + Tags + CLI + E2E               | 2026-01-04 to 01-12 |
