import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';

const textVariants = cva('', {
  variants: {
    variant: {
      body: 'text-[15px] leading-normal text-foreground',
      bodySmall: 'text-[13px] leading-normal text-foreground',
      heading1: 'text-[30px] font-semibold leading-tight text-gray-800',
      heading2: 'text-[24px] font-semibold leading-tight text-gray-800',
      heading3: 'text-[20px] font-semibold leading-tight text-gray-800',
      heading4: 'text-[17px] font-semibold leading-tight text-gray-800',
      label: 'text-[13px] font-medium text-gray-600',
      caption: 'text-[12px] text-muted-foreground',
      code: 'font-mono text-[13px] bg-muted px-1.5 py-0.5 rounded',
    },
    muted: {
      true: 'text-muted-foreground',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'body',
    muted: false,
  },
});

type TextElement = 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'code';

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  as?: TextElement;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ className, variant, muted, as, ...props }, ref) => {
    // Infer element from variant if not specified
    const Component =
      as ??
      (typeof variant === 'string' && variant.startsWith('heading')
        ? (variant.replace('heading', 'h') as TextElement)
        : variant === 'code'
          ? 'code'
          : variant === 'label'
            ? 'label'
            : 'p');

    return React.createElement(Component, {
      ref,
      className: cn(textVariants({ variant, muted, className })),
      ...props,
    });
  }
);
Text.displayName = 'Text';

export { Text, textVariants };
