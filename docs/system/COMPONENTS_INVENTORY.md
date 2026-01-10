# TypeNote Design System - Components Inventory

Quick reference guide for all components and systems defined in the design system.

---

## Design Systems (Foundation)

### 1. Color System

**22 Total Color Tokens**

#### Grayscale Foundation (11 colors)

- `white` - `gray-900` covering text, borders, backgrounds

#### Cornflower Blue Accent (8 colors)

- Primary: `#6495ED` (accent-500)
- Used for: Buttons, links, accents, interactive elements

#### Semantic Colors (4 colors)

- Error, Success, Warning, Info
- Used for: Status feedback and validation

### 2. Typography System

**Key Properties:**

- **Fonts:** IBM Plex Sans (primary), IBM Plex Mono (code)
- **Scale:** 7 sizes (12px to 30px)
- **Weights:** 400, 500, 600 (3 levels)
- **Line Heights:** 1.25 (tight), 1.5 (normal), 1.625 (relaxed)
- **Letter Spacing:** -0.02em (tight), 0 (normal), 0.025em (wide)

### 3. Spacing & Layout System

**Spacing Scale:** 4px base grid with 9 units

- Smallest: 4px | Largest: 48px

**Layout Structure:**

- **Sidebar:** 240-260px (fixed, collapsible)
- **Content:** Fluid (responsive padding: 24px→48px→80px)
- **Right Panel:** ~280px (contextual)

### 4. Interaction System

**Borders & Radius:**

- Border weight: 1px
- Default color: `#e7e5e4` (gray-200)
- Hover color: `#d6d3d1` (gray-300)
- Radius: 4px (default), 6px (large)

**Shadows:**

- `shadow-sm`: 0 1px 2px rgba(0, 0, 0, 0.04)
- `shadow-md`: 0 2px 4px rgba(0, 0, 0, 0.06)

**States:**

- **Hover:** BG: #fafaf9, Border: #d6d3d1
- **Focus:** Double ring (2px white, 4px #6495ED)
- **Selection:** rgba(100, 149, 237, 0.25)

**Animation:**

- **Micro:** 150ms ease-out
- **Standard:** 200ms ease-out

---

## UI Components

### Simple/Atomic Components

#### 1. Button

**Variants:** Primary, Secondary, Tertiary, Danger
**States:** Default, Hover, Focus, Active, Disabled, Loading
**Sizes:** 36px, 40px heights
**Props:** Text, Icon, Size, Variant, Disabled, Loading, onClick

#### 2. Text Input

**States:** Default, Focused, Filled, Error, Disabled
**Props:** Label, Placeholder, Value, Error message, Disabled, Type
**Sizes:** Single line, multiline
**Min height:** 40px

#### 3. Tag / Badge

**Types:** Plain tag, Status badge
**Props:** Label, Color, Size, Removable
**Sizing:** Small (11px), 2px 6px padding

#### 4. Status Badge

**Types:** Success, Warning, Error, Info, In Progress, Completed, Overdue
**Style:** 20% opacity background + darker text
**Props:** Status type, Label, Size

#### 5. Keyboard Key (<kbd>)

**Props:** Key label, Size
**Style:** Monospace, bordered, light background
**Used for:** Shortcut documentation

#### 6. Checkbox

**States:** Unchecked, Checked, Indeterminate, Disabled
**Accent color:** #6495ED (cornflower)
**Size:** 14px

---

## Complex Components

### 1. Type Browser (Table)

**Purpose:** Database-style view for objects of a specific type

**Key Features:**

- ✓ Multi-select with "select all"
- ✓ Sortable columns
- ✓ Filterable columns
- ✓ Column visibility toggle
- ✓ Bulk actions (Archive, Delete)
- ✓ Search/filter

**Sub-Components:**

1. **Header**
   - Title + item count
   - Search box
   - New item button
   - Column settings button

2. **Column Headers** (ColumnHeader)
   - Label
   - Sort indicators (asc/desc)
   - Dropdown menu: Sort, Filter, Hide

3. **Table Rows** (TableRow)
   - Checkbox
   - Title + hover "Open" button
   - Metadata columns (Modified, Tags, Status, etc.)
   - More menu (⋯) on hover

4. **Footer**
   - Selection count
   - Bulk action buttons

**Status Styling:**

- Active: Blue bg + dark blue text
- Done: Green bg + green text
- Draft: Orange bg + orange text

**Columns:**

- Checkbox (40px, fixed)
- Title (flex width, sortable)
- Modified (100px, sortable)
- Tags (150px, not sortable)
- Status (90px, sortable)
- Actions (50px, menu only on hover)

---

### 2. Left Sidebar

**Purpose:** Navigation, type browser quick access, settings

**Height:** Full viewport height
**Width:** 240px (collapsible)

**Sections:**

1. **Top Section**
   - Search/Command Palette trigger (⌘K)
   - Calendar button (opens today's daily note)

2. **Types Section** (scrollable)
   - "Types" label
   - Type items (Notes, Tasks, People, Projects, Resources)
   - Each type shows: Icon + Name + Count (on hover)
   - "+ New Type" button

3. **Bottom Section**
   - Archive button
   - Settings button

**Type Item Specifications:**

- Height: ~28px
- Icon: 14px, color-coded
- Name: 13px font-weight: 500
- Count: Shows on hover, 11px monospace, gray-400

**Colors by Type:**

- Notes: #6495ED
- Tasks: #81c784
- People: #ffb74d
- Projects: #e57373
- Resources: #91a7ff

---

### 3. Daily Notes Layout

**Purpose:** Specialized view for daily journaling

**Header Navigation:**

- ← Prior Day button
- Date display (centered, emphasized)
- Next → button
- "Today" button (highlight if today)

**Content Area:**

- **Editor:** Fluid width, responsive padding (20-32px)
- **Mini Calendar:** 200px fixed right panel

**Mini Calendar:**

- Month/year header with prev/next navigation
- Weekday abbreviations (S M T W T F S)
- Day grid (7×6 layout)
- Current day: Highlighted with cornflower background
- Days with notes: Blue dot indicator below number
- Keyboard shortcut: "T" to jump to today

---

### 4. Right Panel

**Purpose:** Contextual information for current object

**Width:** ~280px (contextual, not shown for daily notes)

**Sections** (for regular objects):

1. **Backlinks**
   - Links to this object
   - Format: Link icon + title
   - Interactive/clickable

2. **Page Info**
   - Created date
   - Modified date
   - Object type

3. **Tags**
   - Associated tags
   - Can be added/removed

4. **Settings**
   - Object-specific options

**Hidden for:** Daily notes (editor takes full width)

---

## States & Feedback Components

### 1. Loading States

**Skeleton Placeholder**

- Linear gradient shimmer animation (1.5s infinite)
- Gradient: #f5f5f4 → #fafaf9 → #f5f5f4
- Border radius: 4px
- Common shapes: Full line, heading, paragraph

### 2. Empty States

**Pattern:**

- Large icon (opacity 0.4)
- Heading (15px, font-weight 500)
- Description (13px body)
- CTA button (Primary, with icon)
- Background: #fafaf9 with dashed border

**Example:**

```
📄 No notes yet
Create your first note to get started
[+ Create Note]
```

### 3. Save Status

**Saving...**

- Inline indicator
- Animated pulse dot
- Text: "Saving..." (12px, #a8a29e)

**Saved**

- Inline indicator
- Check icon
- Text: "Saved" (12px, #81c784)
- Duration: Brief, then fades

### 4. Error/Validation Feedback

**Status Colors:**

- Error: #e57373 (soft red)
- Success: #81c784 (soft green)
- Warning: #ffb74d (soft amber)
- Info: #6495ED (cornflower)

**Badge Style:** Color with 20% opacity background + darker text

### 5. Keyboard Shortcuts

**Badge Style:**

- Font: 12px monospace
- Padding: 2px 6px
- Background: #fafaf9
- Border: 1px solid #e7e5e4
- Border radius: 4px

**Common Keys:**

- ⌘K - Command palette
- ⌘N - New note
- ⌘F - Search
- T - Jump to today

---

## Overlays & Modals

### 1. Command Palette

**Position:** Top-center of screen
**Size:** ~200px width, variable height
**Background:** #ffffff
**Border:** 1px solid #e7e5e4
**Radius:** 8px
**Shadow:** 0 4px 16px rgba(0,0,0,0.12)

**Content:**

- Search input
- Command list (scrollable)
- Items highlight on hover: #f0f4ff

### 2. Toast Notification

**Position:** Bottom-right
**Animation:** Slide-in from bottom-right
**Background:** #292524 (dark)
**Text:** #ffffff
**Padding:** 12px 16px
**Radius:** 6px
**Shadow:** 0 4px 12px rgba(0,0,0,0.15)

**Content:**

- Status icon (green checkmark for success)
- Message text (13px)
- Auto-dismiss: ~3 seconds

### 3. Modal Dialog

**Position:** Centered
**Background:** #ffffff
**Border:** 1px solid #e7e5e4
**Radius:** 8px
**Shadow:** 0 8px 32px rgba(0,0,0,0.12)
**Backdrop:** Semi-transparent dark overlay with blur

**Content:**

- Title (15px, font-weight 600)
- Body text (13px)
- Buttons (usually: Cancel, Action)

**Example:** Delete confirmation

```
Delete note?
This cannot be undone.
[Cancel] [Delete]
```

---

## Icon System

**Library:** Phosphor Icons (@phosphor-icons/react)

**Common Icons Used:**

- MagnifyingGlass, CalendarBlank, FileText, CheckSquare
- User, Folder, BookOpen, Archive
- Gear, Plus, CaretLeft, CaretRight
- Check, Link, DotsThree, CaretDown
- ArrowUp, ArrowDown, Eye, EyeSlash
- Funnel, ArrowRight, X

**Sizing:**

- Small: 12-14px (inline, metadata)
- Medium: 16-18px (buttons, sidebars)
- Large: 20px+ (headers, large UI)

**Colors:**

- Type-specific colors (see sidebar section)
- Muted: #78716c (gray-500)
- Accent: #6495ED (cornflower)

---

## Quick Component Checklist

### When Building Components:

- [ ] Use color tokens (not hardcoded hex)
- [ ] Apply 4px spacing grid
- [ ] Use correct typography combo (size + weight + line-height)
- [ ] Apply 4px or 6px border radius
- [ ] Add focus ring to interactive elements
- [ ] Use ease-out easing for animations
- [ ] Ensure 36×36px minimum touch targets
- [ ] Show appropriate feedback states
- [ ] Make keyboard accessible (focus, enter/space)
- [ ] Test color contrast (WCAG AA minimum)

---

## Component Dependencies

```
Type Browser
├── ColumnHeader
│   └── Icons: ArrowUp, ArrowDown, ChevronDown, Filter, EyeOff
├── TableRow
│   ├── Checkbox
│   ├── Button (Open)
│   ├── Tag (for tags column)
│   ├── Status Badge
│   └── Button (More menu)
└── Bulk Actions (Archive, Delete buttons)

Sidebar
├── Search Input (triggers Command Palette)
├── Calendar Button (opens Daily Notes)
├── SidebarTypeItem
│   ├── Icon (color-coded)
│   ├── Text
│   └── Count Badge
└── Action Buttons (Archive, Settings)

Daily Notes
├── Date Navigation (buttons)
├── Editor (text input)
└── Mini Calendar
    ├── Month Navigation
    ├── Weekday Headers
    └── Day Grid (with indicators)

Right Panel
├── Section Headers
├── Backlink Items
├── Tag Items
└── Info Display

Overlays
├── Command Palette
├── Toast (notification)
└── Modal Dialog
    ├── Title
    ├── Body
    └── Buttons
```

---

## Recommended Implementation Order

1. **Foundation First** (colors, typography, spacing)
2. **Atomic Components** (buttons, inputs, badges)
3. **Simple Composites** (cards, headers, footers)
4. **Complex Components** (table, sidebar, daily notes)
5. **Overlays & States** (modals, toasts, loading)
6. **Full Layouts** (main app layout, dashboard)

---

## Performance Considerations

- **Sidebar type items:** Lazy render long lists
- **Type browser rows:** Virtualize long tables
- **Tooltips/popovers:** Lazy load on hover
- **Mini calendar:** Generate days dynamically
- **Animations:** Use CSS transforms for smooth 60fps

---

## Accessibility Checklist

- [ ] All interactive elements have focus indicators
- [ ] Focus ring is visible (2px white + 4px cornflower)
- [ ] Color isn't the only way to communicate status
- [ ] Icons have aria-labels where needed
- [ ] Form inputs have associated labels
- [ ] Modal dialogs have proper ARIA roles
- [ ] Keyboard navigation supported throughout
- [ ] Color contrast meets WCAG AA standards
- [ ] Text size is readable (min 12px)

---

**Total Component Count:** 15+ documented components and systems
**Design Tokens:** 50+ defined across colors, typography, spacing
**File:** `/docs/system/design_system.jsx` (3,553 lines)
**Status:** Fully documented in DESIGN_SYSTEM_BREAKDOWN.md
