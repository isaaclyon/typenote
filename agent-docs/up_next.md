# Up Next

## Design System Rebuild (Fresh Start)

**Status:** Active — Building additional primitives and patterns for features
**Approach:** Ladle-first development (components built in sandbox before desktop app)

### Current State

- ✅ Foundation preserved: tokens.css, fonts.css, cn() utility
- ✅ Documentation preserved: agent-docs/to-extract/skills/design-principles/, /docs/system/
- ✅ Ladle configured and ready
- ✅ **18 primitives** implemented with co-located stories
- ✅ **8 patterns** implemented with co-located stories
- ✅ Focus styling updated to subtle outlines
- ✅ Primitives/patterns migration complete (components/ has compat re-exports)
- ✅ **All interactive primitives now use shadcn/Radix** for accessibility
- ✅ **All planned patterns complete** (64 stories total)
- ❌ Renderer is placeholder only (no sidebar, no editor, no navigation)

### Build Sequence

Follow primitives → patterns → features as documented in `agent-docs/rules/design-system.md`:

1. **Primitives** — 18 complete (including ScrollArea, DropdownMenu)
2. **Patterns** — 8 complete (all planned patterns done)
3. **Features** — Sidebar, AppShell, InteractiveEditor (next phase)

### Primitive Inventory

**Complete (18):**

- Button, Input, Label (Radix), Checkbox (Radix), Badge, Skeleton
- IconButton, Divider, Tooltip (Radix), Card, Switch (Radix)
- Radio (Radix), Select (Radix), Textarea, Keycap, Spinner
- ScrollArea (Radix), DropdownMenu (Radix)

**Deprioritized:**

- Avatar (single-player app, not needed yet)

### Pattern Inventory

**Complete (8):**

- CheckboxField ✅ — Checkbox + Label + help text
- EmptyState ✅ — Icon + heading + description + action
- InputField ✅ — Input + Label + help/error text
- NavItem ✅ — Sidebar nav with icon, count, actions
- RadioField ✅ — RadioGroup + Label + help text
- SearchInput ✅ — Input with search icon + clear
- SelectField ✅ — Select + Label + help/error text
- SwitchField ✅ — Switch + Label + help text

### Immediate Next Steps

1. **Build Sidebar feature** — Uses NavItem, ScrollArea, DropdownMenu
2. **Build AppShell feature** — Layout container with sidebar + main content
3. Start editor integration (InteractiveEditor)

### Folder Structure

- `src/primitives/` — 16+ atoms with stories
- `src/patterns/` — 2+ molecules with stories
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

| Feature                              | Date       | Commits   |
| ------------------------------------ | ---------- | --------- |
| All field patterns (4)               | 2026-01-18 | `e0ce6b1` |
| EmptyState pattern                   | 2026-01-18 | `c5b4a48` |
| NavItem pattern + semantic tokens    | 2026-01-18 | `790cd45` |
| ScrollArea, DropdownMenu primitives  | 2026-01-18 | `ddaa58d` |
| Spinner primitive                    | 2026-01-18 | `fd4cf3c` |
| Radix migration (5 primitives)       | 2026-01-18 | `6120d2f` |
| Keycap, Textarea, Select primitives  | 2026-01-18 | `a800321` |
| Radio primitive                      | 2026-01-18 | `af27675` |
| Switch primitive                     | 2026-01-18 | `9ccc7b1` |
| Primitives/Patterns Migration        | 2026-01-18 | `e3a0c5d` |
| Design System Atoms + Focus Outlines | 2026-01-18 | `af21b05` |
| Design System Full Reset             | 2026-01-18 | `3fdbd5d` |

Note: All features completed before 2026-01-18 were deleted in the full reset.
See `recent_work.md` for historical milestones.
