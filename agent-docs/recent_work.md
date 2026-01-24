# Recent Work

## Latest Session (2026-01-24 - CSS layout fixes)

### What was accomplished

- **Full-height layout fix** — App now fills entire window (was cutting off halfway)
  - Added `height: 100%` to html/body/#root in tokens.css
  - AppShell's `h-full` now works correctly with proper ancestor heights
- **Divider overflow fix** — Horizontal dividers no longer overlap sidebar border
  - Removed `w-full` from Divider primitive (block elements fill naturally)
  - Added asymmetric margins `ml-2 mr-4` to SidebarFooter divider
- **CLAUDE.md updates** — Added learnings about CSS height propagation and `w-full` + margins anti-pattern

### Key files changed

- `packages/design-system/src/lib/tokens.css` — Added html/body/#root height chain
- `packages/design-system/src/primitives/Divider/Divider.tsx` — Removed `w-full` from horizontal
- `packages/design-system/src/features/Sidebar/SidebarFooter.tsx` — Asymmetric margins
- `CLAUDE.md` — Development notes section
- `.claude/rules/design-system.md` — New anti-pattern

### Commits

- None (uncommitted CSS fixes)

---

## Earlier Session (2026-01-24 - Web mode + UI alignment)

### What was accomplished

- **Web mode setup** — Full HTTP-based dev mode (no Electron!) for faster iteration
  - HTTP adapter implementing TypenoteAPI interface via fetch
  - Environment auto-detection (Electron vs web)
  - Router adapts: HashRouter for Electron, BrowserRouter for web
  - Vite proxy + CORS middleware
  - Dev server using real database (`~/.typenote/typenote.db`)
  - Commands: `pnpm --filter @typenote/http-server dev` + `pnpm --filter @typenote/desktop dev:web`
- **Icon mapping fixed** — Types show correct icons (Calendar, User, MapPin, CheckSquare)
- **API adapter pattern** — All hooks migrated from `window.typenoteAPI` to `api` (adapter)
- **UI alignment** — Per `docs/plans/2026-01-24-ui-alignment.md`: header "New note", footer (Archive/Dark mode/Settings), Calendar row removed, spacing

### Key files added

- `apps/desktop/src/renderer/lib/api.ts` — Environment-aware API client
- `apps/desktop/src/renderer/lib/httpAdapter.ts` — HTTP adapter
- `packages/http-server/src/dev.ts` — Dev server script

### Key files changed

- All renderer hooks (`useTypeCounts`, `usePinnedObjects`, `useCreateObject`, etc.)
- `apps/desktop/src/renderer/layouts/RootLayout.tsx` — Icon mapping + footer
- `apps/desktop/src/renderer/lib/router.tsx` — Hash/Browser router switching
- `apps/desktop/vite.config.ts` — Web mode + proxy
- `packages/http-server/src/server.ts` — CORS middleware
- `packages/design-system/src/features/Sidebar/SidebarHeader.tsx` — Styling

### Commits

- None (experimental DX feature)

---

## Earlier Session (2026-01-24 - Type alignment + destructive purge)

### What was accomplished

- **Type alignment** — PascalCase keys (`Page`), `pluralName` labels, `builtInOnly` queries
- **Destructive cleanup** — `purgeUnsupportedTypes()` wired to `seedBuiltInTypes()`
- **Design-system** — Tasks added to Sidebar/AppShell stories

### Key files changed

- `packages/storage/src/{typeCleanup.ts,objectTypeService.ts}`
- Renderer hooks + `RootLayout.tsx`
- Sidebar stories

### Commits

- None

---

## Historical — Collapsed

- .code prompts + skills (2026-01-24): Added session/E2E wrappers, ported design-principles skill
- Design-system depcruise fix (2026-01-24): Broke cycles with shared types — `860462d`
- Search enrichment (2026-01-24): Metadata in search results — `e61ac60`
- Web mode + UI alignment (2026-01-24): HTTP adapter, icon mapping, footer styling
- Type alignment + destructive purge (2026-01-24): PascalCase keys, `builtInOnly`, `purgeUnsupportedTypes()`
- ObjectDataGrid wiring (2026-01-24): TypesView integration — `86daf59`
- REST API coverage complete (2026-01-24): 20 endpoints — `7454e64` +9
- Editor + autosave robustness (2026-01-23): Move ops, retry, ref resolver
- AppShell renderer wiring (2026-01-23): `1d6aa54` +6
- PropertyList + ObjectDataGrid feature (2026-01-21)
