# TypeNote Components

## Borders

```css
--border-width: 1px;
--border-color: var(--gray-200);
--border-hover: var(--gray-300);
--border-radius: 4px; /* Sharp system */
--border-radius-lg: 6px; /* Larger containers */
```

## Depth Strategy

Borders primary, shadows minimal.

```css
/* Primary: borders define structure */
--border-default: 1px solid var(--gray-200);
--border-strong: 1px solid var(--gray-300);

/* Secondary: subtle shadow for elevation */
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.06);
```

## Hover States

Background tint + border darkening.

```css
--hover-bg: var(--gray-50);
--hover-border: var(--gray-300);
```

## Focus Rings

Offset Apple-style.

```css
--focus-ring: 0 0 0 2px white, 0 0 0 4px var(--accent-500);
```

## Scrollbars

Thin overlay, appears on interaction.

```css
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-thumb {
  background: var(--gray-300);
  border-radius: 4px;
}
```

## Animation

```css
--duration-fast: 150ms; /* Micro-interactions */
--duration-normal: 200ms; /* Standard transitions */
--easing: ease-out; /* Fast start, gentle end */
```

**Rules:**

- No spring/bounce effects
- No animations longer than 300ms
- Prefer opacity and transform

## Modals

- **Command palette** (`⌘K`): Top-center, primary interaction
- **Centered + blur**: For focused tasks (settings, confirmations)
- **Backdrop:** Frosted glass blur, no darkening

## Toasts

- **Position:** Bottom-right
- **Animation:** Subtle slide-in
- **Duration:** 3-5 seconds

## Loading States

Skeleton placeholders.

```css
.skeleton {
  background: linear-gradient(90deg, var(--gray-100) 25%, var(--gray-50) 50%, var(--gray-100) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}
```

## Empty States

Functional, not passive:

- Search bar prominent
- Create button visible
- Guiding text (muted)

## Keyboard Shortcuts

Bordered key badges.

```css
.kbd {
  display: inline-flex;
  padding: 2px 6px;
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: 4px;
}
```

## Save Status

Inline, near content:

- "Saving..." — muted, subtle
- "Saved" — briefly shown, fades
- Auto-save by default

## Icons

**Library:** Phosphor Icons (`@phosphor-icons/react`)
**Weight:** Regular (1.5px stroke)

| Context      | Size    |
| ------------ | ------- |
| Default      | 20px    |
| Small/inline | 16px    |
| Empty states | 24-32px |

**Color:** Inherit, typically `--gray-500`
