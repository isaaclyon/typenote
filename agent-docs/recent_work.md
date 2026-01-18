# Recent Work

## Latest Session (2026-01-18 late night - Design System Full Reset)

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

## Historical Milestones (Code Deleted in Reset)

These features were completed before the full reset. The code no longer exists but represents the implementation history:

| Phase       | Description                                             | Date       |
| ----------- | ------------------------------------------------------- | ---------- |
| DarkModeFix | TanStack Query migration for useSettings (shared state) | 2026-01-17 |
| TanStack+RR | TanStack Query + React Router refactor                  | 2026-01-17 |
| E2EFixes    | E2E test fixes for TypeBrowser UI changes               | 2026-01-16 |
| IntEditor   | InteractiveEditor migration (~30 files deleted)         | 2026-01-15 |
| AppShell    | 3-column layout + sidebars + hooks                      | 2026-01-15 |
| Duplicate   | Object duplication (7 TDD phases, 39 tests)             | 2026-01-15 |
| Trash       | Restore from trash with FTS/refs re-index               | 2026-01-14 |
| Pinning     | Object pinning/favorites for sidebar (54 tests)         | 2026-01-14 |
| TypeBrowser | Phases 1-3 (sort/virtualize/rich cells)                 | 2026-01-14 |
| (Earlier)   | Phases 0-7 + Templates + Tags + CLI + E2E               | 2026-01-04 |

Note: Backend packages (api, core, storage) and E2E test infrastructure remain intact.
