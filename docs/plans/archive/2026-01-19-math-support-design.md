# Math Support Design

**Status:** Implemented
**Owner:** Design System
**Date:** 2026-01-19

## Goal

Add inline and block math support to the TypeNote editor using KaTeX for rendering.

## Requirements

- **Use case:** Occasional formulas (light LaTeX usage)
- **Inline syntax:** `$formula$` (e.g., `$x^2 + y^2 = z^2$`)
- **Block syntax:** `$$...$$` on its own line or `/math` slash command
- **Editing behavior:** Obsidian-style WYSIWYG — focused = raw LaTeX, blurred = rendered
- **Rendering:** KaTeX (fast, lightweight, industry standard)
- **Errors:** Show KaTeX's error message inline

## Implementation

### New Files

- `extensions/InlineMath.ts` — TipTap node for inline math
- `extensions/InlineMathView.tsx` — React view with focus toggle editing
- `extensions/MathBlock.ts` — TipTap node for block math
- `extensions/MathBlockView.tsx` — React view with input + live preview
- `extensions/katex-utils.ts` — `renderMath()` helper
- `extensions/katex-utils.test.ts` — Unit tests
- `stories/Editor.math.stories.tsx` — Ladle stories

### Modified Files

- `Editor.tsx` — Register InlineMath and MathBlock extensions
- `extensions/SlashCommand.ts` — Add `/math` command
- `extensions/index.ts` — Export math types and components
- `editor.css` — Math styling

### Architecture

**InlineMath:**

- `group: 'inline'`, `inline: true`, `atom: true`
- Single attribute: `latex: string`
- Input rule: `/(?<!\$)\$([^$]+)\$$/` (matches `$...$` but not `$$`)
- View: Click-to-edit pattern with timeout-guarded blur

**MathBlock:**

- `group: 'block'`, `content: 'text*'`
- Attribute: `latex: string` (for serialization)
- Input rule: `/^\$\$\s$/` (triggers on `$$ `)
- View: Dual-layer with editable NodeViewContent and KaTeX preview

### Styling

- Inline: Subtle background tint, cursor pointer, error class for invalid LaTeX
- Block: Rounded container with header, input area, preview area
- Dark mode: Uses `.dark` selector (not `:root.dark`)

## Testing

- 7 unit tests for `katex-utils.ts`
- 4 Ladle stories: InlineMath, MathBlocks, ErrorHandling, TryItOut

## Future Enhancements (Out of Scope)

- Equation numbering
- Cross-references to equations
- LaTeX autocomplete
- Math-specific keyboard shortcuts
