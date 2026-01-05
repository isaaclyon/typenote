# Recent Work

## Latest Session (2026-01-05 - TipTap Editor Setup)

### TipTap Read-Only Editor Implementation

Set up TipTap as the document renderer for Phase 7 "Simple block editor" task. **NOT YET COMMITTED** — work in progress with some issues to resolve.

**Completed:**

- TipTap packages installed (@tiptap/react, starter-kit, table, task-list, placeholder)
- NotateDoc → TipTap converter (`notateToTiptap.ts`)
- Custom extensions: RefNode, TagNode, CalloutNode, MathBlock, MathInline, Highlight
- NoteEditor component with document fetching
- Selection wiring (App.tsx + ObjectList click handlers)
- getObject IPC handler for ref type lookup
- Fixed Tailwind v4 PostCSS migration (`@tailwindcss/postcss`)
- Fixed Electron preload CommonJS requirement (esbuild bundling)
- Fixed `electron-rebuild` for better-sqlite3 native module

**Known Issues (to fix next session):**

- Empty document shows blank instead of placeholder
- May need to verify TipTap content is being set correctly

**Key new files:**

- `apps/desktop/src/renderer/lib/notateToTiptap.ts` — NotateDoc→TipTap converter
- `apps/desktop/src/renderer/extensions/` — RefNode, TagNode, CalloutNode, MathBlock, MathInline, Highlight
- `apps/desktop/src/renderer/components/NoteEditor.tsx` — TipTap editor component
- `packages/storage/src/objectService.ts` — Added `getObject()` function

**Build changes:**

- `apps/desktop/package.json` — Added esbuild preload bundling to build script
- `apps/desktop/postcss.config.js` — Updated for Tailwind v4
- `apps/desktop/src/renderer/index.css` — Tailwind v4 @theme syntax + TipTap styles

**Reference added:** `_reference/shadcn-admin/` — Cloned for UI pattern reference (not used in code)

---

## Previous Session (2026-01-05 - CLI & IPC Proof of Life)

### Full Backend Exercisability via CLI

Completed Phase 7 "proof of life" by implementing generic object creation with property validation, 3 new IPC handlers, and a full CLI command set.

**New functionality:**

- `createObject(db, typeKey, title, properties)` — Generic object creation with property validation
- 3 new IPC handlers: `searchBlocks`, `getBacklinks`, `createObject`
- CLI commands: `create`, `list`, `get`, `search`, `patch-insert`, `patch-update`, `patch-delete`

**Key files:**

- `packages/storage/src/objectService.ts` — Added `createObject()` with `CreateObjectError`
- `apps/desktop/src/main/ipc.ts` — 3 new handlers (+30 lines)
- `apps/desktop/src/main/ipc.test.ts` — 10 new tests (+130 lines)
- `apps/desktop/src/preload/index.ts` — 3 new bridge methods
- `apps/cli/src/index.ts` — Full CLI implementation (+280 lines)

**TDD cycles:**

1. IPC handler tests (RED) for searchBlocks, getBacklinks, createObject
2. IPC handler implementation (GREEN)
3. Preload bridge wiring
4. CLI patch command implementation

**Commits:**

- `c140b10 feat: Phase 7 - CLI commands and IPC handlers for proof of life`
- `6ebb6ca feat: add integration test suite for backend confidence`

---

## Previous Session (2026-01-04 night - IPC Refactor)

Discovered missing `listObjects` IPC registration. Refactored to "single source of truth" pattern where adding a handler to `createIpcHandlers()` automatically registers it.

**Commit:** `4e077f3 fix: IPC auto-registration and Date serialization`

---

## Previous Session (2026-01-04 night - Shadcn + Object List)

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
