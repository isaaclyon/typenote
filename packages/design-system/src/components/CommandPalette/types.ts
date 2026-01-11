import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface CommandItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Optional keyboard shortcut */
  shortcut?: string | undefined;
  /** Optional category/group */
  category?: string | undefined;
  /** Callback when selected */
  onSelect: () => void;
}

export interface CommandPaletteProps {
  /** Whether the palette is open */
  open: boolean;
  /** Callback when palette should close */
  onClose: () => void;
  /** Available commands */
  commands: CommandItem[];
  /** Placeholder text for search input */
  placeholder?: string | undefined;
  /** Custom className */
  className?: string;
}

export interface CommandPaletteInputProps {
  /** Input value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Custom className */
  className?: string;
}

export interface CommandPaletteListProps {
  /** List content */
  children: ReactNode;
  /** Custom className */
  className?: string;
}

export interface CommandPaletteItemProps {
  /** Command item data */
  item: CommandItem;
  /** Whether this item is selected */
  selected: boolean;
  /** Click handler */
  onClick: () => void;
  /** Custom className */
  className?: string;
}
