/**
 * Editor - Slash Command stories
 *
 * The `/` trigger menu for inserting block types.
 */

import type { Story } from '@ladle/react';

import { Editor } from '../Editor.js';

export default {
  title: 'Features / Editor / Slash Commands',
};

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type / at the start of a line to insert blocks..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>
        Type <code className="bg-muted px-1 rounded">/</code> at the start of a line to open the
        block menu.
      </p>
      <p>Try: /heading, /bullet, /quote, /code, /divider</p>
    </div>
  </div>
);

export const Filtering: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Type /h to filter to headings..." />
    <div className="text-xs text-muted-foreground space-y-1">
      <p>The slash menu filters as you type:</p>
      <ul className="list-disc list-inside space-y-0.5 ml-2">
        <li>
          <code className="bg-muted px-1 rounded">/h</code> — shows headings
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/list</code> — shows lists
        </li>
        <li>
          <code className="bg-muted px-1 rounded">/code</code> — shows code block
        </li>
      </ul>
    </div>
  </div>
);

export const Disabled: Story = () => (
  <div className="space-y-4 p-6">
    <Editor placeholder="Slash commands are disabled..." enableSlashCommands={false} />
    <p className="text-xs text-muted-foreground">
      Editor with <code className="bg-muted px-1 rounded">enableSlashCommands=false</code>. Typing /
      will not open the menu.
    </p>
  </div>
);
