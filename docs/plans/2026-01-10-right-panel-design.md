# Right Panel Design

**Date:** 2026-01-10
**Status:** Design Complete - Ready for Implementation

## Overview

The right panel is a contextual information surface that displays properties, tags, backlinks, and unlinked mentions for the currently active document. It creates a "thought neighborhood" showing what connects to the current content, while also providing inline editing for document properties and tags.

## Design Principles

1. **Contextual Focus** - Panel content changes based on current document
2. **Click-to-Edit** - Properties display cleanly until clicked, like Capacities
3. **Discovery Surface** - Backlinks and mentions help find connections
4. **Collapsible Density** - Users control information density per section
5. **Symmetrical Layout** - 240px width matches left sidebar for visual balance

## Layout & Structure

### Dimensions

- **Width:** 240px (fixed, matches left sidebar)
- **Position:** Right edge of application
- **Border:** 1px solid gray-300 on left edge
- **Padding:** 16px internal (p-4)
- **Background:** White (#ffffff)
- **Scroll:** Independent vertical scroll

### Section Order (Top to Bottom)

1. **Properties** - Type-defined editable properties
2. **Tags** - Document tags with add/remove/navigate
3. **Backlinks** - Documents linking to this one
4. **Unlinked Mentions** - Documents mentioning title without link

**Section Spacing:** 24px vertical gaps (gap-6)

## Section Designs

### 1. Properties Section

**Purpose:** Display and edit type-specific properties for the current document.

**Section Header:**

- Title: "Properties" (no count)
- Collapse chevron
- Default state: Expanded

**Property Display (Read Mode):**

- Two-column layout: label (80px) | value (flex)
- Label: gray-600, size-sm (13px)
- Value: default text color, size-base (15px)
- Row spacing: 12px (gap-3)
- Hover: bg-gray-50, cursor pointer

**Property Display (Edit Mode):**
When clicked, value transforms to appropriate control:

- **Text:** `<Input>` component
- **Select:** Dropdown with type schema options
- **Date:** Date picker
- **Number:** `<Input type="number">` with validation

**Edit Interaction:**

- Click to enter edit mode, input gets immediate focus
- Enter to save, Escape to cancel
- Validation errors show red border + message below

**Empty Value:**

- Shows gray-400 placeholder: "Not set" or "Add [property name]"

**Example (Book type):**

```
Author          Isaac Asimov
Published       1951
Pages           255
Status          Read
Rating          Not set
```

---

### 2. Tags Section

**Purpose:** Show, add, remove, and navigate via document tags.

**Section Header:**

- Title: "Tags (3)" - shows count
- Collapse chevron
- Default state: Expanded

**Tag Display:**

- Flex-wrap row with 8px gaps (gap-2)
- Tag chips with remove buttons

**Tag Chip Anatomy:**

- Background: gray-100, hover: bg-accent-50
- Text: gray-700, size-sm (13px)
- Height: 24px (h-6)
- Padding: 8px horizontal (px-2)
- Border radius: 4px (rounded)
- Remove button: Small X icon (12px, gray-500, hover: gray-700)

**Click Behaviors:**

- **Tag name:** Navigate to filtered view of all docs with that tag
- **X button:** Remove tag from current document

**Add Tag:**

- "+ Add tag" button (ghost variant, size-sm) below existing tags
- Click shows autocomplete dropdown:
  - Existing tags from database (type-ahead search)
  - "Create new tag" option if no match
- Type new tag name, Enter to create and apply

**Empty State:**

- "No tags yet" in gray-400, size-sm

**Example:**

```
[#project ×] [#backend ×] [#architecture ×]
+ Add tag
```

---

### 3. Backlinks Section

**Purpose:** Show documents that explicitly link to the current document.

**Section Header:**

- Title: "Backlinks (5)" - shows count
- Collapse chevron
- Default state: Expanded

**Backlink Item Structure:**

- Full-width clickable area
- Padding: 8px (p-2)
- Border radius: rounded-md
- Hover: bg-gray-50, transition-colors duration-150
- Item spacing: 4px (gap-1)

**Content Layout (vertical stack):**

- **Document title:** gray-900, font-medium, size-sm (13px), truncate
- **Snippet:** gray-600, size-xs (12px), italic, ~100 characters
  - Format: "...context around the link mention..."
  - Actual link text highlighted in accent-600

**Click Behavior:**

- Navigate to the linked document

**Empty State:**

- "No backlinks yet" in gray-400, size-sm

**Example:**

```
Daily Note - 2026-01-09
  "...discussed the sidebar design with the team and decided..."

Meeting Notes: Architecture Review
  "...the right panel should show backlinks similar to Obsidian..."
```

---

### 4. Unlinked Mentions Section

**Purpose:** Show documents that mention the current document's title in plain text (without explicit link). Powered by FTS5 backend.

**Section Header:**

- Title: "Unlinked Mentions (3)" - shows count
- Collapse chevron
- Default state: **Collapsed** (discovery feature, less frequent use)

**Mention Item Structure:**

- Visually identical to backlinks for consistency
- Full-width clickable area
- Padding: 8px (p-2)
- Hover: bg-gray-50

**Content Layout:**

- **Document title:** gray-900, font-medium, size-sm (13px), truncate
- **Snippet:** gray-600, size-xs (12px), italic, ~100 characters
  - Mentioned text (matching current title) highlighted in accent-600

**Click Behavior:**

- Navigate to the document
- Useful for discovering connections to formalize with explicit links

**Empty State:**

- "No unlinked mentions found" in gray-400, size-sm

**Example (viewing "Sidebar Component"):**

```
Architecture Notes
  "...the sidebar component uses compound patterns for flexibility..."

Development Log
  "...finished implementing sidebar component with 8 sub-parts..."
```

**Key Difference from Backlinks:**
These are _potential_ connections - text mentions the title but isn't linked yet. Helps discover relationships to formalize.

---

## Component Architecture

Following the compound component pattern established by the Sidebar organism.

### Component Hierarchy

```typescript
<RightPanel>
  <RightPanelSection title="Properties" collapsible defaultExpanded>
    <PropertyList>
      <PropertyItem label="Author" value="Isaac Asimov" type="text" />
      <PropertyItem label="Status" value="Read" type="select" options={[...]} />
    </PropertyList>
  </RightPanelSection>

  <RightPanelSection title="Tags" count={3} collapsible defaultExpanded>
    <TagsList>
      <TagChip label="project" onRemove={...} onClick={...} />
      <TagAddButton onAdd={...} />
    </TagsList>
  </RightPanelSection>

  <RightPanelSection title="Backlinks" count={5} collapsible defaultExpanded>
    <BacklinksList>
      <BacklinkItem title="..." snippet="..." onClick={...} />
    </BacklinksList>
  </RightPanelSection>

  <RightPanelSection title="Unlinked Mentions" count={3} collapsible defaultExpanded={false}>
    <UnlinkedMentionsList>
      <UnlinkedMentionItem title="..." snippet="..." onClick={...} />
    </UnlinkedMentionsList>
  </RightPanelSection>
</RightPanel>
```

### Components to Build

**Build Order: Bottom-Up (Atoms → Molecules → Organisms)**

#### Atoms (Simple Components)

1. **TagChip** - Tag badge with remove button
   - Props: `label`, `onRemove`, `onClick`
   - CVA variants for hover states
2. **TagAddButton** - "+ Add tag" trigger
   - Opens autocomplete dropdown
3. **PropertyItem** - Single property row with click-to-edit
   - Props: `label`, `value`, `type` (text/select/date/number), `options?`
   - Read mode vs. edit mode states

#### Molecules (Composed Components)

4. **PropertyList** - Container for property items
   - Vertical stack with 12px gaps
5. **TagsList** - Flex-wrap container for tag chips
   - 8px gaps between chips
6. **BacklinkItem** - Title + snippet clickable row
   - Props: `title`, `snippet`, `onClick`
   - Hover state background
7. **UnlinkedMentionItem** - Same as BacklinkItem (might share implementation)
8. **BacklinksList** - Container for backlink items
9. **UnlinkedMentionsList** - Container for mention items

#### Organisms (Complex Composites)

10. **RightPanelSection** - Collapsible section with header + content
    - Props: `title`, `count?`, `collapsible`, `defaultExpanded`, `children`
    - Collapse chevron icon
    - State persistence to localStorage
11. **RightPanel** - Main 240px container
    - Props: `children`
    - Border, padding, scroll behavior

### Shared Patterns (from Sidebar)

- **CVA** for variants (selected, hover states)
- **forwardRef + displayName** on all components
- **CSS group-hover** for performance (avoid React state for hover)
- **Tailwind cn()** for class merging
- **Comprehensive Ladle stories** for each component

### State Management

**Collapse State:**

- Stored in localStorage
- Key format: `rightPanel.section.{sectionName}.collapsed`
- Boolean value per section
- Persists across sessions

**Property Editing:**

- IPC calls to update object properties in database
- Optimistic UI updates with error rollback
- Validation before save

**Tag Add/Remove:**

- IPC calls to junction table (tags ↔ objects)
- Autocomplete fetches from global tags table
- Create tag if new, then apply to object

**Navigation:**

- Tag click → Navigate to filtered view (all docs with tag)
- Backlink/mention click → Navigate to that document
- Uses existing routing system

---

## Backend Integration

### Required IPC Handlers

**Properties:**

- `getObjectProperties(objectId)` → Returns property schema from type + current values
- `updateObjectProperty(objectId, propertyName, value)` → Update single property

**Tags:**

- `getObjectTags(objectId)` → Returns array of tag objects
- `getAllTags()` → Returns all tags for autocomplete
- `addTagToObject(objectId, tagId)` → Create junction entry
- `removeTagFromObject(objectId, tagId)` → Delete junction entry
- `createTag(name)` → Create new tag, return tagId

**Backlinks:**

- `getBacklinks(objectId)` → Returns array of { objectId, title, snippet }
- Backend extracts ~100 char snippet around link position

**Unlinked Mentions:**

- `getUnlinkedMentions(objectId)` → FTS5 search for title text
- Returns array of { objectId, title, snippet }
- Backend extracts ~100 char snippet around mention

**Navigation:**

- Existing document navigation system
- Filter by tag: Navigate to Type Browser with tag filter applied

---

## Development Plan

### Phase 1: Foundation Components (Atoms)

1. Build `TagChip` in Ladle with stories
2. Build `TagAddButton` in Ladle with stories
3. Build `PropertyItem` in Ladle with all 4 types (text, select, date, number)
   - Stories for read mode, edit mode, empty state, validation errors

### Phase 2: Section Components (Molecules)

4. Build `PropertyList` container
5. Build `TagsList` container
6. Build `BacklinkItem` with title + snippet
7. Build `UnlinkedMentionItem` (might reuse BacklinkItem)
8. Build `BacklinksList` container
9. Build `UnlinkedMentionsList` container

### Phase 3: Container Components (Organisms)

10. Build `RightPanelSection` with collapse logic
    - Implement localStorage persistence
    - Stories for expanded, collapsed, with/without count
11. Build `RightPanel` main container
    - Full integration story with all sections

### Phase 4: Desktop App Integration

12. Create IPC handlers for properties, tags, backlinks, mentions
13. Wire up RightPanel in desktop app with real data
14. Implement navigation for tag clicks, backlink clicks
15. Test full flow: property editing, tag add/remove, navigation

---

## Design Token Reference

### Spacing (4px grid)

- Section gaps: 24px (gap-6)
- Property row spacing: 12px (gap-3)
- Tag chip spacing: 8px (gap-2)
- Item spacing: 4px (gap-1)
- Internal padding: 16px (p-4), 8px (p-2)

### Typography

- Property label: gray-600, size-sm (13px)
- Property value: default, size-base (15px)
- Tag text: gray-700, size-sm (13px)
- Document title: gray-900, font-medium, size-sm (13px)
- Snippet: gray-600, size-xs (12px), italic
- Empty state: gray-400, size-sm (13px)

### Colors

- Background: White (#ffffff)
- Border: gray-300
- Hover backgrounds: gray-50, accent-50
- Highlights: accent-600 (cornflower blue #6495ED)
- Tag chip: gray-100 background

### Dimensions

- Panel width: 240px (w-60)
- Tag chip height: 24px (h-6)
- Property label column: 80px

### Interactions

- Transition duration: 150-200ms
- Timing: ease-out
- No spring/bounce animations

---

## Success Criteria

- [ ] All 11 components built with Ladle stories
- [ ] Click-to-edit works for all 4 property types
- [ ] Tags can be added, removed, and navigate on click
- [ ] Backlinks show title + snippet, navigate on click
- [ ] Unlinked mentions show title + snippet, navigate on click
- [ ] Section collapse state persists across sessions
- [ ] Empty states display correctly for all sections
- [ ] Panel matches design tokens (240px, 4px grid, typography)
- [ ] No console errors or TypeScript issues
- [ ] Full test coverage (unit tests for components)

---

## Open Questions / Future Enhancements

**Potential Enhancements (Post-MVP):**

- Hover previews for backlinks/mentions (like Wikipedia)
- Inline link creation from unlinked mentions
- Multi-select for batch tag operations
- Property history/audit log
- Keyboard shortcuts for section collapse
- Resizable panel width
- Property templates per type

**Questions for Later:**

- Should properties be grouped by category within the section?
- Should we show property change history?
- Should unlinked mentions auto-link on click?
- Should tag autocomplete show usage count?
