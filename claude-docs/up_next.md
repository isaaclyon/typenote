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

### Architectural Boundary Tests ✅ (2026-01-07)

Added dependency-cruiser with 8 rules enforcing package hierarchy. Run `pnpm deps:check`.

### Template Integration Tests ✅ (2026-01-07)

6 new tests verifying template application (5 integration + 1 E2E).

### Template System ✅ (2026-01-06)

Complete 7-phase implementation with 85 new tests + 2 bug fixes.

### Phase 7 — Wire Desktop Shell ✅ (2026-01-06)

IPC bridge, Tailwind/Shadcn UI, TipTap editor, daily note navigation, E2E tests (22 tests).
