import * as React from 'react';
import { PanelLeft } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { Button } from '../Button/Button.js';
import { useSidebar } from './SidebarContext.js';

interface SidebarTriggerProps extends React.ComponentProps<typeof Button> {}

/**
 * Button that toggles the sidebar open/closed.
 * Can be placed anywhere in the app (typically in a header or toolbar).
 */
function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn('size-7', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}

export { SidebarTrigger };
export type { SidebarTriggerProps };
