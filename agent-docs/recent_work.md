# Recent Work

## Latest Session (2026-01-22 - Unified TitleBar Chrome)

### What was accomplished

- **Unified chrome layout** — Breadcrumbs moved into TitleBar; HeaderBar removed
- **AppShell simplified** — Single-row TitleBar + content; breadcrumbs routed into TitleBar
- **Story updates** — TitleBar/AppShell/pattern contexts updated for 36px chrome row
- **Docs archived** — Unified TitleBar plan moved to archived after completion

### Key files changed

- `packages/design-system/src/features/TitleBar/TitleBar.tsx` + stories
- `packages/design-system/src/features/AppShell/AppShell.tsx` + stories
- `packages/design-system/src/features/HeaderBar/*` (removed)
- `packages/design-system/src/patterns/Breadcrumbs/Breadcrumbs.stories.tsx`
- `docs/plans/archived/2026-01-22-unified-titlebar-breadcrumbs-implementation.md`

### Commits (this session)

- None (uncommitted)

---

## Earlier Session (2026-01-21 - Editable PropertyList Complete)

### What was accomplished

- **Editable PropertyList fully implemented** — All 11 tasks from implementation plan complete
- **6 inline editors** — TextEditor, BooleanEditor, SelectEditor, MultiselectEditor, DateEditor, EditableValue orchestrator
- **New primitives** — Popover (Radix-based), Calendar (react-day-picker v9)
- **New patterns** — DatePicker (hybrid text + calendar), DismissibleTag (for relation chips)
- **Comprehensive stories** — 10 new editable stories covering all property types

### Commits (this session)

- `3bb7e90` docs: add editable PropertyList implementation plan
- `706d9bb` feat(design-system): add DismissibleTag pattern for relation chips
- `8cce0cb` feat(design-system): add DatePicker pattern with text parsing
- `fbeb3f6` feat(design-system): integrate editable PropertyList with comprehensive stories
- `bdab04d` feat(design-system): add Calendar pattern with react-day-picker v9
- `afffa9c` feat(design-system): add EditableValue orchestrator component
- `57a4aa3` feat(design-system): add Popover primitive
- `6a289c1` feat(design-system): add DateEditor for inline property editing
- `3a6daba` deps(design-system): add popover, react-day-picker, date-fns
- `cc806b2` feat(design-system): add MultiselectEditor for inline property editing

### Key patterns

- Click-to-edit UX (Notion-style): value display → click → editor → blur/Enter saves
- Boolean special case: checkbox toggles immediately (no edit mode)
- `exactOptionalPropertyTypes` compliance: all optional props use `| undefined`

---

## Earlier Session (2026-01-21 - ObjectDataGrid Design)

- **ObjectDataGrid design + implementation plan** — 10-task step-by-step plan
- **Started inline editors** — TextEditor, BooleanEditor, SelectEditor
- **PropertyListItem extended** — Added editable mode types
- **Commits:** `785ff95`, `e7290b9`, `4327965`, `d072a9e`, `1508230`, `2d138a3`

---

## Earlier Session (2026-01-21 - Data Grid Patterns + CommandPalette)

- Data grid patterns: DataGridHeaderCell, Selection, RowActions, PropertyList
- CommandPalette feature complete with 3 patterns
- Dialog and Table primitives
- **Commits:** `2dbe5cc`, `f6bd41d`, `da80c99`, `c88d97e`, `cddb98e`, `0159329`

---

## Historical — Collapsed

Editor features, Backend packages stable, Pre-design-system-rebuild work.
