# RefNode Hover State Design

## Summary

Improve the hover state for inline reference nodes (wiki-links/mentions) to provide clear "this is clickable" feedback through underline enhancement.

## Visual States

### Default State

- Black text (`text-foreground`)
- Type-colored icon (14px, regular weight)
- Type-colored underline: 1px solid, 70% opacity

### Hover State

- Same black text
- Same icon
- Type-colored underline: 2px solid, 100% opacity
- Cursor: pointer

### Transition

- 150ms ease-out on underline thickness and opacity

## Implementation

### Approach

Use a pseudo-element (`::after`) for the underline instead of CSS `text-decoration`. This provides:

- Control over thickness (height)
- Control over opacity
- Smooth transitions (text-decoration-thickness has poor browser support for animations)

Don't use the Link primitive — refs have specific needs (type colors, thickness animation) that don't generalize to all links.

### RefNodeView Component

```tsx
<span
  onClick={handleClick}
  className="ref-node inline-flex items-center gap-1 cursor-pointer"
  style={{ '--ref-color': refColor } as React.CSSProperties}
>
  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: refColor }} />
  <span className="ref-node-text">{displayTitle}</span>
</span>
```

### CSS (editor.css)

```css
/* Ref node underline */
.ref-node-text {
  position: relative;
}

.ref-node-text::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background-color: var(--ref-color);
  opacity: 0.7;
  transition:
    height 150ms ease-out,
    opacity 150ms ease-out;
}

.ref-node:hover .ref-node-text::after {
  height: 2px;
  opacity: 1;
}
```

## Files to Change

1. `packages/design-system/src/features/Editor/extensions/RefNodeView.tsx` — Replace Link primitive with custom span structure
2. `packages/design-system/src/features/Editor/editor.css` — Add ref node underline styles
