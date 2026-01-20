# Recent Work

## Latest Session (2026-01-19 - CodeBlock with Shiki)

### What was accomplished

- **Built CodeBlock extension** — Custom TipTap extension with language attribute
- **Integrated Shiki** — VS Code-quality syntax highlighting with lazy loading
- **27 supported languages** — TypeScript, Python, Rust, Go, JSON, and more
- **Language dropdown** — Click to change syntax highlighting
- **Copy button** — One-click copy with "Copied!" feedback
- **Markdown input rules** — Type ` ```typescript ` + Enter to create
- **Slash command** — `/code` inserts a code block
- **7 new Ladle stories**: WithCodeBlock, CodeBlockViaMarkdown, CodeBlockViaSlash, CodeBlockLanguages, CodeBlockCopyButton, CodeBlockLongLines, CodeBlockPlainText

### Key files created/modified

- `extensions/shiki-highlighter.ts` — Shiki singleton with lazy loading
- `extensions/CodeBlock.ts` — Extended TipTap extension
- `extensions/CodeBlockView.tsx` — React NodeView with dropdown + copy button
- `Editor.tsx` — Integrated CodeBlock, disabled StarterKit's codeBlock
- `editor.css` — Code block styling (75 lines added)
- `Editor.stories.tsx` — 7 new stories (293 lines)

### Commits

- `7d3d04b` feat(design-system): add CodeBlock with Shiki syntax highlighting

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

## Previous Session (2026-01-19 - SlashCommand Menu)

- **SlashCommand extension** — `/` trigger for 9 block types
- **4 new Ladle stories**: WithSlashCommands, SlashCommandFiltering, SlashCommandDisabled, FullFeaturedEditor
- Commits: `19b0551`

---

## Earlier Sessions (2026-01-19) — Collapsed

- **RefNode styling** (`2d94de1`) — Hover underline effect
- **RefNode + RefSuggestion** (`507aba8`) — Wiki-links via `[[` and mentions via `@`
- **Editor Phase 1** (`437af80`) — TipTap integration with paragraphs, headings, marks
- **HeaderBar feature** (`f4c4d73`) — Link, Breadcrumbs, SearchTrigger, ThemeToggle
- **TitleBar feature** (`5aaaa86`) — Custom Electron window chrome
- **AppShell feature** (`ef71be8`) — Composition layer for full app layout
- **Sidebar refinements** (`4888b68`, `e8b73c4`) — Type-colored hover/active states

## Earlier Sessions (2026-01-18) — Collapsed

- **HeaderBar feature** (`f4c4d73`) — Link primitive, Breadcrumbs, SearchTrigger, ThemeToggle
- **TitleBar feature** (`5aaaa86`) — Custom Electron window chrome (28px, draggable)
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
