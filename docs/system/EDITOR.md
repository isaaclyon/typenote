# TypeNote Editor Design Specs

Design specifications for the TipTap-based editor, documenting styling for custom nodes, prose content, and interactive elements. This is the **brand-aligned future version** using TypeNote design tokens.

---

## Overview

The editor uses TipTap with custom React node views for rich content. All styling follows the TypeNote design system:

- **One accent color:** Cornflower blue (`#6495ED`)
- **Semantic colors:** Only for status (error, success, warning, info)
- **Gray foundation:** Neutral structure, warm undertones
- **4px grid:** All spacing follows the base grid
- **Minimal decoration:** Content-first, subtle interactions

**TipTap Concepts:**

- **Inline nodes:** Elements within text flow (links, tags, math)
- **Block nodes:** Standalone content blocks (callouts, images, math blocks)
- **Atom nodes:** Non-editable content rendered as React components
- **Prose:** Base content styling (headings, paragraphs, lists, code)

---

## Inline Nodes

### RefNode (Wiki-Links)

Type-aware links that inherit styling from the target object's type.

**Visual Pattern:** Icon + underlined text in type's color

| Property        | Value                              | Notes                   |
| --------------- | ---------------------------------- | ----------------------- |
| Display         | `inline-flex items-center gap-1.5` | Icon + text horizontal  |
| Icon            | Type's icon, `h-3.5 w-3.5` (14px)  | Left of text            |
| Text decoration | `underline` in type's color        | Type-specific underline |
| Text color      | `text-gray-700`                    | Inherits body text      |
| Cursor          | `cursor-pointer`                   | Interactive             |
| Transition      | `transition-colors duration-150`   | Smooth hover            |

**Type Color Mapping:**

| Object Type | Icon Color | Underline Color | Token                                       |
| ----------- | ---------- | --------------- | ------------------------------------------- |
| Notes       | Cornflower | Cornflower      | `text-accent-500` / `decoration-accent-500` |
| Tasks       | Green      | Green           | `text-success` / `decoration-success`       |
| Projects    | Red        | Red             | `text-error` / `decoration-error`           |
| People      | Amber      | Amber           | `text-warning` / `decoration-warning`       |
| Resources   | Light blue | Light blue      | `text-accent-300` / `decoration-accent-300` |

**Example Usage:**

```tsx
// Link to a Project (red)
<span className="inline-flex items-center gap-1.5 cursor-pointer transition-colors">
  <FolderIcon className="h-3.5 w-3.5 text-error" />
  <span className="underline decoration-error text-gray-700">My Project</span>
</span>

// Link to a Note (cornflower)
<span className="inline-flex items-center gap-1.5 cursor-pointer transition-colors">
  <FileTextIcon className="h-3.5 w-3.5 text-accent-500" />
  <span className="underline decoration-accent-500 text-gray-700">My Note</span>
</span>
```

**Hover State:**

```tsx
hover: text - gray - 900; // Slightly darker text on hover
```

---

### TagNode (Hashtags)

Matches the Tag component from the design system.

| Property      | Value                             | Notes                  |
| ------------- | --------------------------------- | ---------------------- |
| Background    | `bg-gray-100`                     | Subtle neutral         |
| Text          | `text-gray-700`                   | Primary text           |
| Padding       | `px-2` (8px horizontal)           | Comfortable pill       |
| Height        | `h-6` (24px)                      | Fixed height           |
| Border radius | `rounded` (4px)                   | Sharp corners          |
| Font          | `text-sm font-medium` (14px, 500) | Readable               |
| Hover         | `hover:bg-accent-50`              | Subtle cornflower tint |
| Cursor        | `cursor-pointer`                  | Interactive            |
| Transition    | `transition-colors duration-150`  | Smooth                 |

**Example Usage:**

```tsx
<span
  className="inline-flex items-center rounded px-2 h-6 text-sm font-medium
               bg-gray-100 text-gray-700 hover:bg-accent-50 cursor-pointer
               transition-colors duration-150"
>
  #project
</span>
```

**With Icon (optional):**

```tsx
<span
  className="inline-flex items-center gap-1 rounded px-2 h-6 text-sm font-medium
               bg-gray-100 text-gray-700 hover:bg-accent-50 cursor-pointer
               transition-colors duration-150"
>
  <HashIcon className="h-3 w-3" />
  <span>project</span>
</span>
```

---

### MathInline (LaTeX)

Inline math formulas styled like code.

| Property      | Value                       | Notes           |
| ------------- | --------------------------- | --------------- |
| Background    | `bg-gray-100`               | Same as code    |
| Text          | `text-gray-700`             | Body text color |
| Padding       | `px-1.5 py-0.5` (6px × 2px) | Tight pill      |
| Border radius | `rounded` (4px)             | Consistent      |
| Font          | `font-mono text-sm` (14px)  | Monospace       |

**Example Usage:**

```tsx
<code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-700">E = mc²</code>
```

---

## Block Nodes

### CalloutNode (Admonitions)

Callouts use semantic colors with subtle backgrounds and colored left borders.

**Available Types:**

| Type    | Border                | Background     | Icon Color        | Icon            |
| ------- | --------------------- | -------------- | ----------------- | --------------- |
| Info    | `border-l-accent-500` | `bg-accent-50` | `text-accent-700` | `Info`          |
| Success | `border-l-success`    | `bg-green-50`  | `text-green-700`  | `CheckCircle`   |
| Warning | `border-l-warning`    | `bg-amber-50`  | `text-amber-700`  | `AlertTriangle` |
| Error   | `border-l-error`      | `bg-red-50`    | `text-red-700`    | `AlertCircle`   |

**Structure:**

| Property       | Value                   | Notes                        |
| -------------- | ----------------------- | ---------------------------- |
| Border         | `border-l-4` (4px left) | Colored accent               |
| Border radius  | `rounded-r`             | Right side only (sharp left) |
| Padding        | `p-4` (16px all)        | Comfortable container        |
| Margin         | `my-2` (8px vertical)   | Space between blocks         |
| Icon size      | `h-4 w-4` (16px)        | Standard                     |
| Icon gap       | `gap-2` (8px)           | From title                   |
| Title font     | `font-medium` (500)     | Emphasized                   |
| Content indent | `pl-6` (24px)           | Aligns past icon             |

**Example Usage:**

```tsx
// Info callout
<div className="rounded-r border-l-4 border-l-accent-500 bg-accent-50 p-4 my-2">
  <div className="flex items-center gap-2 font-medium mb-2">
    <InfoIcon className="h-4 w-4 text-accent-700" />
    <span>Note</span>
  </div>
  <div className="pl-6">
    This is an informational callout.
  </div>
</div>

// Warning callout
<div className="rounded-r border-l-4 border-l-warning bg-amber-50 p-4 my-2">
  <div className="flex items-center gap-2 font-medium mb-2">
    <AlertTriangleIcon className="h-4 w-4 text-amber-700" />
    <span>Warning</span>
  </div>
  <div className="pl-6">
    This is a warning callout.
  </div>
</div>
```

**Custom Titles:**

Callouts can override the default title:

```tsx
<span>Custom Title Here</span> // Instead of "Note", "Warning", etc.
```

---

### MathBlock (Display Math)

Block-level LaTeX formulas in a neutral container.

| Property      | Value                      | Notes                  |
| ------------- | -------------------------- | ---------------------- |
| Background    | `bg-gray-100`              | Subtle gray            |
| Border        | `border border-gray-200`   | 1px all around         |
| Border radius | `rounded` (4px)            | Consistent             |
| Padding       | `p-4` (16px)               | Comfortable            |
| Margin        | `my-4` (16px vertical)     | More space than inline |
| Font          | `font-mono text-sm` (14px) | Monospace              |
| Text align    | `text-center`              | Math centered          |
| Label color   | `text-gray-500`            | Muted label            |
| Label size    | `text-xs` (12px)           | Small                  |

**Example Usage:**

```tsx
<div
  className="rounded border border-gray-200 bg-gray-100 p-4 my-4
               flex flex-col items-center"
>
  <div className="text-xs text-gray-500 mb-2 self-start">Display Math</div>
  <pre className="font-mono text-sm text-center whitespace-pre-wrap w-full">
    ∫₀^∞ e^(-x²) dx = √π/2
  </pre>
</div>
```

---

### AttachmentNode (Images)

Image blocks with optional selection state.

**With Image:**

| Property        | Value                    | Notes               |
| --------------- | ------------------------ | ------------------- |
| Margin          | `my-2` (8px vertical)    | Spacing             |
| Image max width | `max-w-full`             | Responsive          |
| Border radius   | `rounded` (4px)          | Consistent          |
| Selection ring  | `ring-2 ring-accent-500` | When selected       |
| Draggable       | `false`                  | Prevent native drag |

**Placeholder (Empty):**

| Property      | Value                                    | Notes                  |
| ------------- | ---------------------------------------- | ---------------------- |
| Height        | `h-32` (128px)                           | Fixed placeholder      |
| Width         | `w-full`                                 | Full width             |
| Background    | `bg-gray-50`                             | Subtle gray            |
| Border        | `border-2 border-dashed border-gray-300` | Dashed outline         |
| Border radius | `rounded-lg` (6px)                       | Slightly larger        |
| Icon size     | `h-8 w-8` (32px)                         | Large placeholder icon |
| Icon color    | `text-gray-400`                          | Muted                  |
| Display       | `flex items-center justify-center`       | Centered icon          |

**Example Usage:**

```tsx
// With image
<div className="my-2">
  <div className="relative inline-block rounded">
    <img
      src="attachment://abc123"
      alt="Diagram"
      className="max-w-full rounded ring-2 ring-accent-500"  // if selected
      draggable={false}
    />
  </div>
</div>

// Placeholder
<div className="my-2">
  <div className="h-32 w-full rounded-lg border-2 border-dashed border-gray-300
                 bg-gray-50 flex items-center justify-center">
    <ImageIcon className="h-8 w-8 text-gray-400" />
  </div>
</div>
```

---

## Prose Styling

Base content styles for the editor. All measurements follow the design system typography scale.

### Headings

| Element | Font Size         | Weight                | Margin        | Color           | Line Height            |
| ------- | ----------------- | --------------------- | ------------- | --------------- | ---------------------- |
| `h1`    | `text-2xl` (24px) | `font-semibold` (600) | `my-4` (16px) | `text-gray-800` | `leading-tight` (1.25) |
| `h2`    | `text-xl` (20px)  | `font-semibold` (600) | `my-3` (12px) | `text-gray-800` | `leading-tight` (1.25) |
| `h3`    | `text-lg` (17px)  | `font-semibold` (600) | `my-2` (8px)  | `text-gray-800` | `leading-tight` (1.25) |

**CSS:**

```css
.tiptap h1 {
  font-size: 1.5rem; /* 24px */
  font-weight: 600;
  margin: 1rem 0; /* 16px */
  color: var(--gray-800);
  line-height: 1.25;
}

.tiptap h2 {
  font-size: 1.25rem; /* 20px */
  font-weight: 600;
  margin: 0.75rem 0; /* 12px */
  color: var(--gray-800);
  line-height: 1.25;
}

.tiptap h3 {
  font-size: 1.0625rem; /* 17px */
  font-weight: 600;
  margin: 0.5rem 0; /* 8px */
  color: var(--gray-800);
  line-height: 1.25;
}
```

---

### Paragraphs & Text

| Element | Font Size          | Weight              | Margin       | Color           | Line Height            |
| ------- | ------------------ | ------------------- | ------------ | --------------- | ---------------------- |
| `p`     | `text-base` (15px) | `font-normal` (400) | `my-2` (8px) | `text-gray-700` | `leading-normal` (1.5) |

**CSS:**

```css
.tiptap p {
  font-size: 0.9375rem; /* 15px */
  font-weight: 400;
  margin: 0.5rem 0; /* 8px */
  color: var(--gray-700);
  line-height: 1.5;
}
```

---

### Lists

| Element    | Font Size          | Margin       | Padding       | Color           | Line Height            |
| ---------- | ------------------ | ------------ | ------------- | --------------- | ---------------------- |
| `ul`, `ol` | `text-base` (15px) | `my-2` (8px) | `pl-6` (24px) | `text-gray-700` | `leading-normal` (1.5) |
| `li`       | `text-base` (15px) | `my-1` (4px) | —             | `text-gray-700` | `leading-normal` (1.5) |

**CSS:**

```css
.tiptap ul,
.tiptap ol {
  padding-left: 1.5rem; /* 24px */
  margin: 0.5rem 0; /* 8px */
  color: var(--gray-700);
}

.tiptap li {
  margin: 0.25rem 0; /* 4px */
}
```

---

### Blockquotes

| Property     | Value                       | Notes               |
| ------------ | --------------------------- | ------------------- |
| Font size    | `text-base` (15px)          | Same as body        |
| Color        | `text-gray-500`             | Muted               |
| Border left  | `3px solid var(--gray-200)` | Accent bar          |
| Padding left | `pl-4` (16px)               | Indent              |
| Margin       | `my-2` (8px)                | Standard block      |
| Line height  | `leading-relaxed` (1.625)   | More breathing room |

**CSS:**

```css
.tiptap blockquote {
  border-left: 3px solid var(--gray-200);
  padding-left: 1rem; /* 16px */
  margin: 0.5rem 0; /* 8px */
  color: var(--gray-500);
  line-height: 1.625;
}
```

---

### Code

**Inline Code:**

| Property      | Value                       | Notes            |
| ------------- | --------------------------- | ---------------- |
| Background    | `bg-gray-100`               | Subtle highlight |
| Font          | `font-mono text-sm` (14px)  | Monospace        |
| Padding       | `px-1.5 py-0.5` (6px × 2px) | Tight pill       |
| Border radius | `rounded` (4px)             | Consistent       |
| Color         | `text-gray-700`             | Body text        |

**Code Blocks:**

| Property      | Value                      | Notes             |
| ------------- | -------------------------- | ----------------- |
| Background    | `bg-gray-100`              | Subtle gray       |
| Font          | `font-mono text-sm` (14px) | Monospace         |
| Padding       | `p-4` (16px)               | Comfortable       |
| Margin        | `my-2` (8px)               | Standard block    |
| Border radius | `rounded` (4px)            | Consistent        |
| Overflow      | `overflow-x-auto`          | Horizontal scroll |

**CSS:**

```css
.tiptap code {
  background: var(--gray-100);
  padding: 0.125rem 0.375rem; /* 2px 6px */
  border-radius: 0.25rem; /* 4px */
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.875rem; /* 14px */
  color: var(--gray-700);
}

.tiptap pre {
  background: var(--gray-100);
  padding: 1rem; /* 16px */
  border-radius: 0.25rem; /* 4px */
  overflow-x: auto;
  margin: 0.5rem 0; /* 8px */
}

.tiptap pre code {
  background: none;
  padding: 0;
}
```

---

### Placeholder

Empty editor placeholder text.

| Property       | Value           | Notes                  |
| -------------- | --------------- | ---------------------- |
| Color          | `text-gray-400` | Muted placeholder      |
| Float          | `left`          | Before first paragraph |
| Pointer events | `none`          | Non-interactive        |

**CSS:**

```css
.tiptap p.is-editor-empty:first-child::before {
  color: var(--gray-400);
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
```

**Usage:**

```tsx
<EditorContent editor={editor} placeholder="Start writing..." />
```

---

## Interactive Elements

### SlashCommandMenu Popup

Dropdown menu triggered by typing `/` in the editor.

**Container:**

| Property      | Value                         | Notes                        |
| ------------- | ----------------------------- | ---------------------------- |
| Background    | `bg-white`                    | Clean surface                |
| Border        | `border border-gray-200`      | 1px outline                  |
| Border radius | `rounded-md` (6px)            | Slightly larger              |
| Shadow        | `shadow-md`                   | `0 2px 4px rgba(0,0,0,0.06)` |
| Max height    | `max-h-[300px]`               | Scrollable                   |
| Overflow      | `overflow-y-auto`             | Vertical scroll              |
| Padding       | `py-1` (4px vertical)         | Tight container              |
| Z-index       | `z-[9999]`                    | Above all content            |
| Position      | Fixed, dynamically positioned | Via Floating UI              |

**Example:**

```tsx
<div className="fixed z-[9999]" style={{ left: '...', top: '...' }}>
  <div
    className="bg-white border border-gray-200 rounded-md shadow-md
                 max-h-[300px] overflow-y-auto py-1"
  >
    {/* Items */}
  </div>
</div>
```

---

### Command Item

Individual command in the slash menu.

| Property    | Value                            | Notes                  |
| ----------- | -------------------------------- | ---------------------- |
| Padding     | `px-3 py-2` (12px × 8px)         | Comfortable hit target |
| Hover bg    | `hover:bg-gray-50`               | Subtle highlight       |
| Selected bg | `bg-accent-50`                   | Cornflower tint        |
| Text        | `text-sm` (14px)                 | Readable               |
| Font weight | `font-normal` (400)              | Body weight            |
| Icon size   | `h-4 w-4` (16px)                 | Standard               |
| Gap         | `gap-2` (8px)                    | Icon to text           |
| Cursor      | `cursor-pointer`                 | Interactive            |
| Transition  | `transition-colors duration-150` | Smooth                 |

**Example:**

```tsx
<div
  className="px-3 py-2 hover:bg-gray-50 bg-accent-50 cursor-pointer
               transition-colors duration-150 flex items-center gap-2 text-sm"
>
  <HeadingIcon className="h-4 w-4 text-gray-500" />
  <span>Heading 1</span>
</div>
```

---

### Section Header

When commands are grouped (8+ items), sections have headers.

| Property       | Value                             | Notes                       |
| -------------- | --------------------------------- | --------------------------- |
| Padding        | `px-3 py-1.5` (12px × 6px)        | Less than items             |
| Text           | `text-xs font-medium` (12px, 500) | Small label                 |
| Color          | `text-gray-500`                   | Muted                       |
| Text transform | `uppercase`                       | All caps                    |
| Letter spacing | `tracking-wide` (0.025em)         | Spaced out                  |
| Margin top     | `mt-1` (4px)                      | Space from previous section |

**Example:**

```tsx
<div className="px-3 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wide mt-1">
  Basic
</div>
```

---

### Empty State

When no commands match the query.

| Property      | Value                    | Notes        |
| ------------- | ------------------------ | ------------ |
| Background    | `bg-white`               | Same as menu |
| Border        | `border border-gray-200` | Consistent   |
| Border radius | `rounded-md` (6px)       | Consistent   |
| Shadow        | `shadow-md`              | Consistent   |
| Padding       | `py-1 px-3` (4px × 12px) | Tight        |
| Text          | `text-sm` (14px)         | Readable     |
| Color         | `text-gray-500`          | Muted        |

**Example:**

```tsx
<div className="bg-white border border-gray-200 rounded-md shadow-md py-1 px-3">
  <div className="text-sm text-gray-500 py-2">No commands found</div>
</div>
```

---

## Quick Reference Table

### Inline Node Summary

| Node Type  | Background | Text Color | Border/Decoration      | Padding         | Height       |
| ---------- | ---------- | ---------- | ---------------------- | --------------- | ------------ |
| RefNode    | None       | `gray-700` | Underline (type color) | —               | Inline       |
| TagNode    | `gray-100` | `gray-700` | None                   | `px-2`          | `h-6` (24px) |
| MathInline | `gray-100` | `gray-700` | None                   | `px-1.5 py-0.5` | Inline       |

### Block Node Summary

| Node Type      | Background  | Border                   | Padding | Margin |
| -------------- | ----------- | ------------------------ | ------- | ------ |
| CalloutNode    | Semantic 50 | `border-l-4` (semantic)  | `p-4`   | `my-2` |
| MathBlock      | `gray-100`  | `border gray-200`        | `p-4`   | `my-4` |
| AttachmentNode | None        | None (or selection ring) | —       | `my-2` |

### Color Token Reference

| Token        | Hex       | Usage in Editor                   |
| ------------ | --------- | --------------------------------- |
| `accent-500` | `#6495ED` | RefNode (Notes), selection ring   |
| `accent-50`  | `#f0f4ff` | Callout info bg, hover states     |
| `accent-700` | `#3d5fc2` | Callout info text/icon            |
| `success`    | `#81c784` | RefNode (Tasks), callout success  |
| `error`      | `#e57373` | RefNode (Projects), callout error |
| `warning`    | `#ffb74d` | RefNode (People), callout warning |
| `gray-100`   | `#f5f5f4` | Tags, code, math inline           |
| `gray-200`   | `#e7e5e4` | Borders, blockquote accent        |
| `gray-400`   | `#a8a29e` | Placeholder text                  |
| `gray-500`   | `#78716c` | Blockquote text, section headers  |
| `gray-700`   | `#44403c` | Body text, primary content        |
| `gray-800`   | `#292524` | Headings                          |

---

## Implementation Notes

### TipTap Node Types

- **Inline nodes:** `group: 'inline', inline: true`
  - Used for: RefNode, TagNode, MathInline
  - Renders within text flow

- **Block nodes:** `group: 'block'`
  - Used for: CalloutNode, MathBlock, AttachmentNode
  - Standalone content blocks

- **Atom nodes:** `atom: true`
  - Non-editable React components
  - Used for all custom nodes

### CSS Variable Integration

All colors should reference design system CSS variables:

```css
/* From @typenote/design-system/tokens.css */
var(--color-accent-500)
var(--color-success)
var(--color-error)
var(--color-warning)
var(--color-gray-100)
var(--color-gray-700)
/* etc. */
```

### Tailwind Config

Ensure `tailwind.config.ts` includes TypeNote design tokens:

```typescript
theme: {
  extend: {
    colors: {
      accent: {
        50: '#f0f4ff',
        100: '#dbe4ff',
        // ... full accent scale
        500: '#6495ed',
        700: '#3d5fc2',
      },
      success: '#81c784',
      error: '#e57373',
      warning: '#ffb74d',
      gray: {
        // ... full gray scale
      },
    },
  },
}
```

---

## Related Documentation

- **Design System Overview:** `/docs/system/README.md`
- **Quick Reference:** `/docs/system/QUICK_REFERENCE.md`
- **Component Inventory:** `/docs/system/COMPONENTS_INVENTORY.md`
- **Design Principles:** `.claude/skills/design-principles/typenote/`

---

**Status:** Brand-aligned future version (not yet implemented)
**Next Steps:** Create Ladle stories to visualize and iterate on these designs
**Created:** 2026-01-11
**Last Updated:** 2026-01-11
