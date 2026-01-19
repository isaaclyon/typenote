---
paths: "packages/design-system/**/*.tsx", "apps/desktop/src/renderer/**/*.tsx"
---

# Design System Rules

This project uses a design system in `packages/design-system/` that ALL UI components must follow. These patterns ensure consistency, maintainability, and alignment with TypeNote's "focused calm" design philosophy.

## Philosophy

TypeNote's design is **focused calm** — minimal, precise, with subtle personality.

For design principles and decisions, see:

- `.claude/skills/design-principles/` — Design philosophy and approach
- `/docs/system/` — Detailed design specifications

## Package Structure

```
packages/design-system/
├── src/
│   ├── components/       # Current location (migration in progress)
│   ├── primitives/       # Foundational UI building blocks (target)
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── patterns/         # Reusable composed UI patterns (target)
│   │   ├── SearchInput/
│   │   │   ├── SearchInput.tsx
│   │   │   ├── SearchInput.stories.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── utils/            # Shared utilities (cn, etc.)
│   └── index.ts
├── .ladle/               # Ladle configuration
│   └── config.mjs
├── package.json
```

## Component Development Workflow

### 1. Build in Ladle Sandbox First

**🚨 MANDATORY: ALL UI components MUST be developed in Ladle BEFORE implementing in the desktop app. 🚨**

This is a non-negotiable requirement. Do NOT create or modify UI components directly in `apps/desktop/src/renderer/` without following this workflow:

1. **Create component in** `packages/design-system/src/primitives/` or `packages/design-system/src/patterns/`
2. **Write Ladle stories** covering all variants and states
3. **Test in Ladle sandbox** at http://localhost:61000
4. **Verify:**
   - Design tokens used correctly (no arbitrary values)
   - 4px spacing grid followed
   - All interactive states work (hover, focus, active, disabled)
   - Responsive behavior if needed
   - Accessibility (keyboard nav, ARIA)
5. **ONLY THEN** import and use in desktop app

```bash
# Start Ladle server
pnpm --filter @typenote/design-system sandbox

# Builds live at http://localhost:61000
```

**Why this is mandatory:**

- **Reusability** — Components built in isolation work everywhere
- **Fast iteration** — No app rebuilds, instant visual feedback
- **Visual regression testing** — Stories catch breaking changes
- **Quality assurance** — Forces variant coverage and edge case handling
- **Living documentation** — Ladle becomes the source of truth
- **Prevents design debt** — No ad-hoc, one-off components in app code

### 2. Build Sequence (Primitives → Patterns → Features)

Build components in this order:

1. **Primitives** — Smallest units (Button, Input, Icon)
2. **Patterns** — Reusable compositions (SearchInput, FormField)
3. **Features** — Domain-specific UI (Sidebar, TypeBrowser, InteractiveEditor)

**Example from Sidebar feature:**

```
1. SidebarTypeItem (pattern - button with icon/label/count)
2. SidebarSearchTrigger (pattern - button + Keycap)
3. SidebarTypesList (pattern - ScrollArea + TypeItems)
4. Sidebar (feature - compose all parts + data)
```

### 3. Component Architecture Patterns

#### Layering Rules (Primitives/Patterns/Features)

- **Primitives:** No domain nouns, no API calls, no routing, no IPC hooks.
- **Patterns:** Reusable composition, still no domain nouns or IPC hooks.
- **Features:** Domain-specific UI; can use IPC hooks, routing, and app state.

#### Graduation Rule

- Build in features first.
- Promote to patterns after 2–3 real uses across features.
- Promote to primitives rarely, only for universal building blocks.

#### Hooks Guidance

- ✅ Allowed in design-system: UI-only hooks (`useDisclosure`, `useKeyboardListNavigation`).
- ❌ Not allowed in design-system: IPC, data fetching, routing, or backend nouns.

#### Pattern A: Simple Component (Primitives/Patterns)

**Use when:** Component is self-contained with no sub-parts

```typescript
// Button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-accent-500 text-white hover:bg-accent-600',
        outline: 'border border-gray-300 hover:bg-gray-50',
      },
      size: {
        sm: 'h-7 px-3',
        md: 'h-9 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
```

#### Pattern B: Compound Component (Features)

**Use when:** Component has multiple sub-parts that can be composed, and includes domain data/behavior

```typescript
// Sidebar/index.ts
export { Sidebar } from './Sidebar.js';
export { SidebarTypeItem } from './SidebarTypeItem.js';
export { SidebarSearchTrigger } from './SidebarSearchTrigger.js';
export { SidebarSection } from './SidebarSection.js';
export { SidebarTypesList } from './SidebarTypesList.js';
export type * from './types.js';

// Usage in app:
import { Sidebar, SidebarTypeItem, SidebarTypesList } from '@typenote/design-system';

<Sidebar>
  <SidebarTypesList>
    <SidebarTypeItem label="Pages" count={42} />
  </SidebarTypesList>
</Sidebar>
```

**Benefits:**

- Flexibility — Compose parts differently per use case
- Discoverability — IDE autocomplete shows all sub-components
- Extensibility — Add custom content between components

### 4. Required Ladle Stories

Every component MUST have stories covering:

1. **Default** — Basic usage with common props
2. **All Variants** — Every variant/size combination
3. **Interactive** — User interactions (click, hover, focus)
4. **Edge Cases** — Empty states, loading, errors, overflow

**Example story structure:**

```typescript
// Sidebar.stories.tsx
import type { Story } from '@ladle/react';
import { Sidebar, SidebarTypeItem } from './index.js';

export const Default: Story = () => (
  <Sidebar>
    <SidebarTypeItem label="Pages" count={12} />
  </Sidebar>
);

export const AllVariants: Story = () => (
  <div className="space-y-4">
    <SidebarTypeItem label="Normal" count={5} />
    <SidebarTypeItem label="Selected" count={5} selected />
    <SidebarTypeItem label="With Color" count={5} color="#6495ED" />
  </div>
);

export const Interactive: Story = () => {
  const [selected, setSelected] = React.useState(0);
  return (
    <div>
      {items.map((item, i) => (
        <SidebarTypeItem
          key={i}
          selected={selected === i}
          onClick={() => setSelected(i)}
          {...item}
        />
      ))}
    </div>
  );
};

export const WithManyItems: Story = () => (
  <Sidebar>
    <SidebarTypesList>
      {Array.from({ length: 25 }).map((_, i) => (
        <SidebarTypeItem key={i} label={`Type ${i}`} count={i} />
      ))}
    </SidebarTypesList>
  </Sidebar>
);
```

## Using Design Tokens

**All design tokens (colors, spacing, typography) are defined in the design documentation.**

See `/docs/system/QUICK_REFERENCE.md` for copy-paste ready values.

**Key principles:**

- **Use the 4px spacing grid** — No arbitrary values like `gap-[13px]`
- **Use design tokens** — Reference existing Tailwind classes from the config
- **Don't create custom colors** — Use only colors defined in `tailwind.config.ts`
- **Check Ladle stories** — See existing components for token usage examples

## Styling Patterns

### 1. CSS-First Hover States (Prefer Over React State)

**Bad:** Managing hover with React state

```typescript
// DON'T: Unnecessary React state for hover
const [hovered, setHovered] = useState(false);

<div
  onMouseEnter={() => setHovered(true)}
  onMouseLeave={() => setHovered(false)}
>
  <span className={hovered ? 'opacity-100' : 'opacity-0'}>Count</span>
</div>
```

**Good:** Use CSS group hover

```typescript
// DO: CSS group hover (no React state)
<div className="group">
  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
    Count
  </span>
</div>
```

**Benefits:**

- Better performance (no re-renders)
- Simpler code (less state management)
- Smoother animations (CSS transitions)

### 2. Class Variance Authority (CVA) for Variants

**Use CVA for components with multiple variants:**

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const itemVariants = cva('base classes that always apply', {
  variants: {
    selected: {
      true: 'bg-accent-50 text-accent-700',
      false: 'hover:bg-gray-50',
    },
    size: {
      sm: 'h-6 text-xs',
      md: 'h-7 text-sm',
    },
  },
  defaultVariants: {
    selected: false,
    size: 'md',
  },
});

// Generate TypeScript types from CVA config
interface Props extends VariantProps<typeof itemVariants> {
  // ... other props
}
```

### 3. Tailwind cn() Utility for Class Merging

```typescript
import { cn } from '../../utils/cn.js';

// Merge classes with proper precedence
<div className={cn(
  'base-class',
  itemVariants({ variant }),
  conditionalClass && 'additional-class',
  className  // User override last
)} />
```

### 4. Transitions

**Pattern:** Fast, subtle transitions with ease-out timing.

```typescript
// Use Tailwind transition utilities
<div className="transition-colors duration-150 ease-out">
  // Color/background changes
</div>

<span className="transition-opacity duration-200">
  // Fade in/out
</span>
```

**Anti-pattern:** No spring/bounce animations — keep it simple and fast.

## TypeScript Patterns

### 1. Component Props with Ref Forwarding

```typescript
import * as React from 'react';

// Export props type for external use
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md';
}

// Use forwardRef for all components
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', ...props }, ref) => {
    return <button ref={ref} {...props} />;
  }
);

Button.displayName = 'Button';

export { Button };
```

### 2. Shared Types in types.ts

```typescript
// components/Sidebar/types.ts
import type { IconProps } from 'lucide-react';

export interface SidebarTypeItemProps {
  icon: React.ComponentType<IconProps>;
  label: string;
  count?: number;
  color?: string;
  selected?: boolean;
  onClick?: () => void;
}

export interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
  children: React.ReactNode;
}
```

### 3. Type-Safe Icon Props

```typescript
import type { LucideIcon } from 'lucide-react';
// OR
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

// Accept icon as component, render with consistent size
interface Props {
  icon: LucideIcon;
}

const Component = ({ icon: Icon }: Props) => (
  <Icon className="w-3.5 h-3.5" />
);
```

## Anti-Patterns to Avoid

### Workflow Violations (CRITICAL)

- [ ] **NEVER build components directly in desktop app** — ALWAYS start in design-system + Ladle
- [ ] **NEVER skip Ladle stories** — Every component needs stories before integration
- [ ] **NEVER copy/paste component code** into desktop app — Import from design-system package
- [ ] **NEVER create UI components in** `apps/desktop/src/renderer/ui/` **that should be in design-system**

### Styling

- [ ] No inline styles (except dynamic colors from props)
- [ ] No custom colors outside design tokens
- [ ] No arbitrary values like `w-[237px]` — use design tokens
- [ ] No mixing spacing systems (stick to 4px grid)
- [ ] No thick borders (>1px) on UI elements
- [ ] No shadows on flat UI elements (sidebar items, etc.)

### Component Architecture

- [ ] No tight coupling — components shouldn't require specific parent context
- [ ] No prop drilling — use composition over configuration
- [ ] No unused props — remove if not needed
- [ ] No default exports — always named exports

### TypeScript

- [ ] No `any` types — use proper types or `unknown`
- [ ] No missing displayName on forwardRef components
- [ ] No implicit children — type as `React.ReactNode`

## Integration with Desktop App

### Import from Design System

```typescript
// apps/desktop/src/renderer/App.tsx
import { Card, SearchInput } from '@typenote/design-system';

// NOT:
import { Card } from '../../../packages/design-system/src/primitives/Card';
```

### Desktop App Should NOT Duplicate Components

If a component exists in design-system, use it. Don't recreate in `apps/desktop/src/renderer/ui/`.

**Exception:** App-specific composed components (e.g., `AppShell` that wires up IPC) live in desktop app but use design-system primitives.

## Documentation Reference

For complete design specs, see:

- `/docs/system/QUICK_REFERENCE.md` — Copy-paste ready values
- `/docs/system/COMPONENTS_INVENTORY.md` — Component catalog
- `.claude/skills/design-principles/` — Design philosophy

## Quality Checklist

Before marking component "done":

- [ ] Component works in Ladle stories
- [ ] All variants have stories
- [ ] Interactive states work (hover, focus, active, disabled)
- [ ] Edge cases covered (empty, loading, overflow)
- [ ] Follows 4px spacing grid
- [ ] Uses design tokens (no arbitrary values)
- [ ] TypeScript types exported
- [ ] displayName set on forwardRef
- [ ] Responsive if needed
- [ ] Accessible (keyboard nav, ARIA if needed)
- [ ] No console errors in Ladle
