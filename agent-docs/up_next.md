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
- ✅ **RelationPicker pattern complete** — searchable object picker with create support
- ✅ **ObjectDataGrid feature complete** — types, cell component, main grid with inline editing
- ❌ Renderer placeholder only (no editor wiring, no navigation)

### MVP Design System Gaps (Remaining)

- [x] Table primitive — compound components + stories
- [x] Dialog primitive — Radix-based with sm/md/lg size variants
- [x] Data grid patterns — DataGridHeaderCell, Selection, RowActions, PropertyList
- [x] CommandPalette feature — search + action launcher with keyboard nav
- [x] ObjectDataGrid design + implementation plan
- [x] Editable PropertyList — all editors + orchestrator + stories
- [x] RelationPicker pattern — searchable popover with DismissibleTag integration
- [x] **ObjectDataGrid feature complete** — types, cell component, main grid with stories
- [ ] Wire AppShell + Editor to desktop renderer

### Immediate Next Steps

**Run this in next session:**

1. `/resume-session` to load context
2. Wire AppShell + Editor to desktop renderer
3. Test full app flow with real data

### Reference

- Editable PropertyList plan: `docs/archive/2026-01-21-editable-property-list.md`
- ObjectDataGrid design: `docs/archive/2026-01-21-object-data-grid-design.md`
- ObjectDataGrid implementation: `docs/archive/2026-01-21-object-data-grid-implementation.md`
- Token reference: `/docs/system/QUICK_REFERENCE.md`

---

## REST API Coverage

**Status:** Active — export/import + attachments download + calendar complete; remaining gaps in object types/settings/pinned/templates/attachments upload (plan: `docs/plans/2026-01-22-rest-api-coverage.md`)

### Completed

- [x] Add export/import API schemas (ExportAll/ImportFolder)
- [x] Add `/export/all` + `/import/folder` routes with tests (`ca974d5`)
- [x] Fix `applyBlockPatch` timestamp precision (seconds vs ms)
- [x] Tasks REST coverage: `TaskSummary`, expanded `GetTasksOptions`, unified `getTasks`, `/tasks` + actions, tests
- [x] Commit tasks REST coverage changes + plan update (`fe28986`, `990d0a1`)
- [x] Markdown export route + core markdown export serializer + tests (`9a5bb1d`)
- [x] Add `/export/object` + `/export/type` routes + API schemas + tests (`ba4b2ad`)
- [x] Attachment download headers contract + `/attachments/:id` + `/attachments/:id/content` routes + tests (`ee496b5`, `33a3034`)
- [x] Calendar routes + `CalendarTypeMetadata` schema + date format enforcement + tests (`d48dab9`, `da398c7`, `7454e64`, `ab2881a`)

### In Progress / Next

- [ ] Object types REST coverage (CRUD routes + schemas)
- [ ] Settings REST coverage (read/update/reset)
- [ ] Pinned objects REST coverage (list/pin/unpin/reorder)
- [ ] Templates REST coverage (CRUD + default template)
- [ ] Attachments upload/list/cleanup endpoints + schemas

---

## Backlog

### E2E Tests

**Status:** ⚠️ Blocked by design system rebuild — Most tests will fail until UI is rebuilt

### Quality & Performance

- [ ] Enable `ignoreStatic: true` in Stryker configs for more accurate scores
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future)

- [ ] REST API coverage expansion — in progress (see REST API Coverage section)
- [ ] Relations semantics finalization
- [ ] Unlinked mentions (design spec: `docs/archive/2026-01-10-unlinked-mentions-design.md`)

---

## Recently Completed

| Feature                          | Date       | Commits                                                          |
| -------------------------------- | ---------- | ---------------------------------------------------------------- |
| REST API coverage expansion      | 2026-01-24 | `fe28986`, `9a5bb1d`, `ba4b2ad`, `ee496b5`, `d48dab9`, `7454e64` |
| ObjectDataGrid feature           | 2026-01-22 | `7fa7ba0`                                                        |
| RelationPicker pattern           | 2026-01-21 | `9429a99`, `8068a77`                                             |
| Editable PropertyList (complete) | 2026-01-21 | `3bb7e90` + 9 commits                                            |
| DismissibleTag, DatePicker       | 2026-01-21 | `706d9bb`, `8cce0cb`                                             |
| Popover, Calendar                | 2026-01-21 | `57a4aa3`, `bdab04d`                                             |
| ObjectDataGrid design + plan     | 2026-01-21 | `785ff95`, `e7290b9`                                             |
| CommandPalette feature           | 2026-01-21 | `f6bd41d`, `da80c99`, `c88d97e`                                  |
| Dialog primitive                 | 2026-01-21 | `cddb98e`                                                        |
