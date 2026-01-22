# Up Next

## Design System Rebuild (Fresh Start)

**Status:** Active — Building features layer
**Approach:** Ladle-first development (components built in sandbox before desktop app)

### Current State

- ✅ Foundation preserved: tokens.css, fonts.css, cn() utility
- ✅ Primitives (20) + patterns (12) complete; interactive primitives use shadcn/Radix
- ✅ Features complete: Sidebar, TitleBar, HeaderBar, AppShell, Editor (Phase 1 + 2a-2g)
- ❌ Renderer placeholder only (no editor wiring, no navigation)

### MVP Design System Gaps (Active)

- [x] Table primitive — compound components + stories
- [ ] Dialog primitive
- [ ] Data grid patterns — DataGridHeaderCell, Selection, RowActions, PropertyList
- [ ] Data grid features — ObjectDataGrid, ObjectDetailHeader, ObjectPropertiesSection
- [ ] CommandPalette feature
- [ ] Pinned column edge styling (scroll-aware) — deferred until pattern work

### Build Sequence

Primitives → patterns → features (see `agent-docs/rules/design-system.md`)

### Feature Inventory

**Complete (6):**

- Sidebar ✅ — Compound component with Header, Section, Footer, Item
- TitleBar ✅ — Custom Electron window chrome (28px, draggable)
- HeaderBar ✅ — App toolbar with breadcrumbs + search + settings
- AppShell ✅ — Composition layer for full app layout
- Editor ✅ — TipTap core plus refs (wiki/heading/block, block IDs), embeds, footnotes, slash command, tags, task lists, code blocks, callouts, tables (toolbar; resize deferred), links/highlight, images (resize + upload UX), math
- NotateDoc Converters ✅ — `packages/core`: tiptapToNotateDoc + notateDocToTiptap (62 tests)

### Immediate Next Steps

1. Wire AppShell + Editor to desktop renderer
2. Enable basic navigation (clicking refs navigates to target)
3. Wire image uploads to app layer (IPC + storage)

### Folder Structure

- `src/primitives/` — 20 atoms with stories
- `src/patterns/` — 12 molecules with stories
- `src/features/` — 5 features (Sidebar, TitleBar, HeaderBar, AppShell, Editor) with stories
- `src/components/` — backward-compat re-exports only

### Reference

- Previous implementation available via `pre-reset` git tag (`88eefdd`)
- Design principles: `agent-docs/to-extract/skills/design-principles/`
- Token reference: `/docs/system/QUICK_REFERENCE.md`

---

## Backlog

### E2E Tests

**Status:** ⚠️ Blocked by design system rebuild — Most tests will fail until UI is rebuilt

Current E2E tests expect UI elements that no longer exist (sidebar navigation, TypeBrowser, editor). Tests will be updated as components are rebuilt in Ladle and integrated into the desktop app.

### Quality & Performance

- [x] Improve mutation testing scores (api: 86.92%, core: 96.50%, storage: 77.51%)
- [x] Mutation testing parallel agent experiment — ~80 tests added, +16% on duplicateObjectService.ts
- [x] Design-system editor helper unit tests (refs, block IDs, slash command, shiki, footnotes, cn)
- [ ] Enable `ignoreStatic: true` in Stryker configs for more accurate scores
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future)

- [ ] Markdown export/import — Architecture designed, ready to implement (see recent_work.md)
- [ ] Relations semantics finalization
- [ ] Unlinked mentions (design spec: `docs/plans/2026-01-10-unlinked-mentions-design.md`)

---

## Recently Completed

| Feature                                                      | Date       | Commits   |
| ------------------------------------------------------------ | ---------- | --------- |
| Image slash insert flow fix (`/image`)                       | 2026-01-21 | `4e792bc` |
| NotateDoc converters (tiptapToNotateDoc + notateDocToTiptap) | 2026-01-21 | `57822b2` |
| Editor.tsx refactoring (1893→562 lines, 5 hooks extracted)   | 2026-01-21 | `0bc2577` |
| Image upload UX (`/image`)                                   | 2026-01-21 | `efd96d5` |
| Embeds (`![[...]]`)                                          | 2026-01-21 | `6501991` |
| Footnotes (`[^key]`)                                         | 2026-01-21 | `352b859` |
| Block IDs + Heading/Block references                         | 2026-01-20 | `cf4b70f` |
| Wiki-link `[[` trigger fix + Tab completion + Alias Mode UX  | 2026-01-20 | `342d296` |
| Image resize + story reorg                                   | 2026-01-20 | `ccb0261` |
| Math support (inline + block with KaTeX)                     | 2026-01-19 | `fa68e93` |
| Table toolbar with row/column/delete controls                | 2026-01-19 | `15fddf5` |
| Primitives + patterns complete                               | 2026-01-18 | `3fdbd5d` |

Note: All features completed before 2026-01-18 were deleted in the full reset.
See `recent_work.md` for historical milestones.
