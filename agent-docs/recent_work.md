# Recent Work

## Latest Session (2026-01-20 - Image Resize + Story Reorg)

### What was accomplished

- **Image resize handles (Phase 2)** — Custom NodeView with left/right drag handles, aspect ratio lock
- **Wiki-link aliases** — `[[Page|alias]]` syntax + context menu editing
- **Story reorganization** — Split 43 stories into 6 focused files (41 total after cleanup)

### Key files changed

- `packages/design-system/src/features/Editor/extensions/ImageNodeView.tsx` (new)
- `packages/design-system/src/features/Editor/extensions/ResizableImage.ts` (new)
- `packages/design-system/src/features/Editor/stories/` (new directory, 7 files)
- `packages/design-system/src/features/Editor/extensions/RefNode.ts` (alias attr)
- `packages/design-system/src/features/Editor/extensions/RefNodeView.tsx` (alias UI)

### Commits

- `ccb0261` feat(design-system): add image resize and reorganize editor stories
- `c2076f3` fix(design-system): fix alias edit popover timing issue

---

## Previous Session (2026-01-20 - Highlight + Images)

- **Highlight mark** — `==text==` syntax with `Cmd+Shift+H` shortcut
- **Image display (Phase 1)** — Display images from URLs with rounded corners
- Commits: `43699d8`

---

## Earlier Session (2026-01-19 - Markdown Contract + Links)

- **Markdown contract plan** — Drafted CommonMark + GFM + Obsidian extras contract and gap list
- **Link + autolink support** — Added TipTap link extension (autolink, open on click)
- **Ladle story** — Added WithLinks story
- Commits: `c5d8fa8`

---

## Earlier Session (2026-01-19 - Table Toolbar & Controls)

- **ContextMenu primitive** — New Radix-based right-click menu
- **TableToolbar component** — Floating row/column/table controls in editor
- **5 Ladle stories**: WithTable, TableViaSlash, TableWithRichContent, EmptyTable, TableWithToolbar
- Commits: not yet committed

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
