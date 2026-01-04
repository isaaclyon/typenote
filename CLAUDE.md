# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Claude Context Files

**Always read these at session start:**

| File                             | Purpose                         |
| -------------------------------- | ------------------------------- |
| `claude-docs/up_next.md`         | Active workstreams & tasks      |
| `claude-docs/current_project.md` | Project overview & phase status |
| `claude-docs/recent_work.md`     | Recent session history          |
| `claude-docs/CLAUDE.md`          | How to maintain the above files |

**Rules:**

- Progress updates and session notes go in `claude-docs/`
- Plans go in `.claude/plans/`
- Update `up_next.md` when starting/finishing tasks
- Keep files concise; delete stale content

## Project Overview

TypeNote — A local-first desktop knowledge management app. Backend-first architecture with SQLite storage, typed objects, and block-based documents.

## Commands

```bash
pnpm typecheck        # Type check all packages
pnpm lint             # Lint all packages
pnpm test             # Run all tests
pnpm build            # Build all packages
pnpm format           # Format all files
pnpm format:check     # Check formatting

# Package-specific
pnpm --filter @typenote/cli dev hello     # Test CLI
pnpm --filter @typenote/api test          # Test API package
pnpm --filter @typenote/storage test      # Test storage package
```

## Architecture

**Stack:** Electron, TypeScript (strict), SQLite, Drizzle ORM, Vitest, Zod

**Monorepo Structure:**

```
packages/
├── api/              # API contracts, types, error taxonomy
│   └── src/          # Zod schemas, request/response types
├── core/             # Pure TypeScript domain logic
│   └── src/          # ULID, content schemas, validation
└── storage/          # SQLite layer
    └── src/          # Drizzle schema, migrations, services

apps/
├── cli/              # Backend testing CLI
│   └── src/          # Commander commands
└── desktop/          # Electron + React + Vite
    └── src/
        ├── main/     # Electron main process (DB access)
        ├── preload/  # Context bridge (IPC)
        └── renderer/ # React UI (no DB access)

docs/foundational/    # Bootstrap plan, backend contract, brief
claude-docs/          # Claude context & progress tracking
```

## Package Boundaries

| Package            | Can Import                                                 | Cannot Import          |
| ------------------ | ---------------------------------------------------------- | ---------------------- |
| `packages/api`     | zod                                                        | electron, node fs, db  |
| `packages/core`    | `@typenote/api`, zod, ulid                                 | electron, node fs, db  |
| `packages/storage` | `@typenote/api`, `@typenote/core`, drizzle, better-sqlite3 | electron               |
| `apps/cli`         | All packages, commander                                    | electron               |
| `apps/desktop`     | All packages, electron, react                              | (main only: db access) |

**Critical:** The renderer process must NEVER import storage or access DB directly.

## Key Files

| Purpose                | Location                                |
| ---------------------- | --------------------------------------- |
| TypeScript base config | `tsconfig.base.json`                    |
| ESLint config          | `eslint.config.js`                      |
| Workspace config       | `pnpm-workspace.yaml`                   |
| Bootstrap plan         | `docs/foundational/bootstrap_plan.md`   |
| Backend contract       | `docs/foundational/backend_contract.md` |
| Drizzle config         | `packages/storage/drizzle.config.ts`    |

## Quality Control

- **TypeScript:** Strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- **Linter:** ESLint with architectural boundary checks
- **Formatter:** Prettier (run `pnpm format`)
- **Pre-commit:** Husky + lint-staged (format + lint)
- **Pre-push:** Typecheck + tests

## Architecture Rules

See `.claude/rules/` for detailed patterns:

| Rule File           | Applies To                   | Key Points                              |
| ------------------- | ---------------------------- | --------------------------------------- |
| `architecture.md`   | All code                     | Package boundaries, no cross-imports    |
| `api.md`            | `packages/api/**`            | Zod schemas, complete error taxonomy    |
| `core.md`           | `packages/core/**`           | Pure TS, no side effects                |
| `storage.md`        | `packages/storage/**`        | Transactions, migrations, Drizzle       |
| `electron.md`       | `apps/desktop/**`            | IPC patterns, renderer isolation        |
| `typescript.md`     | All `.ts` files              | Strict mode, no `any`, proper nulls     |
| `patch.md`          | `packages/storage/**`        | Block patch invariants, concurrency     |
| `content-schema.md` | `packages/core/**`, `api/**` | NotateDoc v1, inline nodes, block types |

## Domain Concepts

**Critical specs live in `docs/foundational/`** — always authoritative for domain logic:

- `backend_contract.md` — Block patch API, error codes, content schema (NotateDoc v1)
- `bootstrap_plan.md` — Phase plan, devex requirements, non-negotiables
- `overarching_brief.md` — Product principles, domain model, architectural decisions
