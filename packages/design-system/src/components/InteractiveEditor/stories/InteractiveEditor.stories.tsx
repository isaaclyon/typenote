import type { Story } from '@ladle/react';
import { InteractiveEditor } from '../InteractiveEditor.js';
import { mockBasicContent } from '../mocks/index.js';

export default {
  title: 'Components/InteractiveEditor',
};

/**
 * Default empty editor with placeholder
 */
export const Default: Story = () => (
  <div className="p-4">
    <InteractiveEditor placeholder="Start typing..." />
  </div>
);

/**
 * Editor with pre-populated content
 */
export const WithContent: Story = () => (
  <div className="p-4">
    <InteractiveEditor initialContent={mockBasicContent} />
  </div>
);

/**
 * Read-only mode
 */
export const ReadOnly: Story = () => (
  <div className="p-4">
    <InteractiveEditor initialContent={mockBasicContent} editable={false} />
  </div>
);

/**
 * With onChange callback (check console)
 */
export const WithOnChange: Story = () => (
  <div className="p-4">
    <InteractiveEditor
      placeholder="Type something and check the console..."
      onChange={(content) => {
        console.log('Content changed:', content);
      }}
    />
  </div>
);

/**
 * Auto-focus on mount
 */
export const AutoFocus: Story = () => (
  <div className="p-4">
    <InteractiveEditor placeholder="This editor auto-focuses..." autofocus />
  </div>
);

/**
 * With hide title (for Daily Notes)
 */
export const HideTitle: Story = () => (
  <div className="p-4">
    <p className="mb-2 text-sm text-muted-foreground">
      First h1 is hidden (used for Daily Notes where title is shown separately)
    </p>
    <InteractiveEditor initialContent={mockBasicContent} hideTitle />
  </div>
);

/**
 * Custom minimum height
 */
export const CustomHeight: Story = () => (
  <div className="p-4">
    <InteractiveEditor placeholder="This editor has a 400px minimum height..." minHeight="400px" />
  </div>
);
