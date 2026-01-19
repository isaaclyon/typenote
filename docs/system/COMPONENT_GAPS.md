# TypeNote Design System - Component Gaps Analysis

**Last Updated:** 2026-01-18
**Design System Status:** Rebuilding after foundation reset

This document identifies missing UI components needed to complete TypeNote's feature set, prioritized by impact and blocking dependencies.

---

## Executive Summary

**Current State:**

- ⚠️ Design system reset (foundation preserved; components rebuilding)
- ✅ Core atoms/molecules being rebuilt in Ladle (Button, Input, Checkbox, Badge, Skeleton, IconButton, Divider, Tooltip, Card, SearchInput)
- ✅ Strong architectural patterns (CVA, cn utility, TypeScript strict mode)
- ⏳ Complex components (Sidebar, AppShell, editor, overlays) are pending rebuild

**Notes:**

- This document still references pre-reset components; update as rebuild progresses.

**The Gap:**
The design system has excellent **primitives** (atoms/molecules) but is missing **domain-specific molecules** for:

- Property editing (text, number, date, select, checkbox, object-ref inputs)
- Data display (table grids, kanban boards)
- Configuration UI (icon/color pickers)

**Strategic Insight:**
Backend services are production-ready (Task Management 100%, Object Types 100%, Calendar 100%), but unusable without property input components. Building P0 components unlocks the highest-value features.

---

## Priority 0 Components (Blocking)

### 1. Property Input Components

**Status:** Not implemented
**Effort:** 2-3 days
**Blocks:** Object editing, Right sidebar, Task management, Settings

**What's Missing:**

A unified property input system that handles all property types defined in the backend schema (`packages/storage/src/propertyValidation.ts`):

```typescript
// Need to create:
<PropertyInput
  type="text"          // text, number, boolean, date, datetime, select, multiselect, ref, refs
  value={currentValue}
  onChange={handleChange}
  config={propertyConfig} // options for select, typeId for refs, etc.
/>

// Or individual components:
<TextProperty value={val} onChange={set} />
<NumberProperty value={val} onChange={set} />
<CheckboxProperty value={val} onChange={set} />
<DateProperty value={val} onChange={set} includeTime />
<SelectProperty options={opts} value={val} onChange={set} />
<MultiSelectProperty options={opts} value={vals} onChange={set} />
<ObjectRefProperty typeId={id} value={refId} onChange={set} />
<ObjectRefsProperty typeId={id} value={refIds} onChange={set} />
```

**Backend Ready:**

- ✅ Full property validation in `propertyValidation.ts`
- ✅ 8 property types: text, number, boolean, date, datetime, select, multiselect, ref, refs
- ✅ Property schemas with validation rules

**Design Primitives Available:**

- ✅ Input (basic text)
- ✅ Checkbox
- ❌ Switch (not rebuilt yet)
- ❌ SelectTrigger (not rebuilt yet)
- ✅ MiniCalendar (date grid)
- ⏳ CommandPalette (reset; needs rebuild)

**What to Build:**

1. Wrapper components for each property type
2. Unified PropertyInput component with type discrimination
3. Property field layout (label + input + validation)
4. PropertyPanel organism for right sidebar
5. Ladle stories for all variants

**Unblocks:**

- Right sidebar property editing
- Task status/priority/due date editing
- Object type property configuration
- Settings panels

---

### 2. Date/Time Picker

**Status:** Partially implemented (MiniCalendar exists, no time input)
**Effort:** 1 day
**Blocks:** Tasks, Events, Date/DateTime properties

**What's Missing:**

```typescript
// Need to create:
<DateTimePicker
  value={dateTime}      // Date | null
  onChange={setDateTime}
  includeTime={true}    // Show time input
  minDate={minDate}     // Optional constraints
  maxDate={maxDate}
/>

// Time input component:
<TimeInput
  value={time}          // "14:30" | null
  onChange={setTime}
  format="24h"          // "12h" | "24h"
/>
```

**Backend Ready:**

- ✅ `date` and `datetime` property types
- ✅ ISO 8601 date/datetime storage
- ✅ Task `due_date` property
- ✅ Event `start_date`, `end_date` properties

**Design Primitives Available:**

- ✅ MiniCalendar (date grid with selection)
- ✅ Input (for time entry)
- ✅ Modal (for picker overlay)

**What to Build:**

1. Combine MiniCalendar + time input
2. Input field trigger (click to open picker)
3. Today/Clear quick actions
4. Keyboard navigation (arrow keys, Enter, Escape)
5. Ladle stories (date only, date+time, with constraints)

**Unblocks:**

- Task due date selection
- Event scheduling
- Daily note date navigation
- Date/DateTime property editing

---

### 3. Dropdown Menu (Context Menu)

**Status:** Radix UI installed but not wired
**Effort:** 1 day
**Blocks:** Context actions, Settings menus, Object actions

**What's Missing:**

```typescript
// Need to create:
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" size="icon">⋮</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onSelect={handleEdit}>
      <Icon /> Edit
    </DropdownMenuItem>
    <DropdownMenuItem onSelect={handleDuplicate}>
      <Icon /> Duplicate
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem onSelect={handleDelete} destructive>
      <Icon /> Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>

// Context menu variant:
<ContextMenu>
  <ContextMenuTrigger>
    <div>Right-click me</div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    {/* Same items structure */}
  </ContextMenuContent>
</ContextMenu>
```

**Backend Ready:**

- ✅ Object CRUD operations (create, update, delete)
- ✅ Soft delete (`deletedAt` field)

**Design Primitives Available:**

- ✅ `@radix-ui/react-dropdown-menu` installed
- ✅ `@radix-ui/react-context-menu` installed
- ✅ Button (for triggers)
- ✅ Icon components (Phosphor)
- ✅ Tooltip (Radix)

**What to Build:**

1. DropdownMenu wrapper (styling + keyboard nav)
2. DropdownMenuItem with icon support
3. DropdownMenuSeparator
4. ContextMenu wrapper (right-click trigger)
5. Destructive item variant (red text/icon for delete actions)
6. Ladle stories (basic menu, with icons, with separators, destructive actions)

**Unblocks:**

- Object row actions (edit, duplicate, delete, change type)
- Settings menu navigation
- Inline property actions
- Right-click context menus

---

## Priority 1 Components (High Value)

### 4. Data Table

**Status:** Library installed but not wired
**Effort:** 2-3 days
**Blocks:** Collection views, Task views

**What's Missing:**

```typescript
// Need to create:
<DataTable
  columns={columnDefs}      // ColumnDef<T>[]
  data={items}              // T[]
  sortable                  // Enable column sorting
  filterable                // Enable column filters
  pagination                // Enable pagination
  onRowClick={handleClick}  // Navigate to object
  emptyState={<EmptyState />}
/>

// Column definition:
const columns: ColumnDef<ObjectType>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => <TitleCell object={row.original} />
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge>{row.getValue("status")}</Badge>
  }
];
```

**Backend Ready:**

- ✅ `listObjects()` with sorting/filtering
- ✅ Pagination support
- ✅ All object properties queryable

**Design Primitives Available:**

- ✅ `@tanstack/react-table` v8.21.3 installed
- ⏳ ScrollArea (not rebuilt yet)
- ✅ Badge (for status/tags)
- ✅ Button (for column headers, actions)
- ⏳ EmptyState (not rebuilt yet)

**What to Build:**

1. DataTable organism wrapper
2. Column header component (sortable, with icons)
3. Row component (hover state, click to navigate)
4. Pagination controls
5. Filtering UI (per-column or global)
6. Ladle stories (basic table, sortable, filterable, empty state)

**Unblocks:**

- Collection table views
- Task list views
- Object type listings
- Search results display

---

### 5. Icon Picker

**Status:** Not implemented
**Effort:** 2-3 days
**Blocks:** Object type creation/editing

**What's Missing:**

```typescript
// Need to create:
<IconPicker
  value={currentIcon}       // string | null (icon name)
  onChange={setIcon}        // (iconName: string) => void
  library="lucide"          // "lucide" | "phosphor"
  categories={["general", "objects", "media"]}
  searchable
/>
```

**Backend Ready:**

- ✅ Object types have `icon` field (string)
- ✅ Icon stored by name (e.g., "FileText", "Calendar")

**Design Primitives Available:**

- ⚠️ Lucide React (not in current design-system rebuild)
- ✅ Phosphor Icons (design-system dependency)
- ✅ Input (for search)
- ⏳ ScrollArea (for icon grid)
- ⏳ Modal (for picker overlay)
- ✅ Button (for trigger + icon buttons)

**What to Build:**

1. Icon grid layout (4-6 columns)
2. Search/filter input
3. Category tabs (optional)
4. Selected state indicator
5. Icon preview in trigger button
6. Ladle stories (basic picker, with search, with categories, selected state)

**Unblocks:**

- Object type icon selection
- Custom type creation UI
- Type configuration panel

---

### 6. Color Picker

**Status:** Not implemented
**Effort:** 1-2 days
**Blocks:** Object type creation/editing

**What's Missing:**

```typescript
// Need to create:
<ColorPicker
  value={hexColor}          // "#6495ED" | null
  onChange={setColor}       // (color: string) => void
  presets={typeColors}      // Predefined color swatches
  allowCustom               // Enable hex input
/>

// Simple preset-only variant:
<ColorSwatches
  value={hexColor}
  onChange={setColor}
  colors={["#6495ED", "#FF6B6B", "#4ECB71", "#FFD93D"]}
/>
```

**Backend Ready:**

- ✅ Object types have `color` field (hex string)
- ✅ Colors stored as `#RRGGBB` format

**Design Primitives Available:**

- ✅ Button (for color swatches)
- ✅ Input (for hex input)
- ⏳ Modal (for picker overlay)

**What to Build:**

1. Color swatch grid (8-12 preset colors)
2. Hex input field (with validation)
3. Color preview button (trigger)
4. Selected state indicator
5. Optional: Hue/saturation picker (can defer to v2)
6. Ladle stories (preset swatches, with hex input, selected state)

**Unblocks:**

- Object type color selection
- Custom type creation UI
- Type configuration panel

---

### 7. Multi-Select Combobox

**Status:** CommandPalette exists (single select), no multi-select variant
**Effort:** 2 days
**Blocks:** Multi-object properties, Tag selection, Filters

**What's Missing:**

```typescript
// Need to create:
<MultiSelect
  options={objects}         // Array<{ id, label, icon?, color? }>
  selected={selectedIds}    // string[]
  onChange={setSelected}    // (ids: string[]) => void
  searchable                // Enable search/filter
  createNew                 // Allow creating new items
  placeholder="Select tags..."
  maxDisplay={3}            // Show "3 items selected" after limit
/>

// Variant: Tag input with autocomplete
<TagInput
  tags={selectedTags}
  suggestions={availableTags}
  onChange={setTags}
  onCreate={createTag}      // Create new tag on Enter
/>
```

**Backend Ready:**

- ✅ `refs` property type (multi-object select)
- ✅ Tags are first-class objects
- ✅ Tag autocomplete in editor

**Design Primitives Available:**

- ⏳ CommandPalette (reset; needs rebuild)
- ✅ Badge/Tag (for selected items)
- ✅ Input (for search)
- ⏳ ScrollArea (for results)
- ✅ Checkbox (for multi-select)

**What to Build:**

1. Multi-select combobox (extend CommandPalette)
2. Selected items display (badges with remove X)
3. Checkbox items in dropdown
4. Keyboard nav (Tab to add, Backspace to remove)
5. Tag input variant (inline editing)
6. Ladle stories (basic multi-select, tag input, with create, max display)

**Unblocks:**

- Multi-object select properties
- Tag management UI
- Collection view filters (filter by multiple types)
- Advanced search filters

---

## Priority 2 Components (Nice to Have)

### 8. Kanban Board

**Status:** Not implemented
**Effort:** 3-5 days
**Blocks:** Task board view, Collection board view

**What's Missing:**

```typescript
// Need to create:
<KanbanBoard
  columns={statusColumns}   // Array<{ id, title, items }>
  items={tasks}             // T[]
  onDragEnd={handleDragEnd} // (itemId, newColumnId, newIndex) => void
  renderItem={renderCard}   // (item: T) => ReactNode
  emptyState={<EmptyState />}
/>
```

**Backend Ready:**

- ✅ Task `status` field (Backlog, Todo, InProgress, Done)
- ✅ `getTasksByStatus()` query
- ✅ `updateTask()` for status changes

**Design Primitives Available:**

- ✅ Card (for task cards)
- ✅ ScrollArea (for column scrolling)
- ✅ Badge (for status indicators)
- ❌ Drag-and-drop library NOT installed (need `@dnd-kit/core`)

**What to Build:**

1. Install `@dnd-kit/core` + `@dnd-kit/sortable`
2. Kanban column component (scrollable, drag target)
3. Draggable card wrapper
4. Drag overlay (ghost card)
5. Drop indicators (show where card will land)
6. Keyboard accessibility (arrow keys + Space to move)
7. Ladle stories (basic board, with drag, empty columns)

**Unblocks:**

- Task board view (Kanban by status)
- Collection board views (group by any property)

**Can Defer Because:**

- Table/list views work for initial launch
- Backend is ready whenever UI is built

---

### 9. Resizable Panels

**Status:** AppShell has fixed/collapsible sidebars, not resizable
**Effort:** 1-2 days
**Blocks:** User-adjustable sidebar widths

**What's Missing:**

```typescript
// Need to create:
<ResizablePanels direction="horizontal">
  <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
    <Sidebar />
  </ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={80}>
    <MainContent />
  </ResizablePanel>
</ResizablePanels>
```

**Backend Ready:**

- ✅ User settings system (`packages/storage/src/userSettings.ts`)
- ✅ Can persist panel sizes to settings

**Design Primitives Available:**

- ✅ AppShell (current layout system)
- ❌ Resize handle component NOT implemented

**What to Build:**

1. Install `react-resizable-panels` (optional, or build custom)
2. Resize handle component (vertical bar with hover state)
3. Mouse drag handlers
4. Persist sizes to localStorage or user settings
5. Keyboard accessibility (arrow keys to resize)
6. Ladle stories (basic panels, with constraints)

**Unblocks:**

- User-adjustable sidebar widths
- Split panes (side-by-side editing)

**Can Defer Because:**

- Fixed-width sidebars are acceptable
- Collapsible sidebars already work

---

## Quick Wins

**Components with dependencies installed but not wired:**

1. **Toast Notifications** - `sonner` installed, basic integration exists
   - **Status:** ✅ Wired in App.tsx
   - **Improvement:** Export unified toast API from design-system
   - **Effort:** Hours

2. **Modal/Dialog** - `@radix-ui/react-dialog` installed
   - **Status:** ✅ Modal component implemented in design-system
   - **Gap:** Not integrated into desktop app (no usage yet)
   - **Effort:** Use existing component, wire up actions

3. **Dropdown/Context Menu** - Radix primitives installed
   - **Status:** ❌ Not implemented (see P0 #3 above)
   - **Effort:** 1 day

---

## Non-Blocking Gaps

### Components from Capacities Checklist NOT in TypeNote

These are explicitly out of scope or deferred:

- ❌ **Side panel** - Not in TypeNote's design (uses right sidebar instead)
- ❌ **AI Assistant panel** - Explicitly deferred in roadmap
- ❌ **Workspace switcher** - Single-workspace only (deferred)
- ❌ **Emoji picker** - Unicode works, no picker needed yet
- ❌ **Math renderer (KaTeX)** - Schema ready, renders as raw LaTeX (low priority)
- ❌ **Unlinked mentions UI** - Backend complete (18 tests), UI deferred

---

## Implementation Roadmap

### Phase 1: Unblock Core Features (P0)

**Effort:** 4-5 days
**Impact:** Unlocks Task Management, Properties Panel, Settings

1. Property Input Components (2-3 days)
2. Date/Time Picker (1 day)
3. Dropdown Menu (1 day)

**Deliverables:**

- ✅ All 8 property types have input components
- ✅ Tasks can be edited (status, priority, due date)
- ✅ Right sidebar shows editable properties
- ✅ Context menus work (right-click actions)

---

### Phase 2: Data Views (P1)

**Effort:** 4-7 days
**Impact:** Unlocks Collection Views, Object Type Manager

4. Data Table (2-3 days)
5. Icon Picker (2-3 days)
6. Color Picker (1-2 days)
7. Multi-Select (2 days)

**Deliverables:**

- ✅ Collection table views work
- ✅ Object types can be created/edited with icon/color
- ✅ Multi-object properties can be edited
- ✅ Tag management UI complete

---

### Phase 3: Advanced Views (P2)

**Effort:** 4-7 days
**Impact:** Better UX, not blocking

8. Kanban Board (3-5 days)
9. Resizable Panels (1-2 days)

**Deliverables:**

- ✅ Task board view (Kanban)
- ✅ User-adjustable sidebar widths

---

## Component Quality Checklist

Before marking a component "done", verify:

- [ ] Component built in `packages/design-system/src/components/`
- [ ] Ladle stories cover all variants and states
- [ ] Follows design system patterns (CVA, cn utility, forwardRef)
- [ ] Uses design tokens (no arbitrary values)
- [ ] 4px spacing grid followed
- [ ] TypeScript types exported
- [ ] Accessible (keyboard nav, ARIA if needed)
- [ ] Interactive states work (hover, focus, active, disabled)
- [ ] Edge cases covered (empty, loading, error, overflow)
- [ ] No console errors in Ladle
- [ ] Tested in desktop app integration

---

## Related Documentation

- [COMPONENTS_INVENTORY.md](./COMPONENTS_INVENTORY.md) - What's currently implemented
- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - Copy-paste design tokens
- [DESIGN_SYSTEM_BREAKDOWN.md](./DESIGN_SYSTEM_BREAKDOWN.md) - Architecture patterns
- `/.claude/rules/design-system.md` - Component development workflow
- `/.claude/skills/design-principles/` - Design philosophy

---

## Appendix: Backend Readiness Matrix

| Feature               | Backend                      | Frontend              | Blocking Component                         |
| --------------------- | ---------------------------- | --------------------- | ------------------------------------------ |
| Task Management       | 100% (10 queries, 362 lines) | 0%                    | Property Inputs, Date Picker               |
| Object Type Manager   | 100% (Full CRUD)             | 0%                    | Icon Picker, Color Picker, Property Inputs |
| Properties Panel      | 100% (8 property types)      | 10%                   | Property Inputs                            |
| Collection Table View | 100% (Sorting, filtering)    | 0%                    | Data Table                                 |
| Task Board View       | 100% (By status query)       | 0%                    | Kanban Board                               |
| Context Actions       | 100% (Delete, update ops)    | 0%                    | Dropdown Menu                              |
| Multi-Object Props    | 100% (refs type)             | 10% (wiki-links only) | Multi-Select                               |
| Calendar Events       | 100%                         | 70%                   | Date/Time Picker (for editing)             |

**Key Takeaway:** Backend is production-ready. UI components are the bottleneck.
