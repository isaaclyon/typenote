# Recent Work

## Latest Session (2026-01-20 - Wiki-Link Alias Debugging)

### What was accomplished

- **Wiki-link alias context menu** — Right-click RefNode → "Edit alias..." works correctly
- **Alias state management fix** — Used external Set to survive TipTap NodeView remounts
- **Alias blur timing fix** — Prevented immediate blur on input focus
- **Pipe syntax WIP** — `[[Page|alias]]` syntax partially implemented but `[[` trigger has issues
- **Design doc** — Created `docs/plans/2026-01-20-wiki-link-alias-design.md`

### Key files changed

- `packages/design-system/src/features/Editor/extensions/RefNodeView.tsx` — Context menu + inline editing
- `packages/design-system/src/features/Editor/extensions/RefNode.ts` — Added `alias` attribute
- `packages/design-system/src/features/Editor/extensions/RefSuggestion.ts` — Added `parseQueryWithAlias()`
- `packages/design-system/src/features/Editor/Editor.tsx` — WIP: `[[` trigger debugging

### Commits

- `e680d99` fix(design-system): improve alias editing state management
- `c2076f3` fix(design-system): fix alias edit popover timing issue

### Known Issues (for next session)

- **`[[` trigger not working** — The `allow()` callback isn't detecting the preceding `[` character correctly. Debug logs show empty text. The `@` trigger works fine.
- **Uncommitted debug code** — Editor.tsx has debug logging for `[[` trigger investigation

---

## Previous Session (2026-01-20 - Image Resize + Story Reorg)

- **Image resize handles (Phase 2)** — Custom NodeView with left/right drag handles
- **Story reorganization** — Split monolithic stories into `stories/` subfolder (6 files)
- Commits: `ccb0261`

---

## Earlier Session (2026-01-20 - Highlight + Images)

- **Highlight mark** — `==text==` syntax with `Cmd+Shift+H` shortcut
- **Image display (Phase 1)** — Display images from URLs
- Commits: `43699d8`

---

## Earlier Sessions (2026-01-19) — Collapsed

- **Tables Phase 1** (`cf7287a`) — TipTap tables + `/table` command
- **Callouts** (`ae98f89`) — 4 types with dropdown and slash commands
- **CodeBlock** (`7d3d04b`) — Shiki highlighting + language dropdown + copy
- **TaskList** (`fb84e66`) — Interactive checkboxes + nesting
- **TagNode** (`38ebbb5`) — Hashtag pills + suggestions
- **SlashCommand** (`19b0551`) — Block insert menu
- **RefNode** (`507aba8`) — Wiki-links + mentions
- **Editor Phase 1** (`437af80`) — Paragraphs/headings/marks

---

## Earlier Sessions (2026-01-18) — Collapsed

- **Primitives + patterns complete** — Radix migration and design-system reset (`3fdbd5d`)

---

## Historical Milestones (Pre-Reset)

Backend packages (api, core, storage) and E2E test infrastructure remain intact.
Features completed before 2026-01-18 reset: Object duplication, Trash/restore, Pinning, TypeBrowser, Templates, Tags, CLI, E2E tests.
