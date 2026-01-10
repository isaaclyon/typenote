import type { Editor } from '@tiptap/react';
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Type,
  List,
  ListOrdered,
  ListChecks,
  Info,
  Quote,
  Code,
  Table,
  Minus,
} from 'lucide-react';
import type { SlashCommand, SlashCommandGroup } from './types.js';

const commands: SlashCommand[] = [
  // Basic (1)
  {
    id: 'paragraph',
    label: 'Text',
    description: 'Plain text paragraph',
    section: 'Basic',
    icon: Type,
    aliases: ['p', 'text'],
    execute: (editor: Editor) => editor.chain().focus().setParagraph().run(),
  },

  // Headings (6)
  {
    id: 'heading-1',
    label: 'Heading 1',
    description: 'Large section heading',
    section: 'Headings',
    icon: Heading1,
    aliases: ['h1', '#'],
    execute: (editor: Editor) => editor.chain().focus().setHeading({ level: 1 }).run(),
  },
  {
    id: 'heading-2',
    label: 'Heading 2',
    description: 'Medium section heading',
    section: 'Headings',
    icon: Heading2,
    aliases: ['h2', '##'],
    execute: (editor: Editor) => editor.chain().focus().setHeading({ level: 2 }).run(),
  },
  {
    id: 'heading-3',
    label: 'Heading 3',
    description: 'Small section heading',
    section: 'Headings',
    icon: Heading3,
    aliases: ['h3', '###'],
    execute: (editor: Editor) => editor.chain().focus().setHeading({ level: 3 }).run(),
  },
  {
    id: 'heading-4',
    label: 'Heading 4',
    description: 'Extra small section heading',
    section: 'Headings',
    icon: Heading4,
    aliases: ['h4', '####'],
    execute: (editor: Editor) => editor.chain().focus().setHeading({ level: 4 }).run(),
  },
  {
    id: 'heading-5',
    label: 'Heading 5',
    description: 'Tiny section heading',
    section: 'Headings',
    icon: Heading5,
    aliases: ['h5', '#####'],
    execute: (editor: Editor) => editor.chain().focus().setHeading({ level: 5 }).run(),
  },
  {
    id: 'heading-6',
    label: 'Heading 6',
    description: 'Smallest section heading',
    section: 'Headings',
    icon: Heading6,
    aliases: ['h6', '######'],
    execute: (editor: Editor) => editor.chain().focus().setHeading({ level: 6 }).run(),
  },

  // Lists (3)
  {
    id: 'bullet-list',
    label: 'Bullet List',
    description: 'Unordered list with bullet points',
    section: 'Lists',
    icon: List,
    aliases: ['ul', '-', 'bullets'],
    execute: (editor: Editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    id: 'numbered-list',
    label: 'Numbered List',
    description: 'Ordered list with numbers',
    section: 'Lists',
    icon: ListOrdered,
    aliases: ['ol', '1.', 'ordered'],
    execute: (editor: Editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    id: 'task-list',
    label: 'Task List',
    description: 'List with checkbox items',
    section: 'Lists',
    icon: ListChecks,
    aliases: ['todo', '[]', 'checklist', 'checkbox'],
    execute: (editor: Editor) => editor.chain().focus().toggleTaskList().run(),
  },

  // Formatting (3)
  {
    id: 'callout',
    label: 'Callout',
    description: 'Highlighted note or warning block',
    section: 'Formatting',
    icon: Info,
    aliases: ['note', 'info', 'warning'],
    execute: (editor: Editor) =>
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'callout',
          attrs: { kind: 'note' },
          content: [{ type: 'paragraph' }],
        })
        .run(),
  },
  {
    id: 'quote',
    label: 'Quote',
    description: 'Blockquote or citation',
    section: 'Formatting',
    icon: Quote,
    aliases: ['blockquote', '>'],
    execute: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    id: 'code-block',
    label: 'Code Block',
    description: 'Code snippet with syntax highlighting',
    section: 'Formatting',
    icon: Code,
    aliases: ['code', '```', 'pre'],
    execute: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
  },

  // Advanced (2)
  {
    id: 'table',
    label: 'Table',
    description: 'Insert a 3x3 table',
    section: 'Advanced',
    icon: Table,
    aliases: ['grid'],
    execute: (editor: Editor) =>
      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    id: 'horizontal-rule',
    label: 'Horizontal Rule',
    description: 'Divider line',
    section: 'Advanced',
    icon: Minus,
    aliases: ['hr', 'divider', '---'],
    execute: (editor: Editor) => editor.chain().focus().setHorizontalRule().run(),
  },
];

export function filterCommands(query: string): SlashCommand[] {
  if (!query) {
    return commands;
  }

  const lowerQuery = query.toLowerCase();
  return commands.filter((cmd) => {
    // Check label
    if (cmd.label.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Check description
    if (cmd.description.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Check aliases
    if (cmd.aliases?.some((alias: string) => alias.toLowerCase().includes(lowerQuery))) {
      return true;
    }

    return false;
  });
}

export function getCommandGroups(): SlashCommandGroup[] {
  const sections: Record<string, SlashCommand[]> = {};

  // Group commands by section
  for (const cmd of commands) {
    if (!sections[cmd.section]) {
      sections[cmd.section] = [];
    }
    const sectionCommands = sections[cmd.section];
    if (sectionCommands) {
      sectionCommands.push(cmd);
    }
  }

  // Convert to array and filter empty sections
  const groups: SlashCommandGroup[] = [];
  for (const [section, cmds] of Object.entries(sections)) {
    if (cmds.length > 0) {
      groups.push({
        section: section as SlashCommand['section'],
        commands: cmds,
      });
    }
  }

  return groups;
}
