# Up Next

## Design System Rebuild (Fresh Start)

**Status:** Active — Migration in progress
**Approach:** Ladle-first development (components built in sandbox before desktop app)

### Current State

- ✅ Foundation preserved: tokens.css, fonts.css, cn() utility
- ✅ Documentation preserved: agent-docs/to-extract/skills/design-principles/, /docs/system/
- ✅ Ladle configured and ready
- ✅ Button/Input/Label primitives implemented with stories
- ✅ Checkbox primitive + CheckboxField pattern implemented with stories
- ✅ IconButton/SearchInput/Card/Divider/Tooltip added with stories
- ✅ Focus styling updated to subtle outlines
- ⚠️ Primitives/patterns migration in progress (compat re-exports in components/)
- ❌ Renderer is placeholder only (no sidebar, no editor, no navigation)

### Build Sequence

Follow primitives → patterns → features as documented in `agent-docs/rules/design-system.md`:

1. **Primitives** — Button ✅, Input ✅, Label ✅, Checkbox ✅, Badge ✅, Skeleton ✅, IconButton ✅, Divider ✅, Tooltip ✅, Card ✅
2. **Patterns** — CheckboxField ✅, SearchInput ✅
3. **Features** — Sidebar, AppShell, InteractiveEditor

### Primitive Inventory (Draft)

Core primitives for a note-taking app:

- Button ✅
- Input ✅
- Label ✅
- Checkbox ✅
- Badge ✅
- Skeleton ✅
- IconButton ✅
- Divider ✅
- Tooltip ✅
- Card ✅
- Avatar (deprioritized for single-player)
- Switch
- Radio
- SelectTrigger
- Textarea
- Keycap
- Spinner

### Immediate Next Steps

1. Finish primitives: Switch, Radio
2. Backfill primitives: SelectTrigger, Textarea, Keycap, Spinner
3. Finish migration: update imports in renderer + remove components/ when safe
4. Keep iterating in Ladle before desktop integration

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
| Design System Atoms + Focus Outlines | 2026-01-18 | `af21b05` |
| Design System Full Reset             | 2026-01-18 | `3fdbd5d` |
| InteractiveEditor wiki-link          | 2026-01-18 | `f9f6602` |
| shadcn Foundation Reset              | 2026-01-18 | `93b738d` |

Note: All features completed before 2026-01-18 were deleted in the full reset.
See `recent_work.md` for historical milestones.
