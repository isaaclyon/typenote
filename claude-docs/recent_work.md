# Recent Work

## Latest Session (2026-01-07 - Template Integration Tests)

### Template Integration Tests ✅

Added 6 new tests verifying template application to DailyNotes:

**Integration tests** (`tests/integration/dailyNote.lifecycle.test.ts`):

- Template content with heading block
- `{{date_key}}` placeholder substitution
- docVersion increment after template application
- No blocks without template
- Existing DailyNote not affected on second call

**E2E test** (`tests/e2e/specs/daily-note.spec.ts`):

- Template heading visible in editor after DailyNote creation

**Commit:**

- `7d7b6e2` test: add template application integration and E2E tests

---

## Previous Session (2026-01-06 night - Template Bug Fixes)

Fixed two issues: seedDailyNoteTemplate() never called at init, dailyNoteService bypassed createObject().

**Commits:**

- `0ccd742` fix: call seedDailyNoteTemplate() during app initialization
- `41548ad` fix: use createObject() in dailyNoteService to apply templates

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
