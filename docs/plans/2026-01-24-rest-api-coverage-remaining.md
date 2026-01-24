# REST API Coverage Remaining

**Status:** ✅ COMPLETE (20/20 endpoints implemented)
**Related Plan:** `docs/plans/2026-01-22-rest-api-coverage.md`

## Summary

All REST API endpoints are now fully implemented and tested. The coverage audit revealed that most endpoints were already complete in earlier sessions — only the `PATCH /pinned/reorder` endpoint was missing.

## Completed Coverage

### Settings (5/5) - COMPLETE

- [x] `GET /settings` - list all settings
- [x] `GET /settings/:key` - get single setting
- [x] `PATCH /settings` - partial UserSettings update
- [x] `PATCH /settings/:key` - update single setting
- [x] `POST /settings/reset` - reset settings to defaults

### Pinned Objects (4/4) - COMPLETE

- [x] `GET /pinned` - list pinned objects
- [x] `POST /pinned` - pin an object (idempotent)
- [x] `DELETE /pinned/:objectId` - unpin an object
- [x] `PATCH /pinned/reorder` - reorder pinned objects (added 2026-01-24)

### Templates (7/6) - COMPLETE (includes extra endpoint)

- [x] `GET /templates` - list templates (with filters)
- [x] `GET /templates/:id` - get template by ID
- [x] `GET /templates/default` - get default template for type
- [x] `POST /templates` - create template
- [x] `PATCH /templates/:id` - update template
- [x] `DELETE /templates/:id` - soft delete template
- [x] `POST /templates/default` - set default template (bonus)

### Attachments (5/5) - COMPLETE

- [x] `GET /attachments/:id` - metadata
- [x] `GET /attachments/:id/content` - download content
- [x] `POST /attachments` - upload with multipart
- [x] `GET /attachments` - list attachments (by objectId)
- [x] `POST /attachments/cleanup` - preview orphaned attachments

## Files Changed (This Session)

- `packages/http-server/src/routes/pinned.ts` - added `PATCH /reorder` route
- `packages/http-server/src/routes/pinned.test.ts` - added 2 tests for reorder
