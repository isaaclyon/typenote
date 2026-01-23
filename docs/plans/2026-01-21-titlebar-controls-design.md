# TitleBar Controls Design

**Goal:** Move search, dark mode toggle, and settings controls from HeaderBar into the TitleBar to eliminate collision with breadcrumbs.

---

## Problem

The current layout places breadcrumbs and utility controls (search, theme toggle, settings) in the same 40px HeaderBar. Long breadcrumb paths (e.g., "Pages / Project Notes / My Note") can collide with the right-aligned controls.

## Solution

Move utility controls into the TitleBar (28px), leaving HeaderBar exclusively for breadcrumbs.

### Layout Change

```
BEFORE:
┌─────────────────────────────────────────────────────────────────┐
│                     TitleBar (28px) - empty                     │
├───────────────┬─────────────────────────────────────────────────┤
│               │  [Breadcrumbs...]  [Search...⌘K] [☀] [⚙] (40px) │
│   Sidebar     ├─────────────────────────────────────────────────┤
│               │              Content                            │
└───────────────┴─────────────────────────────────────────────────┘

AFTER:
┌─────────────────────────────────────────────────────────────────┐
│ [traffic lights]              [Search...⌘K] [☀] [⚙]    (28px)  │
├───────────────┬─────────────────────────────────────────────────┤
│               │  📄 Pages / 📄 Project Notes / 📄 My Note (40px) │
│   Sidebar     ├─────────────────────────────────────────────────┤
│               │              Content                            │
└───────────────┴─────────────────────────────────────────────────┘
```

---

## Design Decisions

### Control Sizing

- **Touch targets:** 24px × 24px (fits 28px TitleBar with 2px vertical padding)
- **Icon size:** 16px (scaled down from current 18px)
- **Rationale:** 24px is the minimum comfortable touch target while fitting the compact TitleBar

### SearchTrigger Style

- **Style:** Compact input-style (~120px width)
- **Not:** Icon-only button
- **Rationale:** Maintains discoverability; users can see "Search..." text and ⌘K hint

### HeaderBar Retention

- **Keep:** HeaderBar at 40px for breadcrumbs
- **Not:** Eliminate HeaderBar or move breadcrumbs to TitleBar
- **Rationale:** Clean visual separation; breadcrumbs get dedicated space for long paths

### TitleBar Control Placement

- **Position:** Right-aligned with padding from window edge
- **Drag region:** Controls wrapped in `app-region-no-drag` container
- **Rationale:** Standard position for utility controls; matches user expectations

---

## Component Changes

### TitleBar (features/TitleBar)

**New props:**

- `onSearchClick?: () => void`
- `onSettingsClick?: () => void`
- `theme?: 'light' | 'dark'`
- `onThemeToggle?: () => void`
- `searchShortcut?: string`

**Implementation:**

- Right-aligned flex container for controls
- `app-region-no-drag` class to enable clicking
- `pr-3` padding from window edge

### SearchTrigger (patterns/SearchTrigger)

**New variant:** `size="compact"`

- Width: ~120px
- Height: 24px
- Placeholder: "Search..."
- Keycap hint retained

### IconButton (primitives/IconButton)

**New variant:** `size="sm"`

- Dimensions: 24px × 24px
- Icon size: 16px

### HeaderBar (features/HeaderBar)

**Removed props:**

- `onSearchClick`
- `onSettingsClick`
- `theme`
- `onThemeToggle`
- `searchShortcut`

**Simplified:** Breadcrumbs only, centered, full width

### AppShell (features/AppShell)

**Changes:**

- Move control props from HeaderBar to TitleBar
- Wire callbacks through TitleBar instead

---

## Files Affected

1. `packages/design-system/src/primitives/IconButton/IconButton.tsx`
2. `packages/design-system/src/patterns/SearchTrigger/SearchTrigger.tsx`
3. `packages/design-system/src/features/TitleBar/TitleBar.tsx`
4. `packages/design-system/src/features/HeaderBar/HeaderBar.tsx`
5. `packages/design-system/src/features/AppShell/AppShell.tsx`
6. All corresponding `.stories.tsx` files

---

## Verification

1. Ladle sandbox shows all variants correctly
2. TitleBar controls are clickable (not blocked by drag region)
3. Breadcrumbs can expand to full HeaderBar width
4. Typecheck passes
