# Up Next

## Design System Migration

**Status:** Active

Migrating design-system components to desktop app. Analysis identified 33 components with ~11 now in use.

### Tier 1 Completed (Drop-in Replacements)

- [x] Skeleton — 5 files migrated (loading states)
- [x] Badge — 2 files migrated (ObjectList, EventCard)
- [x] KeyboardKey — 1 file migrated (CommandShortcut)
- [ ] Checkbox — No opportunities (TipTap handles)

### Tier 2 Next (Wrapper Components - ~30min-2hrs each)

- [ ] DailyNoteNav — Replace custom DailyNoteNavigation.tsx
- [ ] SaveStatus — Connect to save state
- [ ] SettingsModal — Wire up to settings IPC
- [ ] PropertyItem/PropertyTags — Connect to object metadata IPC
- [ ] MiniCalendar — Wire to daily note navigation

### Tier 3 Future (Major Refactors)

- [ ] Sidebar full adoption — Replace custom sidebar in App.tsx
- [ ] AppShell — Restructure entire layout
- [ ] InteractiveEditor — Replace NoteEditor + extensions
- [ ] TypeBrowser — Object browsing views
- [ ] RightSidebar — Add metadata panel

---

## UI/Design System - Organism Components

**Status:** Active
**Plan:** `/Users/isaaclyon/.claude/plans/clever-snuggling-karp.md`

### Completed

- [x] Left Sidebar Navigation organism (8 components, 9 stories)
- [x] AppShell full experience stories (daily note + regular note)
- [x] TypeBrowser Phases 1-3 (sorting, virtualization, rich cells)
- [x] MultiselectDropdown with actions menu

### Next Steps

- [ ] Integrate Sidebar + AppShell into desktop app with real data (wire up IPC)
- [ ] Add InteractiveEditor integration tests for all extensions

---

## Backlog

### E2E Test Fixes

**Status:** Mostly resolved — 231+ passing, flaky tests handled with retry

- [x] Fix blockId lengths (28 invalid ULIDs)
- [x] Add `sourceObjectTitle` to backlinks API
- [x] Fix templates-workflow tests (`type` → `blockType`)
- [x] Fix empty search query returning error
- [x] Fix Toast tests (Sonner 2.x selector change)
- [x] Fix flaky Electron startup timeouts (increased timeout + retry)
- [ ] Fix RefNode rendering — `span[data-ref]` not appearing in editor
- [ ] Fix autocomplete popup — `[[` trigger not showing `.bg-popover`

### Quality & Performance

- [x] Improve mutation testing scores (api: 87.42%, core: 96.30%, storage: 78.30%)
- [ ] Further mutation improvements: objectType.ts (84.91%), calendar.ts (86.36%)
- [ ] Performance benchmarks for 10k+ objects / 100k+ blocks

### Features (Future)

- [ ] Markdown export (in addition to JSON)
- [ ] Relations semantics finalization
- [ ] Unlinked mentions (design spec: `docs/plans/2026-01-10-unlinked-mentions-design.md`)

---

## Recently Completed

| Feature                          | Date       | Commits              |
| -------------------------------- | ---------- | -------------------- |
| updateObject() Service           | 2026-01-14 | `6dff951`            |
| Design System Migration (Tier 1) | 2026-01-14 | `d95f1e7`            |
| Settings Persistence             | 2026-01-15 | `9a85158`            |
| Duplicate Object                 | 2026-01-15 | `7856a54`→`7cb8353`  |
| Pinning + Trash                  | 2026-01-14 | `ae7ca66`, `0f39751` |
| HTTP REST API                    | 2026-01-11 | `16f0e21`→`cb5eb94`  |

See `recent_work.md` Milestones table for full history.
