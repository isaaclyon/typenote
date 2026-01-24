import * as React from 'react';
import { cn } from '../../lib/utils.js';

type DividerOrientation = 'horizontal' | 'vertical';

type DividerTone = 'subtle' | 'default';

export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: DividerOrientation;
  tone?: DividerTone;
}

const toneMap: Record<DividerTone, string> = {
  default: 'bg-border',
  subtle: 'bg-secondary',
};

const orientationMap: Record<DividerOrientation, string> = {
  horizontal: 'h-px',
  vertical: 'h-full w-px',
};

const Divider = React.forwardRef<HTMLDivElement, DividerProps>(
  ({ className, orientation = 'horizontal', tone = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation={orientation}
        className={cn('shrink-0', orientationMap[orientation], toneMap[tone], className)}
        {...props}
      />
    );
  }
);

Divider.displayName = 'Divider';

export { Divider };
export type { DividerOrientation, DividerTone };
