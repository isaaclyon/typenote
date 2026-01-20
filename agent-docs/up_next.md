# Up Next

## Design System Rebuild (Fresh Start)

**Status:** Active — Building features layer
**Approach:** Ladle-first development (components built in sandbox before desktop app)

### Current State

- ✅ Foundation preserved: tokens.css, fonts.css, cn() utility
- ✅ **19 primitives** implemented with co-located stories (added Link)
- ✅ **12 patterns** implemented with co-located stories (added Breadcrumbs, SearchTrigger, ThemeToggle)
- ✅ **All interactive primitives now use shadcn/Radix** for accessibility
- ✅ **5 features complete** — Sidebar, TitleBar, HeaderBar, AppShell, Editor (Phase 1)
- ❌ Renderer is placeholder only (no editor wired, no navigation)

### Build Sequence

Follow primitives → patterns → features as documented in `agent-docs/rules/design-system.md`:

1. **Primitives** — 19 complete
2. **Patterns** — 12 complete
3. **Features** — 5 complete (Sidebar, TitleBar, HeaderBar, AppShell, Editor Phase 1)

### Feature Inventory

**Complete (5):**

- Sidebar ✅ — Compound component with Header, Section, Footer, Item
- TitleBar ✅ — Custom Electron window chrome (28px, draggable)
- HeaderBar ✅ — App toolbar with breadcrumbs + search + settings
- AppShell ✅ — Composition layer for full app layout
- Editor ✅ (Phase 1 + 2a + 2b + 2c) — TipTap/ProseMirror with references, slash commands, tags, and code blocks
  - Paragraphs, headings (h1-h6), basic marks
  - Full-width clickable area with centered content (650px)
  - **RefNode + RefSuggestion** — Wiki-links via `[[` and mentions via `@`
  - **SlashCommand** — `/` trigger for block types (paragraph, h1-h3, lists, quote, code, divider)
  - **TagNode + TagSuggestion** — Hashtags via `#` with autocomplete and creation
  - **TaskList** — Checkboxes via `/task` with nested support, input rules `[ ]`/`[x]`
  - **CodeBlock** — Shiki syntax highlighting, language dropdown, copy button, ` ```lang ` input rules
  - Type-colored inline references with click handling
  - 30 Ladle stories

**Next — NotateDoc converters:**

1. **NotateDoc converters** — Live in `packages/core`, not design-system (TipTap JSON ↔ NotateDoc)

### Immediate Next Steps

1. Wire AppShell + Editor to desktop renderer
2. Enable basic navigation
3. Build NotateDoc converters (TipTap JSON ↔ NotateDoc)

### Folder Structure

- `src/primitives/` — 19 atoms with stories
- `src/patterns/` — 12 molecules with stories
- `src/features/` — 5 features (Sidebar, TitleBar, HeaderBar, AppShell, Editor) with stories
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
| CodeBlock with Shiki syntax highlighting                          | 2026-01-19 | `7d3d04b` |
| TaskList support with slash command and styling                   | 2026-01-19 | `fb84e66` |
| TagNode + TagSuggestion for hashtag support                       | 2026-01-19 | `38ebbb5` |
| SlashCommand menu for block type insertion                        | 2026-01-19 | `19b0551` |
| RefNode styling improvements — hover underline effect             | 2026-01-19 | `2d94de1` |
| Editor Phase 2a — RefNode + RefSuggestion for wiki-links/mentions | 2026-01-19 | `507aba8` |
| Editor feature (Phase 1) — TipTap integration                     | 2026-01-19 | `437af80` |
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
