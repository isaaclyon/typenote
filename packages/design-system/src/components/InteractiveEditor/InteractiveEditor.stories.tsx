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
            content: [{ type: 'text', text: 'Try editing this content!' }],
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
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'Meeting Notes - Q1 Planning' }],
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Discussed roadmap with ' },
              { type: 'text', marks: [{ type: 'bold' }], text: '@Sarah' },
              { type: 'text', text: ' and ' },
              { type: 'text', marks: [{ type: 'bold' }], text: '@Mike' },
              { type: 'text', text: '. Key decisions:' },
            ],
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Launch MVP by March 15th' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [{ type: 'text', text: 'Focus on core editor features first' }],
                  },
                ],
              },
              {
                type: 'listItem',
                content: [
                  {
                    type: 'paragraph',
                    content: [
                      { type: 'text', text: 'Defer ' },
                      { type: 'text', marks: [{ type: 'italic' }], text: 'mobile app' },
                      { type: 'text', text: ' to Q2' },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: 'blockquote',
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: '"Ship something small, ship it well." — Team motto',
                  },
                ],
              },
            ],
          },
        ],
      }}
    />
  </div>
);

ReadOnly.meta = {
  description: 'Read-only mode for previewing content. Use editable={false} for object previews.',
};

/**
 * Preview variant with minimal height - suitable for inline previews in lists or cards.
 */
export const PreviewCompact: Story = () => (
  <div className="p-3 border rounded-md bg-gray-50 max-w-md">
    <InteractiveEditor
      editable={false}
      minHeight="80px"
      initialContent={{
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Quick note about the project status. Everything is on track for the deadline.',
              },
            ],
          },
        ],
      }}
    />
  </div>
);

PreviewCompact.meta = {
  description: 'Compact preview for embedding in cards or list items.',
};

export const WithAutofocus: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor autofocus placeholder="This editor is focused on mount..." />
  </div>
);

export const CustomHeight: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor minHeight="400px" placeholder="This editor has a taller minimum height..." />
  </div>
);
