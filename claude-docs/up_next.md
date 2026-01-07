# Up Next

## Workstream: Phase 7 — Wire Desktop Shell

Status: **✅ COMPLETE**

**Goal:** Minimal Electron UI to exercise the backend.

### Completed ✅

- [x] IPC bridge for storage operations (9 handlers, Zod validation)
- [x] Tailwind CSS + Shadcn UI setup with tooling exclusions
- [x] Basic React shell with object list (TDD for listObjects)
- [x] IPC auto-registration refactor (single source of truth pattern)
- [x] CLI commands for backend proof of life (create, list, get, search, patch-\*)
- [x] IPC handlers for searchBlocks, getBacklinks, createObject (10 tests)
- [x] Generic createObject() with property validation
- [x] TipTap read-only editor with NotateDoc → TipTap converter
- [x] Custom TipTap extensions (RefNode, TagNode, CalloutNode, Math, Highlight)
- [x] Placeholder support for empty documents
- [x] Selection wiring between ObjectList and NoteEditor
- [x] Architectural fix: Query types moved to API package (renderer isolation enforced)
- [x] **Daily note navigation** — Prev/Today/Next buttons with date display (TDD, 46 tests)
- [x] **Writable editor** — TipTap → NotateDoc converter with auto-save (see commit 28802a1)
- [x] **E2E tests (Playwright)** — IPC wiring tests validating all 9 handlers (11 tests pass)

### Remaining ⏳

- [x] E2E UI tests — 21 tests passing (IPC wiring + daily note + editor + navigation)
- [x] Fix native module conflict — smart rebuild script auto-switches between Node/Electron builds

---

## Backlog

### Phase 7 Completeness (After UI Done)

- [ ] Daily note templates system

### Quality & Performance (Post-Phase 7)

- [ ] Improve mutation testing scores (currently: storage 79.9%, api 52.1%)
- [ ] Add architectural boundary tests (dependency-cruiser)
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future Phases)

- [ ] Add Markdown export (in addition to JSON)
- [ ] Relations semantics finalization
- [ ] Attachments support

---

## Recently Completed

### Architectural Review & Fixes ✅ (2026-01-06)

- Comprehensive codebase audit vs. bootstrap plan and architectural rules
- Fixed critical violation: Query types moved from storage to API package
- Enforced renderer process isolation via type boundaries
- Documented db.atomic() pattern in storage rules (better-sqlite3 native)
- Marked phases 0-6 as complete in bootstrap plan
- Verified all non-negotiables (transactions, isolation, editor-agnostic schema, etc.)

**Grade: A- (Excellent)** — Production-ready architecture with zero circular dependencies

### Phase 6 — Export/Import + Mutation Testing ✅ (2026-01-04)

- Deterministic JSON export/import via TDD (17 cycles, 34 tests)
- Stryker mutation testing for all backend packages
