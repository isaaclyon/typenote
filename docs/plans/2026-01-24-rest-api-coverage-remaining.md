# REST API Coverage Remaining

**Status:** Active (7/20 endpoints complete)
**Related Plan:** `docs/plans/2026-01-22-rest-api-coverage.md`

## Scope (Already Complete)

- Export/import + markdown export + object/type export
- Tasks REST coverage
- Attachment download headers + download routes (metadata + content)
- Calendar routes + metadata contracts
- Object types REST coverage (CRUD + key lookup)
- **Settings REST coverage (5/5 endpoints)** - COMPLETE

## Remaining Coverage

### Settings - COMPLETE (5/5)

All endpoints implemented and tested:

- [x] `GET /settings` - implemented
- [x] `GET /settings/:key` - implemented
- [x] `PATCH /settings` (partial UserSettings) - implemented
- [x] `PATCH /settings/:key` (value only) - implemented
- [x] `POST /settings/reset` - implemented

Files: `packages/http-server/src/routes/settings.ts`, `settings.test.ts`
Storage: All functions in `settingsService.ts` wired

### Pinned Objects - NOT STARTED (0/4)

Storage layer complete (`pinnedObjectsService.ts`), routes missing:

- [ ] `GET /pinned` - missing route
- [ ] `POST /pinned` (PinObjectInput) - missing route
- [ ] `DELETE /pinned/:objectId` - missing route
- [ ] `PATCH /pinned/reorder` (ReorderPinnedObjectsInput) - missing route

**Action needed:** Create `packages/http-server/src/routes/pinned.ts` and wire to router

### Templates - NOT STARTED (0/6)

Storage layer complete (`templateService.ts`), routes missing:

- [ ] `GET /templates?objectTypeId` - missing route
- [ ] `GET /templates/:id` - missing route
- [ ] `GET /templates/default?objectTypeId` - missing route
- [ ] `POST /templates` (CreateTemplateInput) - missing route
- [ ] `PATCH /templates/:id` (UpdateTemplateInput) - missing route
- [ ] `DELETE /templates/:id` - missing route

**Action needed:** Create `packages/http-server/src/routes/templates.ts` and wire to router

### Attachments (Upload + Maintenance) - PARTIAL (2/5)

Download routes complete, upload/maintenance missing:

- [x] `GET /attachments/:id` - metadata (implemented)
- [x] `GET /attachments/:id/content` - download (implemented)
- [ ] `POST /attachments` (multipart UploadAttachmentInput + file bytes) - missing
- [ ] `GET /attachments?orphaned=true|false` - missing list route
- [ ] `POST /attachments/cleanup?graceDays=` - missing cleanup route

**Action needed:** Add upload/list/cleanup routes to existing `attachments.ts` file
Storage functions available: `uploadAttachment`, `listAttachments`, `cleanupOrphanedAttachments`

## Next Up

Prioritized by dependency/usage:

1. Pinned objects (sidebar feature dependency)
2. Templates (object creation UX)
3. Attachments upload/maintenance (editor dependency)
