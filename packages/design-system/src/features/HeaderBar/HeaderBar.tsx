import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { Breadcrumbs, type BreadcrumbItem } from '../../patterns/Breadcrumbs/Breadcrumbs.js';

// ============================================================================
// Types
// ============================================================================

export interface HeaderBarProps {
  /** Breadcrumb items for navigation path */
  breadcrumbs?: BreadcrumbItem[];
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HeaderBar
// ============================================================================

/**
 * Simplified header bar that displays only breadcrumbs.
 *
 * Controls (search, theme toggle, settings) have been moved to TitleBar.
 *
 * Layout:
 * - Center: Breadcrumbs (absolutely centered, full width available)
 *
 * Specs:
 * - Height: 40px (compact)
 * - No bottom border (seamless with content)
 * - Background: bg-background
 */
export function HeaderBar({ breadcrumbs = [], className }: HeaderBarProps) {
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
      {/* Center: Breadcrumbs (absolutely centered) */}
      {breadcrumbs.length > 0 && (
        <div className="absolute left-1/2 -translate-x-1/2">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      )}
    </header>
  );
}
