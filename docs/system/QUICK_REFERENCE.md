# TypeNote Design System - Quick Reference

Fast lookup guide for developers implementing components.

---

## Color Tokens

### Grayscale (Use for text, borders, backgrounds)

```
#ffffff      white           (backgrounds)
#fafaf9      gray-50         (subtle backgrounds)
#f5f5f4      gray-100        (sidebars, secondary surfaces)
#e7e5e4      gray-200        (default borders) ⭐
#d6d3d1      gray-300        (hover borders, strong)
#a8a29e      gray-400        (placeholders, hints)
#78716c      gray-500        (secondary text, muted)
#57534e      gray-600        (body text)
#44403c      gray-700        (primary text) ⭐
#292524      gray-800        (headlines)
#1c1917      gray-900        (emphasis)
```

### Primary Brand Color

```
#6495ED      accent-500      (MAIN - buttons, links, accents) ⭐
#748ffc      accent-400      (hover state, lighter)
#5076d4      accent-600      (pressed state, darker)
#f0f4ff      accent-50       (hover backgrounds)
#dbe4ff      accent-100      (selection highlights)
```

### Semantic Colors

```
#e57373      error           (destructive, failures)
#81c784      success         (completed, positive)
#ffb74d      warning         (caution, unsaved)
#6495ED      info            (neutral information)
```

---

## Typography

### Font Families

```
Sans-serif: 'IBM Plex Sans', system-ui, sans-serif
Monospace:  'IBM Plex Mono', ui-monospace, monospace
```

### Font Sizes

```
12px     (text-xs)      Fine print, timestamps
13px     (text-sm)      Labels, metadata ⭐
15px     (text-base)    Body text, editor ⭐
17px     (text-lg)      Subheadings
20px     (text-xl)      Section titles
24px     (text-2xl)     Page titles
30px     (text-3xl)     Hero headings
```

### Font Weights

```
400      (normal)       Body text
500      (medium)       Labels, emphasis ⭐
600      (semibold)     Headings, buttons ⭐
```

### Line Heights

```
1.25     (tight)        Headings
1.5      (normal)       Body text ⭐
1.625    (relaxed)      Long-form reading
```

### Letter Spacing

```
-0.02em  (tight)        Headlines
0        (normal)       Body text ⭐
0.025em  (wide)         Uppercase labels
```

---

## Spacing Scale (4px base grid)

```
4px      (space-1)      Micro gaps
8px      (space-2)      Small spacing ⭐
12px     (space-3)      Medium spacing
16px     (space-4)      Standard padding ⭐
20px     (space-5)      Comfortable gaps
24px     (space-6)      Section spacing ⭐
32px     (space-8)      Major separation
40px     (space-10)     Large gaps
48px     (space-12)     Page-level spacing
```

---

## Common Measurements

### Layout Dimensions

```
240-260px   Sidebar width (fixed, collapsible)
~280px      Right panel width (contextual)
Fluid       Content area width (responsive)
24/48/80px  Content padding (responsive: sm/md/lg)
```

### Interactive Elements

```
36px x 36px Minimum touch target ⭐
36-40px     Button/input height ⭐
4px         Default border radius ⭐
6px         Large border radius
1px         Border weight ⭐
14px        Icon size (inline)
16px        Icon size (standard)
20px        Icon size (large)
```

### Shadows

```
0 1px 2px rgba(0, 0, 0, 0.04)    shadow-sm (subtle)
0 2px 4px rgba(0, 0, 0, 0.06)    shadow-md (cards, dropdowns) ⭐
```

---

## Interactive States

### Hover

```
Background:  #fafaf9  (gray-50)
Border:      #d6d3d1  (gray-300)
Transition:  0.1s smooth
```

### Focus

```
Box Shadow:  0 0 0 2px white, 0 0 0 4px #6495ED
Applied to:  All interactive elements
```

### Text Selection

```
Background:  rgba(100, 149, 237, 0.25)  (20% cornflower)
Applied to:  Selected text
```

### Animation

```
150ms ease-out   Micro interactions (button, toggle)
200ms ease-out   Standard transitions (fade, slide)
Easing:          Always ease-out (no bounce)
```

---

## Button Styles

### Primary

```
Background:  #6495ED
Text:        #ffffff
Padding:     8-10px V, 14-20px H
Font:        13-15px, weight: 600
Border-Radius: 6px
Hover:       #748ffc (lighter)
```

### Secondary

```
Background:  transparent
Text:        #6495ED
Border:      1px solid #6495ED
Padding:     10px 20px
Font:        15px, weight: 600
Border-Radius: 6px
```

### Danger

```
Background:  #e57373 (error)
Text:        #ffffff
Used for:    Delete, destructive actions
```

### Ghost/Tertiary

```
Background:  transparent
Text:        Inherited or #6495ED
No border
Used for:    Links, secondary actions
```

---

## Form Elements

### Text Input

```
Padding:       10px 12px
Border:        1px solid #e7e5e4
Border-Radius: 6px
Font:          15px, inherit family
Focus Border:  #6495ED
Placeholder:   #a8a29e (gray-400)
Min Height:    40px
```

### Checkbox

```
Size:         14px
Accent Color: #6495ED
Checked:      Visual checkmark, cornflower background
```

### Tag / Badge

```
Padding:       2px 6px
Background:    #f5f5f4
Border-Radius: 3px
Font:          11px
Color:         #57534e (gray-600)
```

### Status Badge

```
Padding:       4px 10px
Border-Radius: 4px
Font:          12px, weight: 500
Background:    Color with 20% opacity (e.g., #81c78420)
Text:          Darker shade of color
```

---

## Component Specs

### Table (Type Browser)

```
Header Row:
  - Checkbox      40px (fixed)
  - Title         flex width (min 200px)
  - Modified      100px
  - Tags          150px
  - Status        90px
  - Actions       50px

Row Height:       ~40px
Border Bottom:    1px solid #f5f5f4
Hover BG:         #fafaf9
Selected BG:      (checkbox checked)
```

### Sidebar

```
Width:            240px (collapsible)
Type Row Height:  ~28px
Icon Size:        14px
Text:             13px, weight: 500
Count (on hover): 11px monospace
Background:       #ffffff
```

### Daily Notes

```
Header Height:    ~44px
Editor Padding:   20-32px (responsive)
Mini Calendar W:  200px
Calendar Day Size: ~24px x 24px
```

### Right Panel

```
Width:            ~280px
Section Padding:  12-16px
Text:             13px
Hidden for:       Daily notes
```

### Modal Dialog

```
Position:         Centered
Border-Radius:    8px
Shadow:           0 8px 32px rgba(0,0,0,0.12)
Padding:          16px
Title:            15px, weight: 600
Body:             13px
```

### Toast

```
Position:         Bottom-right
Padding:          12px 16px
Border-Radius:    6px
Background:       #292524
Text:             #ffffff
Shadow:           0 4px 12px rgba(0,0,0,0.15)
Duration:         ~3 seconds
```

---

## Loading & Empty States

### Skeleton

```
Background:  Linear gradient (shimmer)
Animation:   1.5s infinite
Gradient:    #f5f5f4 → #fafaf9 → #f5f5f4
Border-Radius: 4px
```

### Empty State

```
Icon:         40px+ (opacity 0.4)
Heading:      15px, weight: 500
Description:  13px body text
Button:       Primary button
Background:   #fafaf9
Border:       1px dashed #d6d3d1
```

---

## Keyboard Shortcuts Badge

```
Padding:       2px 6px
Font:          12px monospace
Background:    #fafaf9
Border:        1px solid #e7e5e4
Border-Radius: 4px
Color:         #44403c
```

### Common Shortcuts

```
⌘K   Command palette
⌘N   New note
⌘F   Search
T    Jump to today (daily notes)
```

---

## Status Indicators

### Colors

```
Error:       #e57373 (20% opacity bg: #e5737320)
Success:     #81c784 (20% opacity bg: #81c78420)
Warning:     #ffb74d (20% opacity bg: #ffb74d20)
Info:        #6495ED (20% opacity bg: #6495ED20)
```

### Text Colors (for badges)

```
Error:       #d32f2f (dark red)
Success:     #4caf50 (dark green)
Warning:     #f57c00 (dark orange)
Info:        #3d5fc2 (dark blue)
```

---

## Type Colors (Sidebar)

```
Notes:       #6495ED (cornflower)
Tasks:       #81c784 (green)
People:      #ffb74d (amber)
Projects:    #e57373 (red)
Resources:   #91a7ff (light blue)
```

---

## Dev Checklist (Copy & Paste)

```markdown
- [ ] Color tokens used (no hardcoded hex)
- [ ] 4px grid followed
- [ ] Font combo applied (size + weight + line-height)
- [ ] Border radius is 4px or 6px
- [ ] Focus ring added to interactive elements
- [ ] Animations use ease-out
- [ ] Min 36×36px touch targets
- [ ] States shown (hover, focus, active, disabled)
- [ ] Keyboard accessible
- [ ] Color contrast checked (WCAG AA)
```

---

## File References

**Main File:** `/docs/system/design_system.jsx`
**Full Breakdown:** `/docs/system/DESIGN_SYSTEM_BREAKDOWN.md`
**Inventory:** `/docs/system/COMPONENTS_INVENTORY.md`
**This Guide:** `/docs/system/QUICK_REFERENCE.md`

---

## Import Statements (for components)

```tsx
// Colors (use as CSS variables or direct hex)
const PRIMARY = '#6495ED';
const TEXT = '#44403c';
const BORDER = '#e7e5e4';
const HOVER_BG = '#fafaf9';

// Icons (from @phosphor-icons/react)
import { MagnifyingGlass, Plus, CaretDown, Check, X, ... } from '@phosphor-icons/react';

// Fonts
const fontSans = "'IBM Plex Sans', system-ui, sans-serif";
const fontMono = "'IBM Plex Mono', ui-monospace, monospace";
```

---

## CSS-in-JS Template

```tsx
// Button component example
const buttonStyles = {
  primary: {
    backgroundColor: '#6495ED',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 200ms ease-out',
    '&:hover': {
      backgroundColor: '#748ffc',
    },
    '&:focus': {
      boxShadow: '0 0 0 2px white, 0 0 0 4px #6495ED',
    },
  },
};
```

---

## Responsive Breakpoints (Implicit)

The design system uses fluid layouts rather than fixed breakpoints:

```
Content Padding:
  Small viewport:  24px
  Medium viewport: 48px
  Large viewport:  80px

Sidebar: Always fixed 240-260px (can collapse)
Right Panel: Always fixed 280px (hidden on daily notes)
```

---

## Color Accessibility

**Minimum Contrast Ratios:**

- Text on background: 4.5:1 (WCAG AA)
- Large text (18px+): 3:1
- UI components: 3:1

**Safe Combinations:**

- Dark text (#44403c) on white/light bg ✓
- Light text (#ffffff) on dark bg ✓
- Cornflower (#6495ED) as accent over gray ✓

---

## Animation Library

No animation library needed. Use CSS:

```css
/* Micro interaction */
transition: all 150ms ease-out;

/* Standard transition */
transition: all 200ms ease-out;

/* Shimmer skeleton */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Pulse dot (saving) */
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

---

**Last Updated:** 2026-01-10
**Source:** Design System Design System - `/docs/system/design_system.jsx`
