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
- ❌ ObjectDataGrid not wired (basic list placeholder in TypesView)
- ❌ CommandPalette not wired (search/actions not connected)

### MVP Renderer Gaps (Remaining)

- [x] Wire Editor component to NotesView for document editing
- [ ] Wire ObjectDataGrid to TypesView for table view
- [ ] Wire CommandPalette for search + quick actions
- [ ] Connect "New" button to create object flow

### Renderer Follow-ups

- [ ] Invalidate object/type queries on mutations (ref resolver cache refresh)

### DX Improvements

- [ ] Add `electron-vite` or `vite-plugin-electron` for main/preload HMR

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
| Document autosave fixes  | 2026-01-23 | uncommitted  |
| Editor wiring            | 2026-01-23 | uncommitted  |
| AppShell renderer wiring | 2026-01-23 | `1d6aa54` +6 |
| Settings REST coverage   | 2026-01-23 | uncommitted  |
| REST API object types    | 2026-01-24 | `8bc76a1`    |
| REST API batch           | 2026-01-24 | `7454e64` +9 |
| ObjectDataGrid feature   | 2026-01-22 | `7fa7ba0`    |
