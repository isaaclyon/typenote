# Recent Work

## Latest Session (2026-01-07 - Task Management Implementation)

### Implemented Task as Built-in Object Type with taskService

Full TDD implementation of task management, making Task the 6th built-in type (Capacities-style).

**Task Schema:**

- `status`: select (Backlog | Todo | InProgress | Done) — required, default: Todo
- `due_date`: datetime — optional
- `priority`: select (Low | Medium | High) — optional

**API Layer (`packages/api/src/task.ts`):**

- `TaskStatusSchema`, `TaskPrioritySchema` enums
- `TaskPropertiesSchema` for validation
- `GetTasksOptionsSchema` for query filtering

**Storage Layer (`packages/storage/src/taskService.ts`):**

- `getTodaysTasks()`, `getOverdueTasks()`, `getUpcomingTasks(days)`
- `getTasksByStatus()`, `getTasksByPriority()`, `getInboxTasks()`
- `getCompletedTasks()`, `getTasksByDueDate()` (Daily Note integration)
- `completeTask()`, `reopenTask()` convenience mutations

**Tests:**

- 36 API contract tests (`task.test.ts`)
- 24 taskService tests (`taskService.test.ts`)
- 3 built-in type tests (added to `objectTypeService.test.ts`)

**Commit:** `b115e83 feat(storage): add Task as built-in object type with taskService`

---

## Previous Session (2026-01-07 late night - Object Type Inheritance Day 1)

### Implemented Object Type Inheritance Schema (Day 1 of TDD Plan)

Following strict TDD, implemented the foundation for Capacities-style type inheritance.

**API Changes (`packages/api/src/objectType.ts`):**

- Added `parentTypeId`, `pluralName`, `color`, `description` fields
- Created `HexColorSchema` validator for `#RRGGBB` format
- Added 3 error codes: `TYPE_INHERITANCE_CYCLE`, `TYPE_INHERITANCE_DEPTH`, `TYPE_HAS_CHILDREN`

**Storage Changes:**

- Added 4 new columns to `object_types` table in `schema.ts`
- Created migration `0004_add_object_type_inheritance.sql`
- Added index on `parent_type_id` for efficient child lookups

**Tests:**

- 34 new tests in `packages/api/src/objectType.test.ts`
- All tests written first (RED), then implementation (GREEN)

**Commit:** `c77df6f feat(api,storage): add object type inheritance schema`

**Next:** Day 2 — `validateInheritance()` and `resolveTypeSchema()` with caching

---

## Previous Session (2026-01-07 night - Attachments/Media Feature Planning)

### Feature Planning: Attachments/Media System

Comprehensive planning for images and documents support. Explored codebase, clarified requirements, designed architecture, and created TDD implementation plan.

**Requirements Decided:**

- File types: Images (PNG, JPG, GIF, WebP) + Documents (PDF, text)
- Display: Block-level only (not inline with text)
- Storage: Content-addressed (SHA256 hash as filename)
- Size limit: 10 MB per file
- Deletion: 30-day orphan grace period
- Deduplication: Global (same file stored once)

**Architecture Designed:**

- 2 new tables: `attachments` (metadata), `block_attachments` (junction)
- New block type: `attachment` with `AttachmentContentSchema`
- `FileService` abstraction (FilesystemFileService + InMemoryFileService for tests)
- `attachmentService.ts` following tagService pattern

**Plan File:** `.claude/plans/mellow-cuddling-thacker.md` (approved, ready for implementation)

**Estimated Effort:** 31-41 hours across 9 TDD phases

**No implementation done** — planning only. Ready to start Phase 1: API Contracts.

---

## Previous Session (2026-01-07 evening - Custom Object Types Design)

### Feature Planning: Custom Object Types with Inheritance

Brainstormed and designed Capacities-style custom object types. Compared TypeNote's backend against Capacities feature set, identified gaps, and designed architecture for type inheritance.

**Key Decisions Made:**

- Full property inheritance (child gets parent properties + adds own)
- Built-in types can be parents (e.g., `Person` → `Employee`)
- Max 2 levels (parent → child only)
- Block deletion if children exist
- Pragmatic Balance architecture chosen (runtime resolution + cache)

**New Files:**

- `docs/plans/2026-01-07-custom-object-types-design.md` — TDD implementation plan

**Architecture Explored (3 approaches):**

1. Minimal (~270 lines) — parentTypeId only, runtime resolution
2. Clean (~655 lines) — Pre-computed resolvedSchema, dedicated service
3. **Pragmatic Balance (~530 lines)** ✅ — Essential columns + in-memory cache

**Next:** Implement following TDD plan (4 days estimated)

---

## Previous Session (2026-01-07 - Global Tags System Complete)

### Completed Global Tags System (Phases 3-5)

Finished implementing the tags system following strict TDD. Tests were written first, then implementation built to satisfy them.

**New Files:**

- `packages/storage/src/tagService.ts` — Tag service with 10 functions (CRUD, assign/remove, getObjectTags, findOrCreate)
- `packages/storage/drizzle/0003_add_tags.sql` — Migration for tags + object_tags tables

**Modified Files:**

- `packages/storage/src/objectService.ts` — Added `tags: Tag[]` to ObjectDetails, getObject() now includes tags
- `packages/storage/src/objectService.test.ts` — Added 4 tests for getObject() with tags
- `packages/storage/drizzle/meta/_journal.json` — Added migration entry

**Key Implementation Details:**

- Junction table pattern for many-to-many (object_tags)
- Idempotent assignTags/removeTags operations
- TagWithUsage type for listing with usage counts
- Read-back-from-DB pattern ensures consistent timestamp precision

**Test results:** 710 tests passing (447 storage + 263 API), all typechecks pass.

---

## Previous Session (2026-01-07 - Wiki-Link Suggestions)

Implemented autocomplete for `[[` wiki-links and `@` mentions in TipTap. New components: SuggestionPopup, RefSuggestion extension. 21 new tests.

---

## Previous Session (2026-01-07 - Tags Phase 1-2)

Started tags system with TDD. API contracts (53 tests) and database schema complete.

---

## Previous Session (2026-01-07 - Architectural Boundary Tests)

Added dependency-cruiser with 8 rules enforcing package hierarchy. Run `pnpm deps:check`.

---

## Completed Milestones

| Phase       | Description                          | Date       |
| ----------- | ------------------------------------ | ---------- |
| 0           | Day 0 Setup                          | 2026-01-04 |
| 1           | Core Contracts                       | 2026-01-04 |
| 2           | Storage Schema + Migrations          | 2026-01-04 |
| 3           | applyBlockPatch() + getDocument()    | 2026-01-04 |
| 4           | Indexing Side Effects (Refs/FTS)     | 2026-01-04 |
| 5           | Object Types + Daily Notes           | 2026-01-04 |
| 6           | Export/Import + Mutation Testing     | 2026-01-04 |
| 7           | Wire Desktop Shell + E2E Tests       | 2026-01-06 |
| Template    | Template System (7 phases)           | 2026-01-06 |
| Tests       | Template Integration Tests           | 2026-01-07 |
| DepCruise   | Architectural Boundary Tests         | 2026-01-07 |
| Suggestions | Wiki-Link & Mention Autocomplete     | 2026-01-07 |
| Tags        | Global Tags System (5 phases)        | 2026-01-07 |
| Tasks       | Task Management (built-in + service) | 2026-01-07 |
