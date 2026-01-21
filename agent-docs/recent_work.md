# Recent Work

## Latest Session (2026-01-21 - Design-system unit tests)

### What was accomplished

- **Design-system test sweep** — Added unit tests for ref parsing, block IDs, slash command filtering, shiki helpers, footnote manager comparisons, input regexes, and cn utility
- **Embed suppression coverage** — Added tests for nested embed sanitization
- **Safety tweaks** — Exported block ID input regex and filtered undefined footnote nodes
- **Test run** — `pnpm --filter @typenote/design-system test`

### Key files created/changed

- `extensions/*.test.ts` (RefSuggestion, block-id-utils, SlashCommand, shiki-highlighter, FootnoteManager, BlockIdNode, FootnoteRefNode, FootnoteDefNode)
- `extensions/BlockIdNode.ts`, `extensions/FootnoteManager.ts`, `extensions/embed-utils.test.ts`, `lib/utils.test.ts`

### Commits

- `611493c` test(design-system): lock in editor helper behavior

---

## Previous Session (2026-01-21 - Embeds + Footnotes + Ladle Fixes)

### What was accomplished

- **Embeds + suggestions** — EmbedNode preview, `![[` trigger, `/embed` command
- **Footnotes** — Inline refs + definitions, ordering + separator
- **Warning states + stories** — Missing ref/duplicate def highlights, new Ladle stories
- **Docs + tests** — Utilities coverage and agent-docs refresh

### Key files created/changed

- `extensions/EmbedNode.ts`, `EmbedNodeView.tsx`, `FootnoteRefNode.ts`, `FootnoteDefNode.ts`, `FootnoteManager.ts`
- `Editor.tsx`, `SlashCommand.ts`, `types.ts`, `stories/Editor.embeds.stories.tsx`, `stories/Editor.footnotes.stories.tsx`

### Commits

- `6501991`, `352b859`, `ce487b9`, `6d1b17d`, `4a0428f`

---

## Previous Session (2026-01-20 - Block IDs + Heading/Block References)

### What was accomplished

- **Block IDs** — BlockIdNode input rule + click-to-copy reference
- **Heading/Block refs** — RefNode updates, dropdown indicators, auto block IDs
- **RefSuggestion refactor** — Mode state machine, callbacks, new stories

### Key files created/changed

- `extensions/BlockIdNode.ts`, `block-id-utils.ts`, `RefNode.ts`, `RefSuggestion.ts`, `RefSuggestionList.tsx`
- `Editor.tsx`, `stories/Editor.blockId.stories.tsx`, `stories/Editor.refs.stories.tsx`

### Commits

- `cf4b70f`

---

## Earlier Sessions (2026-01-20/19) — Collapsed

- **Wiki-link trigger fix + alias UX** (`342d296`)
- **Math support (KaTeX)** (`fa68e93`)
- **Wiki-link alias context menu** (`e680d99`)
- **Image resize + story reorg** (`ccb0261`)
- **Highlight + images** (`43699d8`)
- **Tables** (`cf7287a`)
- **Callouts** (`ae98f89`)
- **CodeBlock** (`7d3d04b`)
- **TaskList** (`fb84e66`)
- **TagNode** (`38ebbb5`)
- **SlashCommand** (`19b0551`)
- **RefNode** (`507aba8`)
- **Editor Phase 1** (`437af80`)
- **Primitives + patterns** (`3fdbd5d`)

---

## Historical Milestones (Pre-Reset)

Backend packages (api, core, storage) and E2E test infrastructure remain intact.
Features completed before 2026-01-18 reset: Object duplication, Trash/restore, Pinning, TypeBrowser, Templates, Tags, CLI, E2E tests.
