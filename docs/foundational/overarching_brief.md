# Local-First Object Notes — Overarching Brief (Backend-First)

## 1) Purpose

Build a desktop-first, local-only knowledge app where **Objects** (typed entities) are the core unit and each object contains a **document-like block editor**. The system must be engineered **backend-first**: a stable, well-specified API and persistence model that a UI can sit on top of later.

## 2) Product Principles

1. **Local-first by default**: all data stored on device; offline is the normal mode.
2. **Objects > Pages**: objects are typed entities with properties and content.
3. **Document feel, block structure**: each object has a primary document composed of blocks; avoid a global “Notion block soup” mental model.
4. **Stable IDs and deterministic serialization**: everything (objects, blocks, attachments) has durable identifiers.
5. **Airtight API**: the UI is a client of the backend API. The API is versioned, testable, and migration-safe.
6. **Do not prevent web later**: keep core domain logic in portable TypeScript and keep platform-specific concerns at the edges.

## 3) Scope Boundaries

### In-scope (v1)

- Object types (built-in) and object instances
- Properties (typed) and property querying
- Block documents per object
- Inline references (object and block targets)
- Backlinks and graph edges
- Full-text search
- Attachments (local store + metadata)
- Export/backup artifacts suitable for Git/Syncthing
- A backend API with unit/integration tests

### Explicitly out-of-scope (early)

- Cloud sync
- Collaboration / CRDT
- Mobile
- Plugin ecosystem
- Complex graph visualization

## 4) Target Runtime and Stack

- Desktop runtime: **Electron** (day 1)
- Language: **TypeScript everywhere**
- Storage: **SQLite** (file-based) via Drizzle ORM + migrations
- Search: SQLite **FTS5**
- Editor (later): TipTap (ProseMirror)
- Architecture: **Main process owns DB + filesystem**; UI later talks via a typed IPC API

## 5) High-Level Architecture

### Modules

- **core/** (pure TS)
  - domain types, validation, IDs
  - query language + filters
  - serialization formats (JSON/MD export)

- **storage/**
  - SQLite schema (Drizzle)
  - migrations
  - repositories/services (ObjectService, BlockService, SearchService)

- **api/**
  - typed API surface (request/response contracts)
  - versioning strategy
  - IPC transport layer (Electron) later

- **indexer/**
  - FTS maintenance
  - backlink/edge maintenance

- **attachments/**
  - content-addressed file store
  - metadata tracking

- **cli/** (optional but recommended)
  - smoke testing the backend without UI
  - import/export/backup commands

### Process boundaries

- Electron main process: DB connection, filesystem, indexing jobs
- Renderer (later): thin client, no direct DB access

## 6) Domain Model

### Core entities

- **ObjectType**: definition of a type (e.g., Person, Book, Meeting)
- **Object**: instance of a type; has properties + a primary document
- **Block**: typed unit inside an object’s document
- **Edge/Reference**: directed relation between objects/blocks (backlinks)
- **Attachment**: local binary stored in content store; referenced by blocks

### Object identity

- IDs are **ULID** (sortable, durable) for objects, blocks, attachments.
- All references use IDs; titles are never identifiers.

## 7) Persistence Model (SQLite)

### Tables (conceptual)

- object_types(id, key, display_name, schema_json, created_at, updated_at)
- objects(id, type_id, title, props_json, created_at, updated_at, deleted_at)
- blocks(id, object_id, parent_block_id, type, content_json, order_key, created_at, updated_at, deleted_at)
- refs(id, from_object_id, from_block_id, to_object_id, to_block_id, kind, created_at)
- attachments(id, hash, ext, mime, size, created_at)
- attachment_links(id, attachment_id, object_id, block_id, role, created_at)
- fts_blocks(virtual FTS5: block_id, object_id, text)

### Invariants

- Blocks always belong to exactly one object.
- References must point to existing targets (or be soft-valid with a repair routine).
- Deletions are soft-delete (deleted_at) with compaction later.

## 8) Backend API (Concept)

### API style

- Typed request/response contracts (Zod or similar) in **core/**
- Services implement contracts in **storage/**
- Transport-agnostic: callable from CLI tests and later via IPC.

### Core operations

- ObjectType:
  - create/list/get/update/delete

- Object:
  - create/get/update/delete
  - list/filter/query

- Blocks:
  - getDocument(objectId)
  - applyPatch(objectId, operations[])
  - insert/move/delete blocks

- References:
  - create/delete/list inbound/outbound
  - backlinks(objectId)

- Search:
  - search(query, filters)

- Attachments:
  - add(file) => attachmentId
  - link/unlink

- Export:
  - exportVault(path, options)
  - importVault(path)

### Block patch model (important)

- Backend accepts **operations** (insert/update/move/delete) rather than entire document blobs.
- Operations are validated and applied transactionally.

## 9) Indexing and Derived Data

- Maintain refs table by:
  - extracting reference tokens from block content_json on write
  - or accepting explicit reference ops from editor adapter later

- Maintain FTS by:
  - extracting plain text from blocks on write
  - updating fts_blocks within the same transaction

## 10) Export/Backup Format (Git/Syncthing-friendly)

- export root:
  - objects/<typeKey>/<objectId>.json (deterministic formatting)
  - optional objects/<typeKey>/<objectId>.md (frontmatter + body)
  - attachments/<hash>.<ext>
  - manifest.json (schema version, counts, mapping)

- Deterministic key ordering and stable newlines for clean diffs.

## 11) Versioning, Migrations, and Compatibility

- Schema version tracked in DB.
- Migrations are forward-only; export includes schema version.
- API is versioned (v1) and changes require either:
  - additive fields, or
  - explicit new endpoints/contracts.

## 12) Non-Functional Requirements

- Data integrity: every write is transactional.
- Performance: common operations must feel instant on 10k+ objects.
- Reliability: power-loss safe (SQLite journaling defaults; backups are consistent snapshots).
- Testability: comprehensive unit + integration tests around services.

## 13) Deliverables (Backend-First Milestones)

### Milestone A — Storage foundation ✅ COMPLETE

- ✅ SQLite schema + migrations
- ✅ Object CRUD + soft delete
- ✅ Block storage + ordering
- ✅ Basic unit/integration test harness (447+ storage tests)

### Milestone B — References and search ✅ COMPLETE

- ✅ Reference extraction + refs table
- ✅ Backlinks queries
- ✅ FTS5 indexing + search endpoints

### Milestone C — Export/Import ⚠️ PARTIAL

- ✅ Deterministic export
- ✅ Import/restore
- ⏳ Attachment store + linking (deferred to post-v1)

### Milestone D — API hardening ✅ COMPLETE

- ✅ Patch operation validation
- ✅ Concurrency behavior (single-writer via transactions, idempotency keys)
- ✅ Error taxonomy (validation vs not-found vs conflict)

## 14) Decisions Locked (Early)

The following architectural decisions are confirmed and implemented:

1. **Object types: built-ins + user-defined** ✅ IMPLEMENTED
   - Ship a small set of built-in types and support user-defined types.
   - **Built-ins (v1):** `DailyNote`, `Page`, `Person`, `Event`, `Place`.
   - Store property definitions on the type (`schema_json`) and values on objects (`props_json`).
   - Validation is application-level (e.g., Zod), with selective DB indexing for commonly queried fields.

2. **Supported property types (v1)** ✅ IMPLEMENTED
   - `text` (string)
   - `number` (float)
   - `date` (ISO date `YYYY-MM-DD`)
   - `datetime` (ISO datetime)
   - `checkbox` (boolean)
   - `singleselect` (string from allowed options)
   - `multiselect` (string[] from allowed options)
   - `relation` (one-to-one or one-to-many links to other Objects; persisted as edges and queryable)
   - `contentblock` (**inline block reference**) targeting a specific `block_id` (and implicitly its owning `object_id`) for embed/preview behaviors

3. **Daily Notes are first-class** ✅ IMPLEMENTED
   - Built-in `DailyNote` type keyed by **local date** (`date_key` = `YYYY-MM-DD`).
   - Enforce DB-level uniqueness (one DailyNote per `date_key`).
   - **Slugs / calendar URLs:** DailyNote routes resolve via deterministic slug derived from `date_key` (e.g., `/2026-01-12`).
   - **Auto-creation:** create-on-access (open Today / navigate to date creates if missing). Optional creation on midnight rollover while the app is open.
   - Date is computed in the user's configured/local timezone.

4. **Block model: tree, not flat** ✅ IMPLEMENTED
   - Blocks are stored as a tree via `parent_block_id` (nullable = root).
   - Ordering is defined among siblings only.
   - Enables nested lists, toggles/collapsible sections, outline navigation, and clean export.

5. **References: hybrid representation** ✅ IMPLEMENTED
   - Internally references are **explicit ID-based nodes** in block content (unambiguous, rename-safe).
   - Export formats include both stable IDs and a human-readable token form where appropriate.

6. **Reference maintenance: backend authoritative extraction (2A)** ✅ IMPLEMENTED
   - Backend extracts references from persisted block `content_json` on write and maintains the `refs` table transactionally.
   - Leaves room for later optimization (UI hints) without changing correctness model.

7. **Write model: operation-based patch API (3B)** ✅ IMPLEMENTED
   - Backend accepts **validated patch operations** (insert/update/move/delete) rather than whole-document overwrites.
   - Each patch is applied transactionally and increments a document/version counter for optimistic concurrency.

8. **Attachments: content-addressed store + retention GC** ⏳ DEFERRED (post-v1)
   - Attachments stored locally with hashed filenames (content-addressed) and metadata in SQLite.
   - When unlinked, attachments are marked orphaned and retained for a grace period (e.g., 30 days).
   - Provide a manual cleanup routine and periodic maintenance/compaction.

9. **Ordering: fractional (lexicographic) order keys** ✅ IMPLEMENTED
   - Use fractional indexing order keys (lexicographic strings) to support cheap inserts/reorders.
   - Implement a rebalance routine for rare key-growth scenarios.

10. **Tags: global tagging system** ✅ IMPLEMENTED (2026-01-07)
    - Global `tags` table with `id`, `name`, `slug`, `color`, `icon`, `description`.
    - Many-to-many via `object_tags` junction table.
    - Tag assignment/removal operations with usage tracking.
    - Slug uniqueness enforced for natural ID lookup.

11. **Templates: per-type default templates** ✅ IMPLEMENTED
    - `templates` table with template definitions per object type.
    - Auto-application of default template on object creation.
    - DailyNote default template seeded on database init.

12. **IPC API + Desktop integration** ✅ IMPLEMENTED
    - 8 IPC handlers for typed communication between main/renderer.
    - Preload context bridge exposes `window.typenoteAPI`.
    - TipTap editor with custom extensions (refs, tags, callouts, math).
    - Wiki-link autocomplete (`[[` trigger) and mentions (`@` trigger).

---

## 15) Remaining Questions (Next to resolve)

1. **User-defined types v1 constraints:** required/optional props, default values, validation constraints (min/max, regex), and whether properties can be “indexed” by user choice.
2. **Relations v1 semantics:** cardinality rules per property (one vs many), referential integrity behavior on delete, and whether relations are strictly typed (allowed target types).
3. **contentblock behaviors:** display modes (inline preview vs embed), permitted targets (single block only vs subtree reference), and export/import representation.
4. **Slugs beyond DailyNotes:** whether and how non-DailyNote objects get slugs (manual vs generated), rename/redirect behavior.
5. ~~**Templates:** DailyNote template application rules, and whether templates are type-level (per ObjectType) in v1.~~ ✅ RESOLVED — Templates implemented as type-level (per ObjectType) with auto-application on object creation.

## Working Agreements for Iteration

- Keep this brief authoritative and update it as decisions are made.
- Prefer decisions that reduce future migrations.
- Never let editor JSON become the canonical persisted model.
