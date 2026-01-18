import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';
import { Tooltip, TooltipTrigger, TooltipContent } from '../Tooltip/Tooltip.js';
import { useSidebar } from './SidebarContext.js';

/**
 * Container for sidebar menu items (renders as <ul>).
 */
function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
}

/**
 * Individual menu item wrapper (renders as <li>).
 */
function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn('group/menu-item relative', className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  [
    'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm',
    'outline-hidden ring-sidebar-ring transition-[width,height,padding]',
    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
    'focus-visible:ring-2',
    'active:bg-sidebar-accent active:text-sidebar-accent-foreground',
    'disabled:pointer-events-none disabled:opacity-50',
    'aria-disabled:pointer-events-none aria-disabled:opacity-50',
    'data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground',
    'data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground',
    // Padding adjustment when there's a menu action
    'group-has-[[data-sidebar=menu-action]]/menu-item:pr-8',
    // Icon-only mode
    'group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2',
    '[&>span:last-child]:truncate',
    '[&>svg]:size-4 [&>svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        default: 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        outline:
          'bg-background shadow-[0_0_0_1px_var(--color-sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--color-sidebar-accent)]',
      },
      size: {
        default: 'h-8 text-sm',
        sm: 'h-7 text-xs',
        lg: 'h-12 text-sm group-data-[collapsible=icon]:!p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface SidebarMenuButtonProps
  extends React.ComponentProps<'button'>, VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string | React.ComponentProps<typeof TooltipContent>;
}

/**
 * Primary button within a sidebar menu item.
 * Supports tooltip display when sidebar is collapsed to icon mode.
 */
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = 'default',
  size = 'default',
  tooltip,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot : 'button';
  const { isMobile, state } = useSidebar();

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      {...props}
    />
  );

  if (!tooltip) {
    return button;
  }

  const tooltipProps = typeof tooltip === 'string' ? { children: tooltip } : tooltip;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== 'collapsed' || isMobile}
        {...tooltipProps}
      />
    </Tooltip>
  );
}

interface SidebarMenuActionProps extends React.ComponentProps<'button'> {
  asChild?: boolean;
  showOnHover?: boolean;
}

/**
 * Secondary action button within a menu item.
 * Positioned to the right of the main button.
 * Can be set to only show on hover.
 */
function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: SidebarMenuActionProps) {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        'absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0',
        'text-sidebar-foreground ring-sidebar-ring',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'peer-hover/menu-button:text-sidebar-accent-foreground',
        'outline-hidden transition-transform focus-visible:ring-2',
        '[&>svg]:size-4 [&>svg]:shrink-0',
        // Larger hit area on mobile
        'after:absolute after:-inset-2 md:after:hidden',
        // Position based on button size
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        showOnHover &&
          'md:opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
        className
      )}
      {...props}
    />
  );
}

/**
 * Badge/count display within a menu item.
 * Positioned to the right of the menu button.
 */
function SidebarMenuBadge({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        'absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1',
        'text-xs font-medium tabular-nums text-sidebar-foreground pointer-events-none select-none',
        'peer-hover/menu-button:text-sidebar-accent-foreground',
        'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
        // Position based on button size
        'peer-data-[size=sm]/menu-button:top-1',
        'peer-data-[size=default]/menu-button:top-1.5',
        'peer-data-[size=lg]/menu-button:top-2.5',
        'group-data-[collapsible=icon]:hidden',
        className
      )}
      {...props}
    />
  );
}

export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  sidebarMenuButtonVariants,
};
export type { SidebarMenuButtonProps, SidebarMenuActionProps };
