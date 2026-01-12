import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { ContentAreaProps } from './types.js';

/**
 * Fluid content wrapper for the main area of AppShell.
 *
 * Flexes to fill available space between sidebars, with
 * min-w-0 to prevent flex overflow issues.
 */
const ContentArea = React.forwardRef<HTMLElement, ContentAreaProps>(
  ({ children, className }, ref) => {
    return (
      <main
        ref={ref}
        className={cn(
          'flex-1 min-w-0', // min-w-0 prevents flex overflow issues
          'overflow-auto',
          className
        )}
      >
        {children}
      </main>
    );
  }
);

ContentArea.displayName = 'ContentArea';

export { ContentArea };
