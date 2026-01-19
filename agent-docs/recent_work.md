# Recent Work

## Latest Session (2026-01-18 - Primitives Complete + Radix Migration)

### What was accomplished

- Built 6 new primitives: Switch, Radio, Keycap, Textarea, Select, Spinner
- Migrated 5 primitives to shadcn/Radix for proper accessibility:
  - Checkbox → @radix-ui/react-checkbox
  - Label → @radix-ui/react-label
  - Switch → @radix-ui/react-switch
  - Radio → @radix-ui/react-radio-group
  - Select → @radix-ui/react-select
- All 16 primitives now complete with Ladle stories
- Updated CheckboxField pattern to work with Radix Checkbox
- All checks passing: typecheck, lint, Ladle build (16 stories)

### Key files changed

- `packages/design-system/src/primitives/Switch/` (new)
- `packages/design-system/src/primitives/Radio/` (new, then Radix)
- `packages/design-system/src/primitives/Keycap/` (new)
- `packages/design-system/src/primitives/Textarea/` (new)
- `packages/design-system/src/primitives/Select/` (new, then Radix)
- `packages/design-system/src/primitives/Spinner/` (new)
- `packages/design-system/src/primitives/Checkbox/` (Radix migration)
- `packages/design-system/src/primitives/Label/` (Radix migration)
- `packages/design-system/src/patterns/CheckboxField/` (updated for Radix)
- `packages/design-system/package.json` (added 5 Radix deps)

### Commits

- `fd4cf3c` feat(design-system): add spinner primitive
- `6120d2f` refactor(design-system): replace primitives with shadcn/Radix implementations
- `a800321` feat(design-system): add keycap, textarea, and select primitives
- `af27675` feat(design-system): add radio primitive
- `9ccc7b1` feat(design-system): add switch primitive

---

## Previous Session (2026-01-18 - Migration Complete)

### What was accomplished

- Completed primitives/patterns folder structure migration
- Moved 10 primitives to `src/primitives/` with co-located stories
- Moved 2 patterns to `src/patterns/` with co-located stories
- Converted `src/components/` to backward-compat re-exports only
- Fixed duplicate exports in main `index.ts`
- Removed redundant `.tsx` files from components/ (kept only `index.ts`)
- All checks passing: typecheck, lint, Ladle build (12 stories)

### Key files changed

- `packages/design-system/src/primitives/` (10 components + stories)
- `packages/design-system/src/patterns/` (2 components + stories)
- `packages/design-system/src/components/` (re-exports only)
- `packages/design-system/src/index.ts`

### Commits

- `e3a0c5d` refactor(design-system): migrate components to primitives/patterns structure

---

## Previous Session (2026-01-18 - Design System Atoms + Focus Outlines)

### What was accomplished

- Built Button/Input/Label atoms with Ladle stories
- Added Checkbox atom + CheckboxField molecule for label/help alignment
- Switched focus styling from glow rings to subtle outlines in tokens and docs
- Fixed Ladle story glob to pick up design-system stories
- Archived legacy planning docs into `docs/plans/archive/`

### Key files changed

- `packages/design-system/src/components/Button/*`
- `packages/design-system/src/components/Input/*`
- `packages/design-system/src/components/Label/*`
- `packages/design-system/src/components/Checkbox/*`
- `packages/design-system/src/components/CheckboxField/*`
- `packages/design-system/src/lib/tokens.css`
- `docs/system/README.md`
- `packages/design-system/.ladle/config.mjs`

### Commits

- `af21b05` feat(design-system): add checkbox field components
- `f8291a4` feat(design-system): add button and form atoms
- `72b6a99` chore(docs): archive planning docs

---

## Previous Session (2026-01-18 late night - Design System Full Reset)

**Full reset:** Deleted all design system component implementations while preserving documentation, tokens, and configuration.

### What was accomplished

- Deleted component folders: `ui/`, `AppShell/`, `Sidebar/`, `InteractiveEditor/`
- Deleted stories folder
- Reset `src/index.ts` to export only `cn()` utility
- Removed 16 unused dependencies (Radix primitives, TipTap, cmdk, lucide-react, ProseMirror)
- Simplified desktop app files that imported from design-system

### What was preserved

- **Documentation:** `agent-docs/to-extract/skills/design-principles/`, `/docs/system/`
- **Tokens:** `tokens.css`, `fonts.css`
- **Utilities:** `cn()` function
- **Config:** Ladle, Tailwind, TypeScript setup
- **Rules:** `agent-docs/rules/design-system.md`

### Dependencies kept

- @fontsource/ibm-plex-mono, @fontsource/ibm-plex-sans (fonts)
- @radix-ui/react-slot (foundation primitive)
- class-variance-authority, clsx, tailwind-merge (utilities)

### Post-reset state

Design system package is ready for Ladle-first component development.

---

## Previous Sessions (2026-01-18) — All Superseded by Full Reset

Three incremental design system sessions were completed on 2026-01-18 before the full reset:

1. **Sidebar Consolidation** — Consolidated legacy sidebars into shadcn frames
2. **shadcn Foundation Reset** — Rebuilt design-system from scratch with shadcn/ui
3. **InteractiveEditor with Wiki-Links** — TipTap editor with `[[` trigger

All code from these sessions was deleted in the full reset. Key concepts preserved:

- Provider pattern for editor context
- Wiki-link trigger and suggestion popover architecture
- CVA for variant management, HashRouter for Electron

Reference: `pre-reset` git tag at `88eefdd` contains all deleted code.

---

## Historical Milestones (Pre-Reset)

Backend packages (api, core, storage) and E2E test infrastructure remain intact.
Features completed before 2026-01-18 reset: Object duplication, Trash/restore, Pinning, TypeBrowser, Templates, Tags, CLI, E2E tests.
