# Recent Work

## Latest Session (2026-01-24 - Design-system depcruise cycle fix)

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

## Earlier Session (2026-01-24 - ObjectDataGrid wiring complete)

### What was accomplished

- **ObjectDataGrid wired to TypesView** — Replaced placeholder list with full-featured data grid
- **Server-side sorting** — Added `sortBy`/`sortDirection` params to `listObjects` in storage + IPC
- **Soft delete** — Added `softDeleteObject` to storage + IPC for trash functionality
- **Column builder utility** — `buildDataGridColumns()` generates columns from ObjectType schema (17 tests)
- **Data fetching hook** — `useObjectsForDataGrid()` manages data, sorting, and deletion (7 tests)

### Key files changed

- `packages/storage/src/objectService.ts` — Sorting + soft delete
- `apps/desktop/src/main/ipc.ts` — New handlers
- `apps/desktop/src/renderer/routes/TypesView.tsx` — ObjectDataGrid integration
- `apps/desktop/src/renderer/lib/buildDataGridColumns.ts` — Column builder (new)
- `apps/desktop/src/renderer/hooks/useObjectsForDataGrid.ts` — Data hook (new)

### Commit

- `86daf59` feat(renderer): wire ObjectDataGrid to TypesView

### Uncommitted work preserved

- useCommandPalette, useRecentObjects, useSearchObjects, useRecordView hooks (from previous session)
- Various layout/styling changes in RootLayout.tsx, NotesView.tsx

---

## Historical — Collapsed

- Build fixes + test infra (2026-01-24): TypeScript stub fix, CSS build script, new hooks (useRecentObjects/useSearchObjects/useRecordView/useTypesMetadata)
- Commit & cleanup (2026-01-24): 4 atomic commits — `f85eab1`, `9e7ffd4`, `457cb46`, `f58e2dd`
- Document autosave robustness (2026-01-23)
- REST API coverage complete (2026-01-24)
- Editor wiring to NotesView (2026-01-23)
- AppShell renderer wiring (2026-01-23)
- PropertyList + ObjectDataGrid feature (2026-01-21)
