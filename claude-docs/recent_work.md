# Recent Work

## Latest Session (2026-01-15 - Toast Migration & Audit Script)

Built a deterministic design-system audit script and migrated Toast/Toaster from Sonner to design-system.

**Design System Audit Script:**

- `scripts/audit-design-system.ts` — Scans design-system exports, finds usage in desktop app
- `just audit-design-system` — Justfile command to run scanner
- Discovered migration checklist was stale (27/33 migrated, not 26/33)
- Found orphaned components: KeyboardKey (command.tsx deleted), Toast (Sonner used directly)

**Toast Migration:**

- Wrapped Sonner in `packages/design-system/src/components/Toast/Toaster.tsx`
- Re-exported `toast` function from design-system
- Updated all desktop imports: App.tsx, useImageUpload.ts, ipc.ts
- Deleted `apps/desktop/src/renderer/components/ui/sonner.tsx`
- Removed Sonner from desktop package.json (now in design-system)

**Migration Checklist Corrections:**

- Updated `docs/design-system-migration.md` to 29/33 (88%)
- Marked Sidebar, RightSidebar, TypeBrowser as complete (were incorrectly marked incomplete)

**Commits:**

- `0738017 feat(design-system): migrate Toast/Toaster from Sonner to design-system`
- `642251f docs: add Toast migration design`
- `e8b0ddd feat: add design system audit script`
- `f642e67 docs: add design system audit script design`

---

## Previous Session (2026-01-15 - InteractiveEditor Migration)

Replaced desktop's NoteEditor with design-system's InteractiveEditor. Added callback props for IPC integration while keeping mock fallbacks for Ladle stories.

**Key Architectural Pattern:**

- Design-system owns editor with optional callbacks (`refSuggestionCallbacks`, `tagSuggestionCallbacks`)
- Desktop's `DocumentEditor` wraps InteractiveEditor and wires IPC callbacks
- ~30 redundant extension files deleted from desktop

**Design-System Changes:**

- `packages/design-system/src/components/InteractiveEditor/types.ts` — Added callback interfaces + InteractiveEditorRef
- `packages/design-system/.../useRefSuggestion.tsx` — Async callback support with mock fallback
- `packages/design-system/.../useTagSuggestion.tsx` — Async callback support
- `packages/design-system/.../RefNode.tsx` — Added onNavigate click handler
- New extensions migrated: MathBlock, MathInline, Highlight, LineNavigation, AttachmentNode

**Desktop Changes:**

- `apps/desktop/src/renderer/components/DocumentEditor.tsx` — New wrapper with IPC integration
- `apps/desktop/src/renderer/App.tsx` — Uses DocumentEditor instead of NoteEditor
- Deleted: NoteEditor.tsx, SlashCommandMenu/, extensions/\* (~30 files)

**Verification:**

- ✅ Typecheck: All 8 packages pass
- ✅ Tests: 358 desktop tests pass
- ✅ Ladle: Stories work with mock fallbacks

**Commit:**

- `260c23c feat(desktop): replace NoteEditor with InteractiveEditor from design-system`

---

## Previous Session (2026-01-15 - CommandPalette Design System Migration)

Enhanced design-system CommandPalette to match desktop app needs (groups, async/loading states, keyboard navigation). Fully replaced cmdk dependency with design-system components.

**Phases Completed:**

- Phase 1 (Brainstorming) — Design exploration via questions, chose compound component architecture
- Phase 2 (Feature Dev) — Codebase exploration, design document created
- Phase 3 (TDD) — Wrote 10 keyboard hook tests (all passing)
- Phase 4 (Implementation) — Built 8 components + Ladle stories, desktop migration complete

**Key Changes:**

- `packages/design-system/src/components/CommandPalette/` — 8 new components (root, input, list, group, item, empty, loading, separator)
- `packages/design-system/src/components/CommandPalette/useCommandPaletteKeyboard.ts` — Keyboard navigation hook with wrap-around
- `packages/design-system/src/components/CommandPalette/CommandPalette.stories.tsx` — Comprehensive Ladle stories (8 exports)
- `apps/desktop/src/renderer/components/CommandPalette/index.tsx` — Migrated from cmdk wrapper to design-system components
- Deleted: `apps/desktop/src/renderer/components/ui/command.tsx` (cmdk wrapper)
- Removed: `cmdk` dependency from desktop package.json

**Verification:**

- ✅ Typecheck: 6/6 packages pass
- ✅ Unit tests: 10/10 keyboard hook tests passing
- ✅ Desktop build: Successful (2 MB JS bundle)
- ✅ No cmdk imports remaining
- ✅ Design document: `docs/plans/2026-01-15-command-palette-enhancement-design.md`

**Commits:**

- `09f280a feat(desktop): migrate CommandPalette to design-system`
- `73b1a7c docs: add CommandPalette enhancement design`

---

## Previous Session (2026-01-15 - Mutation Testing with Parallel Agents)

Ran Stryker mutation testing across all packages and dispatched 5 parallel agents (haiku/sonnet/opus) to improve coverage for files with low scores.

**Mutation Testing Results:**

| Package           | Score  | Status                 |
| ----------------- | ------ | ---------------------- |
| @typenote/api     | 86.92% | ✅ Above 45% threshold |
| @typenote/core    | 96.50% | ✅ Above 80% threshold |
| @typenote/storage | 77.51% | ✅ Above 75% threshold |

**Parallel Agent Results:**

| File                                  | Model    | Before     | After      | Outcome                              |
| ------------------------------------- | -------- | ---------- | ---------- | ------------------------------------ |
| api/object.ts                         | haiku    | 37.50%     | 37.50%     | Zod ObjectLiteral mutants untestable |
| api/blockPatch.ts                     | sonnet   | 57.89%     | 57.89%     | Static mutants break module load     |
| api/notateDoc.ts                      | sonnet   | 68.97%     | 68.97%     | Stryker static analysis limitation   |
| core/calendarDateUtils.ts             | haiku    | 82.14%     | 82.14%     | Unreachable defensive code           |
| **storage/duplicateObjectService.ts** | **opus** | **58.39%** | **74.45%** | **✅ +16% improvement!**             |

**Key Finding:** Most "unkillable" mutants fall into 3 categories:

1. Static mutants (break at module load, can't be runtime tested)
2. Zod permissive validation (empty `z.object({})` accepts any object)
3. Unreachable defensive code (guards that can never trigger)

**Recommendation:** Enable `ignoreStatic: true` in Stryker config for more accurate scores.

**Tests Added:** ~80 new tests across 5 files (no commits yet — changes uncommitted)

---

## Completed Milestones

| Phase       | Description                                     | Date       |
| ----------- | ----------------------------------------------- | ---------- |
| 0-7         | Core Bootstrap Phases                           | 2026-01-04 |
| Template    | Template System (7 phases)                      | 2026-01-06 |
| Tags        | Global Tags System (5 phases)                   | 2026-01-07 |
| Tasks       | Task Management (built-in + service)            | 2026-01-08 |
| Inheritance | Object Type Inheritance (4 days)                | 2026-01-08 |
| CLI         | Full CLI command coverage                       | 2026-01-08 |
| E2E Fixes   | Fixed 21 test failures (blockIds)               | 2026-01-08 |
| Design      | Left Sidebar Navigation organism                | 2026-01-10 |
| Recent      | Recent Objects Tracking (LRU cache)             | 2026-01-10 |
| Testing     | Mutation testing improvements                   | 2026-01-10 |
| Attachments | Complete system - Phases 1-9 (190+ tests)       | 2026-01-10 |
| CLI Gaps    | Daily/calendar/template/move commands           | 2026-01-10 |
| HTTP API    | REST API for local integrations (10 endpoints)  | 2026-01-11 |
| AppShell    | Full experience stories + RefNode/slash fixes   | 2026-01-12 |
| TypeBrowser | Phases 1-3 (sort/virtualize/rich cells)         | 2026-01-14 |
| Colors      | Color centralization (semantic + demo colors)   | 2026-01-14 |
| Pinning     | Object pinning/favorites for sidebar (54 tests) | 2026-01-14 |
| Trash       | Restore from trash with FTS/refs re-index (TDD) | 2026-01-14 |
| Duplicate   | Object duplication (7 TDD phases, 39 tests)     | 2026-01-15 |
| Settings    | Settings persistence (React hook, 12 tests)     | 2026-01-15 |
| Update      | updateObject() service (17 tests, TDD)          | 2026-01-14 |
| Tier 1 DS   | Design System Tier 1 migration                  | 2026-01-14 |
| Tier 2 DS   | Design System Tier 2 migration (3 components)   | 2026-01-15 |
| AppShell    | 3-column layout + sidebars + hooks              | 2026-01-15 |
| CmdPalette  | CommandPalette DS migration (replaced cmdk)     | 2026-01-15 |
| IntEditor   | InteractiveEditor migration (~30 files deleted) | 2026-01-15 |
| Audit       | Design system audit script                      | 2026-01-15 |
| Toast       | Toast/Toaster wrapped Sonner in DS              | 2026-01-15 |
