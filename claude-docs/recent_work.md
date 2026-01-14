# Recent Work

## Latest Session (2026-01-13 evening - MultiselectDropdown & PropertyItem UX)

### MultiselectDropdown Component

Built new `MultiselectDropdown` component with dropdown UI, search filtering, checkboxes, and drag-and-drop reordering.

**Key accomplishments:**

1. **New MultiselectDropdown component** — Dropdown-based multiselect replacing inline toggle buttons
   - Search/filter input at top
   - Checkbox rows with drag handles
   - Floating UI for positioning (same pattern as Select)
   - @dnd-kit integration for drag-and-drop reordering
   - `onReorder` callback prop for persisting option order

2. **PropertyItem UX improvements:**
   - Added `resolveRefs` prop to show titles instead of IDs for ref/refs types
   - Fixed datetime blur behavior — clicking between date/time inputs no longer triggers premature save
   - Integrated MultiselectDropdown for multiselect type (no longer uses `isEditing` state)

3. **New dependencies:** `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

**New files:**

- `packages/design-system/src/components/MultiselectDropdown/` — New component folder
  - `MultiselectDropdown.tsx` — Component with Floating UI + @dnd-kit
  - `MultiselectDropdown.stories.tsx` — 8 Ladle stories including drag-and-drop demo
  - `index.ts` — Exports

**Modified files:**

- `packages/design-system/src/components/PropertyItem/PropertyItem.tsx` — Added resolveRefs, datetime blur fix, multiselect integration
- `packages/design-system/src/components/PropertyItem/PropertyItem.stories.tsx` — Updated stories with resolveRefs demos
- `packages/design-system/src/components/index.ts` — Export MultiselectDropdown
- `packages/design-system/package.json` — Added @dnd-kit dependencies

**Status:** Uncommitted — ready for testing in Ladle

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
