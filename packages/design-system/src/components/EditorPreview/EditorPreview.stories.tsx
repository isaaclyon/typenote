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
