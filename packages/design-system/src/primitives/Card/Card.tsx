import * as React from 'react';
import { cn } from '../../lib/utils.js';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('rounded-lg border border-border bg-card p-4 text-card-foreground', className)}
      {...props}
    />
  );
});

Card.displayName = 'Card';

export { Card };
