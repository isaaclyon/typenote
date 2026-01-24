# REST API Coverage Remaining

**Status:** Active
**Related Plan:** `docs/plans/2026-01-22-rest-api-coverage.md`

## Scope (Already Complete)

- Export/import + markdown export + object/type export
- Tasks REST coverage
- Attachment download headers + download routes
- Calendar routes + metadata contracts
- Object types REST coverage (CRUD + key lookup)

## Remaining Coverage

### Settings

- `GET /settings`
- `GET /settings/:key`
- `PATCH /settings` (partial UserSettings)
- `PATCH /settings/:key` (value only)
- `POST /settings/reset`

### Pinned Objects

- `GET /pinned`
- `POST /pinned` (PinObjectInput)
- `DELETE /pinned/:objectId`
- `PATCH /pinned/reorder` (ReorderPinnedObjectsInput)

### Templates

- `GET /templates?objectTypeId`
- `GET /templates/:id`
- `GET /templates/default?objectTypeId`
- `POST /templates` (CreateTemplateInput)
- `PATCH /templates/:id` (UpdateTemplateInput)
- `DELETE /templates/:id`

### Attachments (Upload + Maintenance)

- `POST /attachments` (multipart UploadAttachmentInput + file bytes)
- `GET /attachments?orphaned=true|false`
- `POST /attachments/cleanup?graceDays=`

## Next Up

- Settings REST coverage (read/update/reset)
