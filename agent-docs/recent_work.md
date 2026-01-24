# Recent Work

## Latest Session (2026-01-23 - Wire Editor to NotesView)

### What was accomplished

- **Editor wiring complete** — TipTap Editor connected to NotesView with full data flow
- **New hooks** — `useDocument` (fetch + convert) and `useDocumentMutation` (autosave with 750ms debounce)
- **Converter improvements** — Modified `@typenote/core` converters to preserve block IDs through TipTap round-trip
- **RefResolver implementation** — Full resolver pre-fetches all objects for reference display titles/colors
- **Bug fixes from code review** — Stale docVersion race condition, nested block parent tracking, sibling ordering

### Key files changed

- `packages/core/src/converter/tiptapToNotateDoc.ts` — Added `blockId` to ConvertedBlock
- `packages/core/src/converter/notateDocToTiptap.ts` — Embed blockId in TipTap attrs
- `apps/desktop/src/renderer/hooks/useDocument.ts` — New hook
- `apps/desktop/src/renderer/hooks/useDocumentMutation.ts` — New hook
- `apps/desktop/src/renderer/routes/NotesView.tsx` — Full Editor integration
- `apps/desktop/src/renderer/utils/useDebouncedCallback.ts` — New debounce utility

### Commits

- No commits yet — changes uncommitted

### Tests run

- `pnpm --filter @typenote/core test` — 160/160 passing (converters verified)

---

## Earlier Session (2026-01-24 - REST Coverage: Object Types)

Object types REST endpoints complete. Commit: `8bc76a1`.

---

## Earlier Session (2026-01-24 - REST Coverage: Export, Attachments, Calendar)

Export routes, attachment downloads, calendar coverage complete. Commits: `7454e64`, `ab2881a`, +8 more.

---

## Earlier Session (2026-01-23 - AppShell Renderer Wiring)

Wired AppShell to renderer, created test infrastructure, built hooks (usePinnedObjects, useSidebarData). Commits: `1d6aa54`, `bdfee34`, +5 more.

---

## Historical — Collapsed

REST API plan + docs archive cleanup (2026-01-22). PropertyList + ObjectDataGrid (2026-01-21). Earlier backend/UI sessions.
