import * as React from 'react';
import { Sun } from '@phosphor-icons/react/dist/ssr/Sun';
import { Moon } from '@phosphor-icons/react/dist/ssr/Moon';

import { IconButton, type IconButtonSize } from '../../primitives/IconButton/IconButton.js';
import { Tooltip } from '../../primitives/Tooltip/Tooltip.js';

// ============================================================================
// Types
// ============================================================================

export type Theme = 'light' | 'dark';

export interface ThemeToggleProps {
  /** Current theme */
  theme: Theme;
  /** Callback when theme should change */
  onToggle: () => void;
  /** Size of the toggle button */
  size?: IconButtonSize;
  /** Whether to show tooltip */
  showTooltip?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// ThemeToggle
// ============================================================================

// Icon size mapping for each button size
const iconSizeMap: Record<IconButtonSize, string> = {
  xs: 'h-3.5 w-3.5',
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

/**
 * A toggle button for switching between light and dark themes.
 * Shows the current state (Sun for light, Moon for dark).
 */
export function ThemeToggle({
  theme,
  onToggle,
  size = 'sm',
  showTooltip = true,
  className,
}: ThemeToggleProps) {
  const Icon = theme === 'dark' ? Moon : Sun;
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  const button = (
    <IconButton
      variant="ghost"
      size={size}
      aria-label={label}
      onClick={onToggle}
      className={className}
    >
      <Icon className={iconSizeMap[size]} weight="regular" />
    </IconButton>
  );

  if (!showTooltip) {
    return button;
  }

  return (
    <Tooltip content={label} side="bottom">
      {button}
    </Tooltip>
  );
}
