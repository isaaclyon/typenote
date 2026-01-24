# Recent Work

## Latest Session (2026-01-24 - Type alignment + destructive purge)

### What was accomplished

- **Aligned type keys + labels** — Renderer now uses PascalCase type keys (e.g., `Page`) and `pluralName` for sidebar labels; metadata queries use `builtInOnly`
- **Destructive type cleanup** — Added `purgeUnsupportedTypes()` and wired into `seedBuiltInTypes()` to delete unsupported types and related data
- **Design-system parity** — Added **Tasks** to Sidebar/AppShell stories
- **New tests** — Added/updated renderer hook tests + storage cleanup test

### Key files changed

- `packages/storage/src/typeCleanup.ts`
- `packages/storage/src/objectTypeService.ts`
- `apps/desktop/src/renderer/hooks/useTypeCounts.ts`
- `apps/desktop/src/renderer/hooks/useTypesMetadata.ts`
- `apps/desktop/src/renderer/hooks/useDocument.ts`
- `apps/desktop/src/renderer/layouts/RootLayout.tsx`
- `packages/design-system/src/features/Sidebar/Sidebar.stories.tsx`

### Commits

- None

### Uncommitted work preserved

- Left existing renderer/preload/main and package.json edits untouched

---

## Earlier Session (2026-01-24 - .code prompts + skills)

### What was accomplished

- Added `.code/prompts/*` wrappers for session commands + E2E skills
- Ported `design-principles` skill into `.code/skills/`
- Clarified initialization context in `.code/AGENTS.md`

### Key files changed

- `.code/AGENTS.md`
- `.code/prompts/*`
- `.code/skills/design-principles/*`

### Commits

- None

### Uncommitted work preserved

- Left existing renderer/preload/main and package.json edits untouched

---

## Earlier Session (2026-01-24 - Design-system depcruise cycle fix)

### What was accomplished

- Broke design-system cycles by extracting shared types
- Updated editor hooks/types + PropertyList to consume new type modules
- `pnpm deps:check` clean (orphan warnings only)

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

- Search results enriched with metadata (title/type/icon/color)
- JOINs added to `searchBlocks()`; CommandPalette shows real titles
- Tests updated across storage + renderer

### Key files changed

- `packages/storage/src/search.ts` — Extended SearchResult type, added SQL JOINs (4 new fields)
- `packages/storage/src/search.test.ts` — Updated test expectations for enriched results
- `apps/desktop/src/renderer/hooks/useCommandPalette.ts` — New hook using enriched search data
- `apps/desktop/src/renderer/hooks/__tests__/*` — Tests for CommandPalette + search hooks
- `apps/desktop/src/main/ipc.test.ts` — Updated IPC handler test expectations

### Commit

- `e61ac60` feat(search): enrich search results with object metadata

## Historical — Collapsed

- Build fixes + test infra (2026-01-24): TypeScript stub fix, CSS build script, new hooks (useRecentObjects/useSearchObjects/useRecordView/useTypesMetadata)
- ObjectDataGrid wiring complete (2026-01-24): TypesView integration, sorting, soft delete, column builder, data hook — `86daf59`
- Commit & cleanup (2026-01-24): 4 atomic commits — `f85eab1`, `9e7ffd4`, `457cb46`, `f58e2dd`
- Document autosave robustness (2026-01-23)
- REST API coverage complete (2026-01-24)
- Editor wiring to NotesView (2026-01-23)
- AppShell renderer wiring (2026-01-23)
- PropertyList + ObjectDataGrid feature (2026-01-21)
