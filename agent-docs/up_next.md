# Up Next

## Design System Rebuild (Fresh Start)

**Status:** Active — Building features layer
**Approach:** Ladle-first development (components built in sandbox before desktop app)

### Current State

- ✅ Foundation preserved: tokens.css, fonts.css, cn() utility
- ✅ Primitives (21) + patterns (19+) complete; interactive primitives use shadcn/Radix
- ✅ Features complete: Sidebar, TitleBar, HeaderBar, AppShell, Editor, CommandPalette
- ✅ Data grid patterns: DataGridHeaderCell, Selection, RowActions, PropertyList
- ✅ Inline editors: TextEditor, BooleanEditor, SelectEditor (for PropertyList)
- ❌ Renderer placeholder only (no editor wiring, no navigation)

### MVP Design System Gaps (Active)

- [x] Table primitive — compound components + stories
- [x] Dialog primitive — Radix-based with sm/md/lg size variants
- [x] Data grid patterns — DataGridHeaderCell, Selection, RowActions, PropertyList
- [x] CommandPalette feature — search + action launcher with keyboard nav
- [x] ObjectDataGrid design + implementation plan
- [ ] **Execute ObjectDataGrid implementation plan** (10 tasks)
- [ ] Wire AppShell + Editor to desktop renderer

### Immediate Next Steps

**Run this in next session:**

1. `/resume-session` to load context
2. Invoke `superpowers:executing-plans` skill
3. Execute `docs/plans/2026-01-21-object-data-grid-implementation.md`
4. Tasks: Dependencies → Popover → Calendar → DatePicker → DismissibleTag → RelationPicker → ObjectDataGrid

### Folder Structure

- `src/primitives/` — 21 atoms with stories
- `src/patterns/` — 22+ molecules with stories (added editors)
- `src/features/` — 6 features (Sidebar, TitleBar, HeaderBar, AppShell, Editor, CommandPalette)
- `src/components/` — backward-compat re-exports only

### Reference

- ObjectDataGrid design: `docs/plans/2026-01-21-object-data-grid-design.md`
- ObjectDataGrid implementation: `docs/plans/2026-01-21-object-data-grid-implementation.md`
- Data grid contract: `docs/plans/2026-01-21-data-grid-pattern-contract.md`
- Token reference: `/docs/system/QUICK_REFERENCE.md`

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

| Feature                           | Date       | Commits                                    |
| --------------------------------- | ---------- | ------------------------------------------ |
| ObjectDataGrid design + plan      | 2026-01-21 | `785ff95`, `e7290b9`                       |
| Inline editors (Text/Bool/Select) | 2026-01-21 | `4327965`, `d072a9e`, `1508230`, `2d138a3` |
| Data grid patterns                | 2026-01-21 | `2dbe5cc`                                  |
| CommandPalette feature            | 2026-01-21 | `f6bd41d`, `da80c99`, `c88d97e`            |
| Dialog primitive                  | 2026-01-21 | `cddb98e`                                  |
| Table primitive                   | 2026-01-21 | `0159329`                                  |
