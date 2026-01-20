# Recent Work

## Latest Session (2026-01-19 - Math Support)

### What was accomplished

- **Math support complete** — Inline (`$...$`) and block (`$$`/`/math`) math with KaTeX rendering
- **InlineMath** — Atom node with Obsidian-style focus editing (click to edit, blur to render)
- **MathBlock** — Block node with live preview, `/math` slash command
- **KaTeX integration** — Fast synchronous rendering with inline error display
- **7 unit tests** for `katex-utils.ts`
- **4 Ladle stories** — InlineMath, MathBlocks, ErrorHandling, TryItOut
- **Design doc** — `docs/plans/2026-01-19-math-support-design.md`
- **Code review fixes** — Blur timeout cleanup, dark mode CSS selectors

### Key files created

- `extensions/InlineMath.ts` + `InlineMathView.tsx`
- `extensions/MathBlock.ts` + `MathBlockView.tsx`
- `extensions/katex-utils.ts` + test
- `stories/Editor.math.stories.tsx`

### Commits

- `fa68e93` feat(design-system): add math support with KaTeX

### Known Issues (for next session)

- **`[[` trigger not working** — The `allow()` callback isn't detecting the preceding `[` character correctly. Debug logs in Editor.tsx.

---

## Previous Session (2026-01-20 - Wiki-Link Alias)

- **Wiki-link alias context menu** — Right-click RefNode → "Edit alias..."
- **Alias state management fix** — External Set survives TipTap remounts
- Commits: `e680d99`, `c2076f3`

---

## Earlier Session (2026-01-20 - Image Resize + Story Reorg)

- **Image resize handles (Phase 2)** — Custom NodeView with left/right drag handles
- **Story reorganization** — Split monolithic stories into `stories/` subfolder (6 files)
- Commits: `ccb0261`

---

## Earlier Sessions (2026-01-19/20) — Collapsed

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
