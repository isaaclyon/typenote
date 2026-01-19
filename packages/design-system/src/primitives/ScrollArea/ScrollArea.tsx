import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';

import { cn } from '../../lib/utils.js';

// ============================================================================
// Types
// ============================================================================

type ScrollAreaOrientation = 'vertical' | 'horizontal' | 'both';

export interface ScrollAreaProps extends React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Root
> {
  /** Scrollbar orientation */
  orientation?: ScrollAreaOrientation;
  /** Additional class name for the viewport */
  viewportClassName?: string;
}

export interface ScrollBarProps extends React.ComponentPropsWithoutRef<
  typeof ScrollAreaPrimitive.Scrollbar
> {}

// ============================================================================
// ScrollBar
// ============================================================================

const ScrollBar = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Scrollbar>,
  ScrollBarProps
>(({ className, orientation = 'vertical', ...props }, ref) => (
  <ScrollAreaPrimitive.Scrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      'flex touch-none select-none',
      // Fade in/out transition
      'opacity-0 transition-opacity duration-200 ease-out',
      // Show on hover or when scrolling
      'group-hover/scroll-area:opacity-100 data-[state=visible]:opacity-100',
      // Size: 8px wide/tall, no track/border
      orientation === 'vertical' && 'h-full w-2',
      orientation === 'horizontal' && 'h-2 flex-col',
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.Thumb
      className={cn(
        'relative flex-1 rounded-full bg-border',
        'transition-colors duration-150',
        'hover:bg-muted-foreground'
      )}
    />
  </ScrollAreaPrimitive.Scrollbar>
));

ScrollBar.displayName = 'ScrollBar';

// ============================================================================
// ScrollArea
// ============================================================================

const ScrollArea = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, viewportClassName, orientation = 'vertical', children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('group/scroll-area relative overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport
      className={cn('h-full w-full rounded-[inherit]', viewportClassName)}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    {(orientation === 'vertical' || orientation === 'both') && <ScrollBar orientation="vertical" />}
    {(orientation === 'horizontal' || orientation === 'both') && (
      <ScrollBar orientation="horizontal" />
    )}
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));

ScrollArea.displayName = 'ScrollArea';

export { ScrollArea, ScrollBar };
