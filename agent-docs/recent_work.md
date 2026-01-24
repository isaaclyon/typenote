# Recent Work

## Latest Session (2026-01-24 - REST Export/Import + Timestamp Fix)

### What was accomplished

- **REST export/import endpoints added** — `/export/all` + `/import/folder` with API schemas and http-server tests
- **Timestamp precision fix** — normalized `applyBlockPatch` to seconds to stop future-dated `updatedAt` values
- **Live smoke tests run** — export/all + markdown export confirmed file outputs and sane timestamps after rebuild

### Key files changed

- `packages/api/src/exportImport.ts`, `packages/api/src/index.ts`
- `packages/http-server/src/routes/export.ts`, `packages/http-server/src/routes/imports.ts`, tests, router
- `packages/storage/src/applyBlockPatch.ts`, `packages/storage/src/applyBlockPatch.update.test.ts`

### Commits (this session)

- `ca974d5` feat(http-server): add export/import routes

---

## Earlier Session (2026-01-22 - REST API Plan + Docs Archive)

### What was accomplished

- **REST API coverage plan drafted** — mapped missing REST endpoints to existing backend services
- **Docs archive consolidated** — merged plan archives into `docs/archive` for cleaner searches
- **Plans archived** — moved completed plans out of `docs/plans`

### Key files changed

- `docs/plans/2026-01-22-rest-api-coverage.md`
- `docs/archive/2026-01-19-markdown-contract-adherence.md`
- `docs/archive/2026-01-21-object-data-grid-implementation.md`
- `docs/archive/2026-01-22-markdown-export.md`

### Commits (this session)

- None

---

## Earlier Session (2026-01-22 - Unified TitleBar Chrome)

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
- `docs/archive/2026-01-22-unified-titlebar-breadcrumbs-implementation.md`

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

## Historical — Collapsed

ObjectDataGrid design plan + data grid patterns + CommandPalette (2026-01-21), editor features, backend packages stable, pre-design-system-rebuild work.
