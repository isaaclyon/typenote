# REST API Coverage Plan

**Status:** Draft
**Owner:** Backend/API

## Goal

Expose backend capabilities that currently exist only in storage + IPC through the REST server
(`packages/http-server`) and document request/response shapes using `@typenote/api` schemas.

## Conventions

- All routes live under `/api/v1`.
- Responses use `{ success: true, data: ... }`.
- Errors return `ApiError` (`code`, `message`, `details`).
- Inputs/outputs validated with `@typenote/api` Zod schemas.
- IDs are ULIDs, dates use ISO strings, lists accept `limit`/`offset`.

## Current REST Surface (Context)

- `GET /health`
- `GET /objects`, `GET /objects/:id`, `POST /objects`, `PATCH /objects/:id`, `DELETE /objects/:id`
- `GET /objects/:id/document`, `PATCH /objects/:id/document`
- `POST /objects/:id/duplicate`
- `GET/POST/DELETE /objects/:id/tags`
- `GET /objects/:id/backlinks`, `GET /objects/:id/unlinked-mentions`
- `POST /daily-notes/today`, `POST /daily-notes/:dateKey`
- `GET/POST/PATCH/DELETE /tags`
- `GET /search`
- `GET /recent`, `POST /recent/:id`
- `GET /trash`, `POST /trash/:id/restore`

## Missing REST Coverage (Backend Exists)

### Tasks

**Routes**

- `GET /tasks?status&priority&dueDateKey&dueBefore&dueAfter&includeCompleted&limit&offset`
- `GET /tasks/inbox`
- `GET /tasks/today`
- `GET /tasks/overdue`
- `GET /tasks/upcoming?days`
- `GET /tasks/completed?from&to`
- `POST /tasks/:id/complete`
- `POST /tasks/:id/reopen`

**Shapes**

- Query uses `GetTasksOptions` (from `@typenote/api/task`).
- Responses should include task properties (`status`, `due_date`, `priority`).
- Recommend new `TaskSummary = ObjectSummary & { properties: TaskProperties }` schema.
- Action results should return the updated summary or a small `TaskStatusResult` schema.

**Backed by** `taskService.ts` query + action functions.

### Calendar

**Routes**

- `GET /calendar?startDate&endDate&typeKeys[]`
- `GET /calendar/day/:dateKey`
- `GET /calendar/upcoming?days`
- `GET /calendar/types`

**Shapes**

- Queries use `CalendarQueryOptions`.
- Responses use `CalendarItem[]`.
- Add `CalendarTypeMetadata` schema:
  `{ typeId, typeKey, primaryDateProp, secondaryDateProp?, isDateOnly }`.

**Backed by** `calendarService.ts` queries and metadata helpers.

### Object Types

**Routes**

- `GET /object-types?builtInOnly&customOnly`
- `GET /object-types/:id`
- `GET /object-types/key/:key`
- `POST /object-types` (CreateObjectTypeInput)
- `PATCH /object-types/:id` (UpdateObjectTypeInput)
- `DELETE /object-types/:id`

**Shapes**

- Use `ObjectType`, `CreateObjectTypeInput`, `UpdateObjectTypeInput`.

**Backed by** `objectTypeService.ts` CRUD.

### Settings

**Routes**

- `GET /settings`
- `GET /settings/:key`
- `PATCH /settings` (partial `UserSettings`)
- `PATCH /settings/:key` (value only)
- `POST /settings/reset`

**Shapes**

- Use `UserSettings` and `SettingKey`.

**Backed by** `settingsService.ts`.

### Pinned Objects

**Routes**

- `GET /pinned`
- `POST /pinned` (PinObjectInput)
- `DELETE /pinned/:objectId`
- `PATCH /pinned/reorder` (ReorderPinnedObjectsInput)

**Shapes**

- Use `PinnedObjectSummary`, `PinObjectResult`, `UnpinObjectResult`.

**Backed by** `pinnedObjectsService.ts`.

### Templates

**Routes**

- `GET /templates?objectTypeId`
- `GET /templates/:id`
- `GET /templates/default?objectTypeId`
- `POST /templates` (CreateTemplateInput)
- `PATCH /templates/:id` (UpdateTemplateInput)
- `DELETE /templates/:id`

**Shapes**

- Use `Template`, `TemplateContent`, `CreateTemplateInput`, `UpdateTemplateInput`.

**Backed by** `templateService.ts`.

### Attachments / Files

**Routes**

- `POST /attachments` (multipart: UploadAttachmentInput + file bytes)
- `GET /attachments/:id`
- `GET /attachments/:id/content`
- `GET /attachments?orphaned=true|false`
- `POST /attachments/cleanup?graceDays=` (optional)

**Shapes**

- Use `Attachment`, `UploadAttachmentInput`, `UploadAttachmentResult`.
- Errors use `FILE_TOO_LARGE` and `UNSUPPORTED_FILE_TYPE` codes.

**Backed by** `attachmentService.ts` + `fileService.ts`.

### Export / Import

**Routes (proposal)**

- `POST /export/object` (objectId, outputDir?)
- `POST /export/type` (typeKey, outputDir?)
- `POST /export/all` (outputDir?)
- `POST /import/folder` (inputDir, mode)

**Shapes**

- JSON export/import schemas are internal-only today; add API contracts.
- `MarkdownExportInput` + `MarkdownExportResult` exist but are not wired.

**Backed by** `exportService.ts`.

## API Contract Gaps

- `TaskSummary` + task action result schemas.
- `CalendarTypeMetadata` schema.
- JSON export/import manifest + options schemas.
- Attachment download response contract.

## Open Questions

- Should task queries be filter-only (`GET /tasks`) vs named routes?
- Should exports return a streamed archive or server-side file paths?
- How should attachment download caching and MIME headers be handled?
