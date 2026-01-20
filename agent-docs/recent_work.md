# Recent Work

## Latest Session (2026-01-19 - Table Toolbar & Controls)

### What was accomplished

- **ContextMenu primitive** — New Radix-based primitive for right-click menus
- **TableToolbar component** — Floating toolbar appears when cursor is in table cell
  - Tracks position to active cell (moves as you navigate)
  - Row menu: insert above/below, delete row
  - Column menu: insert left/right, delete column
  - Delete table with inline confirmation ("Delete table?" + confirm/cancel)
  - Auto-cancels confirmation on click outside or cursor leaving table
- **5 Ladle stories**: WithTable, TableViaSlash, TableWithRichContent, EmptyTable, TableWithToolbar

### Key files created/modified

- `primitives/ContextMenu/` — New Radix-based context menu primitive
- `extensions/TableToolbar.tsx` — Floating toolbar with row/column/table operations
- `extensions/Table.ts` — Simplified (removed NodeView approach)
- `Editor.tsx` — Added table toolbar integration with cell tracking
- `Editor.stories.tsx` — Added TableWithToolbar story
- `primitives/index.ts` — Export ContextMenu
- `docs/plans/2026-01-19-table-design.md` — Updated status to Phase 1 + 2 complete

### Commits

- Not yet committed

---

## Previous Session (2026-01-19 - Tables Phase 1)

- **Table extension** — TipTap table support using official extensions
- **`/table` slash command** — Inserts 3x3 table with header row
- **4 Ladle stories**: WithTable, TableViaSlash, TableWithRichContent, EmptyTable
- Commits: `cf7287a`

---

## Previous Session (2026-01-19 - Callout Blocks)

- **Callout extension** — 4 types (info, warning, tip, error) with type dropdown, nested content
- **4 slash commands** — `/info`, `/warning`, `/tip`, `/error`
- **4 Ladle stories**
- Commits: `ae98f89`

---

## Previous Session (2026-01-19 - CodeBlock with Shiki)

- **CodeBlock extension** — Shiki syntax highlighting, 27 languages, language dropdown, copy button
- **7 new Ladle stories**: WithCodeBlock, CodeBlockViaMarkdown, CodeBlockViaSlash, CodeBlockLanguages, CodeBlockCopyButton, CodeBlockLongLines, CodeBlockPlainText
- Commits: `7d3d04b`

---

## Previous Session (2026-01-19 - TaskList Extension)

- **TaskList support** — Interactive checkboxes with `/task`, `/todo`, `/checkbox` slash commands
- **Nested support** — Tab/Shift+Tab for indentation
- **3 new Ladle stories**: WithTaskList, TaskListViaSlash, NestedTaskList
- Commits: `fb84e66`

---

## Earlier Sessions (2026-01-19) — Collapsed

- **TaskList** (`fb84e66`) — Checkboxes with `/task` slash command, nested support
- **TagNode + TagSuggestion** (`38ebbb5`) — Hashtags via `#`
- **SlashCommand** (`19b0551`) — `/` trigger for block types
- **RefNode styling** (`2d94de1`) — Hover underline effect
- **RefNode + RefSuggestion** (`507aba8`) — Wiki-links via `[[` and mentions via `@`
- **Editor Phase 1** (`437af80`) — TipTap integration with paragraphs, headings, marks
- **HeaderBar feature** (`f4c4d73`) — Link, Breadcrumbs, SearchTrigger, ThemeToggle
- **TitleBar feature** (`5aaaa86`) — Custom Electron window chrome
- **AppShell feature** (`ef71be8`) — Composition layer for full app layout
- **Sidebar refinements** (`4888b68`, `e8b73c4`) — Type-colored hover/active states

## Earlier Sessions (2026-01-18) — Collapsed

- **Primitives Complete + Radix Migration** — 19 primitives, 5 migrated to Radix
- **All patterns complete** — 12 patterns including field patterns, NavItem, EmptyState
- **Design System Full Reset** (`3fdbd5d`) — Deleted pre-reset code, preserved tokens

Reference: `pre-reset` git tag at `88eefdd` contains all deleted code.

---

## Historical Milestones (Pre-Reset)

Backend packages (api, core, storage) and E2E test infrastructure remain intact.
Features completed before 2026-01-18 reset: Object duplication, Trash/restore, Pinning, TypeBrowser, Templates, Tags, CLI, E2E tests.
