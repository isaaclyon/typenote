import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../Sheet/Sheet.js';
import { useSidebar } from './SidebarContext.js';

const SIDEBAR_WIDTH_MOBILE = '18rem';

interface SidebarProps extends React.ComponentProps<'div'> {
  /**
   * Which side of the screen the sidebar appears on
   * @default 'left'
   */
  side?: 'left' | 'right';
  /**
   * Visual variant of the sidebar
   * - 'sidebar': Default, attached to edge
   * - 'floating': Has margin and border radius
   * - 'inset': Similar to floating but with different inset behavior
   * @default 'sidebar'
   */
  variant?: 'sidebar' | 'floating' | 'inset';
  /**
   * How the sidebar collapses
   * - 'offcanvas': Slides completely off screen
   * - 'icon': Collapses to icon-only width
   * - 'none': Never collapses
   * @default 'offcanvas'
   */
  collapsible?: 'offcanvas' | 'icon' | 'none';
  /**
   * Whether to add padding for the macOS title bar (traffic lights)
   * @default false
   */
  hasTitleBarPadding?: boolean;
}

function Sidebar({
  side = 'left',
  variant = 'sidebar',
  collapsible = 'offcanvas',
  hasTitleBarPadding = false,
  className,
  children,
  ...props
}: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();

  // Non-collapsible sidebar (always visible)
  if (collapsible === 'none') {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          'flex h-full w-[var(--sidebar-width)] flex-col',
          'bg-sidebar text-sidebar-foreground',
          hasTitleBarPadding && 'pt-10',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  // Mobile: Show as Sheet
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className={cn(
            'w-[var(--sidebar-width)] p-0 [&>button]:hidden',
            'bg-sidebar text-sidebar-foreground'
          )}
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Navigation sidebar</SheetDescription>
          </SheetHeader>
          <div className={cn('flex h-full w-full flex-col', hasTitleBarPadding && 'pt-10')}>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Collapsible sidebar
  return (
    <div
      className="group peer hidden text-sidebar-foreground md:block"
      data-state={state}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* Spacer that creates the gap for the sidebar */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          'relative w-[var(--sidebar-width)] bg-transparent transition-[width] duration-200 ease-linear',
          'group-data-[collapsible=offcanvas]:w-0',
          'group-data-[side=right]:rotate-180',
          variant === 'floating' || variant === 'inset'
            ? 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]'
            : 'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]'
        )}
      />
      {/* Fixed sidebar container */}
      <div
        data-slot="sidebar-container"
        className={cn(
          'fixed inset-y-0 z-10 hidden h-svh w-[var(--sidebar-width)] transition-[left,right,width] duration-200 ease-linear md:flex',
          side === 'left'
            ? 'left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]'
            : 'right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]',
          variant === 'floating' || variant === 'inset'
            ? 'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem+2px)]'
            : cn(
                'group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]',
                'group-data-[side=left]:border-r group-data-[side=right]:border-l'
              ),
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className={cn(
            'flex h-full w-full flex-col bg-sidebar',
            'group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm',
            hasTitleBarPadding && 'pt-10'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export { Sidebar };
export type { SidebarProps };
