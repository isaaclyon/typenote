import type * as React from 'react';

/**
 * Props passed to sidebar render functions
 */
export interface SidebarSlotProps {
  collapsed: boolean;
}

/**
 * AppShell component props
 */
export interface AppShellProps {
  /** Render function for left sidebar, receives collapsed state */
  leftSidebar?: ((props: SidebarSlotProps) => React.ReactNode) | undefined;
  /** Render function for right sidebar, receives collapsed state */
  rightSidebar?: ((props: SidebarSlotProps) => React.ReactNode) | undefined;
  /** Main content area */
  children: React.ReactNode;
  /** localStorage key for left sidebar collapse state */
  leftSidebarStorageKey?: string | undefined;
  /** localStorage key for right sidebar collapse state */
  rightSidebarStorageKey?: string | undefined;
  /** localStorage key for left sidebar width */
  leftSidebarWidthStorageKey?: string | undefined;
  /** localStorage key for right sidebar width */
  rightSidebarWidthStorageKey?: string | undefined;
  /** Default collapsed state for left sidebar */
  defaultLeftCollapsed?: boolean | undefined;
  /** Default collapsed state for right sidebar */
  defaultRightCollapsed?: boolean | undefined;
  /** Offset left sidebar controls for macOS title bar padding */
  leftSidebarHasTitleBarPadding?: boolean | undefined;
  /** Offset right sidebar controls for macOS title bar padding */
  rightSidebarHasTitleBarPadding?: boolean | undefined;
  /** Additional CSS classes */
  className?: string | undefined;
}

/**
 * SidebarCollapseButton component props
 */
export interface SidebarCollapseButtonProps {
  /** Whether the sidebar is currently collapsed */
  collapsed: boolean;
  /** Click handler to toggle collapse state */
  onClick: () => void;
  /** Which side of the layout (affects chevron direction) */
  side: 'left' | 'right';
  /** Whether to offset for macOS title bar padding */
  hasTitleBarPadding?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ContentArea component props
 */
export interface ContentAreaProps {
  /** Content to render */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Options for useCollapsibleSidebar hook
 */
export interface UseCollapsibleSidebarOptions {
  /** Default collapsed state */
  defaultCollapsed?: boolean | undefined;
  /** localStorage key for persistence (optional) */
  storageKey?: string | undefined;
}

/**
 * Return value from useCollapsibleSidebar hook
 */
export interface UseCollapsibleSidebarReturn {
  /** Current collapsed state */
  collapsed: boolean;
  /** Toggle collapsed state */
  toggle: () => void;
  /** Set collapsed state directly */
  setCollapsed: (collapsed: boolean) => void;
}
