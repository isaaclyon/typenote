# Recent Work

## Latest Session (2026-01-12 evening - PropertyItem: All 8 Property Types)

### Complete Property Input System

Extended PropertyItem component to support all 8 backend property types, unblocking the entire property editing feature (task management, custom object properties, right sidebar).

**Key accomplishments:**

1. **Added 5 new property types** — boolean (checkbox), datetime (date+time), multiselect (toggle options), ref (object search), refs (multi-object search)
2. **14 comprehensive Ladle stories** — Covering all types, interactions, and real-world examples (Task properties, Book properties)
3. **Fixed layout shift bug** — Matched all input heights to `h-7` (28px) to eliminate jarring content shift when clicking to edit
4. **Cleaned up duplicate stories** — Removed old `AllTypes` story, kept comprehensive `AllPropertyTypes`

**Architecture insights:**

- Boolean type saves immediately on checkbox click (no edit mode)
- DateTime uses split inputs (date + time) with formatted display
- Multiselect shows toggle buttons with Done/Cancel workflow
- Ref/Refs use search input with debounced results dropdown (200ms)
- All inputs now `h-7` to match display mode height (zero layout shift)

**Files modified:**

- `packages/design-system/src/components/PropertyItem/PropertyItem.tsx` — Extended from 4 types to 8 types (~400 lines)
- `packages/design-system/src/components/PropertyItem/PropertyItem.stories.tsx` — Added 7 new stories, deleted duplicate

**Impact:**

Backend property system (100% ready) is now usable in UI. Unblocks:

- Task editing (completed checkbox, priority select, due datetime)
- Object type custom properties
- Right sidebar property panel
- Settings panels

**No commits yet** — Work in progress, ready for further UX iteration in Ladle.

---

## Previous Session (2026-01-12 - Design System: AppShell Full Experience Stories)

### AppShell Full Experience + Design Fixes

Built two comprehensive AppShell stories demonstrating the complete note-editing experience with InteractiveEditor, proper daily note layout, and fixed RefNode styling inconsistency.

**Key accomplishments:**

1. **Fixed slash menu keyboard navigation** — Added `scrollIntoView()` to auto-scroll selected items when navigating beyond visible area
2. **Fixed RefNode styling inconsistency** — Aligned InteractiveEditor RefNodeView with EditorPreview design (removed gray background pill, now clean icon + underline)
3. **Added AppShell story: `WithNoteEditor`** — Regular note editing with Properties + Tags in right sidebar, Backlinks at bottom
4. **Added AppShell story: `WithDailyNoteEditor`** — Daily note editing with DailyNoteNav + MiniCalendar + NotesCreatedList (no Properties/Tags per design spec)

**Architecture insights:**

- Daily notes use different layout from regular notes (mini calendar + notes created list instead of properties panel)
- Backlinks moved from right sidebar to bottom of editor content (Obsidian-like pivot)
- RefNode had two divergent implementations — consolidated to single clean design

**Files modified:**

- `packages/design-system/src/components/InteractiveEditor/extensions/SlashCommand/SlashCommandMenu.tsx` — Added auto-scroll behavior
- `packages/design-system/src/components/InteractiveEditor/extensions/RefNode/RefNodeView.tsx` — Fixed styling to match EditorPreview
- `packages/design-system/src/components/AppShell/AppShell.stories.tsx` — Added two comprehensive full-experience stories

**Commits:**

- `18356b4 fix(design-system): add auto-scroll to slash menu keyboard navigation`

---

## Previous Session (2026-01-11 - HTTP Server REST API)

### REST API for Local Integrations

Built complete HTTP server package (`@typenote/http-server`) using Hono framework with TDD. Integrated into Electron main process for local third-party integrations (Raycast, Alfred, scripts).

**Endpoints implemented (10 total):**

| Endpoint                       | Method     | Purpose                       |
| ------------------------------ | ---------- | ----------------------------- |
| `/api/v1/health`               | GET        | Health check                  |
| `/api/v1/objects`              | GET, POST  | List/create objects           |
| `/api/v1/objects/:id`          | GET        | Get object details            |
| `/api/v1/objects/:id/document` | GET, PATCH | Get/update document           |
| `/api/v1/search`               | GET        | Full-text search              |
| `/api/v1/recent`               | GET        | Recent objects                |
| `/api/v1/daily-notes/today`    | POST       | Get/create today's daily note |
| `/api/v1/daily-notes/:dateKey` | POST       | Get/create daily note by date |

**Key implementation details:**

- Hono + @hono/node-server (12KB, excellent TypeScript/Zod support)
- Shares same SQLite db instance with IPC handlers (no conflicts)
- Localhost only (127.0.0.1:3456) for security
- 38 tests passing in http-server package
- Error handler maps service errors to HTTP status codes

**Files created:**

- `packages/http-server/` — Complete new package
- Design docs in `docs/plans/` (REST API, daily notes API)

**Commits:**

- `16f0e21 feat(http-server): add GET /objects and POST /objects endpoints`
- `87079b9 feat(http-server): add document, search, and recent endpoints`
- `316abf3 feat(http-server): add router composition and server lifecycle`
- `d8fc26f feat(desktop): integrate HTTP server in Electron main process`
- `cb5eb94 feat(http-server): add daily notes API endpoints`

---

## Previous Session (2026-01-10 evening - CLI Critical Gaps)

Completed all 4 critical CLI gaps: daily notes (4 commands), calendar (5 commands), template apply, block move (4 placement modes). ~90 lines new code. Commit: `f9748e5`

---

## Previous Session (2026-01-10 afternoon - Attachments Phase 9)

Completed final phase of attachments system with daily garbage collection scheduler. 8 unit tests, graceful shutdown. Commit: `5a07f5f`. **Attachments system complete** — 190+ tests.

---

## Previous Session (2026-01-10 - Recent Objects)

100-entry LRU cache with command palette integration. Backend service, IPC, React hook, UI. 13 unit + 3 E2E tests. Commit: `b8cb7d6`

---

## Completed Milestones

| Phase       | Description                                    | Date       |
| ----------- | ---------------------------------------------- | ---------- |
| 0-7         | Core Bootstrap Phases                          | 2026-01-04 |
| Template    | Template System (7 phases)                     | 2026-01-06 |
| Tags        | Global Tags System (5 phases)                  | 2026-01-07 |
| Tasks       | Task Management (built-in + service)           | 2026-01-08 |
| Inheritance | Object Type Inheritance (4 days)               | 2026-01-08 |
| CLI         | Full CLI command coverage                      | 2026-01-08 |
| E2E Fixes   | Fixed 21 test failures (blockIds)              | 2026-01-08 |
| Design      | Left Sidebar Navigation organism               | 2026-01-10 |
| Recent      | Recent Objects Tracking (LRU cache)            | 2026-01-10 |
| Testing     | Mutation testing improvements                  | 2026-01-10 |
| Attachments | Complete system - Phases 1-9 (190+ tests)      | 2026-01-10 |
| CLI Gaps    | Daily/calendar/template/move commands          | 2026-01-10 |
| HTTP API    | REST API for local integrations (10 endpoints) | 2026-01-11 |
