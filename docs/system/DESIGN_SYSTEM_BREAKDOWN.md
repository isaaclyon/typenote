# TypeNote Design System - Component & System Breakdown

This document provides a comprehensive breakdown of all components, design systems, and patterns defined in `design_system.jsx`. It serves as a reference guide for developers implementing features and maintaining design consistency.

**File Location:** `/docs/system/design_system.jsx`
**Total Lines:** 3,553
**Primary Use:** Interactive design system documentation and reference

---

## Table of Contents

1. [Design Systems](#design-systems)
   - [Color System](#color-system)
   - [Typography System](#typography-system)
   - [Spacing & Layout System](#spacing--layout-system)
   - [Components & Interactions](#components--interactions)
2. [UI Components](#ui-components)
3. [Complex Components](#complex-components)
4. [States & Feedback Patterns](#states--feedback-patterns)
5. [Recommended File Structure](#recommended-file-structure)

---

## Design Systems

### Color System

**Location:** Lines 28-58 | **Data Structure:** `colors` object

#### Foundation Colors (Grayscale)

Base neutral palette used for text, borders, backgrounds, and UI surfaces.

| Token      | Hex       | Size    | Usage                       |
| ---------- | --------- | ------- | --------------------------- |
| `white`    | `#ffffff` | N/A     | Content background, cards   |
| `gray-50`  | `#fafaf9` | 1 color | Subtle warm off-white       |
| `gray-100` | `#f5f5f4` | 1 color | Sidebar, secondary surfaces |
| `gray-200` | `#e7e5e4` | 1 color | Borders, dividers           |
| `gray-300` | `#d6d3d1` | 1 color | Stronger borders, hover     |
| `gray-400` | `#a8a29e` | 1 color | Placeholder text            |
| `gray-500` | `#78716c` | 1 color | Muted/secondary text        |
| `gray-600` | `#57534e` | 1 color | Body text                   |
| `gray-700` | `#44403c` | 1 color | Primary text                |
| `gray-800` | `#292524` | 1 color | Headlines                   |
| `gray-900` | `#1c1917` | 1 color | Near-black emphasis         |

**Key Insights:**

- 11-step grayscale foundation optimized for warm, desaturated neutrals
- Designed to work with cornflower blue accent
- Used extensively in borders (gray-200/300), text hierarchy (gray-500 to gray-800)

#### Cornflower Blue Accent

Primary interactive color system.

| Token        | Hex       | Usage                     |
| ------------ | --------- | ------------------------- |
| `accent-50`  | `#f0f4ff` | Hover backgrounds         |
| `accent-100` | `#dbe4ff` | Selection, highlights     |
| `accent-200` | `#bac8ff` | Light accent uses         |
| `accent-300` | `#91a7ff` | Secondary accent          |
| `accent-400` | `#748ffc` | Hover states              |
| `accent-500` | `#6495ED` | **PRIMARY** — Main accent |
| `accent-600` | `#5076d4` | Pressed states            |
| `accent-700` | `#3d5fc2` | Dark accent               |

**Key Insights:**

- `#6495ED` (cornflower) is the primary brand color
- Used for buttons, links, active states, accents
- 8-step gradient from light to dark for various interactive states

#### Semantic Colors

Status and feedback indicators.

| Name      | Hex       | Usage                                    |
| --------- | --------- | ---------------------------------------- |
| `error`   | `#e57373` | Destructive actions, validation failures |
| `success` | `#81c784` | Saved, completed, positive               |
| `warning` | `#ffb74d` | Caution, unsaved changes                 |
| `info`    | `#6495ED` | Neutral information (cornflower)         |

---

### Typography System

**Location:** Lines 61-90 | **Data Structure:** `typography` object

#### Font Families

- **Sans:** `'IBM Plex Sans', system-ui, sans-serif`
  - Primary font for UI, body text, labels
- **Mono:** `'IBM Plex Mono', ui-monospace, monospace`
  - Code, metadata, technical content, keyboard shortcuts

#### Type Scale

Responsive sizing system with 7 levels.

| Token       | Size | Usage                     | Context                    |
| ----------- | ---- | ------------------------- | -------------------------- |
| `text-xs`   | 12px | Fine print, timestamps    | Small metadata             |
| `text-sm`   | 13px | Labels, metadata          | UI labels, form hints      |
| `text-base` | 15px | Body text, editor content | Primary reading text       |
| `text-lg`   | 17px | Subheadings               | Secondary headlines        |
| `text-xl`   | 20px | Section titles            | Page-level titles          |
| `text-2xl`  | 24px | Page titles               | Main headlines             |
| `text-3xl`  | 30px | Hero headings             | Rare, full-screen contexts |

**Key Insights:**

- Starts at 12px (not 10px) for readability
- Base body text is 15px (not 16px) — slightly tighter
- Jumps are 1-3px for subtle hierarchy

#### Font Weights

Three-level weight system.

| Token           | Value | Usage                              |
| --------------- | ----- | ---------------------------------- |
| `font-normal`   | 400   | Body text, regular weight          |
| `font-medium`   | 500   | Labels, emphasis, sidebar items    |
| `font-semibold` | 600   | Headings, buttons, strong emphasis |

**Key Insights:**

- Conservative weight scale avoids overstated hierarchy
- 600 is heavier than typical "bold" for impact

#### Line Heights

Spacing between lines for readability.

| Token             | Value | Usage                           |
| ----------------- | ----- | ------------------------------- |
| `leading-tight`   | 1.25  | Headings (compact)              |
| `leading-normal`  | 1.5   | Body text (standard)            |
| `leading-relaxed` | 1.625 | Long-form reading (comfortable) |

#### Letter Spacing

Character-level spacing for emphasis and hierarchy.

| Token             | Value   | Usage                      |
| ----------------- | ------- | -------------------------- |
| `tracking-tight`  | -0.02em | Headlines (tighter)        |
| `tracking-normal` | 0       | Body text, standard        |
| `tracking-wide`   | 0.025em | Uppercase labels, metadata |

---

### Spacing & Layout System

**Location:** Lines 93-114 | **Data Structure:** `spacing` object

#### Spacing Scale

Base grid is **4px**. All spacing derives from this unit.

| Token      | Value | Usage                                   | Context                         |
| ---------- | ----- | --------------------------------------- | ------------------------------- |
| `space-1`  | 4px   | Micro gaps, icon spacing                | Tight margins within components |
| `space-2`  | 8px   | Small spacing within components         | Button padding, small gaps      |
| `space-3`  | 12px  | Medium spacing between related elements | Component padding               |
| `space-4`  | 16px  | Standard section padding                | Default padding, gaps           |
| `space-5`  | 20px  | Comfortable gaps                        | Moderate separation             |
| `space-6`  | 24px  | Between sections                        | Section spacing                 |
| `space-8`  | 32px  | Major separation                        | Section breaks                  |
| `space-10` | 40px  | Large gaps                              | Significant breaks              |
| `space-12` | 48px  | Page-level spacing                      | Major page sections             |

**Key Insights:**

- Consistent 4px base grid throughout
- Used for margins, padding, gaps in layouts
- Creates visual rhythm and consistency

#### Layout Structure

Three-panel layout specification.

| Panel                | Min   | Max   | Properties                                  |
| -------------------- | ----- | ----- | ------------------------------------------- |
| **Sidebar (Left)**   | 240px | 260px | Collapsible, same bg as content, sticky     |
| **Content (Center)** | Fluid | Fluid | Responsive padding: 24px → 48px → 80px      |
| **Right Panel**      | N/A   | 280px | Contextual (backlinks, page info, settings) |

**Key Insights:**

- Sidebar width is fixed (240-260px)
- Content area grows with viewport
- Right panel is optional/contextual
- Responsive padding adjusts content width without breaking layout

#### Interactive Elements

Dimensions for buttons and touch targets.

| Element                    | Min     | Max     | Standard               |
| -------------------------- | ------- | ------- | ---------------------- |
| **Button Height**          | 36px    | 40px    | 40px preferred         |
| **Touch Target**           | 36px    | 36px    | Minimum square         |
| **Icon Size** (in buttons) | 12-16px | 12-16px | Depends on button size |

---

### Components & Interactions

**Location:** Lines 117-138 | **Data Structure:** `components` object

#### Borders

Line definitions for separation and containment.

| Style              | Weight | Color                | Usage                          |
| ------------------ | ------ | -------------------- | ------------------------------ |
| **Default**        | 1px    | `#e7e5e4` (gray-200) | Standard borders, dividers     |
| **Strong / Hover** | 1px    | `#d6d3d1` (gray-300) | Elevated borders, hover states |

#### Border Radius

Softness levels for elements.

| Size        | Value | Usage                             |
| ----------- | ----- | --------------------------------- |
| **Default** | 4px   | Buttons, inputs, cards, modals    |
| **Large**   | 6px   | Larger cards, dropdowns, popovers |

**Key Insights:**

- 4px is standard (subtle, not too rounded)
- 6px for larger surfaces to maintain proportion
- Avoids "pill" style (fully rounded)

#### Shadows

Subtle elevation indicators.

| Token       | Value                           | Usage            |
| ----------- | ------------------------------- | ---------------- |
| `shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.04)` | Subtle elevation |
| `shadow-md` | `0 2px 4px rgba(0, 0, 0, 0.06)` | Cards, dropdowns |

**Key Insights:**

- Design philosophy: Borders primary, shadows minimal
- Only 2 shadow levels for simplicity
- Very soft shadows (4-6% opacity) to avoid heaviness

#### Interactive States

**Hover State**

- Background: `#fafaf9` (gray-50)
- Border: `#d6d3d1` (gray-300) — darker border on hover
- Transition: 0.1s smooth

**Focus Ring (Apple-style)**

- Style: Double ring effect
- Inner: 2px white ring
- Outer: 4px cornflower (`#6495ED`)
- Applied to: Buttons, inputs, interactive elements

**Text Selection**

- Background: `rgba(100, 149, 237, 0.25)` — semi-transparent cornflower
- Applies to: Selected text in editor/content

#### Animation

Motion specifications for interactions.

| Duration  | Usage                                          |
| --------- | ---------------------------------------------- |
| **150ms** | Micro interactions (button hover, icon toggle) |
| **200ms** | Standard transitions (fade, slide, scale)      |

| Easing       | Usage                                            |
| ------------ | ------------------------------------------------ |
| **ease-out** | All transitions (no bounce, smooth deceleration) |

**Key Insights:**

- Two-tier timing: fast for micro, standard for transitions
- Consistent easing (ease-out) everywhere
- No bouncy/spring animations

---

## UI Components

### Simple/Atomic Components

#### Buttons

**Primary Button**

```
Style: Filled
- Background: #6495ED (cornflower)
- Text: #ffffff (white)
- Padding: 8-10px horizontal, 14-20px vertical
- Font: 13-15px, font-weight: 600
- Border radius: 6px
- Hover: Background darkens to #748ffc
```

**Secondary Button**

```
Style: Outlined
- Background: transparent
- Text: #6495ED
- Border: 1px solid #6495ED
- Padding: 10px 20px
- Font: 15px, font-weight: 600
- Border radius: 6px
```

**Tertiary Button** (text/ghost)

```
Style: Transparent
- Background: transparent
- Text: #6495ED
- No border
- Used for: Links, secondary actions
```

**Danger Button**

```
Style: Filled
- Background: #e57373 (error red)
- Text: #ffffff
- Used for: Delete, destructive actions
```

#### Inputs & Text Fields

**Text Input**

```
- Padding: 10px 12px
- Border: 1px solid #e7e5e4
- Border radius: 6px
- Font: 15px, font-family: inherit
- Focus border: #6495ED
- Placeholder color: #a8a29e (gray-400)
- Min height: 40px
```

#### Tags / Badges

**Tag**

```
- Padding: 2px 6px
- Background: #f5f5f4 (gray-100)
- Border radius: 3px
- Font: 11px
- Color: #57534e (gray-600)
- Used for: Content categorization
```

**Status Badge**

```
- Padding: 4px 10px
- Border radius: 4px
- Font: 12px, font-weight: 500
- Background: Color with 20% opacity (e.g., #81c78420 for success)
- Text: Darker shade of color (e.g., #4caf50 for success)
- Types: Success, Warning, Error, Info, In Progress, Completed, Overdue
```

#### Keyboard Keys

**<kbd> Element**

```
- Padding: 2px 6px
- Background: #fafaf9
- Border: 1px solid #e7e5e4
- Border radius: 4px
- Font: 12px monospace
- Color: #44403c
- Used for: Displaying keyboard shortcuts
```

---

## Complex Components

### Type Browser (Lines 527-821)

**Purpose:** Database-style table view for browsing objects of a specific type.

**Key Features:**

- Multi-select with "select all" checkbox
- Sortable columns (ascending/descending)
- Filterable columns
- Column visibility toggle
- Bulk actions (Archive, Delete)
- Search within type

**Props/Configuration:**

| Property        | Type     | Default   | Usage                       |
| --------------- | -------- | --------- | --------------------------- |
| `note`          | Object   | Required  | Data for each row           |
| `note.id`       | Number   | Required  | Unique identifier           |
| `note.title`    | String   | Required  | Row title/main content      |
| `note.modified` | String   | Required  | Last modified date          |
| `note.tags`     | Array    | []        | Associated tags             |
| `note.status`   | String   | "Draft"   | Status: Active, Done, Draft |
| `selectedRows`  | Set      | new Set() | Currently selected row IDs  |
| `onSelect`      | Function | Required  | Callback for row selection  |

**Structure:**

```
TypeBrowser
├── Header
│   ├── Title + Count
│   ├── Search Input
│   ├── New Note Button
│   └── Column Settings Button
├── Table
│   ├── Column Headers
│   │   ├── Checkbox (select all)
│   │   ├── Title (flex width, sortable)
│   │   ├── Modified (100px, sortable)
│   │   ├── Tags (150px, not sortable)
│   │   ├── Status (90px, sortable)
│   │   └── Actions (50px)
│   └── Rows
│       ├── Checkbox
│       ├── Title + Hover "Open" button
│       ├── Modified timestamp
│       ├── Tag badges
│       ├── Status badge
│       └── More menu (hover only)
└── Footer
    ├── Selection count
    └── Bulk action buttons (Archive, Delete)
```

**Variants/States:**

- **Empty state:** Shows when no items
- **Selected state:** Rows highlight with checkbox checked
- **Hover state:** Row background changes to #fafaf9, "Open" button appears
- **Column menu state:** Dropdown for sort/filter/hide

**Status Color Codes:**

- Active: `{ bg: '#6495ED20', text: '#3d5fc2' }`
- Done: `{ bg: '#81c78420', text: '#4caf50' }`
- Draft: `{ bg: '#ffb74d20', text: '#b8860b' }`

### ColumnHeader (Lines 221-360)

**Purpose:** Reusable table column header with sort/filter/hide menu.

**Props:**

| Prop       | Type          | Default  | Usage                 |
| ---------- | ------------- | -------- | --------------------- |
| `label`    | String        | Required | Column title          |
| `width`    | String/Number | Required | "flex" or pixel value |
| `sortable` | Boolean       | true     | Can sort this column  |
| `onSort`   | Function      | Optional | Callback for sort     |
| `sortDir`  | String        | null     | "asc" or "desc"       |
| `canHide`  | Boolean       | true     | Can hide this column  |

**Dropdown Menu Items:**

1. Sort ascending
2. Sort descending
3. Filter...
4. Hide column (if `canHide=true`)

### TableRow (Lines 363-525)

**Purpose:** Single row in type browser table.

**Props:**

| Prop         | Type     | Usage              |
| ------------ | -------- | ------------------ |
| `note`       | Object   | Row data           |
| `isSelected` | Boolean  | Checkbox state     |
| `onSelect`   | Function | Selection callback |

**Hover Behaviors:**

- Row background: #fafaf9
- "Open" button appears on title
- More menu (⋯) appears on right

### Sidebar Component (Lines 2931-3187)

**Purpose:** Left navigation panel for types, quick access, and search.

**Structure:**

```
Sidebar (240px width)
├── Top Section
│   ├── Search/Command Palette trigger (⌘K)
│   └── Calendar button
├── Types Section (scrollable)
│   ├── "Types" label
│   ├── Type items (Notes, Tasks, People, Projects, Resources)
│   │   └── Icon + Name + Count (on hover)
│   └── "+ New Type" button
└── Bottom Section
    ├── Archive button
    └── Settings button
```

**Type Row Specifications:**

- Height: ~28px (compact density)
- Icon size: 14px
- Text: 13px font-weight: 500
- Count label: Shows on hover, monospace, gray-400

**Color Coding for Types:**

- Notes: `#6495ED` (cornflower)
- Tasks: `#81c784` (success green)
- People: `#ffb74d` (warning amber)
- Projects: `#e57373` (error red)
- Resources: `#91a7ff` (light cornflower)

### Daily Notes Layout (Lines 2579-2819)

**Purpose:** Special context for daily note entries with date navigation and mini calendar.

**Header Navigation:**

- ← Prior button
- Date display (e.g., "Wed, Jan 8, 2026")
- Next → button
- "Today" button (highlighted in cornflower)

**Editor Area:**

- Fluid width with responsive padding (20px-32px)
- Title: 20px, font-weight: 600
- Content: 15px body text
- Placeholder: "Start typing to add content"

**Mini Calendar Panel (200px width):**

- Month/year header with prev/next navigation
- Day abbreviations (S M T W T F S)
- Days grid (7 columns)
- Today: Highlighted with cornflower background
- Days with notes: Blue dot indicator below number
- Keyboard: "T" to jump to today

### Right Panel Component (Lines 2821-2928)

**Purpose:** Context-specific panel showing backlinks, page info, tags, settings.

**For Regular Objects:**

- **Backlinks** — Shows what links to this object
- **Page info** — Created, modified, type
- **Tags** — Associated tags
- **Settings** — Object-specific options

**For Daily Notes:**

- Does not show right panel (editor takes full width)

---

## States & Feedback Patterns

### Loading States

**Skeleton Placeholder**

```
- Background: Linear gradient shimmer
- Animation: 1.5s infinite
- Gradient: #f5f5f4 → #fafaf9 → #f5f5f4
- Border radius: 4px
- Used for: Cards, content blocks
```

### Empty States

**Pattern:**

```
- Icon: Large, semi-transparent (opacity 0.4)
- Heading: 15px font-weight: 500
- Description: 13px body text
- CTA Button: Primary button with icon + label
- Background: #fafaf9 (light gray)
- Border: 1px dashed #d6d3d1
- Used when: No items exist or search returns nothing
```

**Example:**

```
[Icon]
No notes yet

Create your first note to get started
[+ Create Note]
```

### Save Status Indicators

**Saving...**

```
- Inline near content
- Animated dot indicator (pulse animation)
- Text: 12px color: #a8a29e
- Format: "• Saving..."
```

**Saved**

```
- Inline near content
- Check icon + text
- Text: 12px color: #81c784 (success)
- Format: "✓ Saved"
- Behavior: Briefly shown, then fades
```

### Status Indicators Table

| State   | Color   | Usage                                    | Badge Style            |
| ------- | ------- | ---------------------------------------- | ---------------------- |
| Error   | #e57373 | Destructive actions, validation failures | Background opacity 20% |
| Success | #81c784 | Saved, completed, positive               | Background opacity 20% |
| Warning | #ffb74d | Caution, unsaved changes                 | Background opacity 20% |
| Info    | #6495ED | Neutral information                      | Background opacity 20% |

### Keyboard Shortcuts Display

**<kbd> Badge Style:**

```
- Padding: 2px 6px
- Font: 12px monospace
- Background: #fafaf9
- Border: 1px solid #e7e5e4
- Border radius: 4px
- Color: #44403c
```

**Common Shortcuts:**

- `⌘ K` — Command palette
- `⌘ N` — New note
- `⌘ F` — Search
- `T` — Jump to today (daily notes)

### Overlays & Modals

**Command Palette**

```
- Position: Top-center
- Background: #ffffff
- Border: 1px solid #e7e5e4
- Border radius: 8px
- Shadow: 0 4px 16px rgba(0,0,0,0.12)
- Items: Searchable list
- Highlight on hover: #f0f4ff background
```

**Toast Notification**

```
- Position: Bottom-right, slide-in animation
- Background: #292524 (near-black)
- Text: #ffffff
- Icon + message format
- Padding: 12px 16px
- Border radius: 6px
- Shadow: 0 4px 12px rgba(0,0,0,0.15)
- Auto-dismiss: After 3-4 seconds
```

**Modal Dialog**

```
- Position: Centered
- Background: #ffffff
- Border: 1px solid #e7e5e4
- Border radius: 8px
- Shadow: 0 8px 32px rgba(0,0,0,0.12)
- Backdrop: Blur effect, semi-transparent dark overlay
- Padding: 16px
- Title: 15px font-weight: 600
- Body: 13px
- Buttons: Usually Cancel (secondary) + Action (primary/danger)
```

---

## Scrollbar

**Specification:**

- Width: 8px
- Thumb color: #d6d3d1 (gray-300)
- Border radius: 4px
- Only visible on scroll

---

## Recommended File Structure

To break this monolithic file into maintainable documentation and components, consider this structure:

```
docs/system/
├── design_system.jsx                  # Main entry (current monolithic file)
├── DESIGN_SYSTEM_BREAKDOWN.md         # This file
└── reference/
    ├── 01_colors.md                   # Color palette, hex values, usage
    ├── 02_typography.md               # Fonts, sizes, weights, line heights
    ├── 03_spacing_layout.md           # Grid, spacing scale, layout rules
    ├── 04_borders_shadows.md          # Border styles, radius, shadows
    ├── 05_interactive_states.md       # Hover, focus, selection, animation
    ├── 06_buttons_inputs.md           # Button variants, input states
    ├── 07_badges_tags.md              # Status badges, tag styles
    ├── 08_overlays.md                 # Modals, toasts, command palette
    ├── 09_tables.md                   # Type browser, table specs
    ├── 10_sidebar.md                  # Left navigation, type browser
    ├── 11_daily_notes.md              # Daily notes layout, calendar
    ├── 12_right_panel.md              # Backlinks, page info, settings
    ├── 13_loading_empty_states.md     # Skeleton, empty states, feedback
    ├── 14_icons.md                    # Icon usage, sizing, colors
    └── 15_keyboard_shortcuts.md       # Keyboard shortcuts reference

components/
├── Buttons/
│   ├── Button.tsx
│   └── Button.stories.tsx
├── Inputs/
│   ├── TextField.tsx
│   └── TextField.stories.tsx
├── Badges/
│   ├── Badge.tsx
│   └── StatusBadge.tsx
├── Tables/
│   ├── TypeBrowser.tsx
│   ├── ColumnHeader.tsx
│   └── TableRow.tsx
├── Sidebar/
│   ├── Sidebar.tsx
│   ├── SidebarTypeItem.tsx
│   └── Sidebar.stories.tsx
├── Layout/
│   ├── MainLayout.tsx
│   ├── DailyNotesLayout.tsx
│   └── RightPanel.tsx
└── Overlays/
    ├── Modal.tsx
    ├── Toast.tsx
    └── CommandPalette.tsx
```

### Key Documentation Files to Create

#### 1. **Color Palette Reference** (`01_colors.md`)

- Hex values with copy-to-clipboard examples
- Color usage guidelines
- Accessibility contrast ratios
- Design tokens mapping

#### 2. **Component Specifications** (`06_buttons_inputs.md`, etc.)

- Variants (primary, secondary, danger)
- States (default, hover, active, disabled, loading)
- Size options
- Props/API documentation

#### 3. **Pattern Library** (`13_loading_empty_states.md`)

- Loading patterns
- Empty states
- Error handling
- Confirmation patterns
- Inline feedback

#### 4. **Layout Grid** (`03_spacing_layout.md`)

- 4px base grid explanation
- Responsive breakpoints
- Container max-widths
- Panel dimensions

---

## Implementation Checklist for Developers

When implementing components from this design system:

- [ ] Use defined color tokens (not hardcoded hex)
- [ ] Follow 4px spacing grid
- [ ] Apply correct font size + weight + line-height combination
- [ ] Use 6px or 4px border radius (never other values)
- [ ] Apply focus ring to all interactive elements
- [ ] Use ease-out easing for all animations
- [ ] Ensure minimum 36×36px touch targets
- [ ] Display feedback states (loading, empty, error)
- [ ] Make components keyboard accessible
- [ ] Test color contrast ratios for accessibility

---

## Summary Statistics

| Metric                 | Count |
| ---------------------- | ----- |
| Color tokens           | 22    |
| Font sizes             | 7     |
| Font weights           | 3     |
| Spacing units          | 9     |
| Interactive components | 6+    |
| Layout panels          | 3     |
| States documented      | 10+   |
| Status types           | 4     |

---

**Last Updated:** 2026-01-10
**Source File:** `/docs/system/design_system.jsx`
