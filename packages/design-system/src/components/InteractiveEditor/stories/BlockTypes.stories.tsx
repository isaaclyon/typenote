import type { Story } from '@ladle/react';
import { InteractiveEditor } from '../InteractiveEditor.js';
import type { JSONContent } from '@tiptap/react';

export default {
  title: 'InteractiveEditor/Block Types',
};

const wrap = (content: JSONContent[]): JSONContent & { content: JSONContent[] } => ({
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

export const BulletList: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        { type: 'paragraph', content: [{ type: 'text', text: 'A bullet list:' }] },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First item' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second item' }] }],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Third item with nested list:' }],
                },
                {
                  type: 'bulletList',
                  content: [
                    {
                      type: 'listItem',
                      content: [
                        { type: 'paragraph', content: [{ type: 'text', text: 'Nested item A' }] },
                      ],
                    },
                    {
                      type: 'listItem',
                      content: [
                        { type: 'paragraph', content: [{ type: 'text', text: 'Nested item B' }] },
                      ],
                    },
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
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'First step' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Second step' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Third step' }] }],
            },
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
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'A task list (click checkboxes!):' }],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Completed task' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Pending task' }] }],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [
                { type: 'paragraph', content: [{ type: 'text', text: 'Another pending task' }] },
              ],
            },
          ],
        },
      ])}
    />
  </div>
);

export const Blockquote: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        { type: 'paragraph', content: [{ type: 'text', text: 'A famous quote:' }] },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: '"The only way to do great work is to love what you do."' },
              ],
            },
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
          content: [
            {
              type: 'text',
              text: 'function greet(name: string): string {\n  return `Hello, ${name}!`;\n}',
            },
          ],
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
                  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Engineer' }] }],
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

export const Callouts: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      initialContent={wrap([
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Callout blocks for different purposes:' }],
        },
        {
          type: 'callout',
          attrs: { kind: 'info' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'This is an info callout for general notes.' }],
            },
          ],
        },
        {
          type: 'callout',
          attrs: { kind: 'success' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'This is a success callout for positive outcomes.' }],
            },
          ],
        },
        {
          type: 'callout',
          attrs: { kind: 'warning' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'This is a warning callout for caution.' }],
            },
          ],
        },
        {
          type: 'callout',
          attrs: { kind: 'error' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'This is an error callout for problems.' }],
            },
          ],
        },
      ])}
    />
  </div>
);

export const AllBlockTypes: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor
      minHeight="600px"
      initialContent={wrap([
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'All Block Types' }],
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'This story demonstrates all available block types.' }],
        },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Lists' }] },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Bullet item' }] }],
            },
          ],
        },
        {
          type: 'orderedList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Ordered item' }] }],
            },
          ],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Task item' }] }],
            },
          ],
        },
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'Quote & Code' }] },
        {
          type: 'blockquote',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: 'A blockquote' }] }],
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
