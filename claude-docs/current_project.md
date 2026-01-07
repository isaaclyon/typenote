# Current Project

## What We're Building

TypeNote — A local-first desktop knowledge management app where typed objects are the core unit. Each object contains a block-based document editor. Think "Notion meets Obsidian" but fully local with SQLite storage.

Key concepts:

- **Objects over pages** — Everything is a typed object (DailyNote, Page, Person, Event, Place)
- **Block-based editing** — Documents are trees of blocks with stable IDs
- **Bidirectional linking** — References extracted and indexed automatically
- **Local-first** — All data in SQLite, offline-capable, no cloud dependency

## Tech Stack

| Layer      | Technology               |
| ---------- | ------------------------ |
| Runtime    | Electron (desktop)       |
| Language   | TypeScript (strict mode) |
| Database   | SQLite + Drizzle ORM     |
| Search     | SQLite FTS5              |
| Editor     | TipTap/ProseMirror       |
| Packages   | pnpm workspaces          |
| Testing    | Vitest + Stryker         |
| Validation | Zod                      |

## Monorepo Structure

```
packages/
  api/      — API contracts, types, error taxonomy
  core/     — Pure TS domain logic, content schemas
  storage/  — SQLite schema, migrations, services
apps/
  cli/      — Backend testing without UI
  desktop/  — Electron + React + Vite
```

## Phase Progress

| Phase | Description                   | Status      |
| ----- | ----------------------------- | ----------- |
| 0     | Day 0 Setup (scaffold, tools) | ✅ Complete |
| 1     | Core Contracts (IDs, schemas) | ✅ Complete |
| 2     | Storage Schema + Migrations   | ✅ Complete |
| 3     | applyBlockPatch() core write  | ✅ Complete |
| 4     | Indexing Side Effects (FTS)   | ✅ Complete |
| 5     | Object Types + Daily Notes    | ✅ Complete |
| 6     | Export/Import + Mutation Test | ✅ Complete |
| 7     | Wire Desktop Shell            | ✅ Complete |

## Key Architecture Decisions

- **Backend-first** — Backend stable before UI work
- **Single SQLite transaction per patch** — Atomicity guaranteed
- **Renderer isolation** — Renderer has no DB access, uses IPC
- **Content schema is editor-agnostic** — NotateDoc v1 not tied to specific editor
- **Soft delete** — Blocks marked deleted, not removed
- **Mutation testing** — Stryker validates test quality (core 80%, storage 75%, api 45% thresholds)

## Quick Commands

```bash
pnpm typecheck     # Type check all packages
pnpm lint          # Lint all packages
pnpm test          # Run all tests (733 tests)
pnpm build         # Build all packages
pnpm mutate        # Run mutation testing
pnpm --filter @typenote/cli dev create Page "Test"  # Create object
pnpm --filter @typenote/cli dev list                  # List objects
pnpm --filter @typenote/cli dev patch-insert <id> paragraph "Hello"  # Add block
```
