// pinningStyles.ts
import type { Column } from '@tanstack/react-table';
import type { CSSProperties } from 'react';

/**
 * Generate CSS styles for a column based on its pinning state.
 * Pinned columns use position: sticky with calculated left/right offsets.
 */
export function getColumnPinningStyles<TData>(column: Column<TData, unknown>): CSSProperties {
  const isPinned = column.getIsPinned();

  if (!isPinned) {
    return {};
  }

  const isLastLeftPinned = isPinned === 'left' && column.getIsLastColumn('left');
  const isFirstRightPinned = isPinned === 'right' && column.getIsFirstColumn('right');

  return {
    position: 'sticky',
    left: isPinned === 'left' ? `${column.getStart('left')}px` : undefined,
    right: isPinned === 'right' ? `${column.getAfter('right')}px` : undefined,
    zIndex: 1,
    backgroundColor: 'white',
    // Visual separator shadow on the edge of pinned group
    boxShadow: isLastLeftPinned
      ? '-4px 0 4px -4px rgba(0,0,0,0.1) inset'
      : isFirstRightPinned
        ? '4px 0 4px -4px rgba(0,0,0,0.1) inset'
        : undefined,
  };
}

/**
 * Build initial column pinning state from column definitions.
 */
export function buildInitialPinningState(
  columns: Array<{ id: string; pinned?: 'left' | 'right' }>,
  enableRowSelection: boolean
): { left: string[]; right: string[] } {
  const left: string[] = [];
  const right: string[] = [];

  // Selection checkbox is always pinned left when enabled
  if (enableRowSelection) {
    left.push('_selection');
  }

  for (const col of columns) {
    if (col.pinned === 'left') {
      left.push(col.id);
    } else if (col.pinned === 'right') {
      right.push(col.id);
    }
  }

  return { left, right };
}
