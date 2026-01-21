# Capacities Clone: Developer Build Checklist

Based on my exploration, here's what you'd hand to a developer to build Capacities from scratch.

**Last Updated:** 2026-01-21 (design-system rebuild; renderer is placeholder)

## Status Legend

| Symbol | Meaning                       |
| ------ | ----------------------------- |
| ✅     | Complete                      |
| ⚠️     | Partial / In Progress         |
| ❌     | Not Implemented               |
| 🔧     | Backend Only (needs UI)       |
| 📦     | Library Installed (not wired) |

**Frontend note:** UI currently lives in `packages/design-system` (Ladle). Desktop renderer routes are placeholders until integration.

---

## Summary Scorecard

| Category                  | Backend  | Frontend | Overall  |
| ------------------------- | :------: | :------: | :------: |
| **1. Core Data Model**    |   90%    |    5%    |   45%    |
| **2. Rich Text Editor**   |   95%    |   85%    |   90%    |
| **3. Navigation & Views** |   60%    |   15%    |   38%    |
| **4. Calendar System**    |   100%   |    0%    |   50%    |
| **5. Task Management**    |   100%   |    0%    |   50%    |
| **6. Command Palette**    |   100%   |    0%    |   50%    |
| **7. AI Assistant**       |    0%    |    0%    |    0%    |
| **8. Settings & Config**  |   60%    |    0%    |   30%    |
| **9. Integrations**       |   60%    |    0%    |   30%    |
| **10. Sharing & Collab**  |   50%    |    0%    |   25%    |
| **11. System Features**   |   85%    |    5%    |   45%    |
| **12. UI Components**     |   N/A    |   60%    |   60%    |
| **OVERALL**               | **~66%** | **~18%** | **~40%** |

---

## 1. CORE DATA MODEL

### Object System (Foundation)

| Feature                                      | Backend | Frontend | Notes                                                        |
| -------------------------------------------- | :-----: | :------: | ------------------------------------------------------------ |
| Base "Object" entity (ID, title, timestamps) |   ✅    |   N/A    | ULID IDs, soft-delete, docVersion for optimistic concurrency |
| Icon field                                   |   ✅    |    ❌    | Stored in type schema, no picker UI                          |
| Color field                                  |   ✅    |    ❌    | Hex color in type schema, no picker UI                       |
| Object Type definitions (schema templates)   |   ✅    |    ❌    | Full CRUD in `objectTypeService.ts`                          |
| Built-in Types: Task                         |   ✅    |    🔧    | Status, priority, due_date properties                        |
| Built-in Types: Daily Note                   |   ✅    |    ❌    | Auto-create backend only; renderer not wired                 |
| Built-in Types: Tag                          |   ✅    |    ⚠️    | Design-system inline tags only; no management UI             |
| Built-in Types: Page                         |   ✅    |    ❌    | No renderer object view after reset                          |
| Custom Object Types (user-created)           |   ✅    |    ❌    | Name, pluralName, icon, color, description                   |
| Type inheritance (parent → child)            |   ✅    |    ❌    | Two-level max, cycle prevention                              |
| Bi-directional linking                       |   ✅    |    ⚠️    | `refs` table complete, basic UI via wiki-links               |
| Tags as first-class objects                  |   ✅    |    ⚠️    | Full CRUD + usage counting, inline only                      |

**Property System:**

| Property Type             | Backend | Frontend | Notes                                  |
| ------------------------- | :-----: | :------: | -------------------------------------- |
| Text                      |   ✅    |    ❌    | Single-line text                       |
| Blocks (rich content)     |   ✅    |    ⚠️    | Design-system editor only; not wired   |
| Label                     |   ❌    |    ❌    | Use Tags instead (first-class objects) |
| Object Select (relations) |   ✅    |    ⚠️    | `ref` type, wiki-link UI only          |
| Multi-Object Select       |   ✅    |    ⚠️    | `refs` type, no multi-select UI        |
| Checkbox                  |   ✅    |    ❌    | `boolean` type                         |
| Date time                 |   ✅    |    ❌    | `date` and `datetime` types            |
| Number                    |   ✅    |    ❌    | Numeric values                         |
| Select (single)           |   ✅    |    ❌    | With options array                     |
| Multi-select              |   ✅    |    ❌    | With options array                     |
| Cover Image               |   ❌    |    ❌    | Not implemented                        |
| Icon                      |   ❌    |    ❌    | Not a property type (only on types)    |
| Created at / Last updated |   ✅    |    ❌    | System fields, not schema properties   |

**Key Files:**

- Schema: `packages/storage/src/schema.ts`
- Service: `packages/storage/src/objectTypeService.ts`
- API: `packages/api/src/objectType.ts`
- Properties: `packages/storage/src/propertyValidation.ts`

### Pre-built Object Type Templates

| Template                           | Backend | Frontend | Notes                                  |
| ---------------------------------- | :-----: | :------: | -------------------------------------- |
| Project                            |   ❌    |    ❌    | Trivial to create as custom type       |
| Meeting                            |   ❌    |    ❌    | Variant of Event type                  |
| Individual/Person                  |   ✅    |    🔧    | Built-in with `email` property         |
| Idea                               |   ❌    |    ❌    | Trivial custom type                    |
| Media (Book, Article, Video, etc.) |   ❌    |    ❌    | Could use inheritance hierarchy        |
| Organization                       |   ❌    |    ❌    | Custom type needed                     |
| Place                              |   ✅    |    🔧    | Built-in with `address` property       |
| Geography                          |   ❌    |    ❌    | Variant of Place                       |
| Event                              |   ✅    |    🔧    | Built-in with `start_date`, `end_date` |

**Currently Seeded Built-in Types:** Page, DailyNote, Tag, Person, Task, Place, Event

---

## 2. RICH TEXT EDITOR (Block-Based)

### Block Types

| Block Type            | Backend | Frontend | Notes                                                    |
| --------------------- | :-----: | :------: | -------------------------------------------------------- |
| Paragraph             |   ✅    |    ✅    | Complete                                                 |
| Headings (H1-H6)      |   ✅    |    ✅    | Schema supports H1-H6                                    |
| Bullet lists          |   ✅    |    ✅    | Complete                                                 |
| Numbered lists        |   ✅    |    ✅    | Complete                                                 |
| Checkboxes/Todo items |   ✅    |    ✅    | `list_item` with `checked` property                      |
| Blockquotes           |   ✅    |    ✅    | Complete                                                 |
| Code blocks           |   ✅    |    ✅    | With language support                                    |
| Dividers              |   ✅    |    ✅    | `thematic_break` type                                    |
| Tables                |   ✅    |    ✅    | GFM-style with alignment                                 |
| Callouts              |   ✅    |    ✅    | Obsidian-style (kind/title/collapsed)                    |
| Math blocks           |   ✅    |    ✅    | KaTeX rendering in design-system; app wiring pending     |
| Footnotes             |   ✅    |    ✅    | Design-system extensions + stories; app wiring pending   |
| Attachments           |   ✅    |    ⚠️    | Image upload UX in design-system; storage wiring pending |

### Inline Formatting

| Format            | Backend | Frontend | Notes                                                |
| ----------------- | :-----: | :------: | ---------------------------------------------------- |
| Bold              |   ✅    |    ✅    | `strong` mark                                        |
| Italic            |   ✅    |    ✅    | `em` mark                                            |
| Underline         |   ❌    |    ❌    | Not in schema                                        |
| Strikethrough     |   ✅    |    ✅    | `strike` mark                                        |
| Inline code       |   ✅    |    ✅    | `code` mark                                          |
| Highlight         |   ✅    |    ✅    | Custom TipTap extension                              |
| Hyperlinks        |   ✅    |    ✅    | Full support                                         |
| @ mentions        |   ✅    |    ✅    | `@` trigger with autocomplete                        |
| Wiki-links `[[]]` |   ✅    |    ✅    | Object/block references                              |
| Hashtags `#tag`   |   ✅    |    ✅    | Links to tag objects                                 |
| Emoji support     |   ⚠️    |    ⚠️    | Unicode works, no picker                             |
| Math inline       |   ✅    |    ✅    | KaTeX rendering in design-system; app wiring pending |

### Editor Features

| Feature                        | Backend | Frontend | Notes                                                       |
| ------------------------------ | :-----: | :------: | ----------------------------------------------------------- |
| Drag-and-drop block reordering |   ✅    |    ❌    | `block.move` operation exists                               |
| Slash command menu (/)         |   N/A   |    ✅    | Design-system only (Ladle); renderer wiring pending         |
| Markdown shortcuts             |   N/A   |    ⚠️    | Via TipTap StarterKit                                       |
| Spellcheck                     |   N/A   |    ❌    | Not configured                                              |
| "Unlinked mentions" detection  |   ✅    |    ❌    | `getUnlinkedMentionsTo()` complete with 18 tests, no UI yet |
| Auto-save                      |   N/A   |    ❌    | No persistence wiring in renderer yet                       |

**Key Files:**

- Content Schema: `packages/api/src/notateDoc.ts` (238 lines)
- Block Patch: `packages/api/src/blockPatch.ts` (163 lines)
- Editor: `packages/design-system/src/features/Editor/Editor.tsx`
- Extensions: `packages/design-system/src/features/Editor/extensions/`
- Stories: `packages/design-system/src/features/Editor/stories/`
- Unlinked Mentions: `packages/storage/src/unlinkedMentions.ts` (145 lines, 18 tests)

**Architecture Note:** NotateDoc v1 schema is editor-agnostic (not storing TipTap JSON), enabling future editor swaps without data migration.

---

## 3. NAVIGATION & VIEWS

### Sidebar

| Feature                           | Backend | Frontend | Notes                                            |
| --------------------------------- | :-----: | :------: | ------------------------------------------------ |
| Workspace switcher (top)          |   ❌    |    ❌    | No multi-workspace support                       |
| Calendar shortcut                 |   N/A   |    ❌    | No sidebar shortcuts                             |
| Tasks shortcut                    |   N/A   |    ❌    | No sidebar shortcuts                             |
| Pinned items section              |   ✅    |    ⚠️    | Design-system Sidebar only; pinning UI not wired |
| Object Types section (expandable) |   ✅    |    ⚠️    | Design-system Sidebar only; no data wiring       |
| "Add section" capability          |   ❌    |    ❌    | Static sidebar                                   |
| Bottom utilities                  |   N/A   |    ❌    | No utilities section                             |
| Settings gear icon                |   N/A   |    ❌    | No settings UI                                   |
| Dark mode toggle                  |   N/A   |    ❌    | No theme system                                  |
| User profile                      |   ❌    |    ❌    | No user/auth system                              |

**Current Sidebar:** Design-system Sidebar + HeaderBar exist in Ladle; renderer is placeholder only.

### Collection Views (for each Object Type)

| Feature                          | Backend | Frontend | Notes                              |
| -------------------------------- | :-----: | :------: | ---------------------------------- |
| Overview tab (summary/dashboard) |   ❌    |    ❌    | Not implemented                    |
| All tab (full list)              |   ✅    |    ❌    | No renderer list UI after reset    |
| Table view                       |   ✅    |    📦    | `@tanstack/react-table` installed  |
| Card/Grid view                   |   ⚠️    |    ❌    | No renderer cards after reset      |
| List view                        |   ⚠️    |    ❌    | No renderer list after reset       |
| Board (Kanban) view              |   ❌    |    ❌    | Not implemented                    |
| Sorting                          |   ✅    |    ❌    | `listObjects` accepts options      |
| Filtering                        |   ✅    |    ❌    | Backend ready, no UI               |
| Saved Queries                    |   ❌    |    ❌    | Not implemented                    |
| Column customization             |   ❌    |    ❌    | Not implemented                    |
| Inline creation ("+ New")        |   ✅    |    ❌    | `createObject()` IPC, no inline UI |

### Object Detail View

| Feature                         | Backend | Frontend | Notes                                |
| ------------------------------- | :-----: | :------: | ------------------------------------ |
| Modal/overlay presentation      |   N/A   |    ❌    | Full-page only                       |
| Full-page expansion option      |   N/A   |    ❌    | Renderer view not implemented        |
| Left sidebar showing properties |   ✅    |    ❌    | Properties in JSON, no display panel |
| Main content area (rich text)   |   ✅    |    ⚠️    | Design-system Editor only            |
| Navigation (prev/next arrows)   |   N/A   |    ❌    | Only list selection                  |
| Breadcrumb                      |   N/A   |    ❌    | Not implemented                      |
| Object type badge/dropdown      |   N/A   |    ❌    | Renderer view not implemented        |
| "Collections" link              |   N/A   |    ❌    | Not implemented                      |

**Key Files:**

- App Shell: `packages/design-system/src/features/AppShell/AppShell.tsx`
- Sidebar: `packages/design-system/src/features/Sidebar/Sidebar.tsx`
- Header Bar: `packages/design-system/src/features/HeaderBar/HeaderBar.tsx`
- Renderer Shell: `apps/desktop/src/renderer/App.tsx`
- Routes: `apps/desktop/src/renderer/routes/*.tsx`

---

## 4. CALENDAR SYSTEM

### Calendar Views

| Feature                     | Backend | Frontend | Notes                        |
| --------------------------- | :-----: | :------: | ---------------------------- |
| Month view                  |   ✅    |    ❌    | Calendar UI removed in reset |
| Week view                   |   ❌    |    ❌    | Not implemented              |
| 3-day view                  |   ❌    |    ❌    | Not implemented              |
| Day view                    |   ❌    |    ❌    | Not implemented              |
| Mini calendar (date picker) |   N/A   |    📦    | `react-day-picker` installed |
| "Today" quick navigation    |   ✅    |    ❌    | No renderer calendar UI      |
| Week number display         |   ❌    |    ❌    | Not implemented              |
| Month navigation            |   ✅    |    ❌    | No renderer calendar UI      |
| Day selection with sidebar  |   ✅    |    ❌    | No renderer calendar UI      |

### Daily Note Integration

| Feature                                | Backend | Frontend | Notes                           |
| -------------------------------------- | :-----: | :------: | ------------------------------- |
| Auto-create daily note for current day |   ✅    |    ❌    | No renderer calendar UI         |
| Quick-add buttons (+ Task, etc.)       |   N/A   |    ❌    | No UI                           |
| Tags section on daily notes            |   ✅    |    ❌    | Tags work, no dedicated section |
| Show calendar events alongside         |   ✅    |    ❌    | No renderer calendar UI         |

### Calendar Object Integration

| Feature                               | Backend | Frontend | Notes                                |
| ------------------------------------- | :-----: | :------: | ------------------------------------ |
| Objects with dates appear in calendar |   ✅    |    ❌    | No renderer calendar UI              |
| Per-type calendar settings            |   ✅    |    ❌    | `showInCalendar` in DB, no UI toggle |
| Create objects from calendar events   |   ❌    |    ❌    | Not implemented                      |
| Color-coded events                    |   ❌    |    ❌    | Not implemented (type badge only)    |
| Click event to navigate               |   ✅    |    ❌    | No renderer calendar UI              |

**Key Files:**

- Calendar Service: `packages/storage/src/calendarService.ts`
- Calendar Date Utils: `packages/core/src/calendarDateUtils.ts`
- Daily Notes Service: `packages/storage/src/dailyNoteService.ts`
- Renderer Route: `apps/desktop/src/renderer/routes/CalendarView.tsx`

---

## 5. TASK MANAGEMENT

### Task Views

| Feature                  | Backend | Frontend | Notes                                      |
| ------------------------ | :-----: | :------: | ------------------------------------------ |
| Inbox (unsorted)         |   ✅    |    ❌    | `getInboxTasks()` - tasks with no due date |
| Today                    |   ✅    |    ❌    | `getTodaysTasks()`                         |
| Scheduled                |   ✅    |    ❌    | `getUpcomingTasks(days)`                   |
| By Status (Kanban board) |   ✅    |    ❌    | `getTasksByStatus()`                       |
| By Context               |   ⚠️    |    ❌    | Via tags, no dedicated view                |
| By Priority              |   ✅    |    ❌    | `getTasksByPriority()`                     |
| Open tasks               |   ✅    |    ❌    | All non-Done tasks                         |
| Completed tasks          |   ✅    |    ❌    | `getCompletedTasks()` with date range      |

### Task Properties

| Property                | Backend | Frontend | Notes                           |
| ----------------------- | :-----: | :------: | ------------------------------- |
| Title                   |   ✅    |    ❌    | No renderer task UI             |
| Status                  |   ✅    |    ❌    | Backlog, Todo, InProgress, Done |
| Due date                |   ✅    |    ❌    | ISO datetime                    |
| Context/Tags            |   ✅    |    ❌    | No renderer task UI             |
| Linked to other objects |   ✅    |    ❌    | No renderer task UI             |
| Notes/description       |   ✅    |    ❌    | No renderer task UI             |
| Priority                |   ✅    |    ❌    | Low, Medium, High               |

### Task Features

| Feature                     | Backend | Frontend | Notes                            |
| --------------------------- | :-----: | :------: | -------------------------------- |
| Quick capture               |   N/A   |    ❌    | No quick-add UI                  |
| Check/uncheck completion    |   ✅    |    ❌    | `completeTask()`, `reopenTask()` |
| Drag between status columns |   N/A   |    ❌    | No Kanban UI                     |
| Date picker for scheduling  |   N/A   |    📦    | Library installed                |
| Flag/priority indicator     |   ✅    |    ❌    | Priority in schema               |

**Key Files:**

- Task Service: `packages/storage/src/taskService.ts` (362 lines, 10 query functions)
- Task API: `packages/api/src/task.ts`
- IPC Handlers: `apps/desktop/src/main/ipc.ts` (lines 289-349)

**Note:** Backend is 100% complete with production-ready query functions. Only needs UI.

---

## 6. COMMAND PALETTE / QUICK ACTIONS

| Feature                         | Backend | Frontend | Notes                     |
| ------------------------------- | :-----: | :------: | ------------------------- |
| Global keyboard shortcut (⌘K)   |   N/A   |    ❌    | No renderer hotkey wiring |
| Universal search across objects |   ✅    |    ❌    | Backend FTS5 only; no UI  |
| Object type filtering           |   ⚠️    |    ❌    | No UI                     |
| Quick actions                   |   N/A   |    ❌    | Not implemented           |
| Quick create                    |   ✅    |    ❌    | No UI                     |
| Recent objects list             |   ✅    |    ❌    | No UI                     |
| Paste from clipboard            |   N/A   |    ❌    | No smart paste            |
| Keyboard navigation             |   N/A   |    ❌    | No UI                     |
| Open in new tab                 |   N/A   |    ❌    | Single-pane only          |
| Open in side panel              |   N/A   |    ❌    | No side panel             |

**Architecture:** Backend search exists; no command palette UI after design-system reset.

**Key Files:**

- Backend: `packages/storage/src/search.ts`, `packages/storage/src/indexing.ts`
- IPC: `apps/desktop/src/main/ipc.ts` (recordView, getRecentObjects, searchBlocks, listObjects)
- Frontend: not implemented since reset

---

## 7. AI ASSISTANT

| Feature                      | Backend | Frontend | Notes       |
| ---------------------------- | :-----: | :------: | ----------- |
| Side panel chat interface    |   ❌    |    ❌    | Not planned |
| Model selector dropdown      |   ❌    |    ❌    | Not planned |
| Context-aware                |   ❌    |    ❌    | Not planned |
| Chat history                 |   ❌    |    ❌    | Not planned |
| "Ask a question" entry point |   ❌    |    ❌    | Not planned |

**Assessment:** AI assistant is explicitly deferred in the roadmap.

---

## 8. SETTINGS & CONFIGURATION

### General Settings

| Feature                   | Backend | Frontend | Notes                                             |
| ------------------------- | :-----: | :------: | ------------------------------------------------- |
| Account management        |   ❌    |    ❌    | No user/auth system                               |
| Editor preferences        |   ✅    |    🔧    | settingsService.ts complete (115 lines), IPC only |
| Appearance (theme)        |   N/A   |    ❌    | Basic Tailwind, no theme                          |
| Language                  |   ❌    |    ❌    | Not implemented                                   |
| Date & Time format        |   ❌    |    ❌    | Not implemented                                   |
| Password & Authentication |   ❌    |    ❌    | No auth system                                    |

### Space Settings

| Feature                  | Backend | Frontend | Notes                |
| ------------------------ | :-----: | :------: | -------------------- |
| Space name/configuration |   ❌    |    ❌    | Single space only    |
| Object Types manager     |   ✅    |    ❌    | Full CRUD backend    |
| Full Export              |   ✅    |    ❌    | JSON export complete |

### Features (Toggleable)

| Feature               | Backend | Frontend | Notes            |
| --------------------- | :-----: | :------: | ---------------- |
| AI Assistant (on/off) |   ❌    |    ❌    | No feature flags |
| Task management       |   ❌    |    ❌    | Always on        |
| Calendar integrations |   ❌    |    ❌    | Not implemented  |
| API access            |   ❌    |    ❌    | No external API  |

### Object Type Configuration

| Feature                          | Backend | Frontend | Notes                    |
| -------------------------------- | :-----: | :------: | ------------------------ |
| Name, Plural name                |   ✅    |    ❌    | In schema                |
| Icon picker                      |   ✅    |    ❌    | Stored, no picker UI     |
| Color picker                     |   ✅    |    ❌    | Hex colors, no picker UI |
| Description                      |   ✅    |    ❌    | In schema                |
| Properties: add, remove, reorder |   ✅    |    ❌    | Schema supports it       |
| Calendar settings                |   ❌    |    ❌    | Not implemented          |
| Sub-types (inheritance)          |   ✅    |    ❌    | Two-level hierarchy      |

**Key Files:**

- Object Type Service: `packages/storage/src/objectTypeService.ts`
- Export Service: `packages/storage/src/exportService.ts`
- Settings Service: `packages/storage/src/settingsService.ts` (complete)

---

## 9. INTEGRATIONS

### Calendar

| Feature                     | Backend | Frontend | Notes       |
| --------------------------- | :-----: | :------: | ----------- |
| Google Calendar OAuth       |   ❌    |    ❌    | Not planned |
| Calendar sync               |   ❌    |    ❌    | Not planned |
| Create from calendar events |   ❌    |    ❌    | Not planned |

### Export

| Feature                  | Backend | Frontend | Notes                           |
| ------------------------ | :-----: | :------: | ------------------------------- |
| Full export (JSON)       |   ✅    |    ❌    | Deterministic, folder structure |
| Full export (Markdown)   |   ❌    |    ❌    | Not implemented                 |
| Individual object export |   ✅    |    ❌    | `exportObject()` function       |
| Import                   |   ✅    |    ❌    | Replace/skip modes              |

### API

| Feature            | Backend | Frontend | Notes           |
| ------------------ | :-----: | :------: | --------------- |
| REST API           |   ❌    |   N/A    | No external API |
| API key management |   ❌    |   N/A    | Not implemented |

**Key Files:**

- Export: `packages/storage/src/exportService.ts`

---

## 10. SHARING & COLLABORATION

| Feature             | Backend | Frontend | Notes                                                                                     |
| ------------------- | :-----: | :------: | ----------------------------------------------------------------------------------------- |
| Share (public link) |   ❌    |    ❌    | Not implemented                                                                           |
| Pin to sidebar      |   ✅    |    ⚠️    | Backend complete; no renderer wiring (design-system only)                                 |
| Duplicate objects   |   ✅    |    🔧    | Complete backend (duplicateObjectService, 19 tests), no UI - internal ref remapping works |
| Change object type  |   ✅    |    ❌    | Backend complete (updateObject with property migration), needs UI                         |

---

## 11. SYSTEM FEATURES

### Data Management

| Feature                  | Backend | Frontend | Notes                                                                                    |
| ------------------------ | :-----: | :------: | ---------------------------------------------------------------------------------------- |
| Trash (soft delete)      |   ✅    |    ❌    | `deletedAt` on objects/blocks                                                            |
| Restore from trash       |   ✅    |    🔧    | Complete backend (trashService with listDeletedObjects + restoreObject, 13 tests), no UI |
| Offline capability       |   ✅    |    ✅    | SQLite local, no network needed                                                          |
| Cloud sync               |   ❌    |    ❌    | No sync layer                                                                            |
| Local-first architecture |   ✅    |    ✅    | SQLite in main process                                                                   |

### Performance

| Feature               | Backend | Frontend | Notes                      |
| --------------------- | :-----: | :------: | -------------------------- |
| Fast search indexing  |   ✅    |   N/A    | FTS5 + auto-indexing       |
| Lazy loading          |   ⚠️    |    ❌    | Pagination in some queries |
| Optimistic UI updates |   ✅    |    ⚠️    | docVersion tracking        |

### Keyboard Shortcuts

| Shortcut                 | Status | Notes                             |
| ------------------------ | :----: | --------------------------------- |
| ⌘K - Command palette     |   ❌   | No command palette UI after reset |
| ⌘H - Open calendar/today |   ❌   | No hotkey system                  |
| ⌘J - Open AI chat        |   ❌   | No AI                             |
| ⌘⇧P - Extended search    |   ❌   | No hotkey system                  |
| ⌘, - Settings            |   ❌   | No settings                       |
| Standard text editing    |   ⚠️   | Design-system editor only         |

---

## 12. UI COMPONENTS TO BUILD

| Component                   |        Installed         | Integrated | Notes                        |
| --------------------------- | :----------------------: | :--------: | ---------------------------- |
| App shell layout            |          Custom          |     ⚠️     | Design-system only (Ladle)   |
| Title bar                   |          Custom          |     ⚠️     | Design-system only (Ladle)   |
| Header bar                  |          Custom          |     ⚠️     | Design-system only (Ladle)   |
| Sidebar                     |          Custom          |     ⚠️     | Design-system only (Ladle)   |
| Rich text editor            |        ✅ TipTap         |     ⚠️     | Design-system only (Ladle)   |
| Resizable sidebar           |            ❌            |     ❌     | Fixed width in design-system |
| Modal/overlay system        |         ✅ Radix         |     ❌     | Available, not used          |
| Side panel                  |            ❌            |     ❌     | Not implemented              |
| Dropdown menus              |         ✅ Radix         |     ❌     | Available, not used          |
| Context menus (right-click) |         ✅ Radix         |     ❌     | Available, not used          |
| Toast notifications         |        ✅ Sonner         |     ❌     | No renderer wiring           |
| Tag/pill components         |            ⚠️            |     ⚠️     | Badge primitive only         |
| Date picker                 |   ✅ react-day-picker    |     ❌     | Installed, not wired         |
| Icon picker                 |            ❌            |     ❌     | Not implemented              |
| Color picker                |            ❌            |     ❌     | Not implemented              |
| Table component             | ✅ @tanstack/react-table |     ❌     | Installed, not integrated    |
| Kanban board component      |            ❌            |     ❌     | Not implemented              |
| Card grid component         |            ⚠️            |     ❌     | No renderer grid             |
| Calendar components         |          Custom          |     ❌     | Calendar UI removed in reset |
| Command palette             |         ✅ cmdk          |     ❌     | No UI after reset            |

### Installed Dependencies (Available but Unused)

```json
{
  "UI/UX": {
    "@radix-ui/react-*": "14 components",
    "cmdk": "1.1.1",
    "sonner": "2.0.7",
    "react-day-picker": "9.12.0",
    "recharts": "3.6.0",
    "lucide-react": "0.561.0"
  },
  "Data/Forms": {
    "@tanstack/react-table": "8.21.3",
    "@tanstack/react-query": "5.90.12",
    "react-hook-form": "7.68.0"
  }
}
```

---

## Quick Wins (Design-System + Libraries Ready)

1. **Renderer Integration** — Wire AppShell + Editor from design-system (1-2 days)
2. **Command Palette** — Rebuild UI around search backend (1-2 days)
3. **Toast Notifications** — Wire `sonner` in renderer (hours)
4. **Date Picker** — Wire `react-day-picker` (1 day)
5. **Table Views** — Integrate `@tanstack/react-table` (2-3 days)

## High-Priority Gaps

1. **Renderer Integration** — AppShell + Editor + Sidebar wiring
2. **Task Management UI** — Backend 100% complete, needs views
3. **Collection Views** — Table/Card/Board layouts for object types
4. **Object Type Manager UI** — Create/edit custom types
5. **Calendar Views** — Month/week/day with daily note integration

---

## Key Architectural Strengths

1. **Strict Type Safety** — Zod schemas everywhere, TypeScript strict mode
2. **Package Boundaries** — `api` → `core` → `storage` → `apps` hierarchy
3. **Atomic Transactions** — Single patch = single transaction
4. **Reference Integrity** — FK constraints, backlink tracking
5. **Soft Deletes** — All entities support soft delete
6. **Optimistic Concurrency** — docVersion prevents edit conflicts
7. **Content Addressable Storage** — Attachment deduplication by SHA256
8. **Editor-Agnostic Content** — NotateDoc v1 enables future editor swaps

---

## Reference Files

| Purpose              | Location                                                 |
| -------------------- | -------------------------------------------------------- |
| Object Schema        | `packages/storage/src/schema.ts`                         |
| Object Types         | `packages/storage/src/objectTypeService.ts`              |
| Tasks                | `packages/storage/src/taskService.ts`                    |
| Daily Notes          | `packages/storage/src/dailyNoteService.ts`               |
| Pinned Objects       | `packages/storage/src/pinnedObjectsService.ts`           |
| Duplicate Objects    | `packages/storage/src/duplicateObjectService.ts`         |
| Trash & Restore      | `packages/storage/src/trashService.ts`                   |
| Export/Import        | `packages/storage/src/exportService.ts`                  |
| Search               | `packages/storage/src/search.ts`                         |
| Content Schema       | `packages/api/src/notateDoc.ts`                          |
| Block Patch          | `packages/api/src/blockPatch.ts`                         |
| IPC Handlers         | `apps/desktop/src/main/ipc.ts`                           |
| Preload API          | `apps/desktop/src/preload/index.ts`                      |
| Main Editor          | `packages/design-system/src/features/Editor/Editor.tsx`  |
| TipTap Extensions    | `packages/design-system/src/features/Editor/extensions/` |
| Reference Components | `_reference/shadcn-admin/src/components/ui/`             |
