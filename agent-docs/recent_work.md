# Recent Work

## Latest Session (2026-01-19 - Sidebar Feature)

### What was accomplished

- Built first **feature** component: Sidebar (compound component pattern)
- Created `src/features/` folder structure for domain-specific UI
- Sidebar sub-components: Sidebar, SidebarHeader, SidebarSection, SidebarFooter, SidebarItem
- SidebarItem wraps NavItem with collapsed-mode tooltip support
- Header layout: Collapse toggle + Search trigger (row 1), New action (row 2)
- Footer: Full rows with icon + label (expanded), icon-only with tooltips (collapsed)
- Uses `Sidebar` icon from Phosphor for collapse/expand toggle
- Right border uses semantic token `border-sidebar-border`
- 6 Ladle stories: Default, Collapsed, WithSecondarySections (Types + Favorites), WithManyItems, WithActionsAndCounts, NoLabels
- All checks passing: typecheck, lint, Ladle build

### Key files changed

- `packages/design-system/src/features/Sidebar/` (new folder)
  - `types.ts`, `SidebarContext.tsx`, `Sidebar.tsx`
  - `SidebarHeader.tsx`, `SidebarSection.tsx`, `SidebarFooter.tsx`, `SidebarItem.tsx`
  - `Sidebar.stories.tsx`, `index.ts`
- `packages/design-system/src/features/index.ts` (new)
- `packages/design-system/src/index.ts` (added features export)

### Commits

- (uncommitted) feat(design-system): add Sidebar feature

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

## Previous Session (2026-01-18 - Primitives Complete + Radix Migration)

### What was accomplished

- Built 6 new primitives: Switch, Radio, Keycap, Textarea, Select, Spinner
- Migrated 5 primitives to shadcn/Radix for proper accessibility:
  - Checkbox → @radix-ui/react-checkbox
  - Label → @radix-ui/react-label
  - Switch → @radix-ui/react-switch
  - Radio → @radix-ui/react-radio-group
  - Select → @radix-ui/react-select
- All 16 primitives now complete with Ladle stories
- Updated CheckboxField pattern to work with Radix Checkbox
- All checks passing: typecheck, lint, Ladle build (16 stories)

### Key files changed

- `packages/design-system/src/primitives/Switch/` (new)
- `packages/design-system/src/primitives/Radio/` (new, then Radix)
- `packages/design-system/src/primitives/Keycap/` (new)
- `packages/design-system/src/primitives/Textarea/` (new)
- `packages/design-system/src/primitives/Select/` (new, then Radix)
- `packages/design-system/src/primitives/Spinner/` (new)
- `packages/design-system/src/primitives/Checkbox/` (Radix migration)
- `packages/design-system/src/primitives/Label/` (Radix migration)
- `packages/design-system/src/patterns/CheckboxField/` (updated for Radix)
- `packages/design-system/package.json` (added 5 Radix deps)

### Commits

- `fd4cf3c` feat(design-system): add spinner primitive
- `6120d2f` refactor(design-system): replace primitives with shadcn/Radix implementations
- `a800321` feat(design-system): add keycap, textarea, and select primitives
- `af27675` feat(design-system): add radio primitive
- `9ccc7b1` feat(design-system): add switch primitive

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
