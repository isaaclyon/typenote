import * as React from 'react';
import { TooltipProvider } from '../Tooltip/Tooltip.js';
import { useIsMobile } from '../../hooks/useIsMobile.js';
import { cn } from '../../utils/cn.js';

const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_ICON = '3rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';

type SidebarContextProps = {
  state: 'expanded' | 'collapsed';
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextProps | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

interface SidebarProviderProps extends React.ComponentProps<'div'> {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /**
   * Storage key for persisting sidebar state to localStorage.
   * If not provided, state is not persisted.
   */
  storageKey?: string;
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  storageKey,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);

  // Initialize from localStorage if storageKey is provided
  const getInitialState = React.useCallback((): boolean => {
    if (typeof window === 'undefined') return defaultOpen;
    if (!storageKey) return defaultOpen;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch {
      // localStorage might not be available
    }
    return defaultOpen;
  }, [defaultOpen, storageKey]);

  // Internal state for uncontrolled mode
  const [_open, _setOpen] = React.useState(getInitialState);
  const open = openProp ?? _open;

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === 'function' ? value(open) : value;

      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }

      // Persist to localStorage if storageKey is provided
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, String(openState));
        } catch {
          // localStorage might not be available
        }
      }
    },
    [setOpenProp, open, storageKey]
  );

  // Toggle sidebar
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  // Keyboard shortcut (Cmd/Ctrl + B)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const state = open ? 'expanded' : 'collapsed';

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              '--sidebar-width': SIDEBAR_WIDTH,
              '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            'group/sidebar-wrapper flex min-h-svh w-full',
            'has-[[data-variant=inset]]:bg-sidebar',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

export { SidebarProvider, useSidebar, SidebarContext };
export type { SidebarContextProps, SidebarProviderProps };
