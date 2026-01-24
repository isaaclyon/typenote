# Up Next

## Design System Rebuild (Fresh Start)

**Status:** Active — Renderer wiring in progress
**Approach:** Ladle-first development (components built in sandbox before desktop app)

### Current State

- ✅ Foundation preserved: tokens.css, fonts.css, cn() utility
- ✅ Primitives (22) + patterns (25+) complete; interactive primitives use shadcn/Radix
- ✅ Features complete: Sidebar, TitleBar (breadcrumbs), AppShell, Editor, CommandPalette
- ✅ ObjectDataGrid feature complete
- ✅ **AppShell + Sidebar wired to renderer** — navigation works, type counts display
- ✅ Test infrastructure for renderer hooks (mocked IPC)
- ❌ Editor not wired (document editing placeholder only)
- ❌ ObjectDataGrid not wired (basic list placeholder in TypesView)
- ❌ CommandPalette not wired (search/actions not connected)

### MVP Renderer Gaps (Remaining)

- [ ] Wire Editor component to NotesView for document editing
- [ ] Wire ObjectDataGrid to TypesView for table view
- [ ] Wire CommandPalette for search + quick actions
- [ ] Connect "New" button to create object flow

### Reference

- AppShell wiring plan: `docs/plans/2026-01-23-appshell-renderer-wiring.md`
- ObjectDataGrid design: `docs/archive/2026-01-21-object-data-grid-design.md`
- Token reference: `/docs/system/QUICK_REFERENCE.md`

---

## REST API Coverage

**Status:** Active — export/import + attachments download + calendar + object types complete; remaining gaps in settings/pinned/templates/attachments upload

### Completed

- [x] Export/import API schemas and routes
- [x] Tasks REST coverage
- [x] Markdown export route
- [x] Attachment download endpoints
- [x] Calendar routes + metadata schema
- [x] Object types REST coverage

### Remaining

- [ ] Settings REST coverage (read/update/reset)
- [ ] Pinned objects REST coverage (list/pin/unpin/reorder)
- [ ] Templates REST coverage (CRUD + default template)
- [ ] Attachments upload/list/cleanup endpoints

---

## Backlog

### E2E Tests

**Status:** Paused — Can resume now that renderer has real components

### Quality & Performance

- [ ] Enable `ignoreStatic: true` in Stryker configs
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

---

## Recently Completed

| Feature                          | Date       | Commits      |
| -------------------------------- | ---------- | ------------ |
| AppShell renderer wiring         | 2026-01-23 | `1d6aa54` +6 |
| REST API coverage (batch)        | 2026-01-24 | `7454e64` +9 |
| REST API coverage (object types) | 2026-01-24 | `8bc76a1`    |
| ObjectDataGrid feature           | 2026-01-22 | `7fa7ba0`    |
| RelationPicker pattern           | 2026-01-21 | `9429a99`    |
| Editable PropertyList            | 2026-01-21 | `3bb7e90` +9 |
