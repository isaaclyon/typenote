import * as React from 'react';
import { cn } from '../../utils/cn.js';
import type { ModalHeaderProps } from './types.js';

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ title, subtitle, className }, ref) => {
    return (
      <div ref={ref} className={cn('px-4 pt-4 pb-3', className)}>
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

export { ModalHeader };
