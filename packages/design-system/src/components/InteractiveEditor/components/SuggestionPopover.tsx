import * as React from 'react';
import { Popover, PopoverContent, PopoverAnchor } from '../../ui/popover.js';

export interface SuggestionPopoverProps {
  /** Whether the popover is open */
  open: boolean;
  /** Called when popover should close */
  onClose: () => void;
  /** Position for the popover (from TipTap's clientRect) */
  position: { top: number; left: number } | null;
  /** Menu content */
  children: React.ReactNode;
  /** Additional class name for the content */
  className?: string;
}

/**
 * SuggestionPopover - A positioned popover for TipTap suggestion menus.
 *
 * This component bridges TipTap's suggestion API (which provides cursor position)
 * with shadcn's Popover component. It creates a virtual anchor at the cursor
 * position and renders the popover content there.
 *
 * @example
 * ```tsx
 * <SuggestionPopover
 *   open={isActive}
 *   onClose={handleClose}
 *   position={{ top: rect.bottom, left: rect.left }}
 * >
 *   <WikiLinkMenu items={items} onSelect={handleSelect} />
 * </SuggestionPopover>
 * ```
 */
export const SuggestionPopover = React.forwardRef<HTMLDivElement, SuggestionPopoverProps>(
  ({ open, onClose, position, children, className }, ref) => {
    if (!open || !position) {
      return null;
    }

    return (
      <Popover open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        {/* Virtual anchor positioned at cursor */}
        <PopoverAnchor asChild>
          <span
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              width: 1,
              height: 1,
              pointerEvents: 'none',
            }}
          />
        </PopoverAnchor>
        <PopoverContent
          ref={ref}
          className={className}
          align="start"
          side="bottom"
          sideOffset={4}
          onEscapeKeyDown={onClose}
          onInteractOutside={onClose}
          // Prevent popover from stealing focus from editor
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {children}
        </PopoverContent>
      </Popover>
    );
  }
);

SuggestionPopover.displayName = 'SuggestionPopover';
