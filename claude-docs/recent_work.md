# Recent Work

## Latest Session (2026-01-06 - Placeholder Validation)

### Verified TipTap Placeholder Implementation

Confirmed that the "empty document placeholder" issue was already resolved in the TipTap editor implementation.

**Findings:**

- Code audit revealed all components were correctly implemented:
  - Placeholder extension configured with `showOnlyWhenEditable: false`
  - Empty document handling in converter (creates minimum valid ProseMirror structure)
  - CSS styling in place for placeholder display
- Tested with fresh dependencies (clean pnpm install + rebuild)
- Desktop app builds successfully without errors

**Marked complete:** "Simple block editor (read-only)" phase 7 task

---

## Previous Session (2026-01-05 - Dev Environment Fix)

### Postinstall Script for Native Modules

Fixed development environment issues caused by Node.js version mismatch and Electron native module compilation.

**Problems solved:**

- `MODULE_NOT_FOUND` error for yargs (Node 25.2.1 incompatibility with installed modules)
- `better-sqlite3` NODE_MODULE_VERSION mismatch (compiled for Node, not Electron)

**Solution:**

- Reinstalled node_modules with fresh lockfile
- Ran `electron-rebuild` to recompile native modules for Electron
- Added `postinstall` script to auto-rebuild after future installs

**Commit:** `e5d2b43 chore: add postinstall script to auto-rebuild native modules for Electron`

---

## Previous Session (2026-01-05 - TipTap Editor Setup)

### TipTap Read-Only Editor Implementation

Set up TipTap as the document renderer for Phase 7 "Simple block editor" task.

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

**Commit:** `8fa1b25 feat: Phase 7 - TipTap read-only editor with shared database path`

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

## Previous Sessions (2026-01-04 & 2026-01-05)

- **CLI & IPC Proof of Life** — `c140b10`, `6ebb6ca` — CLI commands, integration tests
- **IPC Refactor** — `4e077f3` — Auto-registration pattern
- **Shadcn + Object List** — `41a40fe` — Tailwind, Shadcn, ObjectList component
- **Phase 7 IPC Bridge** — `77fece1` — Handler factory, 9 tests, 4 handlers
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
