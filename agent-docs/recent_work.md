# Recent Work

## Latest Session (2026-01-19 - Callout Blocks)

### What was accomplished

- **Built Callout extension** — Custom TipTap node with 4 types: info, warning, tip, error
- **CalloutView with type dropdown** — Click icon/label to change callout type
- **Color-coded styling** — Blue (info), amber (warning), green (tip), red (error)
- **Sharp left border** — Clean rectangular accent border on left side
- **Full nested content** — Supports headings, lists, code blocks inside callouts
- **4 slash commands** — `/info`, `/warning`, `/tip`, `/error`
- **4 new Ladle stories**: WithCallouts, CalloutViaSlash, CalloutWithNestedContent, CalloutTypeChange

### Key files created/modified

- `extensions/Callout.ts` — TipTap Node extension with keyboard shortcuts
- `extensions/CalloutView.tsx` — React NodeView with Phosphor icons + dropdown
- `extensions/SlashCommand.ts` — Added 4 callout commands
- `editor.css` — Callout styling (~90 lines added)
- `Editor.stories.tsx` — 4 new stories
- `extensions/index.ts` — Exported Callout and CodeBlock

### Commits

- `ae98f89` feat(design-system): add Callout blocks with 4 types (info, warning, tip, error)

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

## Previous Session (2026-01-19 - TagNode Extension)

- **TagNode + TagSuggestion** — Hashtags via `#` with autocomplete and creation
- **3 new Ladle stories**: WithTags, WithExistingTags, TagColors
- Commits: `38ebbb5`

---

## Earlier Sessions (2026-01-19) — Collapsed

- **SlashCommand** (`19b0551`) — `/` trigger for block types
- **TagNode + TagSuggestion** (`38ebbb5`) — Hashtags via `#`
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
