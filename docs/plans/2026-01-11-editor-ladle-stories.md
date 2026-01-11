# Editor Ladle Stories Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create Ladle stories for brand-aligned editor node designs to enable visual iteration before implementing in TipTap.

**Architecture:** Build static preview components in `packages/design-system/src/components/EditorPreview/` that demonstrate the styling patterns from `/docs/system/EDITOR.md`. These are not functional TipTap nodes, just visual representations using the design tokens for iteration.

**Tech Stack:** React, TypeScript, Tailwind CSS, Ladle, Lucide icons

---

## Task 1: EditorPreview Container Component

**Files:**

- Create: `packages/design-system/src/components/EditorPreview/EditorPreview.tsx`
- Create: `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`
- Create: `packages/design-system/src/components/EditorPreview/index.ts`

**Step 1: Create container component**

Create `packages/design-system/src/components/EditorPreview/EditorPreview.tsx`:

```tsx
import * as React from 'react';
import { cn } from '../../utils/cn.js';

interface EditorPreviewProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container for previewing editor content styling.
 * Provides the base .tiptap class context without TipTap.
 */
export function EditorPreview({ children, className }: EditorPreviewProps) {
  return (
    <div
      className={cn(
        'tiptap',
        'min-h-[200px] p-6 bg-white rounded border border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
}
```

**Step 2: Create basic story**

Create `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`:

```tsx
import type { Story } from '@ladle/react';
import { EditorPreview } from './EditorPreview.js';

export const Empty: Story = () => (
  <EditorPreview>
    <p className="text-gray-400">Start typing...</p>
  </EditorPreview>
);

export const WithContent: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">This is a paragraph with some content.</p>
  </EditorPreview>
);
```

**Step 3: Create barrel export**

Create `packages/design-system/src/components/EditorPreview/index.ts`:

```tsx
export { EditorPreview } from './EditorPreview.js';
export type * from './EditorPreview.js';
```

**Step 4: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Navigate to: EditorPreview stories
Expected: See empty and with-content previews

**Step 5: Commit**

```bash
git add packages/design-system/src/components/EditorPreview/
git commit -m "feat(design-system): add EditorPreview container component"
```

---

## Task 2: RefNode Preview Component

**Files:**

- Create: `packages/design-system/src/components/EditorPreview/RefNode.tsx`
- Modify: `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`

**Step 1: Create RefNode preview**

Create `packages/design-system/src/components/EditorPreview/RefNode.tsx`:

```tsx
import * as React from 'react';
import { FileText, Folder, User, BookOpen, CheckSquare } from 'lucide-react';
import { cn } from '../../utils/cn.js';

type ObjectType = 'note' | 'project' | 'person' | 'resource' | 'task';

interface RefNodeProps {
  type: ObjectType;
  label: string;
  className?: string;
}

const TYPE_CONFIG: Record<
  ObjectType,
  {
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    decorationClass: string;
  }
> = {
  note: {
    icon: FileText,
    colorClass: 'text-accent-500',
    decorationClass: 'decoration-accent-500',
  },
  task: {
    icon: CheckSquare,
    colorClass: 'text-success',
    decorationClass: 'decoration-success',
  },
  project: {
    icon: Folder,
    colorClass: 'text-error',
    decorationClass: 'decoration-error',
  },
  person: {
    icon: User,
    colorClass: 'text-warning',
    decorationClass: 'decoration-warning',
  },
  resource: {
    icon: BookOpen,
    colorClass: 'text-accent-300',
    decorationClass: 'decoration-accent-300',
  },
};

/**
 * RefNode preview - type-aware wiki-link styling.
 * Shows icon + underlined text in type's color.
 */
export function RefNode({ type, label, className }: RefNodeProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 cursor-pointer transition-colors', className)}
    >
      <Icon className={cn('h-3.5 w-3.5', config.colorClass)} />
      <span className={cn('underline text-gray-700 hover:text-gray-900', config.decorationClass)}>
        {label}
      </span>
    </span>
  );
}
```

**Step 2: Add RefNode stories**

Modify `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`:

```tsx
import type { Story } from '@ladle/react';
import { EditorPreview } from './EditorPreview.js';
import { RefNode } from './RefNode.js';

export const Empty: Story = () => (
  <EditorPreview>
    <p className="text-gray-400">Start typing...</p>
  </EditorPreview>
);

export const WithContent: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">This is a paragraph with some content.</p>
  </EditorPreview>
);

export const RefNodeAllTypes: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">
      Links to different types: <RefNode type="note" label="My Note" />,{' '}
      <RefNode type="project" label="My Project" />, <RefNode type="task" label="My Task" />,{' '}
      <RefNode type="person" label="John Doe" />, and{' '}
      <RefNode type="resource" label="Documentation" />.
    </p>
  </EditorPreview>
);

export const RefNodeInSentence: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">
      I'm working on <RefNode type="project" label="TypeNote Redesign" /> with{' '}
      <RefNode type="person" label="Sarah" /> to improve the{' '}
      <RefNode type="note" label="Editor Experience" />.
    </p>
  </EditorPreview>
);
```

**Step 3: Update barrel export**

Modify `packages/design-system/src/components/EditorPreview/index.ts`:

```tsx
export { EditorPreview } from './EditorPreview.js';
export { RefNode } from './RefNode.js';
export type * from './EditorPreview.js';
export type * from './RefNode.js';
```

**Step 4: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Navigate to: EditorPreview → RefNodeAllTypes
Expected: See all 5 type colors with icons and underlines

**Step 5: Commit**

```bash
git add packages/design-system/src/components/EditorPreview/
git commit -m "feat(design-system): add RefNode preview with type-aware styling"
```

---

## Task 3: TagNode Preview Component

**Files:**

- Create: `packages/design-system/src/components/EditorPreview/TagNode.tsx`
- Modify: `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`

**Step 1: Create TagNode preview**

Create `packages/design-system/src/components/EditorPreview/TagNode.tsx`:

```tsx
import * as React from 'react';
import { Hash } from 'lucide-react';
import { cn } from '../../utils/cn.js';

interface TagNodeProps {
  value: string;
  showIcon?: boolean;
  className?: string;
}

/**
 * TagNode preview - hashtag styling matching Tag component.
 */
export function TagNode({ value, showIcon = true, className }: TagNodeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-2 h-6 text-sm font-medium',
        'bg-gray-100 text-gray-700 hover:bg-accent-50',
        'cursor-pointer transition-colors duration-150',
        className
      )}
    >
      {showIcon && <Hash className="h-3 w-3" />}
      <span>{value}</span>
    </span>
  );
}
```

**Step 2: Add TagNode stories**

Modify `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`:

Add these stories:

```tsx
export const TagNodeVariations: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">
      Tags with icons: <TagNode value="project" /> <TagNode value="important" />{' '}
      <TagNode value="draft" />
    </p>
    <p className="my-2 text-gray-700">
      Tags without icons: <TagNode value="work" showIcon={false} />{' '}
      <TagNode value="personal" showIcon={false} />
    </p>
  </EditorPreview>
);

export const TagNodeInSentence: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">
      This note is tagged with <TagNode value="design-system" /> and{' '}
      <TagNode value="documentation" /> for easy discovery.
    </p>
  </EditorPreview>
);
```

**Step 3: Update barrel export**

Modify `packages/design-system/src/components/EditorPreview/index.ts`:

```tsx
export { EditorPreview } from './EditorPreview.js';
export { RefNode } from './RefNode.js';
export { TagNode } from './TagNode.js';
export type * from './EditorPreview.js';
export type * from './RefNode.js';
export type * from './TagNode.js';
```

**Step 4: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Navigate to: EditorPreview → TagNodeVariations
Expected: See gray pill tags with hover states

**Step 5: Commit**

```bash
git add packages/design-system/src/components/EditorPreview/
git commit -m "feat(design-system): add TagNode preview component"
```

---

## Task 4: MathInline Preview Component

**Files:**

- Create: `packages/design-system/src/components/EditorPreview/MathInline.tsx`
- Modify: `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`

**Step 1: Create MathInline preview**

Create `packages/design-system/src/components/EditorPreview/MathInline.tsx`:

```tsx
import * as React from 'react';
import { cn } from '../../utils/cn.js';

interface MathInlineProps {
  latex: string;
  className?: string;
}

/**
 * MathInline preview - inline LaTeX styled like code.
 */
export function MathInline({ latex, className }: MathInlineProps) {
  return (
    <code
      className={cn('rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-700', className)}
      title="Inline math (LaTeX)"
    >
      {latex}
    </code>
  );
}
```

**Step 2: Add MathInline stories**

Modify `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`:

Add:

```tsx
export const MathInlineVariations: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">
      Einstein's famous equation <MathInline latex="E = mc²" /> relates energy and mass.
    </p>
    <p className="my-2 text-gray-700">
      The quadratic formula is <MathInline latex="x = (-b ± √(b² - 4ac)) / 2a" />.
    </p>
  </EditorPreview>
);
```

**Step 3: Update barrel export**

Modify `packages/design-system/src/components/EditorPreview/index.ts`:

```tsx
export { EditorPreview } from './EditorPreview.js';
export { RefNode } from './RefNode.js';
export { TagNode } from './TagNode.js';
export { MathInline } from './MathInline.js';
export type * from './EditorPreview.js';
export type * from './RefNode.js';
export type * from './TagNode.js';
export type * from './MathInline.js';
```

**Step 4: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Navigate to: EditorPreview → MathInlineVariations
Expected: See gray monospace pills matching code style

**Step 5: Commit**

```bash
git add packages/design-system/src/components/EditorPreview/
git commit -m "feat(design-system): add MathInline preview component"
```

---

## Task 5: CalloutNode Preview Component

**Files:**

- Create: `packages/design-system/src/components/EditorPreview/CalloutNode.tsx`
- Modify: `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`

**Step 1: Create CalloutNode preview**

Create `packages/design-system/src/components/EditorPreview/CalloutNode.tsx`:

```tsx
import * as React from 'react';
import { Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';

type CalloutKind = 'info' | 'success' | 'warning' | 'error';

interface CalloutNodeProps {
  kind: CalloutKind;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const CALLOUT_CONFIG: Record<
  CalloutKind,
  {
    icon: React.ComponentType<{ className?: string }>;
    borderClass: string;
    bgClass: string;
    iconClass: string;
    defaultTitle: string;
  }
> = {
  info: {
    icon: Info,
    borderClass: 'border-l-accent-500',
    bgClass: 'bg-accent-50',
    iconClass: 'text-accent-700',
    defaultTitle: 'Note',
  },
  success: {
    icon: CheckCircle,
    borderClass: 'border-l-success',
    bgClass: 'bg-green-50',
    iconClass: 'text-green-700',
    defaultTitle: 'Success',
  },
  warning: {
    icon: AlertTriangle,
    borderClass: 'border-l-warning',
    bgClass: 'bg-amber-50',
    iconClass: 'text-amber-700',
    defaultTitle: 'Warning',
  },
  error: {
    icon: AlertCircle,
    borderClass: 'border-l-error',
    bgClass: 'bg-red-50',
    iconClass: 'text-red-700',
    defaultTitle: 'Error',
  },
};

/**
 * CalloutNode preview - semantic admonition blocks.
 */
export function CalloutNode({ kind, title, children, className }: CalloutNodeProps) {
  const config = CALLOUT_CONFIG[kind];
  const Icon = config.icon;
  const displayTitle = title ?? config.defaultTitle;

  return (
    <div
      className={cn('rounded-r border-l-4 p-4 my-2', config.borderClass, config.bgClass, className)}
    >
      <div className="flex items-center gap-2 font-medium mb-2">
        <Icon className={cn('h-4 w-4', config.iconClass)} />
        <span>{displayTitle}</span>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}
```

**Step 2: Add CalloutNode stories**

Modify `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`:

Add:

```tsx
export const CalloutNodeAllKinds: Story = () => (
  <EditorPreview>
    <CalloutNode kind="info">
      <p className="text-sm text-gray-700">This is an informational callout with useful context.</p>
    </CalloutNode>

    <CalloutNode kind="success">
      <p className="text-sm text-gray-700">
        Operation completed successfully! All changes have been saved.
      </p>
    </CalloutNode>

    <CalloutNode kind="warning">
      <p className="text-sm text-gray-700">
        Warning: This action cannot be undone. Proceed with caution.
      </p>
    </CalloutNode>

    <CalloutNode kind="error">
      <p className="text-sm text-gray-700">Error: Failed to save changes. Please try again.</p>
    </CalloutNode>
  </EditorPreview>
);

export const CalloutNodeCustomTitles: Story = () => (
  <EditorPreview>
    <CalloutNode kind="info" title="Pro Tip">
      <p className="text-sm text-gray-700">Use keyboard shortcuts to speed up your workflow.</p>
    </CalloutNode>

    <CalloutNode kind="warning" title="Breaking Change">
      <p className="text-sm text-gray-700">
        This version includes breaking API changes. Review the migration guide.
      </p>
    </CalloutNode>
  </EditorPreview>
);
```

**Step 3: Update barrel export**

Modify `packages/design-system/src/components/EditorPreview/index.ts`:

```tsx
export { EditorPreview } from './EditorPreview.js';
export { RefNode } from './RefNode.js';
export { TagNode } from './TagNode.js';
export { MathInline } from './MathInline.js';
export { CalloutNode } from './CalloutNode.js';
export type * from './EditorPreview.js';
export type * from './RefNode.js';
export type * from './TagNode.js';
export type * from './MathInline.js';
export type * from './CalloutNode.js';
```

**Step 4: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Navigate to: EditorPreview → CalloutNodeAllKinds
Expected: See 4 callouts with colored left borders and backgrounds

**Step 5: Commit**

```bash
git add packages/design-system/src/components/EditorPreview/
git commit -m "feat(design-system): add CalloutNode preview with semantic colors"
```

---

## Task 6: MathBlock Preview Component

**Files:**

- Create: `packages/design-system/src/components/EditorPreview/MathBlock.tsx`
- Modify: `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`

**Step 1: Create MathBlock preview**

Create `packages/design-system/src/components/EditorPreview/MathBlock.tsx`:

```tsx
import * as React from 'react';
import { cn } from '../../utils/cn.js';

interface MathBlockProps {
  latex: string;
  className?: string;
}

/**
 * MathBlock preview - display math in neutral container.
 */
export function MathBlock({ latex, className }: MathBlockProps) {
  return (
    <div
      className={cn(
        'rounded border border-gray-200 bg-gray-100 p-4 my-4',
        'flex flex-col items-center',
        className
      )}
    >
      <div className="text-xs text-gray-500 mb-2 self-start">Display Math</div>
      <pre className="font-mono text-sm text-center whitespace-pre-wrap w-full">{latex}</pre>
    </div>
  );
}
```

**Step 2: Add MathBlock stories**

Modify `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`:

Add:

```tsx
export const MathBlockVariations: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">The integral formula:</p>

    <MathBlock latex="∫₀^∞ e^(-x²) dx = √π/2" />

    <p className="my-2 text-gray-700">And the Pythagorean theorem:</p>

    <MathBlock latex="a² + b² = c²" />
  </EditorPreview>
);
```

**Step 3: Update barrel export**

Modify `packages/design-system/src/components/EditorPreview/index.ts`:

```tsx
export { EditorPreview } from './EditorPreview.js';
export { RefNode } from './RefNode.js';
export { TagNode } from './TagNode.js';
export { MathInline } from './MathInline.js';
export { CalloutNode } from './CalloutNode.js';
export { MathBlock } from './MathBlock.js';
export type * from './EditorPreview.js';
export type * from './RefNode.js';
export type * from './TagNode.js';
export type * from './MathInline.js';
export type * from './CalloutNode.js';
export type * from './MathBlock.js';
```

**Step 4: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Navigate to: EditorPreview → MathBlockVariations
Expected: See centered math with gray container and label

**Step 5: Commit**

```bash
git add packages/design-system/src/components/EditorPreview/
git commit -m "feat(design-system): add MathBlock preview component"
```

---

## Task 7: AttachmentNode Preview Component

**Files:**

- Create: `packages/design-system/src/components/EditorPreview/AttachmentNode.tsx`
- Modify: `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`

**Step 1: Create AttachmentNode preview**

Create `packages/design-system/src/components/EditorPreview/AttachmentNode.tsx`:

```tsx
import * as React from 'react';
import { Image } from 'lucide-react';
import { cn } from '../../utils/cn.js';

interface AttachmentNodeProps {
  src?: string;
  alt?: string;
  selected?: boolean;
  className?: string;
}

/**
 * AttachmentNode preview - image with optional selection state.
 */
export function AttachmentNode({
  src,
  alt = '',
  selected = false,
  className,
}: AttachmentNodeProps) {
  if (!src) {
    // Placeholder
    return (
      <div className="my-2">
        <div
          className={cn(
            'h-32 w-full rounded-lg border-2 border-dashed border-gray-300',
            'bg-gray-50 flex items-center justify-center',
            selected && 'ring-2 ring-accent-500',
            className
          )}
        >
          <Image className="h-8 w-8 text-gray-400" />
        </div>
      </div>
    );
  }

  // With image
  return (
    <div className="my-2">
      <div className={cn('relative inline-block rounded', className)}>
        <img
          src={src}
          alt={alt}
          className={cn('max-w-full rounded', selected && 'ring-2 ring-accent-500')}
        />
      </div>
    </div>
  );
}
```

**Step 2: Add AttachmentNode stories**

Modify `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`:

Add:

```tsx
export const AttachmentNodeStates: Story = () => (
  <EditorPreview>
    <p className="my-2 text-gray-700">Placeholder (no image):</p>
    <AttachmentNode />

    <p className="my-2 text-gray-700">Placeholder selected:</p>
    <AttachmentNode selected />

    <p className="my-2 text-gray-700">With image (use data URL for demo):</p>
    <AttachmentNode
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f5f5f4' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2378716c'%3EDemo Image%3C/text%3E%3C/svg%3E"
      alt="Demo"
    />

    <p className="my-2 text-gray-700">Image selected:</p>
    <AttachmentNode
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f5f5f4' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='20' fill='%2378716c'%3ESelected Image%3C/text%3E%3C/svg%3E"
      alt="Selected"
      selected
    />
  </EditorPreview>
);
```

**Step 3: Update barrel export**

Modify `packages/design-system/src/components/EditorPreview/index.ts`:

```tsx
export { EditorPreview } from './EditorPreview.js';
export { RefNode } from './RefNode.js';
export { TagNode } from './TagNode.js';
export { MathInline } from './MathInline.js';
export { CalloutNode } from './CalloutNode.js';
export { MathBlock } from './MathBlock.js';
export { AttachmentNode } from './AttachmentNode.js';
export type * from './EditorPreview.js';
export type * from './RefNode.js';
export type * from './TagNode.js';
export type * from './MathInline.js';
export type * from './CalloutNode.js';
export type * from './MathBlock.js';
export type * from './AttachmentNode.js';
```

**Step 4: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Navigate to: EditorPreview → AttachmentNodeStates
Expected: See placeholder and image states with selection rings

**Step 5: Commit**

```bash
git add packages/design-system/src/components/EditorPreview/
git commit -m "feat(design-system): add AttachmentNode preview component"
```

---

## Task 8: Prose Styling Story

**Files:**

- Modify: `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`

**Step 1: Add comprehensive prose story**

Modify `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`:

Add this story showcasing all prose elements:

```tsx
export const ProseAllElements: Story = () => (
  <EditorPreview>
    <h1 className="text-2xl font-semibold my-4 text-gray-800 leading-tight">Heading 1</h1>
    <h2 className="text-xl font-semibold my-3 text-gray-800 leading-tight">Heading 2</h2>
    <h3 className="text-lg font-semibold my-2 text-gray-800 leading-tight">Heading 3</h3>

    <p className="my-2 text-gray-700 leading-normal">
      This is a paragraph with <strong>bold text</strong> and <em>italic text</em>. Regular body
      copy uses 15px IBM Plex Sans with 1.5 line height.
    </p>

    <ul className="pl-6 my-2 text-gray-700 leading-normal list-disc">
      <li className="my-1">First bullet point</li>
      <li className="my-1">Second bullet point with more text</li>
      <li className="my-1">Third bullet point</li>
    </ul>

    <ol className="pl-6 my-2 text-gray-700 leading-normal list-decimal">
      <li className="my-1">First numbered item</li>
      <li className="my-1">Second numbered item</li>
      <li className="my-1">Third numbered item</li>
    </ol>

    <blockquote className="border-l-4 border-l-gray-200 pl-4 my-2 text-gray-500 leading-relaxed">
      This is a blockquote. It uses muted text color and has a left border accent. Line height is
      slightly more relaxed for better readability.
    </blockquote>

    <p className="my-2 text-gray-700">
      Inline code looks like this:{' '}
      <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-700">
        const x = 42;
      </code>
    </p>

    <pre className="rounded bg-gray-100 p-4 my-2 overflow-x-auto">
      <code className="font-mono text-sm text-gray-700">
        {`function example() {
  console.log("Code block");
  return true;
}`}
      </code>
    </pre>
  </EditorPreview>
);
```

**Step 2: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Navigate to: EditorPreview → ProseAllElements
Expected: See complete typography hierarchy with proper spacing

**Step 3: Commit**

```bash
git add packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx
git commit -m "feat(design-system): add prose styling story with all elements"
```

---

## Task 9: Combined Content Story

**Files:**

- Modify: `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`

**Step 1: Add realistic combined content story**

Modify `packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx`:

Add this story that mixes everything together:

```tsx
import { RefNode } from './RefNode.js';
import { TagNode } from './TagNode.js';
import { MathInline } from './MathInline.js';
import { CalloutNode } from './CalloutNode.js';
import { MathBlock } from './MathBlock.js';
import { AttachmentNode } from './AttachmentNode.js';

export const RealisticContent: Story = () => (
  <EditorPreview>
    <h1 className="text-2xl font-semibold my-4 text-gray-800 leading-tight">
      Project Meeting Notes
    </h1>

    <p className="my-2 text-gray-700">
      Meeting with <RefNode type="person" label="Sarah Chen" /> about{' '}
      <RefNode type="project" label="Q1 Product Launch" />. Tagged: <TagNode value="meeting" />{' '}
      <TagNode value="product" />
    </p>

    <CalloutNode kind="info" title="Key Takeaway">
      <p className="text-sm text-gray-700">
        Launch date confirmed for March 15th. All features must be code-complete by March 1st.
      </p>
    </CalloutNode>

    <h2 className="text-xl font-semibold my-3 text-gray-800 leading-tight">Action Items</h2>

    <ul className="pl-6 my-2 text-gray-700 leading-normal list-disc">
      <li className="my-1">
        Update <RefNode type="note" label="Technical Spec" /> with new requirements
      </li>
      <li className="my-1">
        Create <RefNode type="task" label="Design mockups for landing page" />
      </li>
      <li className="my-1">Review budget calculations</li>
    </ul>

    <h2 className="text-xl font-semibold my-3 text-gray-800 leading-tight">Budget Analysis</h2>

    <p className="my-2 text-gray-700">
      The cost formula is <MathInline latex="C = R × T × (1 + M)" /> where <MathInline latex="R" />{' '}
      is the resource rate, <MathInline latex="T" /> is time, and <MathInline latex="M" /> is the
      markup percentage.
    </p>

    <MathBlock latex="Total = $50/hr × 160hr × (1 + 0.15) = $9,200" />

    <CalloutNode kind="warning">
      <p className="text-sm text-gray-700">
        This exceeds our Q1 budget allocation by 15%. Need to discuss with{' '}
        <RefNode type="person" label="Finance Team" />.
      </p>
    </CalloutNode>

    <h2 className="text-xl font-semibold my-3 text-gray-800 leading-tight">Design Reference</h2>

    <AttachmentNode
      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='300'%3E%3Crect fill='%23f5f5f4' width='600' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2378716c'%3EMockup Screenshot%3C/text%3E%3C/svg%3E"
      alt="Landing page mockup"
    />

    <p className="my-2 text-gray-700">
      Related: <RefNode type="resource" label="Design System Guidelines" />
    </p>
  </EditorPreview>
);
```

**Step 2: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Navigate to: EditorPreview → RealisticContent
Expected: See complete document with all node types mixed naturally

**Step 3: Commit**

```bash
git add packages/design-system/src/components/EditorPreview/EditorPreview.stories.tsx
git commit -m "feat(design-system): add realistic combined content story"
```

---

## Task 10: Export from Design System

**Files:**

- Modify: `packages/design-system/src/components/index.ts`

**Step 1: Add EditorPreview exports**

Modify `packages/design-system/src/components/index.ts`:

Add at the end:

```tsx
// Editor Preview Components
export {
  EditorPreview,
  RefNode,
  TagNode,
  MathInline,
  CalloutNode,
  MathBlock,
  AttachmentNode,
} from './EditorPreview/index.js';
export type * from './EditorPreview/index.js';
```

**Step 2: Verify exports**

Run: `pnpm --filter @typenote/design-system build`
Expected: Clean build with no errors

**Step 3: Commit**

```bash
git add packages/design-system/src/components/index.ts
git commit -m "feat(design-system): export EditorPreview components"
```

---

## Final Verification

**Run complete check:**

```bash
# Type check
pnpm typecheck

# Lint
pnpm lint

# Build design-system
pnpm --filter @typenote/design-system build

# Start Ladle sandbox
pnpm --filter @typenote/design-system sandbox
```

**Expected results:**

- ✅ No type errors
- ✅ No lint errors
- ✅ Build succeeds
- ✅ Ladle shows all EditorPreview stories
- ✅ All stories render correctly with brand-aligned styling

**Ladle stories to verify:**

1. Empty
2. WithContent
3. RefNodeAllTypes
4. RefNodeInSentence
5. TagNodeVariations
6. TagNodeInSentence
7. MathInlineVariations
8. CalloutNodeAllKinds
9. CalloutNodeCustomTitles
10. MathBlockVariations
11. AttachmentNodeStates
12. ProseAllElements
13. RealisticContent

---

## Success Criteria

- [ ] All 13 Ladle stories render without errors
- [ ] Styling matches `/docs/system/EDITOR.md` specifications
- [ ] Components use TypeNote design tokens (accent-500, gray-\*, semantic colors)
- [ ] All components follow 4px spacing grid
- [ ] Hover states work on interactive elements
- [ ] Type colors match specification (Notes=cornflower, Projects=error, etc.)
- [ ] No TypeScript errors
- [ ] No lint errors
- [ ] Components exported from design-system package

---

## Notes

- These are **preview components**, not functional TipTap nodes
- Use for visual iteration before implementing in actual editor
- Can be used as reference when building real TipTap extensions
- All styling should match `/docs/system/EDITOR.md` exactly
