import type { Icon as PhosphorIcon } from '@phosphor-icons/react';
import type { NavItemAction } from '../../patterns/NavItem/NavItem.js';

// ============================================================================
// Sidebar
// ============================================================================

export interface SidebarProps {
  /** Whether the sidebar is collapsed to icon-only mode */
  collapsed: boolean;
  /** Callback when collapse state changes */
  onCollapsedChange: (collapsed: boolean) => void;
  /** Sidebar content (SidebarHeader, SidebarSection, SidebarFooter) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// SidebarHeader
// ============================================================================

export interface SidebarHeaderProps {
  /** Callback when new note action is clicked */
  onNewClick?: () => void;
  /** Label for new note button */
  newLabel?: string;
  /** Callback when search is clicked (opens command palette) */
  onSearchClick?: () => void;
  /** Keyboard shortcut hint for search (e.g., "⌘K" or "Ctrl+K") */
  searchShortcut?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// SidebarSection
// ============================================================================

export interface SidebarSectionProps {
  /** Optional section label */
  label?: string;
  /** Section content (typically SidebarItem components) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// SidebarFooter
// ============================================================================

export interface SidebarFooterAction {
  /** Phosphor icon component */
  icon: PhosphorIcon;
  /** Tooltip label */
  label: string;
  /** Click handler */
  onClick: () => void;
  /** Whether this action is currently active */
  active?: boolean;
}

export interface SidebarFooterProps {
  /** Actions to display in the footer */
  actions: SidebarFooterAction[];
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// SidebarItem
// ============================================================================

export interface SidebarItemProps {
  /** Phosphor icon component */
  icon: PhosphorIcon;
  /** Item label */
  label: string;
  /** Optional count (visible on hover) */
  count?: number;
  /** Whether this item is currently active/selected */
  active?: boolean;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Optional color for the icon */
  iconColor?: string;
  /** Click handler */
  onClick?: () => void;
  /** Optional href for link semantics */
  href?: string;
  /** Actions to show in the dropdown menu */
  actions?: NavItemAction[];
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Context
// ============================================================================

export interface SidebarContextValue {
  collapsed: boolean;
}
