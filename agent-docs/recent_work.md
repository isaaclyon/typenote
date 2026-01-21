# Recent Work

## Latest Session (2026-01-21 - NotateDoc Converters)

### What was accomplished

- **NotateDoc converters** — Built TipTap JSONContent ↔ NotateDoc converters in `packages/core`
- **tiptapToNotateDoc** — Converts editor content to storage format (drops UI-only attrs)
- **notateDocToTiptap** — Converts storage format back to editor (with RefResolver callback for UI metadata)
- **62 unit tests** — Full coverage for all block/inline types, marks, refs, embeds, tables, math, footnotes

### Key files created

- `packages/core/src/converter/types.ts` — TipTap JSONContent type definitions
- `packages/core/src/converter/tiptapToNotateDoc.ts` — Editor → Storage converter (310 lines)
- `packages/core/src/converter/notateDocToTiptap.ts` — Storage → Editor converter (365 lines)
- `packages/core/src/converter/index.ts` — Module exports
- `packages/core/src/converter/*.test.ts` — 62 tests

### Commits

- (uncommitted) feat(core): add NotateDoc ↔ TipTap converters

---

## Earlier Session (2026-01-21 - Editor.tsx refactoring)

- **Editor.tsx god file refactoring** — Reduced from 1,893 lines to 562 lines (70% reduction)
- **Extracted hooks** — `useCallbackRef`, `useImageUpload`, `useSuggestionState`, `useEditorExtensions`
- **Commit:** `0bc2577`

---

## Earlier Sessions (2026-01-21) — Collapsed

- **Image upload UX** (`efd96d5`) — `/image` popover, drag/drop, paste, progress states
- **Design-system unit tests** (`611493c`) — 77 tests for editor helpers
- **Embeds + Footnotes** (`6501991`, `352b859`) — `![[...]]` + `[^key]` support

---

## Earlier Sessions (2026-01-20/19) — Collapsed

- **Block IDs + heading/block references** (`cf4b70f`)
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
