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
- ✅ **Editor wired to NotesView** — document loading, editing, autosave with block ID tracking
- ✅ Editor autosave robustness — move ops, conflict retry, cached ref resolver
- ✅ Test infrastructure for renderer hooks (mocked IPC)
- ✅ **ObjectDataGrid wired to TypesView** — table view with dynamic columns, sorting, delete
- ✅ **Search enrichment complete** — SearchResult includes object titles, type metadata
- ✅ Depcruise cycles resolved in design-system (PropertyList + editor extensions)
- ⏳ CommandPalette wired but not opened yet (hook exists, needs UI trigger)

### MVP Renderer Gaps (Remaining)

- [x] Wire Editor component to NotesView for document editing
- [x] Wire ObjectDataGrid to TypesView for table view
- [x] Enrich search results with object metadata (titles, type info)
- [ ] Wire CommandPalette UI trigger (⌘K shortcut + AppShell integration)
- [ ] Connect "New" button to create object flow

### Renderer Follow-ups

- [ ] Invalidate object/type queries on mutations (ref resolver cache refresh)

### DX Improvements

- [ ] Add `electron-vite` or `vite-plugin-electron` for main/preload HMR
- [ ] Resolve depcruise orphan warnings (.ladle/config.mjs, renderer App.tsx, typeMetadata)

### Reference

- AppShell wiring plan: `docs/plans/2026-01-23-appshell-renderer-wiring.md`
- ObjectDataGrid design: `docs/archive/2026-01-21-object-data-grid-design.md`
- Token reference: `/docs/system/QUICK_REFERENCE.md`

---

## REST API Coverage

**Status:** ✅ COMPLETE — All 20 endpoints implemented
**Plan:** `docs/plans/2026-01-24-rest-api-coverage-remaining.md`

All REST API endpoints are now fully covered:

- Settings (5/5)
- Pinned objects (4/4) — reorder endpoint added this session
- Templates (7/6) — includes bonus `POST /templates/default`
- Attachments (5/5)

---

## Backlog

### E2E Tests

**Status:** Paused — Can resume now that renderer has real components

### Quality & Performance

- [ ] Enable `ignoreStatic: true` in Stryker configs
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

---

## Recently Completed

| Feature                  | Date       | Commits      |
| ------------------------ | ---------- | ------------ |
| Search enrichment        | 2026-01-24 | `e61ac60`    |
| ObjectDataGrid wiring    | 2026-01-24 | `86daf59`    |
| REST API coverage        | 2026-01-24 | `7454e64` +9 |
| AppShell renderer wiring | 2026-01-23 | `1d6aa54` +6 |
| ObjectDataGrid feature   | 2026-01-22 | `7fa7ba0`    |
