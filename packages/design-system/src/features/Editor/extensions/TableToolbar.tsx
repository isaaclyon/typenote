/**
 * TableToolbar - Floating toolbar for table operations.
 *
 * Appears when the cursor is inside a table cell.
 * Provides quick access to row/column add/delete operations.
 */

import * as React from 'react';
import type { Editor } from '@tiptap/react';
import { Plus } from '@phosphor-icons/react/dist/ssr/Plus';
import { Minus } from '@phosphor-icons/react/dist/ssr/Minus';
import { Trash } from '@phosphor-icons/react/dist/ssr/Trash';
import { Rows } from '@phosphor-icons/react/dist/ssr/Rows';
import { Columns } from '@phosphor-icons/react/dist/ssr/Columns';
import { X } from '@phosphor-icons/react/dist/ssr/X';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';

import { cn } from '../../../lib/utils.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../../../primitives/DropdownMenu/index.js';
import { Tooltip } from '../../../primitives/Tooltip/index.js';

// ============================================================================
// Types
// ============================================================================

export interface TableToolbarProps {
  /** The TipTap editor instance */
  editor: Editor;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// TableToolbar Component
// ============================================================================

export function TableToolbar({ editor, className }: TableToolbarProps) {
  // Check if cursor is in a table
  const isInTable = editor.isActive('table');

  // Confirm delete state
  const [confirmingDelete, setConfirmingDelete] = React.useState(false);
  const toolbarRef = React.useRef<HTMLDivElement>(null);

  // Auto-cancel when selection changes (cursor leaves table)
  React.useEffect(() => {
    if (!isInTable && confirmingDelete) {
      setConfirmingDelete(false);
    }
  }, [isInTable, confirmingDelete]);

  // Auto-cancel on click outside
  React.useEffect(() => {
    if (!confirmingDelete) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setConfirmingDelete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [confirmingDelete]);

  if (!isInTable) {
    return null;
  }

  // Row operations
  const addRowBefore = () => editor.chain().focus().addRowBefore().run();
  const addRowAfter = () => editor.chain().focus().addRowAfter().run();
  const deleteRow = () => editor.chain().focus().deleteRow().run();

  // Column operations
  const addColumnBefore = () => editor.chain().focus().addColumnBefore().run();
  const addColumnAfter = () => editor.chain().focus().addColumnAfter().run();
  const deleteColumn = () => editor.chain().focus().deleteColumn().run();

  // Table operations
  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
    setConfirmingDelete(false);
  };

  const handleDeleteClick = () => {
    setConfirmingDelete(true);
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(false);
  };

  return (
    <div
      ref={toolbarRef}
      className={cn(
        'table-toolbar',
        'flex items-center gap-1 p-1',
        'bg-popover border border-border rounded-md shadow-sm',
        className
      )}
    >
      {/* Row menu */}
      <DropdownMenu>
        <Tooltip content="Row options">
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center justify-center',
                'w-7 h-7 rounded',
                'text-muted-foreground hover:text-foreground',
                'hover:bg-muted',
                'transition-colors duration-150'
              )}
            >
              <Rows className="h-4 w-4" weight="regular" />
            </button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Row</DropdownMenuLabel>
          <DropdownMenuItem onClick={addRowBefore}>
            <Plus className="h-4 w-4" />
            Insert row above
          </DropdownMenuItem>
          <DropdownMenuItem onClick={addRowAfter}>
            <Plus className="h-4 w-4" />
            Insert row below
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onClick={deleteRow}>
            <Minus className="h-4 w-4" />
            Delete row
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Column menu */}
      <DropdownMenu>
        <Tooltip content="Column options">
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'flex items-center justify-center',
                'w-7 h-7 rounded',
                'text-muted-foreground hover:text-foreground',
                'hover:bg-muted',
                'transition-colors duration-150'
              )}
            >
              <Columns className="h-4 w-4" weight="regular" />
            </button>
          </DropdownMenuTrigger>
        </Tooltip>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Column</DropdownMenuLabel>
          <DropdownMenuItem onClick={addColumnBefore}>
            <Plus className="h-4 w-4" />
            Insert column left
          </DropdownMenuItem>
          <DropdownMenuItem onClick={addColumnAfter}>
            <Plus className="h-4 w-4" />
            Insert column right
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onClick={deleteColumn}>
            <Minus className="h-4 w-4" />
            Delete column
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Separator */}
      <div className="w-px h-4 bg-border mx-1" />

      {/* Delete table button / confirm row */}
      {confirmingDelete ? (
        <div className="flex items-center gap-1">
          <span className="text-xs text-error font-medium px-1 whitespace-nowrap">
            Delete table?
          </span>
          <Tooltip content="Confirm delete">
            <button
              type="button"
              className={cn(
                'flex items-center justify-center',
                'w-6 h-6 rounded',
                'text-error hover:text-error-foreground',
                'bg-error/10 hover:bg-error',
                'transition-colors duration-150'
              )}
              onClick={deleteTable}
            >
              <Check className="h-3.5 w-3.5" weight="bold" />
            </button>
          </Tooltip>
          <Tooltip content="Cancel">
            <button
              type="button"
              className={cn(
                'flex items-center justify-center',
                'w-6 h-6 rounded',
                'text-muted-foreground hover:text-foreground',
                'hover:bg-muted',
                'transition-colors duration-150'
              )}
              onClick={handleCancelDelete}
            >
              <X className="h-3.5 w-3.5" weight="bold" />
            </button>
          </Tooltip>
        </div>
      ) : (
        <Tooltip content="Delete table">
          <button
            type="button"
            className={cn(
              'flex items-center justify-center',
              'w-7 h-7 rounded',
              'text-muted-foreground hover:text-error',
              'hover:bg-error/10',
              'transition-colors duration-150'
            )}
            onClick={handleDeleteClick}
          >
            <Trash className="h-4 w-4" weight="regular" />
          </button>
        </Tooltip>
      )}
    </div>
  );
}

TableToolbar.displayName = 'TableToolbar';
