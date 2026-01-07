# Up Next

## Workstream: Template Integration Tests

Status: **Ready to Start**

**Goal:** Add integration and E2E tests to verify templates are applied correctly.

### Tasks

- [ ] Add integration test: new DailyNote has template content with date heading
- [ ] Add integration test: `{{date_key}}` placeholder is substituted correctly
- [ ] Add E2E test: editor shows template content after creating DailyNote
- [ ] Update `dailyNote.lifecycle.test.ts` with template assertions

**Why:** The template feature had two bugs (seeding not called, dailyNoteService bypassing createObject) that would have been caught by integration tests verifying template application.

**Test locations:**

- `tests/integration/dailyNote.lifecycle.test.ts` — Add "Template Application" describe block
- `tests/e2e/specs/daily-note.spec.ts` — Add test for template content visible in editor

---

## Backlog

### Quality & Performance

- [ ] Improve mutation testing scores (currently: storage 79.9%, api 52.1%)
- [ ] Add architectural boundary tests (dependency-cruiser)
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future Phases)

- [ ] Add Markdown export (in addition to JSON)
- [ ] Relations semantics finalization
- [ ] Attachments support

---

## Recently Completed

### Template System ✅ (2026-01-06)

Complete 7-phase implementation with 85 new tests + 2 bug fixes:

- All 7 phases: API contracts, placeholder engine, DB schema, template service, application, createObject integration, seeding
- Bug fixes: seedDailyNoteTemplate() now called at init, dailyNoteService uses createObject()

### Phase 7 — Wire Desktop Shell ✅ (2026-01-06)

- IPC bridge (9 handlers), Tailwind/Shadcn UI setup
- TipTap editor with NotateDoc converters (read + write)
- Daily note navigation, auto-save
- E2E tests with Playwright (21 tests)
