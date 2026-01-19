import * as React from 'react';
import { cn } from '../../lib/utils.js';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'full';
}

const roundedMap: Record<NonNullable<SkeletonProps['rounded']>, string> = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  full: 'rounded-full',
};

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, rounded = 'md', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('animate-pulse bg-gray-100', roundedMap[rounded], className)}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
