/**
 * Table Extension
 *
 * Simple data tables using TipTap's official table extensions.
 * Wraps the base extensions with TypeNote-specific configuration.
 *
 * Features:
 * - First row as header (styled distinctly)
 * - Tab/Shift+Tab navigation between cells
 * - Floating table toolbar (see TableToolbar component)
 *
 * Note: Column resizing is disabled due to layout issues with prosemirror-tables
 * widget decorations. Can revisit later.
 */

import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

// ============================================================================
// Configured Extensions
// ============================================================================

/**
 * Pre-configured Table extension for TypeNote.
 * Column resizing disabled for now due to layout issues.
 */
export const TableExtension = Table.configure({
  resizable: false,
});

/**
 * Table row extension.
 */
export const TableRowExtension = TableRow;

/**
 * Regular table cell extension.
 */
export const TableCellExtension = TableCell;

/**
 * Header cell extension (for first row).
 */
export const TableHeaderExtension = TableHeader;

// ============================================================================
// Bundle Export
// ============================================================================

/**
 * All table-related extensions bundled together.
 * Use spread operator to add all at once:
 *
 * @example
 * ```ts
 * import { TableExtensions } from './extensions/Table';
 *
 * const extensions = [
 *   StarterKit,
 *   ...TableExtensions,
 * ];
 * ```
 */
export const TableExtensions = [
  TableExtension,
  TableRowExtension,
  TableCellExtension,
  TableHeaderExtension,
];

// Re-export types for convenience
export type { TableOptions } from '@tiptap/extension-table';
