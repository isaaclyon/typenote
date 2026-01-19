# Recent Work

## Latest Session (2026-01-19 - TitleBar Feature + Sidebar Refinements)

### What was accomplished

- Built **TitleBar** feature — custom Electron window chrome replacement
  - 28px height, full width above sidebar and content
  - White background (`bg-background`) for seamless app integration
  - Always draggable via `-webkit-app-region: drag` for window movement
  - Supports both macOS traffic lights and Windows overlay controls
  - 5 Ladle stories: Default, MacOSSimulation, WindowsSimulation, FullAppLayout, DarkMode
- **Sidebar refinements:**
  - Added type-colored hover/active states (tinted backgrounds from `iconColor`)
  - Hover: 10% opacity tint (`#color1A`)
  - Active/selected: 15% opacity tint (`#color26`)
  - Both expanded (NavItem) and collapsed (icon-only) modes supported
  - Improved collapsed-mode tooltip: count displayed as dimmed element (60% opacity) with gap separator
- **AppShell decomposition documented** — planned sequence: TitleBar ✅ → HeaderBar → AppShell

### Key files changed

- `packages/design-system/src/features/TitleBar/` (new feature)
- `packages/design-system/src/patterns/NavItem/NavItem.tsx` (type-colored states)
- `packages/design-system/src/features/Sidebar/SidebarItem.tsx` (type-colored states + tooltip)
- `packages/design-system/src/lib/tokens.css` (added `@source '../features'`)
- `agent-docs/up_next.md` (AppShell decomposition, TitleBar specs)

### Commits

- `4888b68` feat(design-system): add type-colored hover and active states to sidebar items
- `8542c61` refactor(design-system): improve tooltip count display in collapsed sidebar
- `5aaaa86` feat(design-system): add TitleBar feature for custom Electron window chrome

### Status

- Ladle stories: 79 total (up from 74)
- Design system features: 2 complete (Sidebar ✅, TitleBar ✅)
- Next: HeaderBar feature

---

## Previous Session (2026-01-19 - PlaceholderAction + Sidebar Refinements)

### What was accomplished

- Added **PlaceholderAction** pattern — dashed border placeholder for "add new" actions
- Refined Sidebar layout based on design feedback:
  - Removed search from header (will be relocated elsewhere)
  - Swapped header order: `[New note] [collapse toggle]` (toggle closer to content)
  - Changed New note button from `primary` to `secondary` variant (less loud)
  - Added slight indent (`ml-1`) to section content items
- Updated Sidebar stories with new layout: Types + "Add new type" + Favorites
- Footer still has Settings/Theme toggle (noted as temporary until relocated)
- Total: 74 Ladle stories (up from 70)

### Key files changed

- `packages/design-system/src/patterns/PlaceholderAction/` (new)
- `packages/design-system/src/features/Sidebar/SidebarHeader.tsx` (simplified)
- `packages/design-system/src/features/Sidebar/SidebarSection.tsx` (added indent)
- `packages/design-system/src/features/Sidebar/Sidebar.stories.tsx` (new layout)

### Commits

- `86d8cc7` feat(design-system): add Sidebar feature
- `e8b73c4` feat(design-system): add PlaceholderAction pattern and refine Sidebar layout

---

## Previous Session (2026-01-19 - Sidebar Feature)

### What was accomplished

- Built first **feature** component: Sidebar (compound component pattern)
- Created `src/features/` folder structure for domain-specific UI
- Sidebar sub-components: Sidebar, SidebarHeader, SidebarSection, SidebarFooter, SidebarItem

### Commits

- `86d8cc7` feat(design-system): add Sidebar feature

---

## Previous Session (2026-01-18 - All Patterns Complete)

### What was accomplished

- Built EmptyState pattern (icon + heading + description + action)
- Built 4 field patterns: InputField, RadioField, SelectField, SwitchField
- All 8 planned patterns now complete with Ladle stories
- Total: 64 stories in Ladle sandbox

### Commits

- `c5b4a48` feat(design-system): add EmptyState pattern
- `e0ce6b1` feat(design-system): add InputField, RadioField, SelectField, SwitchField patterns

---

## Earlier Sessions (2026-01-18) — Collapsed

Multiple sessions on 2026-01-18 completed the design system foundation:

- **Primitives Complete + Radix Migration** — 18 primitives, 5 migrated to Radix
- **Migration Complete** — Moved to primitives/patterns folder structure
- **Design System Atoms** — Button, Input, Label, Checkbox with subtle focus outlines
- **Design System Full Reset** — Deleted pre-reset code, preserved tokens and docs

Reference: `pre-reset` git tag at `88eefdd` contains all deleted code.

---

## Historical Milestones (Pre-Reset)

Backend packages (api, core, storage) and E2E test infrastructure remain intact.
Features completed before 2026-01-18 reset: Object duplication, Trash/restore, Pinning, TypeBrowser, Templates, Tags, CLI, E2E tests.
