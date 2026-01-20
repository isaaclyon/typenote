# Recent Work

## Latest Session (2026-01-20 - Wiki-Link Trigger Fix + Alias Mode UX)

### What was accomplished

- **Fixed `[[` wiki-link trigger** — Corrected position calculation in `allow()` callback; now properly detects double brackets
- **Tab completion for suggestions** — Press Tab to autocomplete selected item's title (e.g., type `[[Get` → Tab → `[[Getting Started Guide`)
- **Alias Mode UX** — When typing `|` after a matched item:
  - Popup collapses to show only the matched item
  - Live preview: `→ displays as "alias"`
  - Arrow keys disabled (single item)
  - Tab disabled (already have full title)
  - Enter confirms with alias
- **Design doc** — `docs/plans/2026-01-20-alias-mode-ux-design.md`
- **Fixed opencode plugin error** — Removed `kdco/worktree` from `opencode.json` plugins (already installed via OCX)

### Key files changed

- `packages/design-system/src/features/Editor/Editor.tsx` — Trigger fix, Tab completion, alias mode detection
- `packages/design-system/src/features/Editor/extensions/RefSuggestion.ts` — Matching trigger fix
- `packages/design-system/src/features/Editor/extensions/RefSuggestionList.tsx` — Alias mode UI
- `opencode.json` — Removed duplicate plugin entry

### Commits

- Uncommitted — ready for commit

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
