# Design System Migration Checklist

Track which design system components have been migrated from Ladle to the desktop app.

## Summary

| Status                   | Count  | Percentage |
| ------------------------ | ------ | ---------- |
| ✅ Migrated              | 30     | 91%        |
| 🟡 Ready for Integration | 0      | 0%         |
| 🟠 Major Refactor        | 1      | 3%         |
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
- [x] **DailyNoteNav** — Replaced custom `DailyNoteNavigation.tsx` with design-system component
- [x] **SettingsModal** — Wired to useSettings hook with optimistic updates
  - Includes: SettingsSection, SettingsRow, Select, Switch
- [x] **Select** — Used in `SettingsModalWrapper.tsx` for all dropdown settings
- [x] **Switch** — Used in `SettingsModalWrapper.tsx` for toggle settings
- [x] **Input** — Used in `TagPickerModal.tsx` for tag search
- [x] **SaveStatus** — Connected to editor save state via useAutoSave hook
- [x] **PropertyItem** — Displaying Created, Modified, Type in PropertiesPanel
- [x] **PropertyTags** — Full tag management (add + remove) via TagPickerModal
- [x] **Modal** — Used for TagPickerModal
  - Includes: ModalHeader, ModalContent, ModalFooter
- [x] **Text** — Adopted in TypeBrowserView, PropertiesPanel, CalendarSidebar, CalendarHeader
- [x] **Tag** — Used in PropertiesPanel with removal support
- [x] **TagAddButton** — Used in PropertiesPanel
- [x] **MiniCalendar** — Integrated into LeftSidebar for daily note navigation
- [x] **CommandPalette** — Full implementation with keyboard navigation
  - Includes: CommandPaletteInput, CommandPaletteItem, CommandPaletteList, CommandPaletteGroup, CommandPaletteEmpty, CommandPaletteLoading, CommandPaletteSeparator
- [x] **AppShell** — Main app layout wrapper with collapsible sidebars
  - Includes: ContentArea, SidebarCollapseButton, useCollapsibleSidebar
- [x] **Sidebar** — Full left sidebar with type list, pinning, search, calendar
  - Includes: SidebarTypeItem, SidebarTypesList, SidebarSearchTrigger, SidebarPinnedSection, SidebarActionButton, SidebarCalendarButton, SidebarNewTypeButton, SidebarPinnedItem
  - Status: Fully integrated in LeftSidebar.tsx with useTypeCounts and usePinnedObjects hooks (2026-01-15)
- [x] **RightSidebar** — Metadata panel for object properties
  - Status: Fully integrated in PropertiesPanel.tsx with property display and tag management (2026-01-15)
- [x] **TypeBrowser** — Rich table view for object collections
  - Includes: ColumnPinMenu
  - Status: Fully integrated with sorting, virtualization, and IPC wiring (2026-01-15)

---

## Tier 2: Ready for Integration 🟡

**All components from this tier have been migrated! 🎉**

---

## Tier 3: Major Refactors 🟠

Remaining organism-level components requiring architectural changes.

- [x] **InteractiveEditor** — Desktop app now uses `DocumentEditor` wrapper
  - Includes: RefNode, TagNode, SlashCommand, and all TipTap extensions
  - Status: Fully migrated via commit `260c23c` (2026-01-15)
  - Desktop's DocumentEditor wraps InteractiveEditor with IPC callbacks

- [ ] **EditorPreview** — Read-only editor preview
  - Includes: AttachmentNode, CalloutNode, CodeBlock, MathBlock, MathInline, RefNode, TagNode
  - Note: Component exists in design-system, needs integration into object list views

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
