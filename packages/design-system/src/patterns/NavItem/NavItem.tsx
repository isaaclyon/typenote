import * as React from 'react';
import { DotsThree } from '@phosphor-icons/react/dist/ssr/DotsThree';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { cn } from '../../lib/utils.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../primitives/DropdownMenu/DropdownMenu.js';

// ============================================================================
// Types
// ============================================================================

export interface NavItemAction {
  label: string;
  icon?: PhosphorIcon;
  onClick: () => void;
  destructive?: boolean;
}

export interface NavItemProps {
  /** Phosphor icon component to display */
  icon: PhosphorIcon;
  /** Navigation item label */
  label: string;
  /** Optional count badge (appears on hover) */
  count?: number;
  /** Whether this item is currently active/selected */
  active?: boolean;
  /** Whether this item is disabled */
  disabled?: boolean;
  /** Optional color for the icon (CSS color value) */
  iconColor?: string;
  /** Click handler for the nav item */
  onClick?: () => void;
  /** Optional href for link semantics */
  href?: string;
  /** Actions to show in the dropdown menu */
  actions?: NavItemAction[];
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// NavItem
// ============================================================================

export function NavItem({
  icon: Icon,
  label,
  count,
  active = false,
  disabled = false,
  iconColor,
  onClick,
  href,
  actions,
  className,
}: NavItemProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  // Show hover elements when hovered OR when menu is open
  const showHoverElements = isHovered || isMenuOpen;

  // Compute background style from iconColor
  // Active state: stronger tint (26 = ~15% opacity)
  // Hover state: lighter tint (1A = 10% opacity)
  const computedStyle: React.CSSProperties | undefined =
    iconColor && !disabled
      ? active
        ? { backgroundColor: `${iconColor}26` }
        : showHoverElements
          ? { backgroundColor: `${iconColor}1A` }
          : undefined
      : undefined;

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) return;
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  const content = (
    <>
      {/* Icon */}
      <Icon
        className="h-3.5 w-3.5 shrink-0"
        weight="regular"
        style={iconColor ? { color: iconColor } : undefined}
      />

      {/* Label */}
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{label}</span>

      {/* Count badge - visible on hover */}
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            'shrink-0 rounded px-1.5 py-0.5 text-xs text-muted-foreground',
            'transition-opacity duration-150',
            showHoverElements ? 'opacity-100' : 'opacity-0'
          )}
        >
          {count}
        </span>
      )}

      {/* Action menu trigger - visible on hover */}
      {actions && actions.length > 0 && (
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={cn(
                'shrink-0 rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground',
                'transition-opacity duration-150',
                'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring',
                showHoverElements ? 'opacity-100' : 'opacity-0'
              )}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Actions for ${label}`}
            >
              <DotsThree className="h-4 w-4" weight="bold" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={4}>
            {actions.map((action, index) => {
              const ActionIcon = action.icon;
              const isLastBeforeDestructive =
                !action.destructive &&
                index < actions.length - 1 &&
                actions[index + 1]?.destructive;

              return (
                <React.Fragment key={action.label}>
                  <DropdownMenuItem
                    onClick={action.onClick}
                    {...(action.destructive === true && { destructive: true })}
                  >
                    {ActionIcon && <ActionIcon className="h-4 w-4" weight="regular" />}
                    {action.label}
                  </DropdownMenuItem>
                  {isLastBeforeDestructive && <DropdownMenuSeparator />}
                </React.Fragment>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  );

  const baseClasses = cn(
    'group flex h-7 w-full items-center gap-2 rounded-md px-2',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring',
    // Default state (use hover:bg-muted only if no iconColor, otherwise inline style handles it)
    !active && !disabled && 'text-foreground',
    !active && !disabled && !iconColor && 'hover:bg-muted',
    // Active state (use bg-accent only if no iconColor, otherwise inline style handles it)
    active && !disabled && !iconColor && 'bg-accent text-accent-foreground',
    active && !disabled && iconColor && 'text-foreground',
    // Disabled state
    disabled && 'pointer-events-none opacity-50',
    className
  );

  // Render as link or button based on props
  if (href && !disabled) {
    return (
      <a
        href={href}
        className={baseClasses}
        style={computedStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={baseClasses}
      style={computedStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
    >
      {content}
    </div>
  );
}
