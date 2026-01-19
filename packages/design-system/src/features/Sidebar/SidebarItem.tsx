import * as React from 'react';

import { cn } from '../../lib/utils.js';
import { NavItem } from '../../patterns/NavItem/NavItem.js';
import { Tooltip } from '../../primitives/Tooltip/Tooltip.js';
import { useSidebarContext } from './SidebarContext.js';
import type { SidebarItemProps } from './types.js';

// ============================================================================
// SidebarItem
// ============================================================================

export function SidebarItem({
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
}: SidebarItemProps) {
  const { collapsed } = useSidebarContext();
  const [isHovered, setIsHovered] = React.useState(false);

  // Build tooltip content for collapsed mode
  const tooltipContent = (
    <>
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-1.5 text-muted-foreground">({count})</span>
      )}
    </>
  );

  // Compute background style from iconColor
  // Active state: stronger tint (26 = ~15% opacity)
  // Hover state: lighter tint (1A = 10% opacity)
  const computedStyle: React.CSSProperties | undefined =
    iconColor && !disabled
      ? active
        ? { backgroundColor: `${iconColor}26` }
        : isHovered
          ? { backgroundColor: `${iconColor}1A` }
          : undefined
      : undefined;

  // In collapsed mode, render icon-only with tooltip
  if (collapsed) {
    return (
      <Tooltip content={tooltipContent} side="right">
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={cn(
            'flex h-7 w-full items-center justify-center rounded-md',
            'transition-colors duration-150 ease-out',
            'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring',
            !active && !disabled && 'text-foreground',
            !active && !disabled && !iconColor && 'hover:bg-muted',
            active && !disabled && !iconColor && 'bg-accent text-accent-foreground',
            active && !disabled && iconColor && 'text-foreground',
            disabled && 'pointer-events-none opacity-50',
            className
          )}
          style={computedStyle}
          onClick={disabled ? undefined : onClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.();
            }
          }}
          aria-disabled={disabled}
          aria-label={label}
        >
          <Icon
            className="h-4 w-4 shrink-0"
            weight="regular"
            style={iconColor ? { color: iconColor } : undefined}
          />
        </div>
      </Tooltip>
    );
  }

  // In expanded mode, use NavItem directly
  // Only pass optional props if they have values
  return (
    <NavItem
      icon={Icon}
      label={label}
      active={active}
      disabled={disabled}
      {...(count !== undefined && { count })}
      {...(iconColor !== undefined && { iconColor })}
      {...(onClick !== undefined && { onClick })}
      {...(href !== undefined && { href })}
      {...(actions !== undefined && { actions })}
      {...(className !== undefined && { className })}
    />
  );
}
