# Up Next

## Design System Rebuild (Fresh Start)

**Status:** Active — Building features layer
**Approach:** Ladle-first development (components built in sandbox before desktop app)

### Current State

- ✅ Foundation preserved: tokens.css, fonts.css, cn() utility
- ✅ **19 primitives** implemented with co-located stories (added Link)
- ✅ **12 patterns** implemented with co-located stories (added Breadcrumbs, SearchTrigger, ThemeToggle)
- ✅ **All interactive primitives now use shadcn/Radix** for accessibility
- ✅ **3 features complete** — Sidebar, TitleBar, HeaderBar
- ❌ Renderer is placeholder only (no editor, no navigation wired)

### Build Sequence

Follow primitives → patterns → features as documented in `agent-docs/rules/design-system.md`:

1. **Primitives** — 19 complete (added Link)
2. **Patterns** — 12 complete (added Breadcrumbs, SearchTrigger, ThemeToggle)
3. **Features** — Sidebar ✅, TitleBar ✅, HeaderBar ✅, AppShell (next)

### Feature Inventory

**Complete (3):**

- Sidebar ✅ — Compound component with Header, Section, Footer, Item
  - Collapsible (240px → 56px icon-only mode)
  - Type-colored hover/active states (tinted backgrounds from iconColor)

- TitleBar ✅ — Custom Electron window chrome
  - Height: 28px compact, full width, draggable region
  - macOS traffic lights + Windows overlay controls

- HeaderBar ✅ — App-level toolbar (above content, not sidebar)
  - Left: SearchTrigger (200px, command palette with ⌘K hint)
  - Center: Breadcrumbs (absolutely centered, type icons, clickable ancestors)
  - Right: Settings button + ThemeToggle
  - Height: 40px compact, no bottom border

**Next:**

1. **AppShell** — Composition layer
   - Combines TitleBar + HeaderBar + Sidebar + main content
   - Controlled state pattern (parent owns sidebar collapsed state)
   - Overall layout grid

2. **InteractiveEditor** — TipTap/ProseMirror integration (future)

### Immediate Next Steps

1. **Build AppShell feature** — Compose TitleBar + Sidebar + HeaderBar + content
2. Wire up to desktop renderer
3. Begin editor integration

### Folder Structure

- `src/primitives/` — 19 atoms with stories
- `src/patterns/` — 12 molecules with stories
- `src/features/` — 3 features (Sidebar, TitleBar, HeaderBar) with stories
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

| Feature                                                           | Date       | Commits   |
| ----------------------------------------------------------------- | ---------- | --------- |
| HeaderBar feature + Link, Breadcrumbs, SearchTrigger, ThemeToggle | 2026-01-19 | `f4c4d73` |
| TitleBar feature                                                  | 2026-01-19 | `5aaaa86` |
| Type-colored hover/active states                                  | 2026-01-19 | `4888b68` |
| PlaceholderAction + Sidebar refinements                           | 2026-01-19 | `e8b73c4` |
| Sidebar feature                                                   | 2026-01-19 | `86d8cc7` |
| All field patterns (4)                                            | 2026-01-18 | `e0ce6b1` |
| EmptyState pattern                                                | 2026-01-18 | `c5b4a48` |
| NavItem pattern + semantic tokens                                 | 2026-01-18 | `790cd45` |
| ScrollArea, DropdownMenu primitives                               | 2026-01-18 | `ddaa58d` |
| Radix migration (5 primitives)                                    | 2026-01-18 | `6120d2f` |
| Design System Full Reset                                          | 2026-01-18 | `3fdbd5d` |

Note: All features completed before 2026-01-18 were deleted in the full reset.
See `recent_work.md` for historical milestones.
