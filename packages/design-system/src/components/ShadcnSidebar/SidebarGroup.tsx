import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '../../utils/cn.js';

/**
 * Groups related sidebar items together.
 * Can contain a label, action button, and content.
 */
function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn('relative flex w-full min-w-0 flex-col p-2', className)}
      {...props}
    />
  );
}

interface SidebarGroupLabelProps extends React.ComponentProps<'div'> {
  asChild?: boolean;
}

/**
 * Label for a sidebar group.
 * Hidden when sidebar is collapsed to icon mode.
 */
function SidebarGroupLabel({ className, asChild = false, ...props }: SidebarGroupLabelProps) {
  const Comp = asChild ? Slot : 'div';

  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium',
        'text-sidebar-foreground/70 ring-sidebar-ring',
        'outline-hidden transition-[margin,opacity] duration-200 ease-linear',
        'focus-visible:ring-2',
        '[&>svg]:size-4 [&>svg]:shrink-0',
        'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
        className
      )}
      {...props}
    />
  );
}

interface SidebarGroupActionProps extends React.ComponentProps<'button'> {
  asChild?: boolean;
}

/**
 * Action button positioned in the top-right of a sidebar group.
 * Hidden when sidebar is collapsed to icon mode.
 */
function SidebarGroupAction({ className, asChild = false, ...props }: SidebarGroupActionProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        'absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0',
        'text-sidebar-foreground ring-sidebar-ring',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'outline-hidden transition-transform focus-visible:ring-2',
        '[&>svg]:size-4 [&>svg]:shrink-0',
        // Larger hit area on mobile
        'after:absolute after:-inset-2 md:after:hidden',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
}

/**
 * Content container within a sidebar group.
 */
function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn('w-full text-sm', className)}
      {...props}
    />
  );
}

export { SidebarGroup, SidebarGroupLabel, SidebarGroupAction, SidebarGroupContent };
export type { SidebarGroupLabelProps, SidebarGroupActionProps };
