import * as React from 'react';
import { Gear } from '@phosphor-icons/react/dist/ssr/Gear';

import { cn } from '../../lib/utils.js';
import { IconButton } from '../../primitives/IconButton/IconButton.js';
import { Tooltip } from '../../primitives/Tooltip/Tooltip.js';
import { Breadcrumbs, type BreadcrumbItem } from '../../patterns/Breadcrumbs/Breadcrumbs.js';
import { SearchTrigger } from '../../patterns/SearchTrigger/SearchTrigger.js';
import { ThemeToggle, type Theme } from '../../patterns/ThemeToggle/ThemeToggle.js';

// ============================================================================
// Types
// ============================================================================

export interface HeaderBarProps {
  /** Click handler for search trigger (opens command palette) */
  onSearchClick?: () => void;
  /** Breadcrumb items for navigation path */
  breadcrumbs?: BreadcrumbItem[];
  /** Click handler for settings button */
  onSettingsClick?: () => void;
  /** Current theme */
  theme?: Theme;
  /** Theme toggle handler */
  onThemeToggle?: () => void;
  /** Custom keyboard shortcut for search (e.g., "Ctrl+K" on Windows) */
  searchShortcut?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HeaderBar
// ============================================================================

/**
 * App-level toolbar that sits above the content area (not spanning the sidebar).
 *
 * Layout:
 * - Left: Breadcrumbs (navigation path)
 * - Right: Search trigger, Theme toggle, Settings button
 *
 * Specs:
 * - Height: 40px (compact)
 * - No bottom border (seamless with content)
 * - Background: bg-background
 */
export function HeaderBar({
  onSearchClick,
  breadcrumbs = [],
  onSettingsClick,
  theme = 'light',
  onThemeToggle,
  searchShortcut,
  className,
}: HeaderBarProps) {
  return (
    <header
      className={cn(
        // Layout
        'relative flex h-10 w-full items-center px-4',
        // Visual
        'bg-background',
        className
      )}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center">
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
      </div>

      {/* Right: Search + Actions */}
      <div className="ml-auto flex items-center gap-2">
        <SearchTrigger
          {...(onSearchClick && { onClick: onSearchClick })}
          {...(searchShortcut && { shortcut: searchShortcut })}
        />

        {onThemeToggle && <ThemeToggle theme={theme} onToggle={onThemeToggle} />}

        {onSettingsClick && (
          <Tooltip content="Settings" side="bottom">
            <IconButton variant="ghost" size="sm" aria-label="Settings" onClick={onSettingsClick}>
              <Gear className="h-4 w-4" weight="regular" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </header>
  );
}
