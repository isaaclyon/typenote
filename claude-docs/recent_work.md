# Recent Work

## Latest Session (2026-01-08 - Attachment Renderer UI)

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

## Previous Session (2026-01-08 - CLI Command Suite)

Full CLI coverage for all backend services: tag (10), backlinks (1), template (6), attachment (9), export/import (5). Added `--dry-run` to 4 commands. 31 total commands. Commit: `1a469cf`

---

## Previous Session (2026-01-08 - Attachments Phase 5)

Block Patch Integration for Attachments. 13 new tests. Commit: `7d1260f`

---

## Previous Session (2026-01-08 - Object Type Inheritance)

Completed 4-day TDD implementation. 56 new tests. Commit: `367752c`

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
