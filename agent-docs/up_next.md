# Up Next

## Design System Rebuild (Fresh Start)

**Status:** Active — Building features layer
**Approach:** Ladle-first development (components built in sandbox before desktop app)

### Current State

- ✅ Foundation preserved: tokens.css, fonts.css, cn() utility
- ✅ **18 primitives** implemented with co-located stories
- ✅ **9 patterns** implemented with co-located stories (including PlaceholderAction)
- ✅ **All interactive primitives now use shadcn/Radix** for accessibility
- ✅ **Sidebar feature complete** — compound component with 6 stories
- ❌ Renderer is placeholder only (no editor, no navigation wired)

### Build Sequence

Follow primitives → patterns → features as documented in `agent-docs/rules/design-system.md`:

1. **Primitives** — 18 complete
2. **Patterns** — 9 complete (added PlaceholderAction)
3. **Features** — Sidebar ✅, AppShell (next), InteractiveEditor (future)

### Feature Inventory

**Complete (1):**

- Sidebar ✅ — Compound component with Header, Section, Footer, Item
  - Collapsible (240px → 56px icon-only mode)
  - Header: `[New note] [collapse toggle]` (search relocated)
  - Section items slightly indented (`ml-1`)
  - Footer: Settings/theme (temporary, will relocate)
  - Uses semantic token `border-sidebar-border`

**Next:**

- AppShell — Layout container with sidebar + main content area
- InteractiveEditor — TipTap/ProseMirror integration

### Immediate Next Steps

1. **Build AppShell feature** — Layout container with sidebar + main content
2. Start editor integration (InteractiveEditor)
3. Decide permanent location for search, settings, theme toggle

### Folder Structure

- `src/primitives/` — 18 atoms with stories
- `src/patterns/` — 9 molecules with stories
- `src/features/` — 1 feature (Sidebar) with stories
- `src/components/` — backward-compat re-exports only

### Reference

- Previous implementation available via `pre-reset` git tag (`88eefdd`)
- Design principles: `agent-docs/to-extract/skills/design-principles/`
- Token reference: `/docs/system/QUICK_REFERENCE.md`

---

---

## Backlog

### E2E Tests

**Status:** ⚠️ Blocked by design system rebuild — Most tests will fail until UI is rebuilt

Current E2E tests expect UI elements that no longer exist (sidebar navigation, TypeBrowser, editor). Tests will be updated as components are rebuilt in Ladle and integrated into the desktop app.

### Quality & Performance

- [x] Improve mutation testing scores (api: 86.92%, core: 96.50%, storage: 77.51%)
- [x] Mutation testing parallel agent experiment — ~80 tests added, +16% on duplicateObjectService.ts
- [ ] Enable `ignoreStatic: true` in Stryker configs for more accurate scores
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future)

- [ ] Markdown export (in addition to JSON)
- [ ] Relations semantics finalization
- [ ] Unlinked mentions (design spec: `docs/plans/2026-01-10-unlinked-mentions-design.md`)

---

## Recently Completed

| Feature                                 | Date       | Commits   |
| --------------------------------------- | ---------- | --------- |
| PlaceholderAction + Sidebar refinements | 2026-01-19 | `e8b73c4` |
| Sidebar feature                         | 2026-01-19 | `86d8cc7` |
| All field patterns (4)                  | 2026-01-18 | `e0ce6b1` |
| EmptyState pattern                      | 2026-01-18 | `c5b4a48` |
| NavItem pattern + semantic tokens       | 2026-01-18 | `790cd45` |
| ScrollArea, DropdownMenu primitives     | 2026-01-18 | `ddaa58d` |
| Spinner primitive                       | 2026-01-18 | `fd4cf3c` |
| Radix migration (5 primitives)          | 2026-01-18 | `6120d2f` |
| Keycap, Textarea, Select primitives     | 2026-01-18 | `a800321` |
| Radio primitive                         | 2026-01-18 | `af27675` |
| Switch primitive                        | 2026-01-18 | `9ccc7b1` |
| Primitives/Patterns Migration           | 2026-01-18 | `e3a0c5d` |
| Design System Atoms + Focus Outlines    | 2026-01-18 | `af21b05` |
| Design System Full Reset                | 2026-01-18 | `3fdbd5d` |

Note: All features completed before 2026-01-18 were deleted in the full reset.
See `recent_work.md` for historical milestones.
