# Recent Work

## Latest Session (2026-01-24 - REST Tasks Coverage + Actions)

### What was accomplished

- **Task contracts expanded** — `TaskSummarySchema` added; `GetTasksOptions` gained `completedAfter`, `completedBefore`, `hasDueDate`
- **Unified task query** — `getTasks` in storage handles filters, completion window, and pagination ordering
- **REST tasks endpoints** — read-only routes plus `/tasks/:id/complete` and `/tasks/:id/reopen`, all returning `TaskSummary`
- **Tests added** — API/storage/http-server coverage including pagination + actions
- **Full HTTP server test run** — required port binding (non-sandbox)

### Key files changed

- `packages/api/src/task.ts`, `packages/api/src/task.test.ts`, `packages/api/src/index.ts`
- `packages/storage/src/taskService.ts`, `packages/storage/src/taskService.test.ts`, `packages/storage/src/index.ts`
- `packages/http-server/src/routes/tasks.ts`, `packages/http-server/src/routes/tasks.test.ts`, `packages/http-server/src/router.ts`
- `docs/plans/2026-01-22-rest-api-coverage.md`

### Commits (this session)

- None

---

## Earlier Session (2026-01-24 - REST Export/Import + Timestamp Fix)

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

## Earlier Session (2026-01-21 - Editable PropertyList Complete)

### What was accomplished

- **Editable PropertyList fully implemented** — All 11 tasks from implementation plan complete
- **6 inline editors** — Text/Boolean/Select/Multiselect/Date editors + EditableValue orchestrator
- **New primitives/patterns** — Popover, Calendar, DatePicker, DismissibleTag
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

---

## Historical — Collapsed

Unified TitleBar chrome session (2026-01-22), ObjectDataGrid design plan + data grid patterns + CommandPalette (2026-01-21), editor features, backend packages stable, pre-design-system-rebuild work.
