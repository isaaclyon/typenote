# Recent Work

## Latest Session (2026-01-24 - REST Coverage: Export, Attachments, Calendar)

### What was accomplished

- **Export coverage finished** — `/export/object`, `/export/type`, markdown export route + API schemas
- **Attachment downloads implemented** — headers contract + `/attachments/:id` + `/attachments/:id/content` routes + tests
- **Calendar coverage complete** — routes, metadata schema, date format validation + tests
- **Plan updates** — REST coverage context and calendar/attachment checklists refreshed

### Key files changed

- `packages/http-server/src/routes/export.ts`
- `packages/http-server/src/routes/attachments.ts`
- `packages/http-server/src/routes/calendar.ts`
- `packages/api/src/exportImport.ts`, `packages/api/src/markdownExport.ts`
- `packages/api/src/attachment.ts`, `packages/api/src/calendar.ts`
- `docs/plans/2026-01-22-rest-api-coverage.md`

### Commits (this session)

- `7454e64` fix(api): enforce calendar date formats
- `ab2881a` docs(plans): mark calendar REST coverage complete
- `d48dab9` feat(http-server): add calendar routes
- `33a3034` docs(plans): mark attachment download contract done
- `ee496b5` feat(http-server): add attachment download endpoints
- `da398c7` fix(api): add calendar metadata schema
- `ba4b2ad` feat(http-server): finish object/type export routes
- `fe28986` feat(rest): add tasks coverage and summaries
- `9a5bb1d` feat(markdown): add export serializer and route
- `990d0a1` docs: update REST API coverage context

### Tests run

- `pnpm --filter @typenote/api test -- exportImport.test.ts`
- `pnpm --filter @typenote/http-server test -- export-all.test.ts`
- `pnpm --filter @typenote/api test -- attachment.test.ts`
- `pnpm --filter @typenote/http-server test -- attachments.test.ts`
- `pnpm --filter @typenote/api test -- calendar.test.ts`
- `pnpm --filter @typenote/http-server test -- calendar.test.ts`

---

## Historical — Collapsed

REST API plan + docs archive cleanup (2026-01-22). Editable PropertyList completion + new design-system primitives/patterns + ObjectDataGrid work (2026-01-21). Unified TitleBar chrome and earlier backend/UI sessions.
