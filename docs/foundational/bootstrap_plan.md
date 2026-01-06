# Bootstrap Plan — Local-First Object Notes (Backend-First)

## 1) Objective

Stand up a production-grade local-first backend (SQLite + Drizzle + indexing + export) behind a stable API contract, with minimal UI. The desktop app is a thin shell; correctness and testability come first.

Success criteria:

- Backend services runnable via CLI and test suite without UI
- `applyBlockPatch()` implemented per spec with indexing side effects
- Deterministic export/import proof-of-concept
- Electron shell only exposes typed API surface (renderer has no DB access)

---

## 2) Scaffold and Tooling

### 2.1 Scaffold choice

- Use an Electron + React + Vite + TypeScript scaffold with secure `main/preload/renderer` separation.
- Preferred starting point: a packaging-oriented template (e.g., vite-electron-builder).

### 2.2 Package manager and repo model

- Use **pnpm workspaces** (required).
- Monorepo layout:
  - `packages/core`
  - `packages/storage`
  - `packages/api`
  - `apps/desktop`
  - `apps/cli`

### 2.3 Workspace configuration (pnpm)

- Add `pnpm-workspace.yaml`:
  - include `apps/*` and `packages/*`

- Pin Node version via `.nvmrc` (or Volta) and enforce in CI.
- Enforce pnpm usage via `packageManager` field in root `package.json`.

### 2.4 Baseline dependencies (initial)

- TypeScript
- Drizzle ORM + SQLite driver
- Zod (validation)
- ULID (IDs)
- Vitest (unit tests)

---

## 3) Repo Layout (Target)

```
/apps
  /desktop
    /src/main
    /src/preload
    /src/renderer
  /cli
    /src
/packages
  /core
    /src
  /api
    /src
  /storage
    /src
```

Guiding rules:

- `core` is pure TS: no Electron, no DB, no filesystem imports.
- `storage` contains Drizzle schema, migrations, and service implementations.
- `api` defines request/response contracts, error taxonomy, and validation.
- `desktop/main` owns DB + filesystem and exposes API via preload.
- `renderer` uses only the exposed API.

---

## 4) Phase Plan (Backend-First)

### Phase 0 — Day 0 Setup (0.5–1 day) ✅ COMPLETE

**Deliverables**

- Scaffold boots, builds, and runs on macOS + Windows.
- Workspace configured.
- Lint/test formatting baseline.

**Steps**

1. Create repo from scaffold.
2. Convert to monorepo with workspaces.
3. Add `packages/core`, `packages/api`, `packages/storage`, `apps/cli`.
4. Ensure TS project references or a shared tsconfig.
5. Add CI target scripts locally: `lint`, `test`, `typecheck`, `migrate`.

**Exit criteria**

- `pnpm -r test` runs.
- Desktop app launches.
- CLI runs a hello-world command.

---

### Phase 1 — Core Contracts (1–2 days) ✅ COMPLETE

**Goal**: Establish canonical types/schemas used everywhere.

**Deliverables**

- Canonical IDs (ULID)
- API error types and codes
- Patch op schema and validation
- Canonical NotateDoc v1 content schema types

**Steps**

1. Implement `core/ids` (ULID generation + parsing).
2. Implement `api/errors` and shared `ApiError` shape.
3. Implement `api/blockPatch` request/response types + Zod validators.
4. Implement `core/notateDoc` (InlineNode, BlockType content schemas).
5. Write unit tests for validation (valid/invalid patches).

**Exit criteria**

- Patch validator passes fixture tests.
- Content schema types compile.

---

### Phase 2 — Storage Schema + Migrations (2–4 days) ✅ COMPLETE

**Goal**: Establish SQLite schema and migration workflow.

**Deliverables**

- Drizzle schema tables
- Migration toolchain
- DB open/close lifecycle

**Tables (minimum)**

- `object_types`
- `objects` (includes `doc_version`)
- `blocks`
- `refs`
- `fts_blocks` (FTS5)
- `idempotency`
- (attachments later)

**Steps**

1. Define Drizzle schemas.
2. Add indexes needed for common reads.
3. Create migrations and a `migrate` script.
4. Add an in-memory SQLite option for tests.
5. Add integration tests verifying schema creation and migrations.

**Exit criteria**

- Fresh DB creates successfully.
- Migration runs idempotently.
- Test DB can be spun up per test.

---

### Phase 3 — Implement `applyBlockPatch()` (4–8 days) ✅ COMPLETE

**Goal**: Implement the core write pathway per the patch spec.

**Deliverables**

- Storage services:
  - `ObjectService`
  - `BlockService` (document reads)
  - `PatchService` (`applyBlockPatch`)

- Transactional enforcement of invariants
- Versioning + idempotency

**Key behaviors**

- Validate `baseDocVersion`
- Execute ops in a single SQLite transaction
- Maintain tree structure and order keys
- Soft-delete subtree
- Update `doc_version`

**Steps**

1. Implement `getDocument(objectId)` returning ordered tree.
2. Implement order-key generation between siblings.
3. Implement insert/update/move/delete ops.
4. Implement cycle detection for move.
5. Implement idempotency table behavior.
6. Add integration tests:
   - insert/move/delete scenarios
   - reorder stability
   - version conflicts
   - idempotency replay

**Exit criteria**

- 95%+ of patch spec behaviors covered by tests.
- Patch service stable across restarts.

---

### Phase 4 — Indexing Side Effects (Refs + FTS) (2–4 days) ✅ COMPLETE

**Goal**: Keep backlinks and search consistent with writes.

**Deliverables**

- Reference extraction from `content_json` on write
- `refs` maintenance
- FTS5 update rules

**Steps**

1. Implement plain-text extraction from InlineNodes.
2. Implement reference extraction (object/block refs).
3. Update refs/fts within patch transaction.
4. Add read endpoints:
   - `backlinks(objectId)`
   - `search(query, filters)`

5. Tests:
   - backlink correctness after updates/deletes
   - search results reflect edits

**Exit criteria**

- Backlinks never drift from persisted content.
- Search is consistent after any patch.

---

### Phase 5 — Object Types + Daily Notes (2–4 days) ✅ COMPLETE

**Goal**: Make types and Daily Notes first-class at the backend.

**Deliverables**

- Built-ins: DailyNote, Page, Person, Event, Place
- User-defined type CRUD
- DailyNote endpoints
- Slug resolution for DailyNotes

**Steps**

1. Implement `ObjectTypeService` (create/list/update/delete).
2. Implement property validation per type schema.
3. Implement DailyNote API:
   - `getOrCreateTodayDailyNote()`
   - `getOrCreateDailyNoteByDate(dateKey)`
   - `listDailyNotes(range)`

4. Enforce uniqueness constraint on `DailyNote.date_key`.
5. Implement slug mapping for DailyNotes (deterministic).

**Exit criteria**

- DailyNotes created on access.
- Type validation enforced.

---

### Phase 6 — Export/Import (Backup) (3–6 days) ✅ COMPLETE

**Goal**: Deterministic export suitable for Git/Syncthing; import as restore.

**Deliverables**

- Export format:
  - `objects/<typeKey>/<objectId>.json`
  - optional `.md` export
  - `manifest.json`

- Import restores IDs and relationships

**Steps**

1. Implement deterministic JSON formatting.
2. Implement Markdown exporter for the canonical content model.
3. Implement importer with link resolution policy.
4. Tests:
   - export/import round-trip invariants
   - deterministic diffs

**Exit criteria**

- Round-trip restore works.
- Git diffs are clean for small edits.

---

### Phase 7 — Wire Desktop Shell (Minimal UI) (1–3 days) 🔄 IN PROGRESS

**Goal**: Expose backend API to renderer via preload in a secure way.

**Deliverables**

- Preload exposes typed API methods:
  - `applyBlockPatch`, `getDocument`, `search`, `backlinks`, `getOrCreateTodayDailyNote`

- Renderer can call API and display raw JSON or minimal read-only view

**Completed**

- ✅ 8 IPC handlers in main (with Zod validation at boundary)
- ✅ Typed API exposed via preload with contextBridge
- ✅ Minimal React shell: ObjectList, NoteEditor (TipTap read-only)
- ✅ Selection wiring between object list and document viewer
- ✅ TipTap converter (NotateDoc → TipTap JSON)
- ✅ Custom TipTap extensions (RefNode, TagNode, CalloutNode, Math, Highlight)
- ✅ Placeholder support for empty documents
- ✅ Architectural fix: Query types moved to API package (renderer isolation enforced)

**Remaining**

- [ ] Daily note navigation UI
- [ ] Writable editor (TipTap → NotateDoc converter for patches)
- [ ] E2E tests (Playwright/Spectron)

**Exit criteria**

- Renderer can create today's note and apply patches.
- No renderer access to Node/DB. ✅ (verified via architectural review)

---

## 5) Developer Experience (DevEx) — Strict by Default

The project must be “airtight” from day one. No weak typing, no implicit any, no unvalidated boundaries.

### 5.1 TypeScript strictness (required)

Root `tsconfig.base.json` defaults for all packages/apps:

- `"strict": true`
- `"noImplicitAny": true`
- `"noUncheckedIndexedAccess": true`
- `"exactOptionalPropertyTypes": true`
- `"noImplicitOverride": true`
- `"noFallthroughCasesInSwitch": true`
- `"noPropertyAccessFromIndexSignature": true`
- `"useUnknownInCatchVariables": true`
- `"verbatimModuleSyntax": true`
- `"importsNotUsedAsValues": "error"`
- `"forceConsistentCasingInFileNames": true`
- `"skipLibCheck": false` (set true only if absolutely necessary)

Additional enforcement:

- Typecheck in CI and in pre-push.
- `core` and `api` must be 100% type-safe; no `any` escapes.

### 5.2 Linting + formatting

- **ESLint** with TypeScript rules + import/order + unused imports.
- Enforce architectural boundaries (recommended):
  - `eslint-plugin-boundaries` **or** `dependency-cruiser`.
  - `no-restricted-imports` rules to prevent:
    - renderer importing `storage` or Electron/main-only modules
    - `core` importing Node/Electron/DB modules

- **Prettier** for formatting (single source of truth; eslint-prettier integration).
- Standard commands:
  - `pnpm lint`
  - `pnpm format`
  - `pnpm typecheck`

### 5.3 API boundary runtime validation (required)

- Use **Zod** schemas for every API request/response contract.
- Validate at the boundary layer:
  - preload → main IPC handlers validate incoming payloads
  - main responses validated before returning (at least in dev/test)

- Validation failures are first-class typed errors (do not throw raw errors across IPC).

### 5.4 Git hooks (Husky)

- **Pre-commit**:
  - run Prettier on staged files
  - run ESLint on staged files

- **Pre-push**:
  - `pnpm -r typecheck`
  - `pnpm -r test`

### 5.4 Dead code / unused exports detection

- Add a dead-code tool (choose one):
  - `knip` (preferred) for unused exports/files
  - or `ts-prune`

- Run in CI and optionally in pre-push (depending on speed).

### 5.5 Dependency hygiene

- Enforce dependency boundaries:
  - `packages/core` must not import from Electron, DB, or Node-only libs.
  - `packages/api` must remain transport-agnostic.

- Prefer explicit dependencies (pnpm strictness helps).

### 5.6 Property-based testing for invariants (required)

- Add **fast-check** for property-based testing of patch ops.
- Generate random sequences of operations (insert/move/delete/update) and assert invariants:
  - no cycles in the tree
  - no cross-object parenting
  - sibling ordering preserved
  - soft-delete semantics correct
  - reference extraction + FTS remain consistent with persisted content
  - doc_version monotonic and increments once per successful patch

- Run these tests in CI; keep the runtime bounded (e.g., seed + max runs).

### 5.7 Test standards

- Unit tests for schema validation and patch invariants.
- Integration tests for SQLite transactions and migration correctness.
- Minimum standard: every patch op type has at least one success and one failure test.

---

## 6) Implementation Standards (Non-Negotiables)

- Every patch is a single SQLite transaction.

- Renderer never touches DB directly.

- Backend services are test-first and runnable from CLI.

- Content schema is editor-agnostic.

- Reference extraction and FTS updates happen within the same transaction as edits.

- Every patch is a single SQLite transaction.

- Renderer never touches DB directly.

- Backend services are test-first and runnable from CLI.

- Content schema is editor-agnostic.

- Reference extraction and FTS updates happen within the same transaction as edits.

---

## 6) Near-Term Backlog (After Bootstrap)

- Relations semantics finalization (cardinality + delete behavior)
- Template system (DailyNote templates)
- Attachments (still text-only in v1, but storage can be implemented)
- Performance testing (10k objects, 100k blocks)

---

## 7) First Concrete Tasks (Next 48 hours)

1. Scaffold repo + workspaces.
2. Create `core` schemas for Patch + NotateDoc.
3. Create Drizzle schema + migration runner.
4. Implement a CLI that:
   - creates a Page
   - applies 2–3 patch ops
   - prints document tree

---

## 8) Crash handling and error capture (required)

Even for local-only, ensure deterministic diagnosis of failures.

- Capture and persist unhandled exceptions in:
  - Electron main process
  - renderer process
  - preload layer

- Write crash logs to the app data directory with timestamps.
- In dev: fail fast and surface stack traces.
- In prod: show a user-safe error and write full details to logs.
- (Optional later) wire to a crash reporting service.

---

## 9) Risks and Mitigations

- **Native SQLite bindings across platforms**: pin Electron versions; keep native deps minimal.
- **Overfitting to editor**: canonical schema stays independent; adapters handle conversion.
- **Feature creep**: no rich media; no sync; no plugins until backend is stable.
