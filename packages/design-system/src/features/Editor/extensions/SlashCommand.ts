/**
 * SlashCommand Extension
 *
 * Enables a slash command menu for inserting block types.
 * Triggered by typing `/` at the start of a line.
 *
 * Block types supported:
 * - Paragraph (text/p)
 * - Heading 1-3 (h1/h2/h3)
 * - Bullet List (bullet/ul)
 * - Numbered List (numbered/ol)
 * - Quote (quote/blockquote)
 * - Code Block (code/codeblock)
 * - Divider (divider/hr)
 */

import type { Editor, Range } from '@tiptap/core';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

// ============================================================================
// Types
// ============================================================================

/**
 * A slash command item representing a block type that can be inserted.
 */
export interface SlashCommandItem {
  /** Unique identifier for the command */
  id: string;
  /** Display label (e.g., "Heading 1") */
  title: string;
  /** Icon component from Phosphor */
  icon: PhosphorIcon;
  /** Search aliases (e.g., ['h1', 'heading1']) */
  keywords: string[];
  /** Function to execute the command */
  command: (editor: Editor, range: Range) => void;
}

// ============================================================================
// Commands
// ============================================================================

/**
 * Creates a slash command item with the given properties.
 */
function createCommand(
  id: string,
  title: string,
  icon: PhosphorIcon,
  keywords: string[],
  action: (editor: Editor, range: Range) => void
): SlashCommandItem {
  return {
    id,
    title,
    icon,
    keywords,
    command: action,
  };
}

/**
 * Get the default slash command items.
 * Icons are passed in to avoid importing them in this file (keeps it tree-shakeable).
 */
export function getSlashCommandItems(icons: {
  TextT: PhosphorIcon;
  TextHOne: PhosphorIcon;
  TextHTwo: PhosphorIcon;
  TextHThree: PhosphorIcon;
  ListBullets: PhosphorIcon;
  ListNumbers: PhosphorIcon;
  ListChecks: PhosphorIcon;
  Quotes: PhosphorIcon;
  Code: PhosphorIcon;
  Minus: PhosphorIcon;
}): SlashCommandItem[] {
  return [
    createCommand(
      'paragraph',
      'Paragraph',
      icons.TextT,
      ['text', 'p', 'paragraph'],
      (editor, range) => {
        editor.chain().focus().deleteRange(range).setParagraph().run();
      }
    ),
    createCommand(
      'heading1',
      'Heading 1',
      icons.TextHOne,
      ['h1', 'heading1', 'heading 1'],
      (editor, range) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
      }
    ),
    createCommand(
      'heading2',
      'Heading 2',
      icons.TextHTwo,
      ['h2', 'heading2', 'heading 2'],
      (editor, range) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
      }
    ),
    createCommand(
      'heading3',
      'Heading 3',
      icons.TextHThree,
      ['h3', 'heading3', 'heading 3'],
      (editor, range) => {
        editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
      }
    ),
    createCommand(
      'bulletList',
      'Bullet List',
      icons.ListBullets,
      ['bullet', 'ul', 'list', 'bullet list'],
      (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      }
    ),
    createCommand(
      'orderedList',
      'Numbered List',
      icons.ListNumbers,
      ['numbered', 'ol', 'number', 'ordered', 'numbered list'],
      (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      }
    ),
    createCommand(
      'taskList',
      'Task List',
      icons.ListChecks,
      ['task', 'todo', 'checkbox', 'check', 'task list', 'todo list', '[]'],
      (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      }
    ),
    createCommand('blockquote', 'Quote', icons.Quotes, ['quote', 'blockquote'], (editor, range) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    }),
    createCommand(
      'codeBlock',
      'Code Block',
      icons.Code,
      ['code', 'codeblock', 'code block'],
      (editor, range) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      }
    ),
    createCommand(
      'horizontalRule',
      'Divider',
      icons.Minus,
      ['divider', 'hr', 'horizontal', 'rule', 'line'],
      (editor, range) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      }
    ),
  ];
}

/**
 * Filter slash command items by query string.
 * Matches against title (case-insensitive) or any keyword.
 */
export function filterSlashCommands(items: SlashCommandItem[], query: string): SlashCommandItem[] {
  if (!query) return items;

  const lower = query.toLowerCase();
  return items.filter(
    (item) =>
      item.title.toLowerCase().includes(lower) ||
      item.keywords.some((kw) => kw.toLowerCase().includes(lower))
  );
}
