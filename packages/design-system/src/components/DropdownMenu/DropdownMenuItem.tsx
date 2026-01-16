import * as React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

const dropdownMenuItemVariants = cva(
  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
  {
    variants: {
      variant: {
        default: 'focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        destructive:
          'text-red-600 focus:bg-red-50 focus:text-red-700 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface DropdownMenuItemProps
  extends
    React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>,
    VariantProps<typeof dropdownMenuItemVariants> {
  destructive?: boolean;
}

const DropdownMenuItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuPrimitive.Item>,
  DropdownMenuItemProps
>(({ className, variant, destructive, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      dropdownMenuItemVariants({ variant: destructive ? 'destructive' : variant }),
      className
    )}
    {...props}
  />
));

DropdownMenuItem.displayName = 'DropdownMenuItem';

export { DropdownMenuItem, dropdownMenuItemVariants };
