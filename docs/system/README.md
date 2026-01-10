# TypeNote Design System Documentation

Comprehensive reference for the TypeNote design system, colors, components, and patterns.

---

## Quick Start

**New to TypeNote design?** Start here:

1. **5 min overview:** Read [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) — Essential tokens and values
2. **15 min deep dive:** Read [COMPONENTS_INVENTORY.md](./COMPONENTS_INVENTORY.md) — What components exist
3. **Full reference:** See [DESIGN_SYSTEM_BREAKDOWN.md](./DESIGN_SYSTEM_BREAKDOWN.md) — Complete specs
4. **Interactive preview:** Open [design_system.jsx](./design_system.jsx) in a browser

---

## Files in This Directory

### Documentation

| File                           | Purpose                 | Read Time | For Whom             |
| ------------------------------ | ----------------------- | --------- | -------------------- |
| **QUICK_REFERENCE.md**         | Fast lookup guide       | 5 min     | Everyone             |
| **COMPONENTS_INVENTORY.md**    | Component catalog       | 15 min    | Implementers         |
| **DESIGN_SYSTEM_BREAKDOWN.md** | Complete specifications | 30 min    | Designers, Lead Devs |
| **README.md**                  | This file               | 5 min     | Everyone             |

### Source

| File                  | Purpose                   | Type            |
| --------------------- | ------------------------- | --------------- |
| **design_system.jsx** | Interactive design system | React component |

---

## Key Numbers

| Metric             | Count              |
| ------------------ | ------------------ |
| Color tokens       | 22                 |
| Typography scales  | 7 font sizes       |
| Font weights       | 3 levels           |
| Spacing units      | 9 steps (4px base) |
| UI components      | 15+ documented     |
| Complex components | 6+                 |
| States/variations  | 30+                |

---

## Core Design Principles

### 1. Minimal, Precise Design

- Clean, uncluttered interfaces
- Every pixel purposeful
- Inspired by Linear, Notion, Stripe

### 2. Warm Neutrals

- Grayscale foundation based on warm tones
- Never pure black/white — softer, warmer alternatives
- Creates inviting, readable interfaces

### 3. Cornflower Blue Accent

- Single primary brand color: `#6495ED`
- Used consistently for all interactive elements
- 8-step gradient for interactive states

### 4. Subtle, Smooth Interactions

- 150ms micro interactions (button hover)
- 200ms standard transitions (fade, slide)
- ease-out easing (no bounce)
- Focus rings for keyboard users (Apple-style)

### 5. Content First

- Large, readable typography (12px minimum)
- 1.5 line height for body text
- Plenty of whitespace

### 6. Accessible by Default

- Color contrast verified (WCAG AA)
- Minimum 36×36px touch targets
- Focus indicators on all interactive elements
- Keyboard navigation throughout

---

## Design System Structure

### Foundation Layer (Design Systems)

```
Colors
  ├── Grayscale (11 colors)
  ├── Cornflower Accent (8 colors)
  └── Semantic (4 colors: error, success, warning, info)

Typography
  ├── Font families (Sans, Mono)
  ├── 7-level type scale (12px–30px)
  ├── 3 font weights (400, 500, 600)
  ├── Line heights (tight, normal, relaxed)
  └── Letter spacing (tight, normal, wide)

Spacing & Layout
  ├── 4px base grid (9 units: 4px–48px)
  ├── 3-panel layout (sidebar, content, right panel)
  └── Interactive dimensions (buttons, touch targets)

Interactions
  ├── Borders & radius
  ├── Shadows (subtle, minimal)
  ├── Interactive states (hover, focus, active)
  └── Animation (150ms/200ms, ease-out)
```

### Component Layer

**Atomic Components** (standalone, reusable)

- Buttons (primary, secondary, danger, ghost)
- Text inputs
- Checkboxes
- Tags/badges
- Status badges
- Keyboard keys

**Composite Components** (multiple atoms)

- Cards
- Form groups
- Headers
- Footers
- Navigation items

**Complex Components** (full features)

- Type Browser (table with sort, filter, select)
- Left Sidebar (navigation, type list)
- Daily Notes (date nav, editor, mini calendar)
- Right Panel (backlinks, page info, settings)
- Overlays (command palette, toast, modal)

### State & Feedback Layer

- Loading states (skeleton placeholders)
- Empty states (icon + CTA)
- Error feedback
- Success confirmation (save status)
- Keyboard shortcuts
- Status indicators

---

## Color System at a Glance

### Grayscale Foundation

Used for: Text, borders, backgrounds, UI structure

```
Text Hierarchy:         gray-700 (primary) → gray-500 (muted)
Border Default:         gray-200 (#e7e5e4)
Border Hover/Strong:    gray-300 (#d6d3d1)
Background Light:       gray-50 (#fafaf9)
Headlines:              gray-800 (#292524)
```

### Cornflower Blue (Primary Brand)

Used for: Buttons, links, accents, active states

```
Primary:                #6495ED (accent-500)
Hover/Light:            #748ffc (accent-400)
Pressed/Dark:           #5076d4 (accent-600)
Backgrounds:            #f0f4ff (accent-50) — 20% tint
```

### Semantic Colors

Used for: Status feedback, validation

```
Error:                  #e57373
Success:                #81c784
Warning:                #ffb74d
Info:                   #6495ED (same as primary)
```

---

## Typography Quick Lookup

| Use Case  | Font | Size    | Weight | Line Height |
| --------- | ---- | ------- | ------ | ----------- |
| Body text | Sans | 15px    | 400    | 1.5         |
| Labels    | Sans | 13px    | 500    | 1.5         |
| Headings  | Sans | 20-24px | 600    | 1.25        |
| Code      | Mono | 13px    | 400    | 1.6         |
| Metadata  | Mono | 12px    | 400    | 1.5         |

---

## Component Categories

### Data Display

- **Type Browser** — Database-style table
  - Multi-select, sort, filter, column visibility
  - Bulk actions (archive, delete)
  - Used for: Browsing notes, tasks, people, etc.

- **Table Row** — Single data row with hover actions
- **Column Header** — Sortable, filterable headers
- **Status Badge** — Colored status indicators

### Navigation

- **Left Sidebar** — Type list, quick access, search
  - Search trigger (⌘K)
  - Calendar (opens daily notes)
  - Type items with icons
  - Bottom actions (archive, settings)

- **Daily Notes Layout** — Specialized editor for journals
  - Date navigation
  - Editor with title/content
  - Mini calendar with indicators

- **Right Panel** — Contextual information
  - Backlinks
  - Page info (created, modified, type)
  - Tags
  - Settings

### Forms & Input

- **Text Input** — Standard form field
- **Checkbox** — Multi-select, toggle
- **Button** — Primary, secondary, danger variants

### Feedback & Status

- **Toast** — Bottom-right notification
- **Modal** — Centered dialog (confirm, alert)
- **Command Palette** — Top-center command search
- **Loading State** — Skeleton placeholder with shimmer
- **Empty State** — Icon + message + CTA
- **Save Status** — Inline "Saving..." / "Saved" indicator

### Content

- **Card** — Container for related content
- **Tag** — Small label/chip
- **Badge** — Status indicator

---

## Implementation Examples

### Button

```tsx
// Primary
<button style={{
  backgroundColor: '#6495ED',
  color: '#fff',
  padding: '8px 16px',
  border: 'none',
  borderRadius: '6px',
  fontSize: '15px',
  fontWeight: 600,
  cursor: 'pointer',
}}>
  Primary Action
</button>

// Secondary
<button style={{
  backgroundColor: 'transparent',
  color: '#6495ED',
  border: '1px solid #6495ED',
  padding: '8px 16px',
  borderRadius: '6px',
  fontSize: '15px',
  fontWeight: 600,
}}>
  Secondary
</button>
```

### Text Input

```tsx
<input
  type="text"
  placeholder="Search..."
  style={{
    padding: '10px 12px',
    border: '1px solid #e7e5e4',
    borderRadius: '6px',
    fontSize: '15px',
    fontFamily: 'inherit',
    minHeight: '40px',
  }}
  onFocus={(e) => (e.target.style.borderColor = '#6495ED')}
  onBlur={(e) => (e.target.style.borderColor = '#e7e5e4')}
/>
```

### Status Badge

```tsx
// Success
<span style={{
  backgroundColor: '#81c78420',
  color: '#4caf50',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 500,
}}>
  Completed
</span>

// Error
<span style={{
  backgroundColor: '#e5737320',
  color: '#d32f2f',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 500,
}}>
  Overdue
</span>
```

### Focus Ring

```tsx
// Applied to interactive elements
style={{
  boxShadow: '0 0 0 2px white, 0 0 0 4px #6495ED',
}}
```

---

## Common Tasks

### "I need to build a button"

1. See [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#button-styles)
2. Choose: Primary, Secondary, or Danger variant
3. Use hex colors from reference
4. Apply hover state and focus ring
5. Check touch target (min 36×36px)

### "I need to add a table"

1. See [COMPONENTS_INVENTORY.md](./COMPONENTS_INVENTORY.md#1-type-browser-table)
2. Study Type Browser specs
3. Implement ColumnHeader, TableRow components
4. Add multi-select, sort, filter
5. Include bulk actions

### "I'm building a new view"

1. Check [DESIGN_SYSTEM_BREAKDOWN.md](./DESIGN_SYSTEM_BREAKDOWN.md#recommended-file-structure) for layout
2. Use 3-panel layout (sidebar, content, right panel)
3. Apply responsive padding (24px → 48px → 80px)
4. Add keyboard shortcuts
5. Include appropriate states (loading, empty, error)

### "I need colors"

1. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#color-tokens)
2. Use grayscale for structure (#e7e5e4 for borders)
3. Use cornflower (#6495ED) for interactive elements
4. Use semantic colors for feedback
5. Test color contrast

### "I'm unsure about spacing"

1. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md#spacing-scale-4px-base-grid)
2. Use 4px grid consistently
3. Common values: 8px, 12px, 16px, 24px
4. Padding & margins follow grid
5. Use space-4 (16px) as default section padding

---

## Design System Governance

### What's Documented Here

- Colors (22 tokens)
- Typography (7 scales, 3 weights)
- Spacing (9 units on 4px grid)
- 15+ components and patterns
- States and feedback patterns
- Layout structure (3-panel)

### What's Not (Yet)

- Component APIs / props
- React/Vue/Svelte implementations
- CSS/Tailwind classes
- Responsive breakpoints (uses fluid layout)
- Theme switching / dark mode
- Animation library details

### Adding New Components

1. Document in [COMPONENTS_INVENTORY.md](./COMPONENTS_INVENTORY.md)
2. Add to [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) if relevant
3. Add detailed specs to [DESIGN_SYSTEM_BREAKDOWN.md](./DESIGN_SYSTEM_BREAKDOWN.md)
4. Update this README if it changes core principles

---

## Related Files

**In this directory:**

- `design_system.jsx` — Interactive preview (open in React)

**In the repo:**

- `.claude/rules/` — Architecture & component rules
- `docs/foundational/` — Bootstrap plan, backend contract
- `docs/system/` — System documentation (this directory)

---

## Resources

### External Design References

- **Linear.app** — Minimal, precise design inspiration
- **Notion** — Clean, spacious layouts
- **Stripe** — Premium, professional brand colors
- **Apple Design System** — Focus rings, subtle animations

### Icon Library

- **Phosphor Icons** — All UI icons (@phosphor-icons/react)

### Fonts

- **IBM Plex Sans** — Primary font (clean, readable)
- **IBM Plex Mono** — Code/metadata font (monospace)
- Both: Google Fonts, open source

---

## Contributing to Design System

When proposing changes:

1. **Document thoroughly** — Add to DESIGN_SYSTEM_BREAKDOWN.md
2. **Include variants** — Show default, hover, active states
3. **Specify tokens** — Reference colors, spacing, typography
4. **Test accessibility** — Verify contrast, focus indicators
5. **Consider responsiveness** — How does it scale?
6. **Update references** — Keep QUICK_REFERENCE.md current

---

## Frequently Asked Questions

**Q: Can I use a different color?**
A: Only for exceptional cases. Use semantic colors for status, cornflower for interactive. Keep consistency.

**Q: What about dark mode?**
A: Not yet planned. Current design is light-mode only. Evaluate if needed later.

**Q: Can I use different spacing values?**
A: Stick to the 4px grid (4, 8, 12, 16, 20, 24, 32, 40, 48px). Consistency matters.

**Q: What's the minimum text size?**
A: 12px (text-xs) for fine print. 13px (text-sm) for labels. 15px (text-base) for body.

**Q: How do I make something stand out?**
A: Use font-weight 600 + size bump, or cornflower color, or increase padding. Not via color alone.

**Q: Can components have borders AND shadows?**
A: Prefer borders. Shadows are minimal and rare. Use for elevation when needed (modals, dropdowns).

**Q: What about animations? Transitions?**
A: Use 150ms for hover/micro, 200ms for transitions. Always ease-out. No spring/bounce.

---

## Changelog

### Version 1.0 (2026-01-10)

- Initial design system documentation
- 22 color tokens defined
- 15+ components documented
- Complete specifications for all systems
- Quick reference guide created
- Component inventory compiled

---

## License

The TypeNote design system is part of the TypeNote project. All components, specifications, and documentation are internal to TypeNote.

---

## Questions?

Refer to:

- [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for fast answers
- [COMPONENTS_INVENTORY.md](./COMPONENTS_INVENTORY.md) for component specs
- [DESIGN_SYSTEM_BREAKDOWN.md](./DESIGN_SYSTEM_BREAKDOWN.md) for detailed reference
- [design_system.jsx](./design_system.jsx) for interactive preview

---

**Last Updated:** 2026-01-10
**Source:** `/docs/system/design_system.jsx` (3,553 lines)
**Documentation:** Complete ✓
