# Multiselect Visual Refresh Design

**Date:** 2026-01-13
**Status:** Ready for implementation
**Reference:** Capacities-style option pills with TypeNote design principles

## Overview

Refresh the `MultiselectDropdown` component to feel more polished and intentional, adding colored option pills, an actions menu, and refined checkbox styling.

## Design Decisions

| Aspect         | Decision                                        |
| -------------- | ----------------------------------------------- |
| Option display | Colored pill/badge with soft pastel backgrounds |
| Color palette  | 12 colors (6 base × 2 variants: light/regular)  |
| Checkbox       | Keep square, add rounded corners (4px)          |
| Actions        | "..." menu with edit, delete, change color      |
| Drag handles   | Keep existing (already working)                 |

## Color Palette

6 base colors with light and regular variants:

| Color  | Light Variant                  | Regular Variant                 |
| ------ | ------------------------------ | ------------------------------- |
| Blue   | `bg-blue-50 text-blue-700`     | `bg-blue-100 text-blue-800`     |
| Green  | `bg-green-50 text-green-700`   | `bg-green-100 text-green-800`   |
| Amber  | `bg-amber-50 text-amber-700`   | `bg-amber-100 text-amber-800`   |
| Red    | `bg-red-50 text-red-700`       | `bg-red-100 text-red-800`       |
| Purple | `bg-violet-50 text-violet-700` | `bg-violet-100 text-violet-800` |
| Gray   | `bg-gray-100 text-gray-600`    | `bg-gray-200 text-gray-700`     |

Default for options without a color: `gray.light`

### Constants File

```typescript
// packages/design-system/src/constants/optionColors.ts

export const OPTION_COLORS = {
  blue: { light: 'bg-blue-50 text-blue-700', regular: 'bg-blue-100 text-blue-800' },
  green: { light: 'bg-green-50 text-green-700', regular: 'bg-green-100 text-green-800' },
  amber: { light: 'bg-amber-50 text-amber-700', regular: 'bg-amber-100 text-amber-800' },
  red: { light: 'bg-red-50 text-red-700', regular: 'bg-red-100 text-red-800' },
  purple: { light: 'bg-violet-50 text-violet-700', regular: 'bg-violet-100 text-violet-800' },
  gray: { light: 'bg-gray-100 text-gray-600', regular: 'bg-gray-200 text-gray-700' },
} as const;

export type OptionColor = keyof typeof OPTION_COLORS;
export type OptionColorVariant = 'light' | 'regular';

export function getOptionColorClasses(
  color: OptionColor = 'gray',
  variant: OptionColorVariant = 'light'
): string {
  return OPTION_COLORS[color][variant];
}
```

## Option Item Layout

```
┌─────────────────────────────────────────────────────────┐
│  ⋮⋮   [ Human          ]              ☐    •••         │
│  ↑         ↑                          ↑     ↑          │
│ drag    colored pill              checkbox  menu       │
│ handle  (pastel bg)               (rounded) (on hover) │
└─────────────────────────────────────────────────────────┘
```

### Spacing (4px grid)

- Row padding: `px-2 py-2` (8px × 8px)
- Gap between elements: `gap-2` (8px)
- Pill padding: `px-2 py-0.5` (8px × 2px)

### Pill Styling

```tsx
<span
  className={cn(
    'px-2 py-0.5 rounded text-sm font-medium',
    getOptionColorClasses(option.color, option.variant)
  )}
>
  {option.label}
</span>
```

## Actions Menu

Appears on row hover via "..." button.

### Menu Items

1. **Edit** — Rename the option inline
2. **Change color** — Opens color picker with 12 swatches
3. **Delete** — Remove option (confirm if option is in use)

### Menu Trigger

```tsx
<button
  className={cn(
    'opacity-0 group-hover:opacity-100',
    'p-1 rounded hover:bg-gray-100',
    'text-gray-400 hover:text-gray-600',
    'transition-opacity duration-150'
  )}
>
  <DotsThree className="w-4 h-4" weight="bold" />
</button>
```

### Color Picker

Grid of 12 color swatches (6 light + 6 regular):

```
┌──────────────────┐
│ Change color   › │
├──────────────────┤
│ ● ● ● ● ● ●     │  ← light variants
│ ● ● ● ● ● ●     │  ← regular variants
└──────────────────┘
```

Each swatch is a 20×20px circle with the background color, current selection shows a check mark.

## Data Model

### Updated Option Interface

```typescript
export interface MultiselectOption {
  value: string;
  label: string;
  color?: OptionColor; // 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray'
  variant?: OptionColorVariant; // 'light' | 'regular', defaults to 'light'
}
```

### Updated Props

```typescript
export interface MultiselectDropdownProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiselectOption[];
  onOptionsChange?: (options: MultiselectOption[]) => void; // Handles reorder, edit, delete, color
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}
```

### Migration

Existing options without `color` render as `gray.light` (default). No breaking changes.

## Checkbox Refinement

Add rounded corners to the existing square checkbox:

```tsx
// In Checkbox component
<input
  type="checkbox"
  className={cn(
    'rounded' // Add 4px border-radius
    // ... existing classes
  )}
/>
```

## Implementation Phases

### Phase 1: Foundation

- [ ] Create `constants/optionColors.ts`
- [ ] Update `Checkbox` with rounded corners
- [ ] Export color utilities

### Phase 2: Pill Display

- [ ] Update `SortableItem` to render colored pills
- [ ] Update `MultiselectOption` interface with color props
- [ ] Add default gray styling

### Phase 3: Actions Menu

- [ ] Add "..." button to option rows
- [ ] Create dropdown menu component
- [ ] Implement edit inline functionality
- [ ] Implement delete with confirmation
- [ ] Implement color picker submenu

### Phase 4: Stories & Polish

- [ ] Update Ladle stories with colored options
- [ ] Add color picker story
- [ ] Add actions menu interaction story
- [ ] Verify spacing and hover states

## Files Changed

| File                                          | Change                                |
| --------------------------------------------- | ------------------------------------- |
| `constants/optionColors.ts`                   | New file                              |
| `Checkbox/Checkbox.tsx`                       | Add `rounded` class                   |
| `MultiselectDropdown/MultiselectDropdown.tsx` | Colored pills, actions menu           |
| `MultiselectDropdown/types.ts`                | Update option interface (if separate) |
| `PropertyItem/PropertyItem.tsx`               | Update to pass color props            |
| `PropertyItem/PropertyItem.stories.tsx`       | Add colored option examples           |
