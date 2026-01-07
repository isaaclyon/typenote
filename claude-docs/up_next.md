# Up Next

## Backlog

### Quality & Performance

- [ ] Improve mutation testing scores (currently: storage 79.9%, api 52.1%)
- [x] ~~Add architectural boundary tests (dependency-cruiser)~~ ✅
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future Phases)

- [ ] Add Markdown export (in addition to JSON)
- [ ] Relations semantics finalization
- [ ] Attachments support

---

## Recently Completed

### Global Tags System ✅ (2026-01-07)

Full implementation with 5 phases: API contracts (53 tests), database schema, tagService (37 tests), getObject() integration (4 tests), full verification. Junction table pattern for many-to-many relationships. All objects now have implicit `tags` property.

### Wiki-Link & Mention Suggestions ✅ (2026-01-07)

TipTap autocomplete extension with `[[` and `@` triggers. Includes search filtering, create-new option, click navigation, keyboard nav. 21 new tests (14 SuggestionPopup + 4 RefSuggestion + 3 RefNode).

### Architectural Boundary Tests ✅ (2026-01-07)

Added dependency-cruiser with 8 rules enforcing package hierarchy. Run `pnpm deps:check`.

### Template Integration Tests ✅ (2026-01-07)

6 new tests verifying template application (5 integration + 1 E2E).

### Template System ✅ (2026-01-06)

Complete 7-phase implementation with 85 new tests + 2 bug fixes.
