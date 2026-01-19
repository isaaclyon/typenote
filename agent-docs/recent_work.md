# Recent Work

## Latest Session (2026-01-19 - TagNode Extension)

### What was accomplished

- **Brainstormed and designed** TagNode feature using brainstorming skill
- **Built TagNode extension** — TipTap Node for inline hashtags
- **Built TagSuggestion** — Autocomplete triggered by `#` with search/create support
- **TagNodeView** — Colored pill/chip rendering with hover effect
- **TagSuggestionList UI** — Dropdown matching RefSuggestionList styling
- **3 new Ladle stories**: WithTags, WithExistingTags, TagColors
- **Updated FullFeaturedEditor** — Now includes tags
- **Design doc**: `docs/plans/2026-01-19-tag-node-design.md`

### Key files created

- `packages/design-system/src/features/Editor/extensions/TagNode.ts` — TipTap Node extension
- `packages/design-system/src/features/Editor/extensions/TagNodeView.tsx` — React component
- `packages/design-system/src/features/Editor/extensions/TagSuggestionList.tsx` — Dropdown UI

### Key files modified

- `Editor.tsx` — Wired in tag suggestion state, render callbacks, popup rendering
- `types.ts` — Added `enableTags`, `onTagSearch`, `onTagCreate`, `onTagClick` props
- `editor.css` — Added `.tag-node-pill` styles with color-mix for tinted backgrounds
- `extensions/index.ts` — Exported TagNode types and components
- `Editor.stories.tsx` — 3 new stories + updated FullFeaturedEditor

### Commits

- `38ebbb5` feat(design-system): add TagNode and TagSuggestion for hashtag support

### Notes

- React 18 warnings about `flushSync` during initial render are a known TipTap issue (not affecting functionality)

---

## Previous Session (2026-01-19 - SlashCommand Menu)

### What was accomplished

- **Brainstormed and designed** SlashCommand feature using brainstorming skill
- **Built SlashCommand extension** — TipTap Suggestion plugin for `/` trigger
- **9 block types supported**: paragraph, h1-h3, bullet list, numbered list, quote, code block, divider
- **Filterable menu**: type `/head` to filter to headings
- **SlashCommandList UI** — dropdown matching RefSuggestionList styling
- **4 new Ladle stories**: WithSlashCommands, SlashCommandFiltering, SlashCommandDisabled, FullFeaturedEditor
- **Design doc**: `docs/plans/2026-01-19-slash-command-design.md`

### Commits

- `19b0551` feat(design-system): add SlashCommand menu for block type insertion

---

## Previous Session (2026-01-19 - RefNode Styling Improvements)

- **Hover effect**: 2px → 4px underline transition with raised position for descenders
- **Fixed bugs**: unique PluginKey for @ and [[ triggers, icons in dropdown
- **Design doc**: `docs/plans/2026-01-19-ref-node-hover-design.md`
- Commits: `2d94de1`, `0de9c41`, `0af415e`, `b8be1dd`

---

## Previous Session (2026-01-19 - Editor Phase 2a: RefNode + RefSuggestion)

### What was accomplished

- Built **RefNode** extension — inline reference nodes
- Built **RefSuggestion** — autocomplete via `@` and `[[` triggers
- **RefSuggestionList** — dropdown UI with keyboard navigation
- **3 new Ladle stories**: WithRefs, WithExistingRefs, RefTypeColors

### Commits

- `507aba8` feat(design-system): add RefNode and RefSuggestion for wiki-links and mentions

---

## Previous Session (2026-01-19 - Editor Feature Phase 1)

- Built **Editor** feature — TipTap/ProseMirror integration
- Phase 1: paragraphs, headings, basic marks, full-width clickable area
- `437af80` feat(design-system): add Editor feature with TipTap integration

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
