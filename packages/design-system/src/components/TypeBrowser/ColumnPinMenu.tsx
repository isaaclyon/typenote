// ColumnPinMenu.tsx
import * as React from 'react';
import type { Column } from '@tanstack/react-table';
import {
  useFloating,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  offset,
  flip,
  FloatingPortal,
} from '@floating-ui/react';
import { Pin, PinOff } from 'lucide-react';
import { cn } from '../../utils/cn.js';

export interface ColumnPinMenuProps {
  /** The column to control pinning for */
  column: Column<unknown, unknown>;
  /** Whether this column is permanently pinned (cannot be changed by user) */
  isPermanentlyPinned: boolean;
}

/**
 * Dropdown menu for pinning/unpinning a column.
 * Shows pin icon that reveals menu on click.
 */
export function ColumnPinMenu({ column, isPermanentlyPinned }: ColumnPinMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const isPinned = column.getIsPinned();

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    middleware: [offset(4), flip({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'menu' });

  const { getReferenceProps, getFloatingProps } = useInteractions([click, dismiss, role]);

  const handlePin = (direction: 'left' | 'right' | false) => {
    column.pin(direction);
    setIsOpen(false);
  };

  // Don't show menu for permanently pinned columns
  if (isPermanentlyPinned) {
    return (
      <span className="text-gray-400" title="This column is always pinned">
        <Pin className="w-3 h-3" />
      </span>
    );
  }

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        className={cn(
          'p-0.5 rounded transition-colors',
          'opacity-0 group-hover:opacity-100',
          isPinned && 'opacity-100 text-accent-600',
          !isPinned && 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
          isOpen && 'opacity-100 bg-gray-100'
        )}
        {...getReferenceProps()}
        title={isPinned ? `Pinned ${isPinned}` : 'Pin column'}
      >
        {isPinned ? <Pin className="w-3 h-3" /> : <Pin className="w-3 h-3" />}
      </button>

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className="z-50 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]"
          >
            <button
              type="button"
              className={cn(
                'w-full px-3 py-1.5 text-left text-sm flex items-center gap-2',
                'hover:bg-gray-50 transition-colors',
                isPinned === 'left' && 'text-accent-600 bg-accent-50'
              )}
              onClick={() => handlePin('left')}
            >
              <Pin className="w-3.5 h-3.5" />
              Pin Left
            </button>
            <button
              type="button"
              className={cn(
                'w-full px-3 py-1.5 text-left text-sm flex items-center gap-2',
                'hover:bg-gray-50 transition-colors',
                isPinned === 'right' && 'text-accent-600 bg-accent-50'
              )}
              onClick={() => handlePin('right')}
            >
              <Pin className="w-3.5 h-3.5 rotate-180" />
              Pin Right
            </button>
            {isPinned && (
              <>
                <div className="border-t border-gray-100 my-1" />
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-600"
                  onClick={() => handlePin(false)}
                >
                  <PinOff className="w-3.5 h-3.5" />
                  Unpin
                </button>
              </>
            )}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

ColumnPinMenu.displayName = 'ColumnPinMenu';
