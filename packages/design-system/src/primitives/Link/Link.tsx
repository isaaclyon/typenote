import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { cn } from '../../lib/utils.js';

// ============================================================================
// Types
// ============================================================================

type LinkVariant = 'default' | 'muted' | 'unstyled';

// ============================================================================
// Variants
// ============================================================================

const linkVariants = cva(
  [
    'inline-flex items-center gap-1 cursor-pointer',
    'transition-colors duration-150 ease-out',
    'focus-visible:outline focus-visible:outline-1 focus-visible:outline-ring',
    'focus-visible:outline-offset-2 focus-visible:rounded-sm',
    // Underline styling
    'underline underline-offset-2',
  ],
  {
    variants: {
      variant: {
        default: 'text-foreground hover:text-foreground/80',
        muted: 'text-muted-foreground hover:text-foreground',
        unstyled: 'no-underline',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// ============================================================================
// Component
// ============================================================================

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>, VariantProps<typeof linkVariants> {
  /** Optional Phosphor icon component to display before the label */
  icon?: PhosphorIcon;
  /** Icon color (CSS color value) */
  iconColor?: string;
  /** Use Radix Slot for composition (asChild pattern) */
  asChild?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { className, variant, icon: Icon, iconColor, asChild = false, children, style, ...props },
    ref
  ) => {
    const Component = asChild ? Slot : 'a';

    // Apply iconColor to the underline
    const combinedStyle: React.CSSProperties | undefined = iconColor
      ? { ...style, textDecorationColor: iconColor }
      : style;

    return (
      <Component
        ref={ref}
        className={cn(linkVariants({ variant }), className)}
        style={combinedStyle}
        {...props}
      >
        {Icon && (
          <Icon className="h-3.5 w-3.5 shrink-0" weight="regular" style={{ color: iconColor }} />
        )}
        {children}
      </Component>
    );
  }
);

Link.displayName = 'Link';

export { Link, linkVariants };
export type { LinkVariant };
