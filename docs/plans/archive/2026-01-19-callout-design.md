# Callout Block Design

## Overview

Callout blocks are highlighted content areas for drawing attention to important information. They feature an icon, colored background, and optional title with body content.

## Callout Types

| Type    | Color | Icon          | Use Case                      |
| ------- | ----- | ------------- | ----------------------------- |
| info    | blue  | Info          | General information, notes    |
| warning | amber | Warning       | Caution, potential issues     |
| tip     | green | Lightbulb     | Helpful hints, best practices |
| error   | red   | WarningCircle | Errors, critical warnings     |

## Visual Design

```
┌──────────────────────────────────────────────────────────────┐
│ [icon] Title (optional, editable)                            │
│ ─────────────────────────────────────────────────────────────│
│ Body content goes here. Supports all inline marks (bold,     │
│ italic, code, refs, tags).                                   │
│                                                              │
│ Can have multiple paragraphs and nested blocks.              │
└──────────────────────────────────────────────────────────────┘
```

### Styling

- **Border**: Left accent border (4px) in the callout color
- **Background**: Very subtle tint of the callout color (5-10% opacity)
- **Icon**: Phosphor icon in the callout color (16px)
- **Title**: Optional, editable, same line as icon
- **Body**: Standard editor content, full nested support

### Color Tokens

```css
/* Info (Blue) */
--callout-info-bg: color-mix(in srgb, var(--color-accent-500) 8%, transparent);
--callout-info-border: var(--color-accent-500);
--callout-info-icon: var(--color-accent-600);

/* Warning (Amber) */
--callout-warning-bg: color-mix(in srgb, #f59e0b 8%, transparent);
--callout-warning-border: #f59e0b;
--callout-warning-icon: #d97706;

/* Tip (Green) */
--callout-tip-bg: color-mix(in srgb, #22c55e 8%, transparent);
--callout-tip-border: #22c55e;
--callout-tip-icon: #16a34a;

/* Error (Red) */
--callout-error-bg: color-mix(in srgb, #ef4444 8%, transparent);
--callout-error-border: #ef4444;
--callout-error-icon: #dc2626;
```

## TipTap Extension

### Schema

```typescript
type: 'callout'
group: 'block'
content: 'block+'  // Allow nested blocks
attrs:
  calloutType: 'info' | 'warning' | 'tip' | 'error' (default: 'info')
```

### Extension Structure

```
extensions/
  Callout.ts           # TipTap Node extension
  CalloutView.tsx      # React NodeView component
```

### CalloutView Features

1. **Type selector dropdown** - Click icon to change callout type
2. **Full nested editing** - Body content supports all block types
3. **Keyboard shortcuts**:
   - Enter at end of callout exits to new paragraph
   - Backspace at start of empty callout converts to paragraph

## Slash Commands

Add 4 new slash commands:

| Command  | Keywords                | Action                 |
| -------- | ----------------------- | ---------------------- |
| /info    | info, note, callout     | Insert info callout    |
| /warning | warning, caution, alert | Insert warning callout |
| /tip     | tip, hint, idea         | Insert tip callout     |
| /error   | error, danger, critical | Insert error callout   |

## Input Rules (Optional)

Consider markdown-style input rules:

- `> [!info]` → Info callout
- `> [!warning]` → Warning callout
- `> [!tip]` → Tip callout
- `> [!error]` → Error callout

This matches Obsidian's callout syntax for familiarity.

## Implementation Steps

1. **Create Callout extension** (`Callout.ts`)
   - Define node schema with calloutType attribute
   - Configure content model for nested blocks
   - Add keyboard handling

2. **Create CalloutView** (`CalloutView.tsx`)
   - Render icon + type dropdown
   - Render nested NodeViewContent
   - Style with CSS classes

3. **Add CSS styles** (`editor.css`)
   - Callout container styles
   - Color variants for each type
   - Icon positioning

4. **Add slash commands** (`SlashCommand.ts`)
   - Add Info, Warning, Lightbulb, WarningCircle icons
   - Create 4 new command items

5. **Register extension** (`Editor.tsx`)
   - Import and add Callout extension to baseExtensions

6. **Create Ladle stories** (`Editor.stories.tsx`)
   - WithCallouts (all 4 types)
   - CalloutViaSlash
   - CalloutTypeChange
   - NestedCalloutContent

## Dependencies

- `@phosphor-icons/react`: Info, Warning, Lightbulb, WarningCircle icons
- Existing DropdownMenu primitive for type selector

## Testing Considerations

- Callout renders with correct type styling
- Type dropdown changes callout appearance
- Nested content (headings, lists, refs) works inside callout
- Slash command inserts callout at correct position
- Backspace at start of empty callout removes it
