import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { CommandPaletteProps } from './types.js';

/**
 * CommandPalette - Root container for the command palette.
 *
 * A modal dialog with backdrop blur that renders children (Input, List, etc.).
 * Handles body scroll locking when open.
 */
const CommandPalette = React.forwardRef<HTMLDivElement, CommandPaletteProps>(
  ({ open, onOpenChange, children, className }, ref) => {
    // Lock body scroll when open
    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [open]);

    if (!open) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
          aria-hidden="true"
        />

        {/* Command Palette Dialog */}
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          className={cn(
            'relative bg-background rounded-lg shadow-2xl w-full max-w-lg mx-4',
            'animate-[slide-in-from-bottom_200ms_ease-out]',
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);

CommandPalette.displayName = 'CommandPalette';

export { CommandPalette };
