# Recent Work

## Latest Session (2026-01-13 - Select Component UX Improvements)

### Custom Select for PropertyItem

Replaced native `<select>` element in PropertyItem with custom `Select` component to ensure consistent cross-platform UX (native macOS picker was jarring).

**Key accomplishments:**

1. **Added size prop to Select** — `'sm'` (h-7/28px) and `'md'` (h-9/36px) variants
2. **Fixed positioning strategy** — Changed to `strategy: 'fixed'` to prevent layout shift when dropdown opens
3. **Updated PropertyItem** — Now uses custom `Select` with `size="sm"` instead of native `<select>`
4. **Focus style cleanup** — Changed from ring-offset to border color for cleaner focus indication

**Architecture insights:**

- Floating UI's `size` middleware conflicted with our `size` prop — renamed import to `floatingSize`
- Fixed positioning removes dropdown from document flow, preventing content shift
- `FloatingPortal` renders to document.body for proper overlay behavior

**Commits:**

- `70ec931 feat(design-system): add size prop and fixed positioning to Select`
- `3b88d2d docs: update session notes with PropertyItem progress`

**Still in progress (uncommitted):**

- PropertyItem full implementation (8 types) — testing layout shift fix
- MultiselectDropdown new component — started but not complete

---

## Previous Session (2026-01-12 evening - PropertyItem: All 8 Property Types)

Extended PropertyItem to support all 8 backend property types (text, number, boolean, date, datetime, select, multiselect, ref, refs). 14 Ladle stories covering all interactions. Work continues with UX refinement.

---

## Previous Session (2026-01-12 - AppShell Full Experience Stories)

Built AppShell stories with InteractiveEditor, daily note layout, fixed RefNode styling and slash menu auto-scroll. Commits: `18356b4`, `44da3b6`

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
