# Recent Work

## Latest Session (2026-01-24 - .code prompts + skills)

### What was accomplished

- **Added .code prompt wrappers** — Added short `.code/prompts/*` wrappers for session commands + E2E skills
- **Ported design-principles skill** — Copied `.claude/skills/design-principles/` into `.code/skills/`
- **Clarified initialization context** — Removed auto-load wording from `.code/AGENTS.md`

### Key files changed

- `.code/AGENTS.md`
- `.code/prompts/*`
- `.code/skills/design-principles/*`

### Commits

- None

### Uncommitted work preserved

- Left existing renderer/preload/main and package.json edits untouched

---

## Earlier Session (2026-01-24 - Claude/Codex config sync)

### What was accomplished

- **Restored design-principles skill** — Brought back `.claude/skills/design-principles/` files for design references
- **Synced AGENTS + CLAUDE** — Replaced `AGENTS.md` with a symlink to `CLAUDE.md` for deterministic alignment
- **Codex parity** — Added `.code/AGENTS.md` + `.code/CLAUDE.md` symlinks and removed `opencode.json`

### Key files changed

- `.claude/skills/design-principles/*`
- `AGENTS.md` (symlink to `CLAUDE.md`)
- `.code/AGENTS.md`, `.code/CLAUDE.md`
- `opencode.json` (deleted)

### Commits

- None

### Uncommitted work preserved

- Left existing renderer/preload/main and package.json edits untouched

---

## Earlier Session (2026-01-24 - Design-system depcruise cycle fix)

### What was accomplished

- **Broke design-system cycles** — Extracted shared types into `.types.ts` modules for PropertyList + editor extensions
- **Imports aligned** — Updated editor hooks/types and PropertyList to consume the new type modules
- **Depcruise clean** — `pnpm deps:check` now reports 0 errors (only orphan warnings remain)

### Key files changed

- `packages/design-system/src/patterns/PropertyList/{PropertyList.types.ts,PropertyList.tsx,EditableValue.tsx,index.ts}`
- `packages/design-system/src/features/Editor/extensions/{Callout,EmbedNode,ResizableImage}*.ts*`
- `packages/design-system/src/features/Editor/extensions/ImageNodeView.tsx`
- `packages/design-system/src/features/Editor/hooks/{useEditorExtensions.ts,useImageUpload.ts}`
- `packages/design-system/src/features/Editor/{types.ts,Editor.tsx}`

### Commit

- `860462d` fix(design-system): extract shared types to break cycles

### Uncommitted work preserved

- Renderer hooks/tests + layout changes (RootLayout, NotesView, IPC adapter)
- Sidebar story + type tweaks in design-system
- Preload/API typings edits and package.json/lockfile changes

---

## Earlier Session (2026-01-24 - Search enrichment)

### What was accomplished

- **Search results enriched with metadata** — Extended `SearchResult` to include object title, type key, icon, and color
- **SQL JOIN pattern** — Added JOINs with `objects` and `object_types` tables in `searchBlocks()` query
- **CommandPalette displays real titles** — Search results now show "Meeting Notes" instead of "01ABC..."
- **Follows codebase patterns** — Mirrors the JOIN enrichment approach from `getBacklinks()`, `getRecentObjects()`, `getPinnedObjects()`
- **Comprehensive testing** — Updated 8 test files with new field expectations, all 846 storage tests + 121 desktop tests pass

### Key files changed

- `packages/storage/src/search.ts` — Extended SearchResult type, added SQL JOINs (4 new fields)
- `packages/storage/src/search.test.ts` — Updated test expectations for enriched results
- `apps/desktop/src/renderer/hooks/useCommandPalette.ts` — New hook using enriched search data
- `apps/desktop/src/renderer/hooks/__tests__/*` — Tests for CommandPalette + search hooks
- `apps/desktop/src/main/ipc.test.ts` — Updated IPC handler test expectations

### Commit

- `e61ac60` feat(search): enrich search results with object metadata

### Uncommitted work preserved

- useRecentObjects, useRecordView, useSearchObjects, useTypesMetadata hooks (from previous sessions)
- Layout/styling changes in RootLayout.tsx, NotesView.tsx
- package.json dependency additions

---

## Historical — Collapsed

- Build fixes + test infra (2026-01-24): TypeScript stub fix, CSS build script, new hooks (useRecentObjects/useSearchObjects/useRecordView/useTypesMetadata)
- ObjectDataGrid wiring complete (2026-01-24): TypesView integration, sorting, soft delete, column builder, data hook — `86daf59`
- Commit & cleanup (2026-01-24): 4 atomic commits — `f85eab1`, `9e7ffd4`, `457cb46`, `f58e2dd`
- Document autosave robustness (2026-01-23)
- REST API coverage complete (2026-01-24)
- Editor wiring to NotesView (2026-01-23)
- AppShell renderer wiring (2026-01-23)
- PropertyList + ObjectDataGrid feature (2026-01-21)
