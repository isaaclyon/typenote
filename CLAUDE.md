# TypeNote Monorepo (Claude Code)

TypeNote is a local-first Electron desktop knowledge app with strict package boundaries and a rebuilt design system. Treat the rules in `agent-docs/rules/` as authoritative.

## Collaboration Note

Other agents may work in this tree at the same time. Changes you didn't make are not your responsibility, but keep them in mind when assessing behavior or reasoning about repo state.

## Context Auto-Loaded

These files provide project context and are loaded automatically at session start:

- `agent-docs/current_project.md` — Current phase, milestones, and focus
- `agent-docs/up_next.md` — Active workstreams, blockers, and tasks
- `agent-docs/recent_work.md` — Recent sessions, accomplishments, and file changes

## Load-on-Demand Rules (Required)

When your task touches one of these areas, read the matching rule file and follow it as mandatory. Do not load all rules up front.

- Architecture/package boundaries: `agent-docs/rules/architecture.md`
- TypeScript strictness: `agent-docs/rules/typescript.md`
- Renderer patterns (TanStack Query, routing): `agent-docs/rules/renderer-patterns.md`
- Electron process isolation + IPC: `agent-docs/rules/electron.md`
- Design system workflow (Ladle-first): `agent-docs/rules/design-system.md`
- API contracts + errors: `agent-docs/rules/api.md`
- Core domain logic: `agent-docs/rules/core.md`
- Storage/DB patterns: `agent-docs/rules/storage.md`
- Block patch invariants: `agent-docs/rules/patch.md`
- Content schema (NotateDoc): `agent-docs/rules/content-schema.md`
- E2E testing conventions: `agent-docs/rules/e2e-testing.md`

## Repository Layout

- `packages/api` — API contracts, Zod schemas, error taxonomy
- `packages/core` — Pure TS domain logic (no I/O)
- `packages/storage` — SQLite schema, migrations, data access
- `packages/design-system` — UI components + Ladle stories
- `apps/desktop` — Electron main + preload + renderer
- `apps/cli` — Headless testing CLI
- `tests/integration` — Vitest integration suite
- `tests/e2e` — Playwright E2E suite

## House Style Summary

- TypeScript strict mode is mandatory; avoid `any` and non-null assertions.
- Use `unknown` + narrowing in `catch` blocks.
- With `verbatimModuleSyntax`, use `import type` for type-only imports.
- Prefer workspace imports (`@typenote/*`) over relative cross-package imports.
- Keep naming consistent with the surrounding folder; match existing file conventions.
- Errors must use the canonical API error taxonomy from `packages/api`.
- IPC responses use a success/error envelope; check `success` before accessing data.

## Architecture Boundaries (Never Break)

- `packages/api` is the foundation; it cannot import from other packages.
- `packages/core` can import `@typenote/api` only.
- `packages/storage` can import `@typenote/api` and `@typenote/core`.
- `apps/desktop` and `apps/cli` can import all packages.
- Renderer never imports storage at runtime; type-only imports are allowed.

## Renderer + Electron Rules (Critical)

- Renderer has no Node.js access. Use `window.typenoteAPI` only.
- All data fetching in renderer uses TanStack Query (no manual `useEffect` fetches).
- Navigation uses `createHashRouter` and `useNavigate`.
- IPC handler names are prefixed with `typenote:`.

## Storage + Patch Rules (Critical)

- All document writes go through `applyBlockPatch()` in a single transaction.
- Patch invariants are strict: no cycles, same-object parenting, unique order keys.
- Soft-delete semantics: use `deletedAt`, never hard delete blocks.

## Design System Workflow (Non-Negotiable)

- UI components must be built in `packages/design-system` first.
- Create Ladle stories for all variants before desktop integration.
- Do not add or modify renderer UI components directly without design-system parity.

## Quick Commands (Root)

- Install: `pnpm install`
- Typecheck all: `pnpm typecheck`
- Lint all: `pnpm lint`
- Format: `pnpm format` (check: `pnpm format:check`)
- Build all: `pnpm build`
- Run unit tests (excludes integration/e2e): `pnpm test`
- Integration tests: `pnpm test:integration`
- E2E (full rebuild): `pnpm test:e2e`
- E2E (skip rebuild): `pnpm test:e2e:quick`
- E2E headed: `pnpm test:e2e:headed`
- Mutation testing: `pnpm mutate`
- Dependency boundaries: `pnpm deps:check`
- Desktop dev (full): `pnpm dev`
- Desktop dev (fast): `pnpm dev:quick`

## Running a Single Test

Vitest (packages/api, core, storage, design-system, integration):

- File: `pnpm --filter @typenote/core test -- path/to/file.test.ts`
- Test name: `pnpm --filter @typenote/core test -- -t "test name"`
- Watch: `pnpm --filter @typenote/core test:watch -- -t "test name"`

Integration tests:

- `pnpm --filter @typenote/integration-tests test -- path/to/file.test.ts`

Playwright (tests/e2e):

- File: `pnpm --filter @typenote/e2e-tests test -- path/to/spec.ts`
- Test name: `pnpm --filter @typenote/e2e-tests test -- --grep "test name"`
- Headed: `pnpm --filter @typenote/e2e-tests test:headed -- path/to/spec.ts`

Design system sandbox (Ladle):

- `pnpm --filter @typenote/design-system sandbox`

## Testing Notes

- Use in-memory SQLite for storage tests (`:memory:`).
- E2E uses Playwright; selectors should use `data-testid`.
- Pretest hooks rebuild native modules (`better-sqlite3`) automatically; do not skip them.

## Session Commands

Use these skills to manage sessions:

- `/resume-session` — Resume work with git context and session summary
- `/end-session` — Wrap up session and update agent-docs
- `/commit-session` — Prepare an atomic commit for current changes
