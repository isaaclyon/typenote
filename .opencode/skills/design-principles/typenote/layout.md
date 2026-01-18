# TypeNote Layout

## Spacing Grid

4px base for precision.

```css
--space-1: 4px; /* Micro: icon gaps */
--space-2: 8px; /* Small: within components */
--space-3: 12px; /* Medium: related elements */
--space-4: 16px; /* Standard: section padding */
--space-5: 20px; /* Comfortable gaps */
--space-6: 24px; /* Between sections */
--space-8: 32px; /* Major separation */
--space-10: 40px; /* Large gaps */
--space-12: 48px; /* Page-level spacing */
```

## App Structure

```
┌──────────────────────────────────────────────────────────────┐
│  Left Sidebar        │    Content Area    │   Right Panel    │
│  (collapsible)       │    (fluid)         │   (contextual)   │
│  240-260px           │                    │                  │
├──────────────────────┼────────────────────┼──────────────────┤
│  • Types             │                    │  • Backlinks     │
│  • Quick Access      │    Editor          │  • Page info     │
│  • Calendar          │                    │  • Settings      │
│  • Tasks             │                    │                  │
└──────────────────────┴────────────────────┴──────────────────┘
```

## Left Sidebar

- **Width:** 240-260px default
- **Collapsible:** Yes, for focus mode
- **Background:** White (`#ffffff`) with subtle right border
- **Contents:** Types, Quick Access (calendar, tasks, pinned)

## Content Area

- **Width:** Fluid (expands with window)
- **Padding:** Responsive
  - Small screens: 24px
  - Medium screens: 48px
  - Large screens: 80px
- **Background:** White (`#ffffff`)

## Right Panel

- **Contextual:** Appears based on content type
- **Background:** White (`#ffffff`)
- **Contents:** Backlinks, page info, settings

## Interactive Elements

- **Button/input height:** 36-40px
- **Minimum touch target:** 36px
- **Icon size:** 20px default, 16px small

## Responsive Behavior

- Sidebar collapses on narrow windows
- Right panel hides on narrow windows
- Content padding scales with available space
