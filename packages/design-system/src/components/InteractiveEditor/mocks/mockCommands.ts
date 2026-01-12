import type { LucideIcon } from 'lucide-react';
import {
  Pilcrow,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Table,
  Minus,
} from 'lucide-react';

/**
 * Represents a slash command available in the editor.
 */
export interface SlashCommand {
  /** Unique identifier for the command */
  id: string;
  /** Display label shown in the menu */
  label: string;
  /** Brief description of what the command does */
  description: string;
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Search keywords that trigger this command */
  keywords: string[];
  /** Action identifier for executing the command */
  action: string;
}

/**
 * Mock slash commands for the InteractiveEditor.
 * These power the slash command menu that appears when typing "/".
 */
export const mockCommands: SlashCommand[] = [
  // Text blocks
  {
    id: 'paragraph',
    label: 'Paragraph',
    description: 'Plain text block',
    icon: Pilcrow,
    keywords: ['p', 'text', 'paragraph', 'plain'],
    action: 'paragraph',
  },
  {
    id: 'heading1',
    label: 'Heading 1',
    description: 'Large section heading',
    icon: Heading1,
    keywords: ['h1', 'heading', 'title', 'large'],
    action: 'heading1',
  },
  {
    id: 'heading2',
    label: 'Heading 2',
    description: 'Medium section heading',
    icon: Heading2,
    keywords: ['h2', 'heading', 'subtitle', 'medium'],
    action: 'heading2',
  },
  {
    id: 'heading3',
    label: 'Heading 3',
    description: 'Small section heading',
    icon: Heading3,
    keywords: ['h3', 'heading', 'small'],
    action: 'heading3',
  },

  // Lists
  {
    id: 'bulletList',
    label: 'Bullet List',
    description: 'Unordered list with bullets',
    icon: List,
    keywords: ['ul', 'bullet', 'list', 'unordered', '-'],
    action: 'bulletList',
  },
  {
    id: 'orderedList',
    label: 'Numbered List',
    description: 'Ordered list with numbers',
    icon: ListOrdered,
    keywords: ['ol', 'numbered', 'list', 'ordered', '1.'],
    action: 'orderedList',
  },
  {
    id: 'taskList',
    label: 'Task List',
    description: 'Checklist with toggleable items',
    icon: CheckSquare,
    keywords: ['todo', 'task', 'checklist', 'checkbox', '[]'],
    action: 'taskList',
  },

  // Advanced blocks
  {
    id: 'blockquote',
    label: 'Quote',
    description: 'Highlighted quote block',
    icon: Quote,
    keywords: ['quote', 'blockquote', '>', 'citation'],
    action: 'blockquote',
  },
  {
    id: 'codeBlock',
    label: 'Code Block',
    description: 'Syntax highlighted code',
    icon: Code,
    keywords: ['code', 'pre', 'snippet', '```', 'syntax'],
    action: 'codeBlock',
  },

  // Callouts (4 variants)
  {
    id: 'callout-info',
    label: 'Info Callout',
    description: 'Informational note',
    icon: Info,
    keywords: ['callout', 'info', 'note', 'tip', 'information'],
    action: 'callout-info',
  },
  {
    id: 'callout-success',
    label: 'Success Callout',
    description: 'Success or confirmation message',
    icon: CheckCircle,
    keywords: ['callout', 'success', 'done', 'complete', 'check'],
    action: 'callout-success',
  },
  {
    id: 'callout-warning',
    label: 'Warning Callout',
    description: 'Warning or caution message',
    icon: AlertTriangle,
    keywords: ['callout', 'warning', 'caution', 'attention', 'alert'],
    action: 'callout-warning',
  },
  {
    id: 'callout-error',
    label: 'Error Callout',
    description: 'Error or danger message',
    icon: XCircle,
    keywords: ['callout', 'error', 'danger', 'critical', 'problem'],
    action: 'callout-error',
  },

  // Other blocks
  {
    id: 'table',
    label: 'Table',
    description: 'Insert a table',
    icon: Table,
    keywords: ['table', 'grid', 'spreadsheet', 'columns', 'rows'],
    action: 'table',
  },
  {
    id: 'horizontalRule',
    label: 'Divider',
    description: 'Horizontal line separator',
    icon: Minus,
    keywords: ['hr', 'divider', 'line', 'separator', '---'],
    action: 'horizontalRule',
  },
];

/**
 * Filter commands by search query.
 * Matches against label, description, and keywords.
 */
export function filterCommands(query: string): SlashCommand[] {
  if (!query.trim()) {
    return mockCommands;
  }

  const lowerQuery = query.toLowerCase();

  return mockCommands.filter((command) => {
    // Check label
    if (command.label.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Check description
    if (command.description.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Check keywords
    return command.keywords.some((keyword) => keyword.toLowerCase().includes(lowerQuery));
  });
}
