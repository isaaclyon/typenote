# InteractiveEditor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully functional TipTap-based editor component in the design system for Ladle stories.

**Architecture:** InteractiveEditor wraps TipTap with custom extensions adapted from the desktop app. Shared styling constants are extracted from EditorPreview components. Mock data enables wiki-link and slash command testing without IPC.

**Tech Stack:** TipTap, React, TypeScript, Tailwind, Ladle, Floating UI

---

## Phase 1: Foundation

### Task 1: Install TipTap Dependencies

**Files:**

- Modify: `packages/design-system/package.json`

**Step 1: Add TipTap dependencies**

```bash
cd /Users/isaaclyon/Developer/personal/typenote
pnpm --filter @typenote/design-system add @tiptap/react @tiptap/core @tiptap/pm @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-table @tiptap/extension-table-row @tiptap/extension-table-cell @tiptap/extension-table-header @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/suggestion @floating-ui/react
```

**Step 2: Verify installation**

Run: `pnpm --filter @typenote/design-system build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add packages/design-system/package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
feat(design-system): add TipTap dependencies for InteractiveEditor
EOF
)"
```

---

### Task 2: Extract Shared Constants

**Files:**

- Create: `packages/design-system/src/constants/editorConfig.ts`
- Create: `packages/design-system/src/constants/index.ts`
- Modify: `packages/design-system/src/components/EditorPreview/RefNode.tsx`
- Modify: `packages/design-system/src/components/EditorPreview/CalloutNode.tsx`

**Step 1: Create shared constants file**

Create `packages/design-system/src/constants/editorConfig.ts`:

```typescript
import {
  FileText,
  Folder,
  User,
  BookOpen,
  CheckSquare,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import type { ComponentType } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Object Type Configuration (for RefNode)
// ─────────────────────────────────────────────────────────────────────────────

export type ObjectType = 'note' | 'project' | 'person' | 'resource' | 'task';

export interface TypeConfig {
  icon: ComponentType<{ className?: string }>;
  colorClass: string;
  decorationClass: string;
}

export const TYPE_CONFIG: Record<ObjectType, TypeConfig> = {
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

// ─────────────────────────────────────────────────────────────────────────────
// Callout Configuration
// ─────────────────────────────────────────────────────────────────────────────

export type CalloutKind = 'info' | 'success' | 'warning' | 'error';

export interface CalloutConfig {
  icon: ComponentType<{ className?: string }>;
  bgClass: string;
  iconClass: string;
  defaultTitle: string;
}

export const CALLOUT_CONFIG: Record<CalloutKind, CalloutConfig> = {
  info: {
    icon: Info,
    bgClass: 'bg-accent-50',
    iconClass: 'text-accent-700',
    defaultTitle: 'Note',
  },
  success: {
    icon: CheckCircle,
    bgClass: 'bg-green-50',
    iconClass: 'text-green-700',
    defaultTitle: 'Success',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-amber-50',
    iconClass: 'text-amber-700',
    defaultTitle: 'Warning',
  },
  error: {
    icon: AlertCircle,
    bgClass: 'bg-red-50',
    iconClass: 'text-red-700',
    defaultTitle: 'Error',
  },
};
```

**Step 2: Create constants index**

Create `packages/design-system/src/constants/index.ts`:

```typescript
export * from './editorConfig.js';
```

**Step 3: Update RefNode to use shared constants**

Modify `packages/design-system/src/components/EditorPreview/RefNode.tsx`:

```typescript
import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { TYPE_CONFIG, type ObjectType } from '../../constants/editorConfig.js';

interface RefNodeProps {
  type: ObjectType;
  label: string;
  className?: string;
}

/**
 * RefNode preview - type-aware wiki-link styling.
 * Shows icon + underlined text in type's color.
 */
export function RefNode({ type, label, className }: RefNodeProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span
      className={cn('inline-flex items-center gap-1 cursor-pointer transition-colors', className)}
    >
      <Icon className={cn('h-3.5 w-3.5', config.colorClass)} />
      <span className={cn('underline text-gray-700 hover:text-gray-900', config.decorationClass)}>
        {label}
      </span>
    </span>
  );
}

export type { ObjectType };
```

**Step 4: Update CalloutNode to use shared constants**

Modify `packages/design-system/src/components/EditorPreview/CalloutNode.tsx`:

```typescript
import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { CALLOUT_CONFIG, type CalloutKind } from '../../constants/editorConfig.js';

interface CalloutNodeProps {
  kind: CalloutKind;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * CalloutNode preview - semantic admonition blocks.
 */
export function CalloutNode({ kind, title, children, className }: CalloutNodeProps) {
  const config = CALLOUT_CONFIG[kind];
  const Icon = config.icon;
  const displayTitle = title ?? config.defaultTitle;

  return (
    <div className={cn('rounded p-4 my-2', config.bgClass, className)}>
      <div className="flex items-center gap-2 font-medium mb-2">
        <Icon className={cn('h-4 w-4', config.iconClass)} />
        <span>{displayTitle}</span>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}

export type { CalloutKind };
```

**Step 5: Verify Ladle still works**

Run: `pnpm --filter @typenote/design-system sandbox`
Expected: Ladle starts, EditorPreview stories render correctly

**Step 6: Commit**

```bash
git add packages/design-system/src/constants packages/design-system/src/components/EditorPreview/RefNode.tsx packages/design-system/src/components/EditorPreview/CalloutNode.tsx
git commit -m "$(cat <<'EOF'
refactor(design-system): extract shared editor constants

Move TYPE_CONFIG and CALLOUT_CONFIG to shared constants for reuse
between EditorPreview and upcoming InteractiveEditor.
EOF
)"
```

---

### Task 3: Create InteractiveEditor Scaffold

**Files:**

- Create: `packages/design-system/src/components/InteractiveEditor/InteractiveEditor.tsx`
- Create: `packages/design-system/src/components/InteractiveEditor/types.ts`
- Create: `packages/design-system/src/components/InteractiveEditor/index.ts`

**Step 1: Create types file**

Create `packages/design-system/src/components/InteractiveEditor/types.ts`:

```typescript
import type { JSONContent } from '@tiptap/react';
import type { ObjectType } from '../../constants/editorConfig.js';

export interface MockNote {
  id: string;
  title: string;
  type: ObjectType;
}

export interface MockTag {
  id: string;
  value: string;
  color?: string;
}

export interface InteractiveEditorProps {
  /** Initial content in TipTap JSON format */
  initialContent?: JSONContent;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Called when content changes */
  onChange?: (content: JSONContent) => void;
  /** Called when editor loses focus */
  onBlur?: () => void;
  /** Called when editor gains focus */
  onFocus?: () => void;
  /** Whether the editor is editable (default: true) */
  editable?: boolean;
  /** Whether to focus on mount */
  autofocus?: boolean;
  /** Mock notes for wiki-link autocomplete */
  mockNotes?: MockNote[];
  /** Mock tags for tag autocomplete */
  mockTags?: MockTag[];
  /** Additional CSS classes */
  className?: string;
  /** Minimum height (e.g., "200px", "100%") */
  minHeight?: string;
}
```

**Step 2: Create main component**

Create `packages/design-system/src/components/InteractiveEditor/InteractiveEditor.tsx`:

```typescript
import * as React from 'react';
import { useEditor, EditorContent, type JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { cn } from '../../utils/cn.js';
import type { InteractiveEditorProps } from './types.js';

/**
 * InteractiveEditor - A fully functional TipTap editor for design system stories.
 *
 * Provides real editing capabilities with mocked autocomplete data for
 * wiki-links, tags, and slash commands.
 */
export function InteractiveEditor({
  initialContent,
  placeholder = 'Start typing...',
  onChange,
  onBlur,
  onFocus,
  editable = true,
  autofocus = false,
  className,
  minHeight = '200px',
}: InteractiveEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Customize StarterKit options as needed
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: false,
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableCell,
      TableHeader,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: initialContent,
    editable,
    autofocus,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    onBlur: () => {
      onBlur?.();
    },
    onFocus: () => {
      onFocus?.();
    },
  });

  return (
    <div
      className={cn('interactive-editor', className)}
      style={{ minHeight }}
    >
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none focus:outline-none"
      />
    </div>
  );
}
```

**Step 3: Create index file**

Create `packages/design-system/src/components/InteractiveEditor/index.ts`:

```typescript
export { InteractiveEditor } from './InteractiveEditor.js';
export type * from './types.js';
```

**Step 4: Verify build**

Run: `pnpm --filter @typenote/design-system build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add packages/design-system/src/components/InteractiveEditor
git commit -m "$(cat <<'EOF'
feat(design-system): add InteractiveEditor scaffold

Basic TipTap editor with StarterKit, tables, and task lists.
Foundation for adding custom extensions and stories.
EOF
)"
```

---

### Task 4: Create Basic Stories

**Files:**

- Create: `packages/design-system/src/components/InteractiveEditor/InteractiveEditor.stories.tsx`

**Step 1: Create stories file**

Create `packages/design-system/src/components/InteractiveEditor/InteractiveEditor.stories.tsx`:

```typescript
import type { Story } from '@ladle/react';
import { InteractiveEditor } from './InteractiveEditor.js';

export default {
  title: 'Components/InteractiveEditor',
};

export const Empty: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor placeholder="Start typing here..." />
  </div>
);

export const WithContent: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={{
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Welcome to the Editor' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is a ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'fully functional' },
              { type: 'text', text: ' TipTap editor with ' },
              { type: 'text', marks: [{ type: 'italic' }], text: 'inline formatting' },
              { type: 'text', text: '.' },
            ],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Try editing this content!' },
            ],
          },
        ],
      }}
    />
  </div>
);

export const ReadOnly: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      editable={false}
      initialContent={{
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This editor is read-only. You cannot edit this text.' },
            ],
          },
        ],
      }}
    />
  </div>
);

export const WithAutofocus: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      autofocus
      placeholder="This editor is focused on mount..."
    />
  </div>
);

export const CustomHeight: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      minHeight="400px"
      placeholder="This editor has a taller minimum height..."
    />
  </div>
);
```

**Step 2: Start Ladle and verify**

Run: `pnpm --filter @typenote/design-system sandbox`
Navigate to: http://localhost:61000
Expected: InteractiveEditor stories appear and are editable

**Step 3: Commit**

```bash
git add packages/design-system/src/components/InteractiveEditor/InteractiveEditor.stories.tsx
git commit -m "$(cat <<'EOF'
feat(design-system): add basic InteractiveEditor stories

Stories for empty, with content, read-only, autofocus, and custom height.
EOF
)"
```

---

### Task 5: Create BlockTypes Stories

**Files:**

- Create: `packages/design-system/src/components/InteractiveEditor/stories/BlockTypes.stories.tsx`

**Step 1: Create block types stories**

Create `packages/design-system/src/components/InteractiveEditor/stories/BlockTypes.stories.tsx`:

```typescript
import type { Story } from '@ladle/react';
import { InteractiveEditor } from '../InteractiveEditor.js';
import type { JSONContent } from '@tiptap/react';

export default {
  title: 'InteractiveEditor/Block Types',
};

const wrap = (content: JSONContent['content']): JSONContent => ({
  type: 'doc',
  content,
});

export const Headings: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'Heading 1' }] },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Heading 2' }] },
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'Heading 3' }] },
        { type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: 'Heading 4' }] },
        { type: 'heading', attrs: { level: 5 }, content: [{ type: 'text', text: 'Heading 5' }] },
        { type: 'heading', attrs: { level: 6 }, content: [{ type: 'text', text: 'Heading 6' }] },
      ])}
    />
  </div>
);
Headings.meta = {
  description: 'All heading levels from H1 to H6',
};

export const BulletList: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        { type: 'paragraph', content: [{ type: 'text', text: 'A bullet list:' }] },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First item' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second item' }] }] },
            {
              type: 'listItem',
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Third item with nested list:' }] },
                {
                  type: 'bulletList',
                  content: [
                    { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nested item A' }] }] },
                    { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Nested item B' }] }] },
                  ],
                },
              ],
            },
          ],
        },
      ])}
    />
  </div>
);

export const OrderedList: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        { type: 'paragraph', content: [{ type: 'text', text: 'An ordered list:' }] },
        {
          type: 'orderedList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First step' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second step' }] }] },
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Third step' }] }] },
          ],
        },
      ])}
    />
  </div>
);

export const TaskList: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        { type: 'paragraph', content: [{ type: 'text', text: 'A task list (click checkboxes!):' }] },
        {
          type: 'taskList',
          content: [
            { type: 'taskItem', attrs: { checked: true }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Completed task' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pending task' }] }] },
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Another pending task' }] }] },
          ],
        },
      ])}
    />
  </div>
);
TaskList.meta = {
  description: 'Interactive task list with checkboxes',
};

export const Blockquote: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        { type: 'paragraph', content: [{ type: 'text', text: 'A famous quote:' }] },
        {
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: '"The only way to do great work is to love what you do."' }] },
            { type: 'paragraph', content: [{ type: 'text', text: '— Steve Jobs' }] },
          ],
        },
      ])}
    />
  </div>
);

export const CodeBlock: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        { type: 'paragraph', content: [{ type: 'text', text: 'A code block:' }] },
        {
          type: 'codeBlock',
          attrs: { language: 'typescript' },
          content: [{ type: 'text', text: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}' }],
        },
      ])}
    />
  </div>
);

export const Table: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        { type: 'paragraph', content: [{ type: 'text', text: 'A simple table:' }] },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Name' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Role' }] }] },
                { type: 'tableHeader', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Status' }] }] },
              ],
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Alice' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Engineer' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Active' }] }] },
              ],
            },
            {
              type: 'tableRow',
              content: [
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bob' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Designer' }] }] },
                { type: 'tableCell', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Active' }] }] },
              ],
            },
          ],
        },
      ])}
    />
  </div>
);

export const HorizontalRule: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        { type: 'paragraph', content: [{ type: 'text', text: 'Content above the line' }] },
        { type: 'horizontalRule' },
        { type: 'paragraph', content: [{ type: 'text', text: 'Content below the line' }] },
      ])}
    />
  </div>
);

export const AllBlockTypes: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      minHeight="600px"
      initialContent={wrap([
        { type: 'heading', attrs: { level: 1 }, content: [{ type: 'text', text: 'All Block Types' }] },
        { type: 'paragraph', content: [{ type: 'text', text: 'This story demonstrates all available block types in the editor.' }] },

        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Lists' }] },
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bullet item' }] }] },
          ],
        },
        {
          type: 'orderedList',
          content: [
            { type: 'listItem', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ordered item' }] }] },
          ],
        },
        {
          type: 'taskList',
          content: [
            { type: 'taskItem', attrs: { checked: false }, content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task item' }] }] },
          ],
        },

        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Quote & Code' }] },
        {
          type: 'blockquote',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'A blockquote' }] },
          ],
        },
        {
          type: 'codeBlock',
          content: [{ type: 'text', text: 'const x = 42;' }],
        },

        { type: 'horizontalRule' },
        { type: 'paragraph', content: [{ type: 'text', text: 'End of demo.' }] },
      ])}
    />
  </div>
);
AllBlockTypes.meta = {
  description: 'Comprehensive showcase of all block types',
};
```

**Step 2: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Navigate to: http://localhost:61000
Expected: All block type stories render and are editable

**Step 3: Commit**

```bash
git add packages/design-system/src/components/InteractiveEditor/stories
git commit -m "$(cat <<'EOF'
feat(design-system): add BlockTypes stories for InteractiveEditor

Stories for headings, lists, task lists, blockquotes, code blocks,
tables, and horizontal rules.
EOF
)"
```

---

### Task 6: Create InlineFormatting Stories

**Files:**

- Create: `packages/design-system/src/components/InteractiveEditor/stories/InlineFormatting.stories.tsx`
- Create: `packages/design-system/src/components/InteractiveEditor/components/ShortcutHints.tsx`

**Step 1: Create ShortcutHints component**

Create `packages/design-system/src/components/InteractiveEditor/components/ShortcutHints.tsx`:

```typescript
import * as React from 'react';
import { KeyboardKey } from '../../KeyboardKey/KeyboardKey.js';
import { cn } from '../../../utils/cn.js';

interface ShortcutHint {
  keys: string[];
  action: string;
}

interface ShortcutHintsProps {
  hints: ShortcutHint[];
  className?: string;
}

/**
 * Shows keyboard shortcuts as visual hints in stories.
 */
export function ShortcutHints({ hints, className }: ShortcutHintsProps) {
  return (
    <div className={cn('bg-gray-50 rounded-lg p-3 text-xs', className)}>
      <div className="font-medium mb-2 text-gray-500">Shortcuts</div>
      <div className="space-y-1.5">
        {hints.map((hint, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {hint.keys.map((key, j) => (
                <KeyboardKey key={j}>{key}</KeyboardKey>
              ))}
            </div>
            <span className="text-gray-600">{hint.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Create inline formatting stories**

Create `packages/design-system/src/components/InteractiveEditor/stories/InlineFormatting.stories.tsx`:

```typescript
import type { Story } from '@ladle/react';
import { InteractiveEditor } from '../InteractiveEditor.js';
import { ShortcutHints } from '../components/ShortcutHints.js';
import type { JSONContent } from '@tiptap/react';

export default {
  title: 'InteractiveEditor/Inline Formatting',
};

const wrap = (content: JSONContent['content']): JSONContent => ({
  type: 'doc',
  content,
});

const isMac = typeof navigator !== 'undefined' && navigator.platform.includes('Mac');
const mod = isMac ? '⌘' : 'Ctrl';

export const Bold: Story = () => (
  <div className="flex gap-4">
    <div className="flex-1 p-4 border rounded-lg bg-white">
      <InteractiveEditor
        initialContent={wrap([
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Select text and press ' },
              { type: 'text', marks: [{ type: 'bold' }], text: `${mod}+B` },
              { type: 'text', text: ' to make it ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'bold' },
              { type: 'text', text: '.' },
            ],
          },
        ])}
      />
    </div>
    <ShortcutHints hints={[{ keys: [mod, 'B'], action: 'Bold' }]} />
  </div>
);

export const Italic: Story = () => (
  <div className="flex gap-4">
    <div className="flex-1 p-4 border rounded-lg bg-white">
      <InteractiveEditor
        initialContent={wrap([
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Select text and press ' },
              { type: 'text', marks: [{ type: 'code' }], text: `${mod}+I` },
              { type: 'text', text: ' to make it ' },
              { type: 'text', marks: [{ type: 'italic' }], text: 'italic' },
              { type: 'text', text: '.' },
            ],
          },
        ])}
      />
    </div>
    <ShortcutHints hints={[{ keys: [mod, 'I'], action: 'Italic' }]} />
  </div>
);

export const Code: Story = () => (
  <div className="flex gap-4">
    <div className="flex-1 p-4 border rounded-lg bg-white">
      <InteractiveEditor
        initialContent={wrap([
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Select text and press ' },
              { type: 'text', marks: [{ type: 'code' }], text: `${mod}+E` },
              { type: 'text', text: ' to make it ' },
              { type: 'text', marks: [{ type: 'code' }], text: 'inline code' },
              { type: 'text', text: '.' },
            ],
          },
        ])}
      />
    </div>
    <ShortcutHints hints={[{ keys: [mod, 'E'], action: 'Inline code' }]} />
  </div>
);

export const Strikethrough: Story = () => (
  <div className="flex gap-4">
    <div className="flex-1 p-4 border rounded-lg bg-white">
      <InteractiveEditor
        initialContent={wrap([
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Select text and press ' },
              { type: 'text', marks: [{ type: 'code' }], text: `${mod}+Shift+S` },
              { type: 'text', text: ' to make it ' },
              { type: 'text', marks: [{ type: 'strike' }], text: 'strikethrough' },
              { type: 'text', text: '.' },
            ],
          },
        ])}
      />
    </div>
    <ShortcutHints hints={[{ keys: [mod, 'Shift', 'S'], action: 'Strikethrough' }]} />
  </div>
);

export const AllFormats: Story = () => (
  <div className="flex gap-4">
    <div className="flex-1 p-4 border rounded-lg bg-white">
      <InteractiveEditor
        initialContent={wrap([
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Inline Formatting Examples' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'You can combine ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'bold' },
              { type: 'text', text: ', ' },
              { type: 'text', marks: [{ type: 'italic' }], text: 'italic' },
              { type: 'text', text: ', ' },
              { type: 'text', marks: [{ type: 'code' }], text: 'code' },
              { type: 'text', text: ', and ' },
              { type: 'text', marks: [{ type: 'strike' }], text: 'strikethrough' },
              { type: 'text', text: '.' },
            ],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'You can also combine marks: ' },
              { type: 'text', marks: [{ type: 'bold' }, { type: 'italic' }], text: 'bold italic' },
              { type: 'text', text: ' or ' },
              { type: 'text', marks: [{ type: 'bold' }, { type: 'code' }], text: 'bold code' },
              { type: 'text', text: '.' },
            ],
          },
        ])}
      />
    </div>
    <ShortcutHints
      hints={[
        { keys: [mod, 'B'], action: 'Bold' },
        { keys: [mod, 'I'], action: 'Italic' },
        { keys: [mod, 'E'], action: 'Inline code' },
        { keys: [mod, 'Shift', 'S'], action: 'Strikethrough' },
      ]}
    />
  </div>
);
AllFormats.meta = {
  description: 'All inline formatting options with keyboard shortcuts',
};
```

**Step 3: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Expected: Inline formatting stories work, shortcuts displayed

**Step 4: Commit**

```bash
git add packages/design-system/src/components/InteractiveEditor/components packages/design-system/src/components/InteractiveEditor/stories/InlineFormatting.stories.tsx
git commit -m "$(cat <<'EOF'
feat(design-system): add InlineFormatting stories with ShortcutHints

Stories for bold, italic, code, strikethrough with visual keyboard hints.
EOF
)"
```

---

### Task 7: Export InteractiveEditor from Design System

**Files:**

- Modify: `packages/design-system/src/components/index.ts`
- Modify: `packages/design-system/src/index.ts`

**Step 1: Add to components index**

Add to `packages/design-system/src/components/index.ts`:

```typescript
// ... existing exports ...
export * from './InteractiveEditor/index.js';
```

**Step 2: Add constants export to main index**

Add to `packages/design-system/src/index.ts`:

```typescript
// ... existing exports ...
export * from './constants/index.js';
```

**Step 3: Verify build and exports**

Run: `pnpm --filter @typenote/design-system build`
Expected: Build succeeds, InteractiveEditor is exported

**Step 4: Commit**

```bash
git add packages/design-system/src/components/index.ts packages/design-system/src/index.ts
git commit -m "$(cat <<'EOF'
feat(design-system): export InteractiveEditor and constants
EOF
)"
```

---

## Phase 2: Rich Blocks (Callout, Math, Highlight)

### Task 8: Add CalloutNode Extension

**Files:**

- Create: `packages/design-system/src/components/InteractiveEditor/extensions/CalloutNode.tsx`
- Create: `packages/design-system/src/components/InteractiveEditor/extensions/index.ts`
- Modify: `packages/design-system/src/components/InteractiveEditor/InteractiveEditor.tsx`

**Step 1: Create CalloutNode extension**

Create `packages/design-system/src/components/InteractiveEditor/extensions/CalloutNode.tsx`:

```typescript
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { cn } from '../../../utils/cn.js';
import { CALLOUT_CONFIG, type CalloutKind } from '../../../constants/editorConfig.js';

interface CalloutNodeAttrs {
  kind: CalloutKind;
}

function CalloutNodeView({ node }: NodeViewProps) {
  const attrs = node.attrs as CalloutNodeAttrs;
  const kind = attrs.kind || 'info';
  const config = CALLOUT_CONFIG[kind];
  const Icon = config.icon;

  return (
    <NodeViewWrapper>
      <div className={cn('rounded p-4 my-2', config.bgClass)}>
        <div className="flex items-center gap-2 font-medium mb-2">
          <Icon className={cn('h-4 w-4', config.iconClass)} />
          <span>{config.defaultTitle}</span>
        </div>
        <div className="pl-6">
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',

  addAttributes() {
    return {
      kind: {
        default: 'info',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-kind') ?? 'info',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-kind': attributes['kind'] as string,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },
});
```

**Step 2: Create extensions index**

Create `packages/design-system/src/components/InteractiveEditor/extensions/index.ts`:

```typescript
export { CalloutNode } from './CalloutNode.js';
```

**Step 3: Add to InteractiveEditor**

Modify `packages/design-system/src/components/InteractiveEditor/InteractiveEditor.tsx` to add the import and extension:

```typescript
// Add import at top
import { CalloutNode } from './extensions/index.js';

// Add to extensions array after TaskItem
CalloutNode,
```

**Step 4: Create callout story**

Add to `packages/design-system/src/components/InteractiveEditor/stories/BlockTypes.stories.tsx`:

```typescript
export const Callouts: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        { type: 'paragraph', content: [{ type: 'text', text: 'Callout blocks for different purposes:' }] },
        {
          type: 'callout',
          attrs: { kind: 'info' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This is an info callout for general notes.' }] }],
        },
        {
          type: 'callout',
          attrs: { kind: 'success' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This is a success callout for positive outcomes.' }] }],
        },
        {
          type: 'callout',
          attrs: { kind: 'warning' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This is a warning callout for caution.' }] }],
        },
        {
          type: 'callout',
          attrs: { kind: 'error' },
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'This is an error callout for problems.' }] }],
        },
      ])}
    />
  </div>
);
Callouts.meta = {
  description: 'Info, success, warning, and error callout blocks',
};
```

**Step 5: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Expected: Callout blocks render with correct styling and are editable

**Step 6: Commit**

```bash
git add packages/design-system/src/components/InteractiveEditor
git commit -m "$(cat <<'EOF'
feat(design-system): add CalloutNode extension to InteractiveEditor

Styled callout blocks with info, success, warning, error variants.
Uses shared CALLOUT_CONFIG for consistent styling.
EOF
)"
```

---

## Phase 3: Slash Commands

### Task 9: Create Slash Command Mock Data

**Files:**

- Create: `packages/design-system/src/components/InteractiveEditor/mocks/mockCommands.ts`
- Create: `packages/design-system/src/components/InteractiveEditor/mocks/index.ts`

**Step 1: Create mock commands**

Create `packages/design-system/src/components/InteractiveEditor/mocks/mockCommands.ts`:

````typescript
import type { Editor } from '@tiptap/react';
import type { ComponentType } from 'react';
import {
  Heading1,
  Heading2,
  Heading3,
  Type,
  List,
  ListOrdered,
  ListChecks,
  Info,
  Quote,
  Code,
  Table,
  Minus,
} from 'lucide-react';

export type CommandSection = 'Basic' | 'Headings' | 'Lists' | 'Formatting' | 'Advanced';

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  section: CommandSection;
  icon: ComponentType<{ className?: string }>;
  aliases?: string[];
  execute: (editor: Editor) => void;
}

export const mockCommands: SlashCommand[] = [
  // Basic
  {
    id: 'paragraph',
    label: 'Text',
    description: 'Plain text paragraph',
    section: 'Basic',
    icon: Type,
    aliases: ['p', 'text'],
    execute: (editor) => editor.chain().focus().setParagraph().run(),
  },

  // Headings
  {
    id: 'heading-1',
    label: 'Heading 1',
    description: 'Large section heading',
    section: 'Headings',
    icon: Heading1,
    aliases: ['h1', '#'],
    execute: (editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
  },
  {
    id: 'heading-2',
    label: 'Heading 2',
    description: 'Medium section heading',
    section: 'Headings',
    icon: Heading2,
    aliases: ['h2', '##'],
    execute: (editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
  },
  {
    id: 'heading-3',
    label: 'Heading 3',
    description: 'Small section heading',
    section: 'Headings',
    icon: Heading3,
    aliases: ['h3', '###'],
    execute: (editor) => editor.chain().focus().setHeading({ level: 3 }).run(),
  },

  // Lists
  {
    id: 'bullet-list',
    label: 'Bullet List',
    description: 'Unordered list with bullet points',
    section: 'Lists',
    icon: List,
    aliases: ['ul', '-', 'bullets'],
    execute: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'numbered-list',
    label: 'Numbered List',
    description: 'Ordered list with numbers',
    section: 'Lists',
    icon: ListOrdered,
    aliases: ['ol', '1.', 'ordered'],
    execute: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'task-list',
    label: 'Task List',
    description: 'List with checkbox items',
    section: 'Lists',
    icon: ListChecks,
    aliases: ['todo', '[]', 'checklist'],
    execute: (editor) => editor.chain().focus().toggleTaskList().run(),
  },

  // Formatting
  {
    id: 'callout',
    label: 'Callout',
    description: 'Highlighted note or warning block',
    section: 'Formatting',
    icon: Info,
    aliases: ['note', 'info', 'warning'],
    execute: (editor) =>
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'callout',
          attrs: { kind: 'info' },
          content: [{ type: 'paragraph' }],
        })
        .run(),
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Blockquote or citation',
    section: 'Formatting',
    icon: Quote,
    aliases: ['blockquote', '>'],
    execute: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'code-block',
    label: 'Code Block',
    description: 'Code snippet with syntax highlighting',
    section: 'Formatting',
    icon: Code,
    aliases: ['code', '```', 'pre'],
    execute: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },

  // Advanced
  {
    id: 'table',
    label: 'Table',
    description: 'Insert a 3x3 table',
    section: 'Advanced',
    icon: Table,
    aliases: ['grid'],
    execute: (editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: 'horizontal-rule',
    label: 'Horizontal Rule',
    description: 'Divider line',
    section: 'Advanced',
    icon: Minus,
    aliases: ['hr', 'divider', '---'],
    execute: (editor) => editor.chain().focus().setHorizontalRule().run(),
  },
];

export function filterCommands(query: string): SlashCommand[] {
  if (!query) return mockCommands;

  const lowerQuery = query.toLowerCase();
  return mockCommands.filter((cmd) => {
    if (cmd.label.toLowerCase().includes(lowerQuery)) return true;
    if (cmd.description.toLowerCase().includes(lowerQuery)) return true;
    if (cmd.aliases?.some((alias) => alias.toLowerCase().includes(lowerQuery))) return true;
    return false;
  });
}
````

**Step 2: Create mocks index**

Create `packages/design-system/src/components/InteractiveEditor/mocks/index.ts`:

```typescript
export * from './mockCommands.js';
```

**Step 3: Commit**

```bash
git add packages/design-system/src/components/InteractiveEditor/mocks
git commit -m "$(cat <<'EOF'
feat(design-system): add mock slash commands for InteractiveEditor
EOF
)"
```

---

### Task 10: Create SlashCommand Extension and Menu

**Files:**

- Create: `packages/design-system/src/components/InteractiveEditor/components/SlashCommandMenu.tsx`
- Create: `packages/design-system/src/components/InteractiveEditor/extensions/SlashCommand.tsx`

**Step 1: Create SlashCommandMenu component**

Create `packages/design-system/src/components/InteractiveEditor/components/SlashCommandMenu.tsx`:

```typescript
import * as React from 'react';
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import type { SlashCommand, CommandSection } from '../mocks/mockCommands.js';
import { cn } from '../../../utils/cn.js';

interface SlashCommandMenuProps {
  items: SlashCommand[];
  command: (item: SlashCommand) => void;
}

export interface SlashCommandMenuHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const SECTIONS: CommandSection[] = ['Basic', 'Headings', 'Lists', 'Formatting', 'Advanced'];

export const SlashCommandMenu = forwardRef<SlashCommandMenuHandle, SlashCommandMenuProps>(
  ({ items, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
      setSelectedIndex(0);
    }, [items]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % items.length);
          return true;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
          return true;
        }

        if (event.key === 'Enter') {
          event.preventDefault();
          const selectedItem = items[selectedIndex];
          if (selectedItem) {
            command(selectedItem);
          }
          return true;
        }

        return false;
      },
    }));

    if (items.length === 0) {
      return (
        <div className="bg-white border rounded-md shadow-lg py-2 px-3 min-w-[200px]">
          <div className="text-sm text-gray-500">No commands found</div>
        </div>
      );
    }

    // Group by section if many items
    const shouldGroup = items.length >= 8;

    if (!shouldGroup) {
      return (
        <div className="bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto py-1 min-w-[240px]">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => command(item)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left text-sm',
                  'hover:bg-gray-100 transition-colors',
                  index === selectedIndex && 'bg-gray-100'
                )}
              >
                <Icon className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    // Grouped view
    const groups = SECTIONS.map((section) => ({
      section,
      commands: items.filter((cmd) => cmd.section === section),
    })).filter((g) => g.commands.length > 0);

    let currentIndex = 0;

    return (
      <div className="bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto py-1 min-w-[240px]">
        {groups.map((group) => (
          <div key={group.section}>
            <div className="px-3 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
              {group.section}
            </div>
            {group.commands.map((cmd) => {
              const index = currentIndex++;
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => command(cmd)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left text-sm',
                    'hover:bg-gray-100 transition-colors',
                    index === selectedIndex && 'bg-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4 text-gray-500" />
                  <div>
                    <div className="font-medium">{cmd.label}</div>
                    <div className="text-xs text-gray-500">{cmd.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  }
);

SlashCommandMenu.displayName = 'SlashCommandMenu';
```

**Step 2: Create SlashCommand extension**

Create `packages/design-system/src/components/InteractiveEditor/extensions/SlashCommand.tsx`:

```typescript
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import { computePosition, flip, shift } from '@floating-ui/react';
import { filterCommands, type SlashCommand as SlashCommandType } from '../mocks/mockCommands.js';
import { SlashCommandMenu, type SlashCommandMenuHandle } from '../components/SlashCommandMenu.js';

const slashCommandPluginKey = new PluginKey('slashCommand');

export const SlashCommand = Extension.create({
  name: 'slashCommand',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: '/',
        pluginKey: slashCommandPluginKey,

        items: ({ query }) => filterCommands(query),

        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run();
          const cmd = props as SlashCommandType;
          cmd.execute(editor);
        },

        render: () => {
          let component: ReactRenderer<SlashCommandMenuHandle> | null = null;
          let popup: HTMLDivElement | null = null;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandMenu, {
                props: {
                  items: props.items ?? [],
                  command: (item: SlashCommandType) => {
                    props.command(item);
                  },
                },
                editor: props.editor,
              });

              popup = document.createElement('div');
              popup.style.position = 'fixed';
              popup.style.zIndex = '9999';
              popup.appendChild(component.element);
              document.body.appendChild(popup);

              if (props.clientRect) {
                const rect = props.clientRect();
                if (rect) {
                  void computePosition({ getBoundingClientRect: () => rect }, popup, {
                    placement: 'bottom-start',
                    middleware: [flip(), shift()],
                  }).then(({ x, y }) => {
                    if (popup) {
                      popup.style.left = `${x}px`;
                      popup.style.top = `${y}px`;
                    }
                  });
                }
              }
            },

            onUpdate: (props) => {
              component?.updateProps({
                items: props.items ?? [],
                command: (item: SlashCommandType) => {
                  props.command(item);
                },
              });

              if (props.clientRect && popup) {
                const rect = props.clientRect();
                if (rect) {
                  void computePosition({ getBoundingClientRect: () => rect }, popup, {
                    placement: 'bottom-start',
                    middleware: [flip(), shift()],
                  }).then(({ x, y }) => {
                    if (popup) {
                      popup.style.left = `${x}px`;
                      popup.style.top = `${y}px`;
                    }
                  });
                }
              }
            },

            onKeyDown: (props) => {
              if (props.event.key === 'Escape') {
                popup?.remove();
                return true;
              }
              return component?.ref?.onKeyDown?.(props) ?? false;
            },

            onExit: () => {
              popup?.remove();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});
```

**Step 3: Add to extensions index**

Update `packages/design-system/src/components/InteractiveEditor/extensions/index.ts`:

```typescript
export { CalloutNode } from './CalloutNode.js';
export { SlashCommand } from './SlashCommand.js';
```

**Step 4: Add to InteractiveEditor**

Add to imports and extensions array in `InteractiveEditor.tsx`:

```typescript
import { CalloutNode, SlashCommand } from './extensions/index.js';

// In extensions array:
SlashCommand,
```

**Step 5: Create SlashCommand stories**

Create `packages/design-system/src/components/InteractiveEditor/stories/SlashCommand.stories.tsx`:

```typescript
import type { Story } from '@ladle/react';
import { InteractiveEditor } from '../InteractiveEditor.js';
import { ShortcutHints } from '../components/ShortcutHints.js';

export default {
  title: 'InteractiveEditor/Slash Commands',
};

export const BasicUsage: Story = () => (
  <div className="flex gap-4">
    <div className="flex-1 p-4 border rounded-lg bg-white">
      <InteractiveEditor
        autofocus
        placeholder="Type '/' to see the command menu..."
      />
    </div>
    <ShortcutHints
      hints={[
        { keys: ['/'], action: 'Open command menu' },
        { keys: ['↑', '↓'], action: 'Navigate' },
        { keys: ['Enter'], action: 'Select' },
        { keys: ['Esc'], action: 'Close' },
      ]}
    />
  </div>
);
BasicUsage.meta = {
  description: "Type '/' anywhere to open the slash command menu",
};

export const FilteredSearch: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <div className="mb-4 text-sm text-gray-500">
      Try typing: <code className="bg-gray-100 px-1 rounded">/head</code> or{' '}
      <code className="bg-gray-100 px-1 rounded">/list</code>
    </div>
    <InteractiveEditor
      autofocus
      placeholder="Type '/head' to filter to headings..."
    />
  </div>
);
FilteredSearch.meta = {
  description: 'Commands filter as you type after the slash',
};

export const InsertCallout: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <div className="mb-4 text-sm text-gray-500">
      Type <code className="bg-gray-100 px-1 rounded">/callout</code> and press Enter
    </div>
    <InteractiveEditor
      autofocus
      placeholder="Try inserting a callout block..."
    />
  </div>
);
```

**Step 6: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Expected: Slash command menu appears when typing "/", filters work, commands execute

**Step 7: Commit**

```bash
git add packages/design-system/src/components/InteractiveEditor
git commit -m "$(cat <<'EOF'
feat(design-system): add SlashCommand extension to InteractiveEditor

Type "/" to open command menu with headings, lists, formatting options.
Menu filters as you type and supports keyboard navigation.
EOF
)"
```

---

## Phase 4: Wiki-Links & Tags

### Task 11: Create Mock Notes and Tags

**Files:**

- Create: `packages/design-system/src/components/InteractiveEditor/mocks/mockNotes.ts`
- Create: `packages/design-system/src/components/InteractiveEditor/mocks/mockTags.ts`
- Modify: `packages/design-system/src/components/InteractiveEditor/mocks/index.ts`

**Step 1: Create mock notes**

Create `packages/design-system/src/components/InteractiveEditor/mocks/mockNotes.ts`:

```typescript
import type { MockNote } from '../types.js';

export const mockNotes: MockNote[] = [
  { id: '01HX123456789', title: 'Getting Started Guide', type: 'note' },
  { id: '01HX123456790', title: 'Project Roadmap', type: 'project' },
  { id: '01HX123456791', title: 'Weekly Team Sync', type: 'note' },
  { id: '01HX123456792', title: 'Design System Documentation', type: 'resource' },
  { id: '01HX123456793', title: 'Alice Johnson', type: 'person' },
  { id: '01HX123456794', title: 'Bob Smith', type: 'person' },
  { id: '01HX123456795', title: 'Review PR #42', type: 'task' },
  { id: '01HX123456796', title: 'Fix login bug', type: 'task' },
  { id: '01HX123456797', title: 'Architecture Decision Records', type: 'resource' },
  { id: '01HX123456798', title: 'Q1 Planning', type: 'project' },
];

export function filterNotes(query: string, notes: MockNote[] = mockNotes): MockNote[] {
  if (!query) return notes.slice(0, 5);

  const lowerQuery = query.toLowerCase();
  return notes.filter((note) => note.title.toLowerCase().includes(lowerQuery)).slice(0, 10);
}
```

**Step 2: Create mock tags**

Create `packages/design-system/src/components/InteractiveEditor/mocks/mockTags.ts`:

```typescript
import type { MockTag } from '../types.js';

export const mockTags: MockTag[] = [
  { id: 'tag-1', value: 'important', color: '#ef4444' },
  { id: 'tag-2', value: 'todo', color: '#f59e0b' },
  { id: 'tag-3', value: 'in-progress', color: '#3b82f6' },
  { id: 'tag-4', value: 'done', color: '#22c55e' },
  { id: 'tag-5', value: 'blocked', color: '#ef4444' },
  { id: 'tag-6', value: 'review', color: '#8b5cf6' },
  { id: 'tag-7', value: 'idea', color: '#ec4899' },
  { id: 'tag-8', value: 'meeting', color: '#06b6d4' },
];

export function filterTags(query: string, tags: MockTag[] = mockTags): MockTag[] {
  if (!query) return tags.slice(0, 5);

  const lowerQuery = query.toLowerCase();
  return tags.filter((tag) => tag.value.toLowerCase().includes(lowerQuery)).slice(0, 10);
}
```

**Step 3: Update mocks index**

Update `packages/design-system/src/components/InteractiveEditor/mocks/index.ts`:

```typescript
export * from './mockCommands.js';
export * from './mockNotes.js';
export * from './mockTags.js';
```

**Step 4: Commit**

```bash
git add packages/design-system/src/components/InteractiveEditor/mocks
git commit -m "$(cat <<'EOF'
feat(design-system): add mock notes and tags for wiki-link autocomplete
EOF
)"
```

---

### Task 12: Create RefNode and RefSuggestion Extensions

**Files:**

- Create: `packages/design-system/src/components/InteractiveEditor/extensions/RefNode.tsx`
- Create: `packages/design-system/src/components/InteractiveEditor/components/SuggestionPopup.tsx`
- Create: `packages/design-system/src/components/InteractiveEditor/extensions/RefSuggestion.tsx`

**Step 1: Create RefNode extension**

Create `packages/design-system/src/components/InteractiveEditor/extensions/RefNode.tsx`:

```typescript
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { cn } from '../../../utils/cn.js';
import { TYPE_CONFIG, type ObjectType } from '../../../constants/editorConfig.js';

interface RefTarget {
  kind: 'object' | 'block';
  objectId: string;
  blockId?: string;
}

interface RefNodeAttrs {
  mode: 'link' | 'embed';
  target: RefTarget | null;
  alias: string | null;
  objectType?: ObjectType;
}

function RefNodeView({ node }: NodeViewProps) {
  const attrs = node.attrs as RefNodeAttrs;
  const { target, alias, objectType = 'note' } = attrs;
  const config = TYPE_CONFIG[objectType];
  const Icon = config.icon;

  const displayText = alias ?? target?.objectId.slice(0, 8) ?? 'Unknown';

  return (
    <NodeViewWrapper as="span" className="inline">
      <span
        className={cn(
          'inline-flex items-center gap-1 cursor-pointer transition-colors',
        )}
      >
        <Icon className={cn('h-3.5 w-3.5', config.colorClass)} />
        <span className={cn('underline text-gray-700 hover:text-gray-900', config.decorationClass)}>
          {displayText}
        </span>
      </span>
    </NodeViewWrapper>
  );
}

export const RefNode = Node.create({
  name: 'ref',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      mode: { default: 'link' },
      target: { default: null },
      alias: { default: null },
      objectType: { default: 'note' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-ref]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-ref': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RefNodeView);
  },
});
```

**Step 2: Create SuggestionPopup component**

Create `packages/design-system/src/components/InteractiveEditor/components/SuggestionPopup.tsx`:

```typescript
import * as React from 'react';
import { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import type { MockNote } from '../types.js';
import { TYPE_CONFIG } from '../../../constants/editorConfig.js';
import { cn } from '../../../utils/cn.js';
import { Plus } from 'lucide-react';

type SuggestionItem = MockNote | { createNew: true; title: string };

interface SuggestionPopupProps {
  items: MockNote[];
  query: string;
  onSelect: (item: SuggestionItem) => void;
}

export interface SuggestionPopupRef {
  onKeyDown: (event: KeyboardEvent) => boolean;
}

export const SuggestionPopup = forwardRef<SuggestionPopupRef, SuggestionPopupProps>(
  ({ items, query, onSelect }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Include "create new" option if query is non-empty
    const allItems: SuggestionItem[] = [
      ...items,
      ...(query.trim() ? [{ createNew: true as const, title: query }] : []),
    ];

    useEffect(() => {
      setSelectedIndex(0);
    }, [items, query]);

    useImperativeHandle(ref, () => ({
      onKeyDown: (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % allItems.length);
          return true;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
          return true;
        }

        if (event.key === 'Enter') {
          event.preventDefault();
          const selectedItem = allItems[selectedIndex];
          if (selectedItem) {
            onSelect(selectedItem);
          }
          return true;
        }

        return false;
      },
    }));

    if (allItems.length === 0) {
      return (
        <div className="bg-white border rounded-md shadow-lg py-2 px-3 min-w-[200px]">
          <div className="text-sm text-gray-500">No results</div>
        </div>
      );
    }

    return (
      <div className="bg-white border rounded-md shadow-lg max-h-[300px] overflow-y-auto py-1 min-w-[240px]">
        {allItems.map((item, index) => {
          if ('createNew' in item) {
            return (
              <button
                key="create-new"
                onClick={() => onSelect(item)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 text-left text-sm',
                  'hover:bg-gray-100 transition-colors',
                  index === selectedIndex && 'bg-gray-100'
                )}
              >
                <Plus className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">Create "{item.title}"</div>
                  <div className="text-xs text-gray-500">Create new note</div>
                </div>
              </button>
            );
          }

          const config = TYPE_CONFIG[item.type];
          const Icon = config.icon;

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-left text-sm',
                'hover:bg-gray-100 transition-colors',
                index === selectedIndex && 'bg-gray-100'
              )}
            >
              <Icon className={cn('h-4 w-4', config.colorClass)} />
              <div>
                <div className="font-medium">{item.title}</div>
                <div className="text-xs text-gray-500 capitalize">{item.type}</div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);

SuggestionPopup.displayName = 'SuggestionPopup';
```

**Step 3: Create RefSuggestion extension**

Create `packages/design-system/src/components/InteractiveEditor/extensions/RefSuggestion.tsx`:

```typescript
import { Extension } from '@tiptap/core';
import Suggestion, { type SuggestionOptions } from '@tiptap/suggestion';
import { PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import { computePosition, flip, shift } from '@floating-ui/react';
import { filterNotes, mockNotes } from '../mocks/mockNotes.js';
import type { MockNote } from '../types.js';
import { SuggestionPopup, type SuggestionPopupRef } from '../components/SuggestionPopup.js';

type SuggestionItem = MockNote | { createNew: true; title: string };

const wikiLinkPluginKey = new PluginKey('wikiLinkSuggestion');

function createSuggestionConfig(
  trigger: string,
  pluginKey: PluginKey
): Omit<SuggestionOptions<MockNote>, 'editor'> {
  return {
    pluginKey,
    char: trigger,
    allowSpaces: true,
    startOfLine: false,

    items: ({ query }) => filterNotes(query, mockNotes),

    command: ({ editor, range, props }) => {
      const item = props as SuggestionItem;
      editor.chain().focus().deleteRange(range).run();

      if ('createNew' in item) {
        // For demo, just insert a ref with the title
        editor.commands.insertContent({
          type: 'ref',
          attrs: {
            mode: 'link',
            target: { kind: 'object', objectId: 'new-' + Date.now() },
            alias: item.title,
            objectType: 'note',
          },
        });
      } else {
        editor.commands.insertContent({
          type: 'ref',
          attrs: {
            mode: 'link',
            target: { kind: 'object', objectId: item.id },
            alias: item.title,
            objectType: item.type,
          },
        });
      }
    },

    render: () => {
      let component: ReactRenderer<SuggestionPopupRef> | null = null;
      let popup: HTMLDivElement | null = null;

      return {
        onStart: (props) => {
          component = new ReactRenderer(SuggestionPopup, {
            props: {
              items: props.items ?? [],
              query: props.query,
              onSelect: (item: SuggestionItem) => {
                props.command(item);
              },
            },
            editor: props.editor,
          });

          popup = document.createElement('div');
          popup.style.position = 'fixed';
          popup.style.zIndex = '9999';
          popup.appendChild(component.element);
          document.body.appendChild(popup);

          if (props.clientRect) {
            const rect = props.clientRect();
            if (rect) {
              void computePosition({ getBoundingClientRect: () => rect }, popup, {
                placement: 'bottom-start',
                middleware: [flip(), shift()],
              }).then(({ x, y }) => {
                if (popup) {
                  popup.style.left = `${x}px`;
                  popup.style.top = `${y}px`;
                }
              });
            }
          }
        },

        onUpdate: (props) => {
          component?.updateProps({
            items: props.items ?? [],
            query: props.query,
            onSelect: (item: SuggestionItem) => {
              props.command(item);
            },
          });

          if (props.clientRect && popup) {
            const rect = props.clientRect();
            if (rect) {
              void computePosition({ getBoundingClientRect: () => rect }, popup, {
                placement: 'bottom-start',
                middleware: [flip(), shift()],
              }).then(({ x, y }) => {
                if (popup) {
                  popup.style.left = `${x}px`;
                  popup.style.top = `${y}px`;
                }
              });
            }
          }
        },

        onKeyDown: (props) => {
          if (props.event.key === 'Escape') {
            popup?.remove();
            return true;
          }
          return component?.ref?.onKeyDown(props.event) ?? false;
        },

        onExit: () => {
          popup?.remove();
          component?.destroy();
        },
      };
    },
  };
}

export const RefSuggestion = Extension.create({
  name: 'refSuggestion',

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...createSuggestionConfig('[[', wikiLinkPluginKey),
      }),
    ];
  },
});
```

**Step 4: Update extensions index**

Update `packages/design-system/src/components/InteractiveEditor/extensions/index.ts`:

```typescript
export { CalloutNode } from './CalloutNode.js';
export { SlashCommand } from './SlashCommand.js';
export { RefNode } from './RefNode.js';
export { RefSuggestion } from './RefSuggestion.js';
```

**Step 5: Add to InteractiveEditor**

Update imports and extensions in `InteractiveEditor.tsx`:

```typescript
import { CalloutNode, SlashCommand, RefNode, RefSuggestion } from './extensions/index.js';

// In extensions array:
RefNode,
RefSuggestion,
```

**Step 6: Create WikiLinks stories**

Create `packages/design-system/src/components/InteractiveEditor/stories/WikiLinks.stories.tsx`:

```typescript
import type { Story } from '@ladle/react';
import { InteractiveEditor } from '../InteractiveEditor.js';
import { ShortcutHints } from '../components/ShortcutHints.js';
import type { JSONContent } from '@tiptap/react';

export default {
  title: 'InteractiveEditor/Wiki Links',
};

const wrap = (content: JSONContent['content']): JSONContent => ({
  type: 'doc',
  content,
});

export const CreateLink: Story = () => (
  <div className="flex gap-4">
    <div className="flex-1 p-4 border rounded-lg bg-white">
      <InteractiveEditor
        autofocus
        placeholder="Type '[[' to create a wiki-link..."
      />
    </div>
    <ShortcutHints
      hints={[
        { keys: ['[['], action: 'Start wiki-link' },
        { keys: ['↑', '↓'], action: 'Navigate' },
        { keys: ['Enter'], action: 'Select' },
        { keys: ['Esc'], action: 'Close' },
      ]}
    />
  </div>
);
CreateLink.meta = {
  description: "Type '[[' to open the wiki-link suggestion popup",
};

export const SearchNotes: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <div className="mb-4 text-sm text-gray-500">
      Try: <code className="bg-gray-100 px-1 rounded">[[project</code> or{' '}
      <code className="bg-gray-100 px-1 rounded">[[alice</code>
    </div>
    <InteractiveEditor
      autofocus
      placeholder="Type '[[' then search for a note..."
    />
  </div>
);
SearchNotes.meta = {
  description: 'Notes filter as you type after [[',
};

export const WithExistingLinks: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This document links to ' },
            {
              type: 'ref',
              attrs: {
                mode: 'link',
                target: { kind: 'object', objectId: '01HX123456790' },
                alias: 'Project Roadmap',
                objectType: 'project',
              },
            },
            { type: 'text', text: ' and mentions ' },
            {
              type: 'ref',
              attrs: {
                mode: 'link',
                target: { kind: 'object', objectId: '01HX123456793' },
                alias: 'Alice Johnson',
                objectType: 'person',
              },
            },
            { type: 'text', text: '.' },
          ],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Related task: ' },
            {
              type: 'ref',
              attrs: {
                mode: 'link',
                target: { kind: 'object', objectId: '01HX123456795' },
                alias: 'Review PR #42',
                objectType: 'task',
              },
            },
          ],
        },
      ])}
    />
  </div>
);
WithExistingLinks.meta = {
  description: 'Wiki-links with different object types (project, person, task)',
};

export const CreateNewNote: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <div className="mb-4 text-sm text-gray-500">
      Type <code className="bg-gray-100 px-1 rounded">[[My New Idea</code> and select "Create"
    </div>
    <InteractiveEditor
      autofocus
      placeholder="Type '[[' with a new note name..."
    />
  </div>
);
CreateNewNote.meta = {
  description: 'Create a link to a new note that doesn\'t exist yet',
};
```

**Step 7: Verify in Ladle**

Run: `pnpm --filter @typenote/design-system sandbox`
Expected: Wiki-links work, suggestions appear, refs render with type icons

**Step 8: Commit**

```bash
git add packages/design-system/src/components/InteractiveEditor
git commit -m "$(cat <<'EOF'
feat(design-system): add wiki-link support to InteractiveEditor

Type '[[' to search and link to notes. RefNode displays with type-aware
icons and colors. Includes "Create new" option for non-existent notes.
EOF
)"
```

---

## Final Cleanup

### Task 13: Final Build and Export Verification

**Step 1: Run full build**

```bash
pnpm build
```

Expected: All packages build successfully

**Step 2: Run typecheck**

```bash
pnpm typecheck
```

Expected: No type errors

**Step 3: Run lint**

```bash
pnpm lint
```

Expected: No lint errors (or fix any that appear)

**Step 4: Verify Ladle works**

```bash
pnpm --filter @typenote/design-system sandbox
```

Navigate through all InteractiveEditor stories, verify everything works.

**Step 5: Final commit**

```bash
git add -A
git commit -m "$(cat <<'EOF'
feat(design-system): complete InteractiveEditor Phase 1-4

Full TipTap editor with:
- All block types (headings, lists, tables, callouts)
- Inline formatting with keyboard shortcuts
- Slash command menu
- Wiki-link autocomplete with mock data
- Shared constants with EditorPreview
EOF
)"
```

---

## Summary

| Phase | Tasks | What's Built                                                   |
| ----- | ----- | -------------------------------------------------------------- |
| 1     | 1-7   | TipTap scaffold, basic stories, block types, inline formatting |
| 2     | 8     | CalloutNode extension                                          |
| 3     | 9-10  | Slash commands with mock data                                  |
| 4     | 11-12 | Wiki-links with RefNode and autocomplete                       |

**Total tasks:** 13
**Estimated time:** 2-4 hours

---

Plan complete and saved to `docs/plans/2026-01-11-interactive-editor-impl.md`.

**Two execution options:**

1. **Subagent-Driven (this session)** — I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

Which approach?
