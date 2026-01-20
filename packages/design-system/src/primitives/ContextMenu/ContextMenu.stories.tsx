import * as React from 'react';
import type { Story } from '@ladle/react';
import { Copy } from '@phosphor-icons/react/dist/ssr/Copy';
import { Scissors } from '@phosphor-icons/react/dist/ssr/Scissors';
import { Clipboard } from '@phosphor-icons/react/dist/ssr/Clipboard';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuLabel,
} from './ContextMenu.js';

export default {
  title: 'Primitives / ContextMenu',
};

// ============================================================================
// Default
// ============================================================================

export const Default: Story = () => {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="p-8">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <div className="flex h-32 w-64 items-center justify-center rounded-md border border-dashed border-border bg-muted/50 text-sm text-muted-foreground">
            Right-click here
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Actions</ContextMenuLabel>
          <ContextMenuItem onSelect={() => setLastAction('Cut')}>
            <Scissors />
            Cut
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setLastAction('Copy')}>
            <Copy />
            Copy
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setLastAction('Paste')}>
            <Clipboard />
            Paste
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem destructive onSelect={() => setLastAction('Delete')}>
            <Trash />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {lastAction && (
        <p className="mt-4 text-sm text-muted-foreground">Last action: {lastAction}</p>
      )}
    </div>
  );
};

Default.storyName = 'Default';

// ============================================================================
// Table Context (preview for table use case)
// ============================================================================

export const TableContext: Story = () => {
  const [lastAction, setLastAction] = React.useState<string | null>(null);

  return (
    <div className="p-8">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-border bg-muted p-2 text-left font-semibold">Name</th>
                <th className="border border-border bg-muted p-2 text-left font-semibold">Role</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-2">Alice</td>
                <td className="border border-border p-2">Developer</td>
              </tr>
              <tr>
                <td className="border border-border p-2">Bob</td>
                <td className="border border-border p-2">Designer</td>
              </tr>
            </tbody>
          </table>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuLabel>Row</ContextMenuLabel>
          <ContextMenuItem onSelect={() => setLastAction('Insert row above')}>
            Insert row above
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setLastAction('Insert row below')}>
            Insert row below
          </ContextMenuItem>
          <ContextMenuItem destructive onSelect={() => setLastAction('Delete row')}>
            Delete row
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuLabel>Column</ContextMenuLabel>
          <ContextMenuItem onSelect={() => setLastAction('Insert column left')}>
            Insert column left
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => setLastAction('Insert column right')}>
            Insert column right
          </ContextMenuItem>
          <ContextMenuItem destructive onSelect={() => setLastAction('Delete column')}>
            Delete column
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem destructive onSelect={() => setLastAction('Delete table')}>
            Delete table
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      {lastAction && (
        <p className="mt-4 text-sm text-muted-foreground">Last action: {lastAction}</p>
      )}
    </div>
  );
};

TableContext.storyName = 'Table Context';
