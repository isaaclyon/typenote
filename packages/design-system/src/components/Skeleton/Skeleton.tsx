import * as React from 'react';
import { cn } from '../../utils/cn.js';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100',
        'bg-[length:200%_100%] rounded',
        className
      )}
      style={{
        animation: 'shimmer 2s ease-in-out infinite',
      }}
      {...props}
    />
  );
}

export { Skeleton };
