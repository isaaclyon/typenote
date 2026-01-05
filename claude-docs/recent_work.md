# Recent Work

## Latest Session (2026-01-04 night - Shadcn + Object List)

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

## Previous Session (2026-01-04 late evening - Phase 7 IPC)

### Phase 7 Started — IPC Bridge via TDD

Wired up Electron IPC communication between renderer and main process using 6 TDD cycles (7 tests).

**New files:**

- `apps/desktop/src/main/ipc.ts` — Handler factory with `createIpcHandlers(db)`
- `apps/desktop/src/main/ipc.test.ts` — 7 tests covering all handlers
- `apps/desktop/src/preload/api.d.ts` — TypeScript types for `window.typenoteAPI`
- `apps/desktop/vitest.config.mjs` — Test configuration for desktop app

**Handlers implemented:**

- `getDocument(objectId)` — Retrieve document block tree
- `applyBlockPatch(request)` — Apply mutations with Zod validation
- `getOrCreateTodayDailyNote()` — Get/create today's daily note

**Architecture patterns:**

- Handlers are pure functions testable without Electron runtime
- Consistent outcome pattern: `{ success, result/error }`
- DB initialized at `app.whenReady`, closed at `before-quit`

**Commit:**

- `77fece1 feat: Phase 7 - IPC bridge for Electron desktop app`

---

## Previous Session (2026-01-04 evening - Phase 6 + Stryker)

Phase 6 complete: Export/Import service (34 tests) + Stryker mutation testing.

- `4b11dc6 feat: Phase 6 - Export/Import service for Git-friendly backup`
- `b27f704 feat: add Stryker mutation testing for backend packages`

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
