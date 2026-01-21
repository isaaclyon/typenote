# Recent Work

## Latest Session (2026-01-21 - Embeds + Footnotes)

### What was accomplished

- **Embeds (![[...]])** — New EmbedNode block with read-only preview, expand/collapse, open action
- **Embed suggestions** — `![[` trigger with heading/block targets + `/embed` slash command
- **Footnotes** — Inline `[^key]` refs + `[^key]:` definitions with auto ordering + separator
- **Warning states** — Missing ref highlights and duplicate def notices
- **Utilities + tests** — embed-utils + footnote-utils with Vitest coverage
- **New Ladle stories** — Embeds and Footnotes

### Key files created/changed

- `extensions/EmbedNode.ts`, `EmbedNodeView.tsx` — Embed node + preview renderer
- `extensions/FootnoteRefNode.ts`, `FootnoteDefNode.ts`, `FootnoteManager.ts` — Footnote system
- `Editor.tsx`, `SlashCommand.ts`, `types.ts` — Embed/footnote wiring
- `stories/Editor.embeds.stories.tsx`, `Editor.footnotes.stories.tsx` — New stories

### Commits

- `6501991`, `352b859`

---

## Previous Session (2026-01-20 - Block IDs + Heading/Block References)

### What was accomplished

- **Block IDs (`^block-id` syntax)** — New BlockIdNode extension with input rule, click-to-copy reference
- **Heading References (`[[Page#Heading]]`)** — Extended RefNode with `headingText` attribute, H1-H6 level indicators in dropdown
- **Block References (`[[Page#^blockid]]`)** — Extended RefNode with `blockId` attribute, auto-generates 6-char ID
- **Refactored RefSuggestion** — Clean state machine with 3 modes: `object`, `heading`, `block`
- **New Editor callbacks** — `onHeadingSearch`, `onBlockSearch`, `onBlockIdInsert`
- **8 new Ladle stories** — Block IDs (4), Heading/Block refs (4)

### Key files created/changed

- `extensions/BlockIdNode.ts`, `BlockIdNodeView.tsx`, `block-id-utils.ts` — New block ID feature
- `extensions/RefNode.ts`, `RefNodeView.tsx` — Added headingText/blockId attributes
- `extensions/RefSuggestion.ts` — Refactored state machine with type guards
- `extensions/RefSuggestionList.tsx` — Heading/block item rendering
- `Editor.tsx`, `types.ts` — Wire new callbacks
- `stories/Editor.blockId.stories.tsx`, `Editor.refs.stories.tsx` — New stories

### Commits

- `cf4b70f`

---

## Previous Session (2026-01-20 - Wiki-Link Trigger Fix + Alias Mode UX)

- **Fixed `[[` wiki-link trigger** — Position calculation corrected
- **Tab completion** — Autocomplete selected item's title
- **Alias Mode UX** — Collapsed popup with live preview for `|alias` syntax
- Commits: `342d296`

---

## Previous Session (2026-01-19 - Math Support)

- **Math support complete** — Inline (`$...$`) and block (`$$`/`/math`) with KaTeX
- **InlineMath/MathBlock** — Custom NodeViews with live preview
- Commits: `fa68e93`

---

## Earlier Sessions (2026-01-19/20) — Collapsed

- **Wiki-link alias context menu** (`e680d99`) — Right-click RefNode → "Edit alias..."
- **Image resize + story reorg** (`ccb0261`) — Drag handles, 6-file story split

- **Highlight + Images** (`43699d8`) — `==text==` syntax, image display
- **Tables** (`cf7287a`) — TipTap tables + `/table` command
- **Callouts** (`ae98f89`) — 4 types with dropdown
- **CodeBlock** (`7d3d04b`) — Shiki highlighting
- **TaskList** (`fb84e66`) — Interactive checkboxes
- **TagNode** (`38ebbb5`) — Hashtag pills
- **SlashCommand** (`19b0551`) — Block insert menu
- **RefNode** (`507aba8`) — Wiki-links + mentions
- **Editor Phase 1** (`437af80`) — Paragraphs/headings/marks
- **Primitives + patterns** (`3fdbd5d`) — Radix migration, design-system reset

---

## Historical Milestones (Pre-Reset)

Backend packages (api, core, storage) and E2E test infrastructure remain intact.
Features completed before 2026-01-18 reset: Object duplication, Trash/restore, Pinning, TypeBrowser, Templates, Tags, CLI, E2E tests.
