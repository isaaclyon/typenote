import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '../../lib/utils.js';

type TooltipSide = 'top' | 'right' | 'bottom' | 'left';

type TooltipAlign = 'start' | 'center' | 'end';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: TooltipSide;
  align?: TooltipAlign;
  delayDuration?: number;
  disabled?: boolean;
  openOnClick?: boolean;
  className?: string;
}

const Tooltip = ({
  content,
  children,
  side = 'top',
  align = 'center',
  delayDuration = 120,
  disabled = false,
  openOnClick = true,
  className,
}: TooltipProps) => {
  const [open, setOpen] = React.useState(false);

  if (disabled) {
    return <>{children}</>;
  }

  const trigger = React.isValidElement(children) ? (
    React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
      onClick: (event: React.MouseEvent) => {
        const childProps = (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>)
          .props;
        if (typeof childProps.onClick === 'function') {
          childProps.onClick(event as React.MouseEvent<HTMLElement>);
        }
        if (!event.defaultPrevented && openOnClick) {
          setOpen((prevOpen) => !prevOpen);
        }
      },
    })
  ) : (
    <span
      onClick={(event) => {
        if (!event.defaultPrevented && openOnClick) {
          setOpen((prevOpen) => !prevOpen);
        }
      }}
    >
      {children}
    </span>
  );

  return (
    <TooltipPrimitive.Provider delayDuration={delayDuration}>
      <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>
        <TooltipPrimitive.Trigger asChild>{trigger}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            sideOffset={8}
            className={cn(
              'z-50 rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground',
              'shadow-sm shadow-black/5',
              'data-[state=delayed-open]:animate-in data-[state=closed]:animate-out',
              'data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0',
              'data-[state=delayed-open]:zoom-in-95 data-[state=closed]:zoom-out-95',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
              'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
              className
            )}
          >
            {content}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};

Tooltip.displayName = 'Tooltip';

export { Tooltip };
export type { TooltipSide, TooltipAlign };
