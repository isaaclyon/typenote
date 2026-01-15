# Design System Migration Checklist

Track which design system components have been migrated from Ladle to the desktop app.

## Summary

| Status                   | Count  | Percentage |
| ------------------------ | ------ | ---------- |
| ✅ Migrated              | 14     | 42%        |
| 🟡 Ready for Integration | 11     | 33%        |
| 🟠 Major Refactor        | 6      | 18%        |
| ⚪ Optional              | 2      | 6%         |
| **Total**                | **33** | 100%       |

---

## Tier 1: Migrated ✅

Drop-in components already used in the desktop app.

- [x] **Button** — `App.tsx`, `CalendarHeader.tsx`, `DailyNoteNavigation.tsx`
- [x] **Skeleton** — `ObjectList.tsx`, `NoteEditor.tsx`, `CalendarSidebar.tsx`, `BacklinksSection.tsx`
- [x] **Badge** — `ObjectList.tsx`, `EventCard.tsx`
- [x] **KeyboardKey** — `command.tsx` (CommandShortcut)
- [x] **Card** — `EventCard.tsx` (CardHeader, CardTitle)
- [x] **ScrollArea** — `EventList.tsx`, `SuggestionPopup.tsx`
- [x] **BacklinkItem** — `BacklinksSection.tsx`, `UnlinkedMentionsSection.tsx`
- [x] **EmptyState** — `BacklinksSection.tsx`, `UnlinkedMentionsSection.tsx`
- [x] **CollapsibleSection** — `BacklinksSection.tsx`, `UnlinkedMentionsSection.tsx`
- [x] **SidebarPinnedSection** — `App.tsx`
- [x] **Toast** — Wired via Sonner in `App.tsx`

---

## Tier 2: Ready for Integration 🟡

Complete implementations with Ladle stories. Need IPC wiring or minor integration work.

### High Priority

- [x] **DailyNoteNav** — Replaced custom `DailyNoteNavigation.tsx` with design-system component
- [x] **SettingsModal** — Wired to useSettings hook with optimistic updates
  - Includes: SettingsSection, SettingsRow, Select, Switch

### Medium Priority

- [x] **SaveStatus** — Connected to editor save state via useAutoSave hook
- [ ] **PropertyItem** — Connect to object metadata IPC (~1-2 hrs)
- [ ] **PropertyTags** — Connect to tag system IPC (~1-2 hrs)
- [ ] **Modal** — Radix-based compound component
  - Includes: ModalHeader, ModalContent, ModalFooter
- [ ] **Select** — Form control component
- [ ] **Switch** — For settings toggles
- [ ] **Input** — Text input primitive
- [ ] **Text** — Typography component
- [ ] **Tag** — Single tag display
- [ ] **TagAddButton** — Add tag button with interaction

### Low Priority

- [ ] **MiniCalendar** — `react-day-picker` based

### Already Wired

- [x] **CommandPalette** — Already wired, tests complete
  - Includes: CommandPaletteInput, CommandPaletteItem, CommandPaletteList

---

## Tier 3: Major Refactors 🟠

Organism-level components requiring architectural changes. Do after Tier 2.

- [ ] **Sidebar** (~1-2 days) — Full left sidebar replacement
  - Includes: SidebarTypeItem, SidebarTypesList, SidebarSection, SidebarSearchTrigger, SidebarActionButton, SidebarCalendarButton, SidebarNewTypeButton, SidebarPinnedItem
  - Note: Pinning UI complete, needs type list wiring

- [ ] **AppShell** (~2-3 days) — Complete app layout wrapper
  - Includes: ContentArea, SidebarCollapseButton, useCollapsibleSidebar
  - Note: Stories show daily note + regular note views

- [ ] **RightSidebar** (~1 day) — Metadata panel for object properties

- [ ] **InteractiveEditor** (~2-3 days) — Replace `NoteEditor.tsx` + custom extensions
  - Includes: RefNode, TagNode, SlashCommand, and other TipTap extensions
  - Note: Full TipTap integration already built

- [ ] **EditorPreview** (~1-2 days) — Read-only editor preview
  - Includes: AttachmentNode, CalloutNode, CodeBlock, MathBlock, MathInline, RefNode, TagNode

- [ ] **TypeBrowser** (~1 day) — Rich table view for object collections
  - Includes: ColumnPinMenu
  - Note: Phase 1-3 complete with sorting, virtualization

---

## Tier 4: Optional ⚪

Specialized components with limited use cases.

- [ ] **NotesCreatedList** — Specialized list display
- [ ] **TagChip** — Tag display variant

### Not Applicable

- ~~Checkbox~~ — TipTap handles task lists internally (no migration needed)

---

## Reference

- **Design System Source:** `packages/design-system/src/components/`
- **Desktop App UI:** `apps/desktop/src/renderer/components/`
- **Ladle Sandbox:** `pnpm --filter @typenote/design-system sandbox` → http://localhost:61000
