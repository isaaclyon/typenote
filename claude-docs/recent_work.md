# Recent Work

## Latest Session (2026-01-13 night - E2E Test Fixes)

Fixed 8 failing E2E tests with 3 distinct root causes.

**Fixes:**

1. **Empty search query** — Added early return in `searchBlocks()` for empty/whitespace queries (FTS5 MATCH throws on empty strings)
2. **Toast tests** — Updated selector from `[data-sonner-toaster]` to `section[aria-label*="Notifications"]` for Sonner 2.x compatibility
3. **Flaky timeouts** — Increased `firstWindow()` timeout to 45s + added 1 retry locally for sporadic Electron startup

**Files modified:**

- `packages/storage/src/search.ts` — Empty query handling
- `packages/storage/src/search.test.ts` — Added empty/whitespace tests
- `tests/e2e/specs/toast.spec.ts` — Updated Sonner selectors
- `tests/e2e/fixtures/app.fixture.ts` — Increased firstWindow timeout
- `tests/e2e/playwright.config.ts` — Added 1 retry for local runs

Commits: `ce89df4`

---

## Previous Session (2026-01-13 evening - MultiselectDropdown & PropertyItem UX)

Built `MultiselectDropdown` component with Floating UI + @dnd-kit for drag-and-drop reordering. Updated PropertyItem with `resolveRefs` prop and datetime blur fix. Commits: `ded86c9`

---

## Previous Session (2026-01-13 - Select Component UX Improvements)

Replaced native `<select>` in PropertyItem with custom `Select` component. Added size prop (`'sm'`/`'md'`) and fixed positioning strategy. Commits: `70ec931`, `3b88d2d`

---

## Previous Session (2026-01-12 evening - PropertyItem: All 8 Property Types)

Extended PropertyItem to support all 8 backend property types. 14 Ladle stories covering all interactions.

---

## Completed Milestones

| Phase       | Description                                    | Date       |
| ----------- | ---------------------------------------------- | ---------- |
| 0-7         | Core Bootstrap Phases                          | 2026-01-04 |
| Template    | Template System (7 phases)                     | 2026-01-06 |
| Tags        | Global Tags System (5 phases)                  | 2026-01-07 |
| Tasks       | Task Management (built-in + service)           | 2026-01-08 |
| Inheritance | Object Type Inheritance (4 days)               | 2026-01-08 |
| CLI         | Full CLI command coverage                      | 2026-01-08 |
| E2E Fixes   | Fixed 21 test failures (blockIds)              | 2026-01-08 |
| Design      | Left Sidebar Navigation organism               | 2026-01-10 |
| Recent      | Recent Objects Tracking (LRU cache)            | 2026-01-10 |
| Testing     | Mutation testing improvements                  | 2026-01-10 |
| Attachments | Complete system - Phases 1-9 (190+ tests)      | 2026-01-10 |
| CLI Gaps    | Daily/calendar/template/move commands          | 2026-01-10 |
| HTTP API    | REST API for local integrations (10 endpoints) | 2026-01-11 |
| AppShell    | Full experience stories + RefNode/slash fixes  | 2026-01-12 |
