import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { ModalFooterProps } from './types.js';

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('px-4 pb-4 pt-3 flex items-center justify-end gap-2', className)}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

export { ModalFooter };
