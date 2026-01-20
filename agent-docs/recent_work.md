# Recent Work

## Latest Session (2026-01-19 - TaskList Extension)

### What was accomplished

- **Added TaskList support** — Interactive checkboxes with slash command
- **Installed TipTap extensions** — `@tiptap/extension-task-list`, `@tiptap/extension-task-item`
- **Added slash command** — `/task`, `/todo`, `/checkbox` keywords
- **Custom CSS styling** — Checkboxes with hover/checked states, strikethrough for completed items
- **Nested support** — Tab/Shift+Tab for indentation
- **3 new Ladle stories**: WithTaskList, TaskListViaSlash, NestedTaskList

### Key files modified

- `Editor.tsx` — Added TaskList + TaskItem extensions, ListChecks icon
- `editor.css` — Custom checkbox styling (63 lines added)
- `extensions/SlashCommand.ts` — Added Task List command with keywords
- `Editor.stories.tsx` — 3 new stories (197 lines)

### Commits

- `fb84e66` feat(design-system): add TaskList support with slash command and styling

---

## Previous Session (2026-01-19 - TagNode Extension)

- **Built TagNode extension** — TipTap Node for inline hashtags
- **Built TagSuggestion** — Autocomplete triggered by `#` with search/create support
- **3 new Ladle stories**: WithTags, WithExistingTags, TagColors
- **Design doc**: `docs/plans/2026-01-19-tag-node-design.md`
- Commits: `38ebbb5`

---

## Previous Session (2026-01-19 - SlashCommand Menu)

- **Brainstormed and designed** SlashCommand feature using brainstorming skill
- **Built SlashCommand extension** — TipTap Suggestion plugin for `/` trigger
- **9 block types supported**: paragraph, h1-h3, bullet list, numbered list, quote, code block, divider
- **Filterable menu**: type `/head` to filter to headings
- **SlashCommandList UI** — dropdown matching RefSuggestionList styling
- **4 new Ladle stories**: WithSlashCommands, SlashCommandFiltering, SlashCommandDisabled, FullFeaturedEditor
- **Design doc**: `docs/plans/2026-01-19-slash-command-design.md`
- Commits: `19b0551`

---

## Previous Session (2026-01-19 - RefNode Styling Improvements)

- **Hover effect**: 2px → 4px underline transition with raised position for descenders
- **Fixed bugs**: unique PluginKey for @ and [[ triggers, icons in dropdown
- **Design doc**: `docs/plans/2026-01-19-ref-node-hover-design.md`
- Commits: `2d94de1`, `0de9c41`, `0af415e`, `b8be1dd`

---

## Previous Session (2026-01-19 - Editor Phase 2a: RefNode + RefSuggestion)

- Built **RefNode** extension — inline reference nodes
- Built **RefSuggestion** — autocomplete via `@` and `[[` triggers
- **RefSuggestionList** — dropdown UI with keyboard navigation
- **3 new Ladle stories**: WithRefs, WithExistingRefs, RefTypeColors
- Commits: `507aba8`

---

## Previous Session (2026-01-19 - Editor Feature Phase 1)

- Built **Editor** feature — TipTap/ProseMirror integration
- Phase 1: paragraphs, headings, basic marks, full-width clickable area
- Commits: `437af80`

---

## Earlier Sessions (2026-01-19) — Collapsed

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
