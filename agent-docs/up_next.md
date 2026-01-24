# Up Next

## Design System Rebuild (Fresh Start)

**Status:** Active — Building features layer
**Approach:** Ladle-first development (components built in sandbox before desktop app)

### Current State

- ✅ Foundation preserved: tokens.css, fonts.css, cn() utility
- ✅ Primitives (22) + patterns (25+) complete; interactive primitives use shadcn/Radix
- ✅ Features complete: Sidebar, TitleBar (breadcrumbs), AppShell, Editor, CommandPalette
- ✅ Unified chrome: breadcrumbs in TitleBar; HeaderBar removed
- ✅ Data grid patterns: DataGridHeaderCell, Selection, RowActions, PropertyList
- ✅ **Editable PropertyList complete** — All 6 editors, EditableValue orchestrator, stories
- ✅ New primitives: Popover, Calendar, DatePicker, DismissibleTag
- ❌ Renderer placeholder only (no editor wiring, no navigation)

### MVP Design System Gaps (Remaining)

- [x] Table primitive — compound components + stories
- [x] Dialog primitive — Radix-based with sm/md/lg size variants
- [x] Data grid patterns — DataGridHeaderCell, Selection, RowActions, PropertyList
- [x] CommandPalette feature — search + action launcher with keyboard nav
- [x] ObjectDataGrid design + implementation plan
- [x] Editable PropertyList — all editors + orchestrator + stories
- [ ] **Execute ObjectDataGrid implementation plan** (remaining tasks: RelationPicker, ObjectDataGrid)
- [ ] Wire AppShell + Editor to desktop renderer

### Immediate Next Steps

**Run this in next session:**

1. `/resume-session` to load context
2. Build RelationPicker pattern (uses DismissibleTag, Popover)
3. Build ObjectDataGrid feature (the main data table)
4. Wire to desktop renderer

### Reference

- Editable PropertyList plan: `docs/archive/2026-01-21-editable-property-list.md`
- ObjectDataGrid design: `docs/archive/2026-01-21-object-data-grid-design.md`
- ObjectDataGrid implementation: `docs/archive/2026-01-21-object-data-grid-implementation.md`
- Token reference: `/docs/system/QUICK_REFERENCE.md`

---

## REST API Coverage

**Status:** Active — tasks coverage complete; export/markdown work in progress (plan: `docs/plans/2026-01-22-rest-api-coverage.md`)

### Completed

- [x] Add export/import API schemas (ExportAll/ImportFolder)
- [x] Add `/export/all` + `/import/folder` routes with tests (`ca974d5`)
- [x] Fix `applyBlockPatch` timestamp precision (seconds vs ms)
- [x] Tasks REST coverage: `TaskSummary`, expanded `GetTasksOptions`, unified `getTasks`, `/tasks` + actions, tests

### In Progress / Next

- [ ] Commit markdown export route + core markdown serializer + tests (untracked in working tree)
- [ ] Commit Tasks REST coverage changes + plan update
- [ ] Add remaining export endpoints (`/export/object`, `/export/type`) and JSON export/import contracts
- [ ] Define attachment download response contract + headers
- [ ] Start calendar endpoints (`/calendar*`) + `CalendarTypeMetadata` schema

---

## Backlog

### E2E Tests

**Status:** ⚠️ Blocked by design system rebuild — Most tests will fail until UI is rebuilt

### Quality & Performance

- [ ] Enable `ignoreStatic: true` in Stryker configs for more accurate scores
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future)

- [ ] Markdown export/import — export/import endpoints landed; markdown export + object/type export pending
- [ ] REST API coverage expansion — in progress (see REST API Coverage section)
- [ ] Relations semantics finalization
- [ ] Unlinked mentions (design spec: `docs/archive/2026-01-10-unlinked-mentions-design.md`)

---

## Recently Completed

| Feature                          | Date       | Commits                         |
| -------------------------------- | ---------- | ------------------------------- |
| Editable PropertyList (complete) | 2026-01-21 | `3bb7e90` + 9 commits           |
| DismissibleTag, DatePicker       | 2026-01-21 | `706d9bb`, `8cce0cb`            |
| Popover, Calendar                | 2026-01-21 | `57a4aa3`, `bdab04d`            |
| ObjectDataGrid design + plan     | 2026-01-21 | `785ff95`, `e7290b9`            |
| CommandPalette feature           | 2026-01-21 | `f6bd41d`, `da80c99`, `c88d97e` |
| Dialog primitive                 | 2026-01-21 | `cddb98e`                       |
