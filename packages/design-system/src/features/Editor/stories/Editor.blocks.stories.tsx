/**
 * Editor - Block stories
 *
 * Task lists, code blocks, callouts, and tables.
 */

import type { Story } from '@ladle/react';
import type { JSONContent } from '@tiptap/core';

import { Editor } from '../Editor.js';

export default {
  title: 'Features / Editor / Blocks',
};

// ============================================================================
// Task List Stories
// ============================================================================

const contentWithTasks: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Project Tasks' }],
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Set up project repository' }],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: true },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Create initial design mockups' }],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Implement authentication flow' }],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: { checked: false },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Write unit tests' }],
            },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Click checkboxes to toggle completion!' }],
    },
  ],
};

export const TaskList: Story = () => (
  <div className="space-y-4 p-6">
    <Editor content={contentWithTasks} />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Task lists with interactive checkboxes. Completed items show strikethrough text.</p>
      <p>
        Use <code className="bg-muted px-1 rounded">/task</code> or{' '}
        <code className="bg-muted px-1 rounded">/todo</code> to insert a new task list.
      </p>
    </div>
  </div>
);

TaskList.storyName = 'Task List';

export const TaskListViaSlash: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type /task or /todo to create a task list..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Insert task lists using slash commands:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>
          <code className="bg-muted px-1 rounded">/task</code> — Task List
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/todo</code> — Task List
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/checkbox</code> — Task List
        </li>
      </ul>
      <p className="mt-2">Press Enter to create new items, Backspace on empty to exit.</p>
    </div>
  </div>
);

TaskListViaSlash.storyName = 'Task List (Slash)';

export const NestedTaskList: Story = () => {
  const contentWithNestedTasks: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Sprint Planning' }],
      },
      {
        type: 'taskList',
        content: [
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Backend API' }],
              },
              {
                type: 'taskList',
                content: [
                  {
                    type: 'taskItem',
                    attrs: { checked: true },
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'User endpoints' }],
                      },
                    ],
                  },
                  {
                    type: 'taskItem',
                    attrs: { checked: false },
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Auth middleware' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'taskItem',
            attrs: { checked: false },
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Frontend UI' }],
              },
              {
                type: 'taskList',
                content: [
                  {
                    type: 'taskItem',
                    attrs: { checked: true },
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Component library' }],
                      },
                    ],
                  },
                  {
                    type: 'taskItem',
                    attrs: { checked: false },
                    content: [
                      {
                        type: 'paragraph',
                        content: [{ type: 'text', text: 'Dashboard page' }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithNestedTasks} />
      <p className="text-xs text-muted-foreground">
        Nested task lists for hierarchical todo tracking. Use Tab to indent, Shift+Tab to outdent.
      </p>
    </div>
  );
};

NestedTaskList.storyName = 'Nested Task List';

// ============================================================================
// Code Block Stories
// ============================================================================

export const CodeBlock: Story = () => {
  const contentWithCode: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Code Example' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Here is a TypeScript function:' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [
          {
            type: 'text',
            text: `function greet(name: string): string {
  return \`Hello, \${name}!\`;
}

const message = greet('World');
console.log(message);`,
          },
        ],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'The code above demonstrates basic TypeScript syntax.' }],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithCode} />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Code block with Shiki syntax highlighting.</p>
        <p>Click the language badge to change the language, or the Copy button to copy code.</p>
      </div>
    </div>
  );
};

CodeBlock.storyName = 'Code Block';

export const CodeBlockViaMarkdown: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type ```typescript and press Enter to create a code block..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Create code blocks using Markdown syntax:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>
          <code className="bg-muted px-1 rounded">```typescript</code> + Enter
        </li>
        <li>
          <code className="bg-muted px-1 rounded">```python</code> + Enter
        </li>
        <li>
          <code className="bg-muted px-1 rounded">```</code> + Enter (plain text)
        </li>
      </ul>
    </div>
  </div>
);

CodeBlockViaMarkdown.storyName = 'Code Block (Markdown)';

export const CodeBlockViaSlash: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type /code to insert a code block..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>
        Use <code className="bg-muted px-1 rounded">/code</code> slash command to insert a code
        block.
      </p>
      <p>Then use the language dropdown to select the syntax.</p>
    </div>
  </div>
);

CodeBlockViaSlash.storyName = 'Code Block (Slash)';

export const CodeBlockLanguages: Story = () => {
  const contentWithMultipleLanguages: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Multi-Language Support' }],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'TypeScript' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [
          {
            type: 'text',
            text: `interface User {
  id: string;
  name: string;
  email: string;
}

const users: User[] = [];`,
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Python' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'python' },
        content: [
          {
            type: 'text',
            text: `def fibonacci(n: int) -> list[int]:
    if n <= 0:
        return []
    fib = [0, 1]
    for i in range(2, n):
        fib.append(fib[i-1] + fib[i-2])
    return fib[:n]`,
          },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: 'Rust' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'rust' },
        content: [
          {
            type: 'text',
            text: `fn main() {
    let greeting = "Hello, Rust!";
    println!("{}", greeting);
    
    let numbers = vec![1, 2, 3, 4, 5];
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithMultipleLanguages} />
      <p className="text-xs text-muted-foreground">
        Shiki supports 25+ languages. Click the language badge to change syntax highlighting.
      </p>
    </div>
  );
};

CodeBlockLanguages.storyName = 'Code Block Languages';

export const CodeBlockLongLines: Story = () => {
  const contentWithLongCode: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Long lines scroll horizontally:' }],
      },
      {
        type: 'codeBlock',
        attrs: { language: 'typescript' },
        content: [
          {
            type: 'text',
            text: `// This is a very long line that should scroll horizontally rather than wrap, demonstrating the overflow behavior of the code block component
const veryLongVariableName = "This string is intentionally very long to test horizontal scrolling in code blocks when the content exceeds the container width";

function anotherExampleFunction(param1: string, param2: number, param3: boolean, param4: object, param5: string[]): { result: string; count: number } {
  return { result: param1, count: param2 };
}`,
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithLongCode} />
      <p className="text-xs text-muted-foreground">
        Long lines scroll horizontally. The code block maintains its max-width within the editor.
      </p>
    </div>
  );
};

CodeBlockLongLines.storyName = 'Code Block (Long Lines)';

// ============================================================================
// Callout Stories
// ============================================================================

export const Callouts: Story = () => {
  const contentWithCallouts: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Callout Blocks' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Callouts help highlight important information:' }],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'info' },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is an ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'info callout' },
              {
                type: 'text',
                text: '. Use it to provide additional context or helpful notes to readers.',
              },
            ],
          },
        ],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'warning' },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is a ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'warning callout' },
              {
                type: 'text',
                text: '. Use it to caution readers about potential issues or important considerations.',
              },
            ],
          },
        ],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'tip' },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is a ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'tip callout' },
              {
                type: 'text',
                text: '. Use it to share best practices, shortcuts, or helpful hints.',
              },
            ],
          },
        ],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'error' },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is an ' },
              { type: 'text', marks: [{ type: 'bold' }], text: 'error callout' },
              {
                type: 'text',
                text: '. Use it to highlight critical warnings, errors, or things to avoid.',
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithCallouts} />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          Four callout types with distinct colors: Info (blue), Warning (amber), Tip (green), Error
          (red).
        </p>
        <p>Click the icon/label to change the callout type via dropdown menu.</p>
      </div>
    </div>
  );
};

export const CalloutViaSlash: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type /info, /warning, /tip, or /error to insert a callout..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Insert callouts using slash commands:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>
          <code className="bg-muted px-1 rounded">/info</code> — Info callout (blue)
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/warning</code> — Warning callout (amber)
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/tip</code> — Tip callout (green)
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/error</code> — Error callout (red)
        </li>
      </ul>
    </div>
  </div>
);

CalloutViaSlash.storyName = 'Callout (Slash)';

export const CalloutNested: Story = () => {
  const contentWithNestedCallout: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Rich Callout Content' }],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'tip' },
        content: [
          {
            type: 'heading',
            attrs: { level: 3 },
            content: [{ type: 'text', text: 'Pro Tip: Keyboard Shortcuts' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Use these shortcuts to work faster:' }],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', marks: [{ type: 'code' }], text: 'Cmd+B' },
                      { type: 'text', text: ' — Bold text' },
                    ],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', marks: [{ type: 'code' }], text: 'Cmd+I' },
                      { type: 'text', text: ' — Italic text' },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'callout',
        attrs: { calloutType: 'warning' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Breaking Change in v2.0' }],
          },
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'The API endpoint has changed. Update your code:',
              },
            ],
          },
          {
            type: 'codeBlock',
            attrs: { language: 'typescript' },
            content: [
              {
                type: 'text',
                text: `// Old (v1.x)
const response = await api.getUser(id);

// New (v2.0)
const response = await api.users.get(id);`,
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithNestedCallout} />
      <p className="text-xs text-muted-foreground">
        Callouts support full nested content: headings, lists, code blocks, and more.
      </p>
    </div>
  );
};

CalloutNested.storyName = 'Callout (Nested Content)';

// ============================================================================
// Table Stories
// ============================================================================

export const Table: Story = () => {
  const contentWithTable: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Project Timeline' }],
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: 'Here is our quarterly roadmap:' }],
      },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quarter' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Milestone' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Status' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Q1' }] }],
              },
              {
                type: 'tableCell',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Design System' }] },
                ],
              },
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'bold' }], text: 'Complete' }],
                  },
                ],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Q2' }] }],
              },
              {
                type: 'tableCell',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Editor Features' }] },
                ],
              },
              {
                type: 'tableCell',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', marks: [{ type: 'italic' }], text: 'In Progress' }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Click cells to edit. Use Tab to navigate between cells.' },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={contentWithTable} />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>Table with header row. Tab/Shift+Tab navigates between cells.</p>
        <p>Drag column borders to resize. Header row has distinct styling.</p>
      </div>
    </div>
  );
};

export const TableViaSlash: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type /table to insert a table..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>Insert tables using slash commands:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>
          <code className="bg-muted px-1 rounded">/table</code> — Insert 3x3 table with header row
        </li>
      </ul>
    </div>
  </div>
);

TableViaSlash.storyName = 'Table (Slash)';

export const TableWithToolbar: Story = () => {
  const tableWithData: JSONContent = {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Table Manipulation' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Click inside any table cell to see the floating toolbar above the table.',
          },
        ],
      },
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Name' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Role' }] }],
              },
              {
                type: 'tableHeader',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Status' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Alice' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Developer' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Active' }] }],
              },
            ],
          },
          {
            type: 'tableRow',
            content: [
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bob' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Designer' }] }],
              },
              {
                type: 'tableCell',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Active' }] }],
              },
            ],
          },
        ],
      },
    ],
  };

  return (
    <div className="space-y-4 p-6">
      <Editor content={tableWithData} />
      <div className="text-xs text-muted-foreground space-y-1">
        <p>
          <strong>Floating toolbar</strong> appears when cursor is in a table:
        </p>
        <ul className="list-disc list-inside space-y-0.5 ml-2">
          <li>
            <strong>Rows icon</strong> — Insert row above/below, delete row
          </li>
          <li>
            <strong>Columns icon</strong> — Insert column left/right, delete column
          </li>
          <li>
            <strong>Trash icon</strong> — Delete entire table
          </li>
        </ul>
      </div>
    </div>
  );
};

TableWithToolbar.storyName = 'Table (Toolbar)';
