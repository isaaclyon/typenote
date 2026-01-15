import type { ReactNode } from 'react';

// =============================================================================
// Root Component
// =============================================================================

export interface CommandPaletteProps {
  /** Whether the palette is open */
  open: boolean;
  /** Callback when open state should change */
  onOpenChange: (open: boolean) => void;
  /** Content (Input, List, etc.) */
  children: ReactNode;
  /** Custom className */
  className?: string;
}

// =============================================================================
// Input
// =============================================================================

export interface CommandPaletteInputProps {
  /** Current input value */
  value: string;
  /** Callback when value changes */
  onValueChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Auto-focus when palette opens (default: true) */
  autoFocus?: boolean;
  /** Custom className */
  className?: string;
}

// =============================================================================
// List
// =============================================================================

export interface CommandPaletteListProps {
  /** List content (groups, items, empty, loading) */
  children: ReactNode;
  /** Custom className */
  className?: string;
}

// =============================================================================
// Group
// =============================================================================

export interface CommandPaletteGroupProps {
  /** Section heading (e.g., "Recent", "Go to", "Create new") */
  heading?: string;
  /** Group items */
  children: ReactNode;
  /** Custom className */
  className?: string;
}

// =============================================================================
// Item
// =============================================================================

export interface CommandPaletteItemProps {
  /** Optional value for filtering/accessibility (defaults to children text) */
  value?: string;
  /** Whether this item is visually selected */
  selected?: boolean;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Callback when item is selected (click or Enter) */
  onSelect: () => void;
  /** Item content (icons, text, badges) */
  children: ReactNode;
  /** Custom className */
  className?: string;
}

// =============================================================================
// Empty State
// =============================================================================

export interface CommandPaletteEmptyProps {
  /** Empty state message */
  children: ReactNode;
  /** Custom className */
  className?: string;
}

// =============================================================================
// Loading State
// =============================================================================

export interface CommandPaletteLoadingProps {
  /** Loading message (defaults to "Searching...") */
  children?: ReactNode;
  /** Custom className */
  className?: string;
}

// =============================================================================
// Separator
// =============================================================================

export interface CommandPaletteSeparatorProps {
  /** Custom className */
  className?: string;
}

// =============================================================================
// Keyboard Hook
// =============================================================================

export interface UseCommandPaletteKeyboardOptions {
  /** Total number of items for navigation */
  itemCount: number;
  /** Callback when item is selected (Enter key) */
  onSelect: (index: number) => void;
  /** Callback when Escape is pressed */
  onEscape: () => void;
  /** Whether keyboard navigation is enabled (default: true) */
  enabled?: boolean;
}

export interface UseCommandPaletteKeyboardReturn {
  /** Currently selected index (0-based) */
  selectedIndex: number;
  /** Set selected index (e.g., on mouse hover) */
  setSelectedIndex: (index: number) => void;
}
