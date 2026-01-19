import * as React from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';

import { cn } from '../../lib/utils.js';
import { IconButton } from '../IconButton/IconButton.js';
import { Input } from '../Input/Input.js';
import type { InputSize, InputVariant } from '../Input/Input.js';

type SearchInputSize = Extract<InputSize, 'sm' | 'md'>;

type SearchInputVariant = InputVariant;

export interface SearchInputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  size?: SearchInputSize;
  variant?: SearchInputVariant;
  containerClassName?: string;
  onClear?: () => void;
}

const iconSizeMap: Record<SearchInputSize, string> = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

const clearIconSizeMap: Record<SearchInputSize, string> = {
  sm: 'h-3 w-3',
  md: 'h-3.5 w-3.5',
};

const inputPaddingMap: Record<SearchInputSize, string> = {
  sm: 'pl-8 pr-8',
  md: 'pl-9 pr-9',
};

const clearButtonSizeMap: Record<SearchInputSize, 'sm' | 'md'> = {
  sm: 'sm',
  md: 'md',
};

const clearButtonClassMap: Record<SearchInputSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-7 w-7',
};

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      className,
      containerClassName,
      size = 'md',
      variant = 'default',
      onClear,
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasValue = typeof value === 'string' ? value.length > 0 : Boolean(value);

    return (
      <div className={cn('relative flex items-center', containerClassName)}>
        <span
          aria-hidden="true"
          className={cn('pointer-events-none absolute left-3 text-gray-400', iconSizeMap[size])}
        >
          <MagnifyingGlass aria-hidden="true" className={iconSizeMap[size]} weight="bold" />
        </span>

        <Input
          ref={ref}
          className={cn(inputPaddingMap[size], className)}
          size={size}
          variant={variant}
          value={value}
          disabled={disabled}
          {...props}
        />
        {hasValue && !disabled ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <IconButton
              aria-label="Clear search"
              variant="ghost"
              size={clearButtonSizeMap[size]}
              className={clearButtonClassMap[size]}
              onClick={(event) => {
                event.preventDefault();
                onClear?.();
              }}
            >
              <X aria-hidden="true" className={clearIconSizeMap[size]} weight="bold" />
            </IconButton>
          </div>
        ) : null}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { SearchInput };
export type { SearchInputSize, SearchInputVariant };
