# TypeNote Colors

## Mode

**Light mode primary.** Dark mode is a thoughtful adaptation.

## Gray Foundation

Mostly neutral with barely perceptible warmth. White for content.

```css
--white: #ffffff; /* Content background, cards */
--gray-50: #fafaf9; /* Very subtle warm off-white */
--gray-100: #f5f5f4; /* Sidebar, secondary surfaces */
--gray-200: #e7e5e4; /* Borders, dividers */
--gray-300: #d6d3d1; /* Stronger borders, hover states */
--gray-400: #a8a29e; /* Placeholder text */
--gray-500: #78716c; /* Muted/secondary text */
--gray-600: #57534e; /* Body text */
--gray-700: #44403c; /* Primary text */
--gray-800: #292524; /* Headlines */
--gray-900: #1c1917; /* Near-black emphasis */
```

## Accent: Cornflower Blue

Soft, literary, distinctive. Not harsh, not dusty.

```css
--accent-50: #f0f4ff; /* Hover backgrounds */
--accent-100: #dbe4ff; /* Selection, highlights */
--accent-200: #bac8ff; /* Light accent uses */
--accent-300: #91a7ff; /* Secondary accent */
--accent-400: #748ffc; /* Hover states */
--accent-500: #6495ed; /* PRIMARY - Cornflower Blue */
--accent-600: #5076d4; /* Pressed states */
--accent-700: #3d5fc2; /* Dark accent */
```

## Semantic Colors

Soft-but-clear, matching cornflower's energy.

```css
--error: #e57373; /* Soft coral-red */
--success: #81c784; /* Soft sage-green */
--warning: #ffb74d; /* Soft amber */
--info: #6495ed; /* Cornflower (same as accent) */
```

## Selection

```css
::selection {
  background: rgba(100, 149, 237, 0.25); /* Cornflower at 25% */
}
```

## Usage Rules

- **White** (`#ffffff`) for main content background
- **Gray** builds structure — color only for meaning
- **One accent** — cornflower blue for interactive elements
- **Semantic colors** for status only (error, success, warning)
- **No decorative color** — no gradients, no multiple accents
