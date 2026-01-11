import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { ModalContentProps } from './types.js';

const ModalContent = React.forwardRef<HTMLDivElement, ModalContentProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('px-4 py-3 text-sm text-gray-600', className)}>
        {children}
      </div>
    );
  }
);

ModalContent.displayName = 'ModalContent';

export { ModalContent };
