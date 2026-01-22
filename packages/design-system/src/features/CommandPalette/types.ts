import type * as React from 'react';

/** Object item in the command palette (recent objects, search results) */
export interface CommandPaletteObjectItem {
  type: 'object';
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  /** Display label for the object type, e.g., "Page", "Daily Note", "Person" */
  objectType: string;
}

/** Action item in the command palette (quick actions) */
export interface CommandPaletteActionItem {
  type: 'action';
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  /** Optional keyboard shortcut hint, e.g., "⌘N" */
  shortcut?: string;
}

/** Union type for all items in the command palette */
export type CommandPaletteItemData = CommandPaletteObjectItem | CommandPaletteActionItem;
