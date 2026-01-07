# Recent Work

## Latest Session (2026-01-06 night - Template Bug Fixes)

### Integration Bug Fixes

Fixed two issues discovered during manual testing:

1. **seedDailyNoteTemplate() never called** — Function was defined and tested but not invoked during app initialization
2. **dailyNoteService bypassed createObject()** — Raw DB inserts meant templates were never applied to new DailyNotes

**Commits:**

- `0ccd742` fix: call seedDailyNoteTemplate() during app initialization
- `41548ad` fix: use createObject() in dailyNoteService to apply templates

**Key changes:**

- `apps/desktop/src/main/index.ts` — Added seedDailyNoteTemplate(db) call
- `apps/cli/src/index.ts` — Added seedDailyNoteTemplate(db) call
- `packages/storage/src/dailyNoteService.ts` — Now uses createObject() instead of raw insert

---

## Previous Session (2026-01-06 evening - Template System Phase 7)

### Template System Complete ✅

- Added `seedDailyNoteTemplate()` — idempotent function to create default template
- Default template: H1 heading with `{{date_key}}` placeholder + empty paragraph
- 85 new tests total across all 7 phases

**Commit:** `3dec6db` — "feat: Template system with DailyNote default template"

---

## Completed Milestones

| Phase    | Description                       | Date       |
| -------- | --------------------------------- | ---------- |
| 0        | Day 0 Setup                       | 2026-01-04 |
| 1        | Core Contracts                    | 2026-01-04 |
| 2        | Storage Schema + Migrations       | 2026-01-04 |
| 3        | applyBlockPatch() + getDocument() | 2026-01-04 |
| 4        | Indexing Side Effects (Refs/FTS)  | 2026-01-04 |
| 5        | Object Types + Daily Notes        | 2026-01-04 |
| 6        | Export/Import + Mutation Testing  | 2026-01-04 |
| 7        | Wire Desktop Shell + E2E Tests    | 2026-01-06 |
| Template | Template System (7 phases)        | 2026-01-06 |
