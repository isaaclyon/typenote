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
    <InteractiveEditor autofocus placeholder="This editor is focused on mount..." />
  </div>
);

export const CustomHeight: Story = () => (
  <div className="p-4 border rounded-lg bg-white">
    <InteractiveEditor minHeight="400px" placeholder="This editor has a taller minimum height..." />
  </div>
);
