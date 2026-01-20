# Recent Work

## Latest Session (2026-01-19 - Tables)

### What was accomplished

- **Table extension** — TipTap table support using official extensions
- **`/table` slash command** — Inserts 3x3 table with header row
- **Header row styling** — Bold text, muted background
- **Tab/Shift+Tab navigation** — Move between cells
- **Cell selection highlighting** — Visual feedback for selected cells
- **4 new Ladle stories**: WithTable, TableViaSlash, TableWithRichContent, EmptyTable
- **Column resizing disabled** — prosemirror-tables widget causes layout issues (deferred to Phase 2)

### Key files created/modified

- `extensions/Table.ts` — TipTap table extensions bundle (resizable: false)
- `extensions/SlashCommand.ts` — Added `/table` command with Table icon
- `editor.css` — Table styling (~50 lines)
- `Editor.tsx` — Registered TableExtensions
- `Editor.stories.tsx` — 4 new table stories
- `docs/plans/2026-01-19-table-design.md` — Design doc

### Commits

- Not yet committed

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
