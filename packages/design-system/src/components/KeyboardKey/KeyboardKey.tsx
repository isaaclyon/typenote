import * as React from 'react';
import { cn } from '../../utils/cn.js';

export interface KeyboardKeyProps extends React.HTMLAttributes<HTMLElement> {}

function KeyboardKey({ className, children, ...props }: KeyboardKeyProps) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center',
        'px-1.5 py-0.5 min-w-[1.5rem]',
        'font-mono text-xs',
        'bg-muted border border-border rounded shadow-sm',
        'text-foreground',
        className
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

export { KeyboardKey };
