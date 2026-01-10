import type { LucideIcon } from 'lucide-react';

// Main container
export interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// Type item (most complex component)
export interface SidebarTypeItemProps {
  icon: LucideIcon;
  label: string;
  count: number;
  color?: string; // For icon color
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

// Search trigger
export interface SidebarSearchTriggerProps {
  onClick?: () => void;
  shortcut?: string; // defaults to "⌘K"
  className?: string;
}

// Calendar button
export interface SidebarCalendarButtonProps {
  onClick?: () => void;
  isToday?: boolean;
  className?: string;
}

// Action button (Archive, Settings)
export interface SidebarActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  withDivider?: boolean;
  className?: string;
}

// New Type button
export interface SidebarNewTypeButtonProps {
  onClick?: () => void;
  className?: string;
}

// Section wrapper
export interface SidebarSectionProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

// Types list container
export interface SidebarTypesListProps {
  className?: string;
  children?: React.ReactNode;
}
