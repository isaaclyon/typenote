import type { Story } from '@ladle/react';
import { InteractiveEditor } from '../InteractiveEditor.js';
import { ShortcutHints } from '../components/ShortcutHints.js';
import type { JSONContent } from '@tiptap/react';

export default {
  title: 'InteractiveEditor/Inline Formatting',
};

const wrap = (content: JSONContent[]): JSONContent & { content: JSONContent[] } => ({
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
