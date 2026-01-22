# Recent Work

## Latest Session (2026-01-21 - Table Primitive)

### What was accomplished

- **Table primitive shipped** — Compound components + TableContainer wrapper with stories
- **Row state styling tuned** — Hover, selected/active tinting, indeterminate header selection
- **Pinned column experiments** — Tested scroll-aware shadows and reverted to baseline sticky behavior

### Key files changed

- `packages/design-system/src/primitives/Table/Table.tsx`
- `packages/design-system/src/primitives/Table/Table.stories.tsx`
- `packages/design-system/src/primitives/Table/index.ts`
- `packages/design-system/src/primitives/index.ts`

### Commits

- None (local changes)

---

## Earlier Session (2026-01-21 - Fix /image Slash Insert)

### What was accomplished

- **Restored /image slash insert flow** — Slash command opens the image insert popover, removes the trigger text, and inserts at the original cursor
- **Read-only guard for image insert** — Popover closes and does not open when the editor is read-only

### Key files changed

- `packages/design-system/src/features/Editor/Editor.tsx`

### Commits

- `4e792bc` fix(design-system): restore /image slash insert flow

---

## Earlier Session (2026-01-21 - Markdown Export/Import Design)

### What was accomplished

- **NotateDoc converters committed** — `57822b2` feat(core): add NotateDoc ↔ TipTap converters
- **Markdown export/import requirements** — Brainstormed via skill, clarified all design decisions
- **Architecture designed** — Two code-architect agents converged on unified/remark approach

### Key decisions documented

- Export link format: `[[id|Title]]` (roundtrip-safe)
- Import link resolution: Create new objects (merge duplicates later)
- Frontmatter: Parse YAML to object properties
- Folder structure: Flatten on import
- Attachments: Keep as external refs (MVP)
- Build order: Export first, then import

### Architecture summary

- Location: `packages/core/src/markdown/`
- Parser: `unified` + `remark` ecosystem
- APIs: `notateDocToMarkdown()`, `markdownToNotateDoc()`
- ~3,500 lines estimated (similar scope to TipTap converters)

### Commits

- `57822b2` feat(core): add NotateDoc ↔ TipTap converters

---

## Earlier Session (2026-01-21 - NotateDoc Converters)

- **tiptapToNotateDoc** — Editor → Storage converter (310 lines)
- **notateDocToTiptap** — Storage → Editor with RefResolver callback (365 lines)
- **62 unit tests** — All block/inline types, marks, refs, embeds, tables, math, footnotes
- **Commit:** `57822b2`

---

## Earlier Sessions (2026-01-19–21) — Collapsed

Editor features: Editor.tsx refactor (`0bc2577`), Image upload UX (`efd96d5`), design-system tests (`611493c`), embeds (`6501991`), footnotes (`352b859`), block IDs (`cf4b70f`), wiki-link UX (`342d296`), math (`fa68e93`), images (`ccb0261`), tables (`cf7287a`), callouts (`ae98f89`), code blocks (`7d3d04b`), task lists (`fb84e66`), tags (`38ebbb5`), slash command (`19b0551`), RefNode (`507aba8`), Editor Phase 1 (`437af80`), primitives+patterns (`3fdbd5d`).

---

## Historical Milestones (Pre-Reset)

Backend packages (api, core, storage) and E2E test infrastructure remain intact.
Features completed before 2026-01-18 reset: Object duplication, Trash/restore, Pinning, TypeBrowser, Templates, Tags, CLI, E2E tests.
