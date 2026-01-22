# Up Next

## Design System Rebuild (Fresh Start)

**Status:** Active — Building features layer
**Approach:** Ladle-first development (components built in sandbox before desktop app)

### Current State

- ✅ Foundation preserved: tokens.css, fonts.css, cn() utility
- ✅ Primitives (21) + patterns (19) complete; interactive primitives use shadcn/Radix
- ✅ Features complete: Sidebar, TitleBar, HeaderBar, AppShell, Editor, CommandPalette
- ❌ Renderer placeholder only (no editor wiring, no navigation)

### MVP Design System Gaps (Active)

- [x] Table primitive — compound components + stories
- [x] Dialog primitive — Radix-based with sm/md/lg size variants
- [x] Data grid patterns — DataGridHeaderCell, Selection, RowActions, PropertyList (uncommitted)
- [x] CommandPalette feature — search + action launcher with keyboard nav
- [ ] Data grid features — ObjectDataGrid, ObjectDetailHeader, ObjectPropertiesSection
- [ ] Pinned column edge styling (scroll-aware) — deferred until feature work

### Immediate Next Steps

1. Commit data grid patterns (uncommitted from earlier session)
2. Wire AppShell + Editor to desktop renderer
3. Enable basic navigation (clicking refs navigates to target)
4. Build ObjectDataGrid feature (compose patterns + TanStack Table)

### Folder Structure

- `src/primitives/` — 21 atoms with stories
- `src/patterns/` — 19 molecules with stories (added CommandPalette patterns)
- `src/features/` — 6 features (Sidebar, TitleBar, HeaderBar, AppShell, Editor, CommandPalette)
- `src/components/` — backward-compat re-exports only

### Reference

- Design principles: `agent-docs/to-extract/skills/design-principles/`
- Token reference: `/docs/system/QUICK_REFERENCE.md`
- Data grid contract: `docs/plans/2026-01-21-data-grid-pattern-contract.md`
- CommandPalette spec: `docs/plans/2026-01-21-command-palette-design.md`

---

## Backlog

### E2E Tests

**Status:** ⚠️ Blocked by design system rebuild — Most tests will fail until UI is rebuilt

### Quality & Performance

- [ ] Enable `ignoreStatic: true` in Stryker configs for more accurate scores
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future)

- [ ] Markdown export/import — Architecture designed, ready to implement
- [ ] Relations semantics finalization
- [ ] Unlinked mentions (design spec: `docs/plans/2026-01-10-unlinked-mentions-design.md`)

---

## Recently Completed

| Feature                | Date       | Commits                         |
| ---------------------- | ---------- | ------------------------------- |
| CommandPalette feature | 2026-01-21 | `f6bd41d`, `da80c99`, `c88d97e` |
| Dialog primitive       | 2026-01-21 | `cddb98e`                       |
| Table primitive        | 2026-01-21 | `0159329`                       |
