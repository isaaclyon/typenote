import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../../utils/cn.js';

export interface DropdownMenuSeparatorProps extends React.ComponentPropsWithoutRef<
  typeof DropdownMenuPrimitive.Separator
> {}

const DropdownMenuSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Separator>,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('my-1 h-px bg-gray-200', className)}
    {...props}
  />
));

DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export { DropdownMenuSeparator };
