# Recent Work

## Latest Session (2026-01-10 - Recent Objects Feature Complete)

### Recent Objects Tracking - Full Implementation

Completed end-to-end recent objects tracking feature with 100-entry LRU cache, backend service, IPC layer, and command palette integration. Feature fully tested and committed.

**Backend Implementation:**

- Database: `recent_objects` table with CASCADE delete on objectId FK
- Migration: `0007_add_recent_objects.sql` with proper SQL breakpoints
- Service: `recentObjectsService.ts` with silent failure pattern (logs, doesn't throw)
  - `recordView(db, objectId)` — UPSERT with LRU cleanup (100 max)
  - `getRecentObjects(db, limit)` — Ordered by viewedAt DESC, filters soft-deleted
  - `clearRecentObjects(db)` — Deletes all entries
- Tests: 13/13 passing unit tests with deterministic timestamps

**IPC Layer:**

- Main process: `recordView` and `getRecentObjects` handlers
- Preload: Exposed API with TypeScript types
- Types: Added `RecentObjectSummary` interface

**Frontend Integration:**

- `useRecentObjects` hook - Fetches recent objects from backend
- CommandPalette "Recent" section - Shows when query is empty
- Auto-tracking: Records views on navigation and object creation
- UI: Clock icon, type badge, ordered by most recent first

**Testing:**

- 13 unit tests (service layer)
- 3 E2E tests (IPC wiring, ordering with 1s delay for SQLite second precision, limit parameter)
- All 1677 tests passing across entire codebase
- Full typecheck, build verification

**Key files:**

- `packages/storage/src/schema.ts` — recentObjects table
- `packages/storage/drizzle/0007_add_recent_objects.sql` — migration
- `packages/storage/src/recentObjectsService.ts` — service implementation (150 lines)
- `packages/storage/src/recentObjectsService.test.ts` — TDD test suite
- `apps/desktop/src/renderer/hooks/useRecentObjects.ts` — React hook
- `apps/desktop/src/renderer/components/CommandPalette/index.tsx` — UI integration
- `apps/desktop/src/renderer/hooks/useCommandActions.ts` — view tracking
- `tests/e2e/specs/ipc-wiring.spec.ts` — E2E tests
- `tests/e2e/types/global.d.ts` — TypeScript types

**Commit:** `b8cb7d6 feat(recent-objects): implement 100-entry LRU cache with command palette integration`

---

## Previous Session (2026-01-10 - Left Sidebar Navigation Organism)

### Built and Committed First Organism Component

Implemented comprehensive left sidebar navigation organism in Ladle sandbox with 8 compound components, 9 interactive stories, and full design system adherence. Verified with full test suite before committing.

**Components created:**

- `Sidebar.tsx` — Main 240px container (nav element)
- `SidebarTypeItem.tsx` — Type row with CVA variants, CSS hover count
- `SidebarSection.tsx` — Layout section wrapper
- `SidebarTypesList.tsx` — ScrollArea integration for scrollable types
- `SidebarSearchTrigger.tsx` — ⌘K search trigger with KeyboardKey
- `SidebarCalendarButton.tsx` — Today's note access
- `SidebarActionButton.tsx` — Settings/Archive with divider support
- `SidebarNewTypeButton.tsx` — "+ New Type" button

**Stories coverage:**

- AllVariants, Default, Interactive (state management), WithManyItems (25 items, scroll test), Empty, Loading, TypeItemVariants, SearchTriggerVariants, ActionButtonVariants

**Design system adherence:**

- 240px width (w-60), 28px type items (h-7), 14px icons
- CSS group hover for count visibility (no React state)
- CVA for selected variant
- 4px spacing grid throughout
- Lucide React icons (consistent with existing components)

**Key patterns established:**

- Compound component architecture (flexibility for composition)
- CSS-first interactivity (performance over React state)
- Bottom-up build sequence (simple → complex → container)

**Verification:**

- Typecheck: All 6 packages pass
- Lint: design-system clean
- Tests: 1652 tests pass (565 api, 91 core, 697 storage, 1 cli, 298 desktop)
- Build: All packages build successfully

**Commit:** `d8c01d3 feat(design-system): add left sidebar navigation organism`

---

## Previous Session (2026-01-08 - Attachment Renderer UI)

### Completed Phase 6 & 8 of Attachment System

Implemented image upload and display in the TipTap editor. Users can drag-drop or paste images which are validated, base64-encoded, and uploaded via IPC to the content-addressed storage system.

**Phase 6 - IPC Layer:**

- Added 6 attachment IPC handlers: uploadAttachment, getAttachment, listAttachments, linkBlockToAttachment, unlinkBlockFromAttachment, getBlockAttachments
- 13 new IPC tests

**Phase 8 - Renderer Integration:**

- AttachmentNode TipTap extension with image rendering (7 tests)
- ResizeHandle component for aspect-ratio-preserving resize
- useImageUpload hook for drag-drop/paste handling (15 tests)
- imageUtils for validation (type/size) and base64 encoding (17 tests)
- Integrated with NoteEditor via event listeners

**Commit:** `cc6ab66 feat(attachments): implement image upload and display in editor`

---

## Previous Session (2026-01-08 - E2E Test Fixes)

### Fixed E2E Test Failures (21 tests fixed)

Investigated 41 E2E test failures. Root cause: invalid blockIds (wrong character count for ULID validation). Fixed 28 blockIds across 6 spec files.

**Key changes:**

- Fixed blockIds in `references-linking.spec.ts`, `search-discovery.spec.ts`, `block-hierarchy.spec.ts`, `ipc-wiring.spec.ts`, `object-creation.spec.ts`, `templates-workflow.spec.ts`
- Added `sourceObjectTitle` to `BacklinkResult` type in `packages/storage/src/backlinks.ts`
- Updated `tests/e2e/types/global.d.ts` Block interface (`blockType` not `type`)

**Results:** 185 tests passing (up from 164), 20 remaining failures are UI-related (RefNode rendering, autocomplete popup)

**Commit:** `b5a9382 fix(e2e): correct blockId lengths and add sourceObjectTitle to backlinks`

---

## Completed Milestones

| Phase       | Description                          | Date       |
| ----------- | ------------------------------------ | ---------- |
| 0-7         | Core Bootstrap Phases                | 2026-01-04 |
| Template    | Template System (7 phases)           | 2026-01-06 |
| Tags        | Global Tags System (5 phases)        | 2026-01-07 |
| Tasks       | Task Management (built-in + service) | 2026-01-08 |
| Inheritance | Object Type Inheritance (4 days)     | 2026-01-08 |
| Attachments | Phases 1-8 (180+ tests)              | 2026-01-08 |
| CLI         | Full CLI command coverage            | 2026-01-08 |
| Design      | Left Sidebar Navigation organism     | 2026-01-10 |
| Recent      | Recent Objects Tracking (LRU cache)  | 2026-01-10 |
