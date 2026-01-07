# Up Next

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

Complete 7-phase implementation with 85 new tests:

- Phase 1: API contracts — Zod schemas for templates (25 tests)
- Phase 2: Placeholder engine — {{title}}, {{date_key}}, {{created_date}} (18 tests)
- Phase 3: Database schema — templates table + migration 0002
- Phase 4: Template service — CRUD operations (19 tests)
- Phase 5: Template application — applyTemplateToObject() (13 tests)
- Phase 6: createObject() integration — auto-apply default templates (5 tests)
- Phase 7: DailyNote default template seeding (5 tests)

### Phase 7 — Wire Desktop Shell ✅ (2026-01-06)

- IPC bridge (9 handlers), Tailwind/Shadcn UI setup
- TipTap editor with NotateDoc converters (read + write)
- Daily note navigation, auto-save
- E2E tests with Playwright (21 tests)
