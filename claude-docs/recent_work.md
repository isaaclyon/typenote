# Recent Work

## Latest Session (2026-01-04 night - IPC Refactor)

### IPC Auto-Registration Pattern

Discovered missing `listObjects` IPC registration (unit tests passed but integration would fail). Refactored to "single source of truth" pattern.

**Bug fixes:**

- Added missing `ipcMain.handle('typenote:listObjects', ...)` registration
- Fixed Date serialization in ObjectList (IPC sends strings, not Date objects)

**Architectural refactor:**

- New `setupIpcHandlers(db)` auto-registers all handlers via loop
- Adding a handler to `createIpcHandlers()` now automatically registers it
- Removed 19 lines of manual registration from `main/index.ts`
- Pattern: "Don't remember, automate"

**Lesson learned:**

- Unit tests verify pieces work in isolation, but don't verify they're connected
- Need integration/E2E tests to catch "wiring" issues
- Architectural constraints (single source of truth) prevent classes of bugs

**Commit:** `4e077f3 fix: IPC auto-registration and Date serialization`

---

## Previous Session (2026-01-04 night - Shadcn + Object List)

### Shadcn UI + Object List Shell via TDD

Set up frontend stack and built object list with strict TDD for backend.

**New files:**

- `apps/desktop/tailwind.config.js` — Tailwind with CSS variables
- `apps/desktop/postcss.config.js` — PostCSS for Tailwind
- `apps/desktop/components.json` — Shadcn configuration
- `apps/desktop/src/renderer/index.css` — CSS with theme variables
- `apps/desktop/src/renderer/lib/utils.ts` — `cn()` helper
- `apps/desktop/src/renderer/components/ui/` — Button, Card, ScrollArea
- `apps/desktop/src/renderer/components/ObjectList.tsx` — Object list component
- `packages/storage/src/objectService.ts` — `listObjects()` function (TDD)
- `packages/storage/src/objectService.test.ts` — 3 tests

**Modified files:**

- `apps/desktop/src/main/ipc.ts` — Added `listObjects` handler
- `apps/desktop/src/preload/index.ts` — Exposed `listObjects` via bridge
- `eslint.config.js` — ESLint ignores `components/ui/**` (Shadcn)

**TDD cycles:**

1. Storage: `listObjects` returns objects with type info (RED → GREEN)
2. Storage: Excludes soft-deleted, handles empty
3. IPC: Handler wraps storage function (RED → GREEN)

**Devex:**

- Shadcn components excluded from ESLint
- Stryker already excludes desktop app
- Path alias `@/` configured in tsconfig + Vite

---

## Previous Sessions (2026-01-04)

- **Phase 7 IPC Bridge** — `77fece1` — Handler factory, 9 tests, 4 handlers
- **Shadcn + Object List** — `41a40fe` — Tailwind, Shadcn, ObjectList component
- **Phase 6 Export/Import** — `4b11dc6` — Deterministic JSON export (34 tests)
- **Stryker Mutation Testing** — `b27f704` — Mutation testing for backend packages

---

## Completed Milestones

| Phase | Description                       | Date       |
| ----- | --------------------------------- | ---------- |
| 0     | Day 0 Setup                       | 2026-01-04 |
| 1     | Core Contracts                    | 2026-01-04 |
| 2     | Storage Schema + Migrations       | 2026-01-04 |
| 3     | applyBlockPatch() + getDocument() | 2026-01-04 |
| 4     | Indexing Side Effects (Refs/FTS)  | 2026-01-04 |
| 5     | Object Types + Daily Notes        | 2026-01-04 |
| 6     | Export/Import + Mutation Testing  | 2026-01-04 |
