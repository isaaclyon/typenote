import * as React from 'react';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { cn } from '../../lib/utils.js';
import { Link } from '../../primitives/Link/Link.js';

// ============================================================================
// Types
// ============================================================================

export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** Optional Phosphor icon component (e.g., type icon) */
  icon?: PhosphorIcon;
  /** Icon color (CSS color value) */
  iconColor?: string;
  /** Click handler for navigation (not used for last item) */
  onClick?: () => void;
}

export interface BreadcrumbsProps {
  /** Array of breadcrumb items (last item is current page, not clickable) */
  items: BreadcrumbItem[];
  /** Separator character between items */
  separator?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// Breadcrumbs
// ============================================================================

export function Breadcrumbs({ items, separator = '/', className }: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center text-sm', className)}>
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-1">
              {/* Separator (not before first item) */}
              {index > 0 && (
                <span className="mx-1 text-muted-foreground select-none" aria-hidden="true">
                  {separator}
                </span>
              )}

              {isLast ? (
                // Current page - not clickable, emphasized
                <span
                  className="flex items-center gap-1 font-medium text-foreground"
                  aria-current="page"
                >
                  {Icon && (
                    <Icon
                      className="h-3.5 w-3.5 shrink-0"
                      weight="regular"
                      style={item.iconColor ? { color: item.iconColor } : undefined}
                    />
                  )}
                  {item.label}
                </span>
              ) : (
                // Clickable ancestor
                <Link
                  variant="muted"
                  icon={Icon}
                  {...(item.iconColor && { iconColor: item.iconColor })}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    item.onClick?.();
                  }}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
