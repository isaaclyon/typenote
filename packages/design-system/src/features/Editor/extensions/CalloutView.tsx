/**
 * CalloutView - Custom NodeView for callout blocks.
 *
 * Features:
 * - Type-specific icons and colors (info, warning, tip, error)
 * - Dropdown to change callout type
 * - Full nested content support via NodeViewContent
 */

import * as React from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Info } from '@phosphor-icons/react/dist/ssr/Info';
import { Warning } from '@phosphor-icons/react/dist/ssr/Warning';
import { Lightbulb } from '@phosphor-icons/react/dist/ssr/Lightbulb';
import { WarningCircle } from '@phosphor-icons/react/dist/ssr/WarningCircle';
import { CaretDown } from '@phosphor-icons/react/dist/ssr/CaretDown';

import { cn } from '../../../lib/utils.js';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '../../../primitives/DropdownMenu/index.js';
import type { CalloutType } from './Callout.types.js';

// ============================================================================
// Callout Type Configuration
// ============================================================================

interface CalloutConfig {
  label: string;
  icon: React.ComponentType<{ className?: string; weight?: 'regular' | 'bold' | 'fill' }>;
  className: string;
}

const CALLOUT_CONFIGS: Record<CalloutType, CalloutConfig> = {
  info: {
    label: 'Info',
    icon: Info,
    className: 'callout-info',
  },
  warning: {
    label: 'Warning',
    icon: Warning,
    className: 'callout-warning',
  },
  tip: {
    label: 'Tip',
    icon: Lightbulb,
    className: 'callout-tip',
  },
  error: {
    label: 'Error',
    icon: WarningCircle,
    className: 'callout-error',
  },
};

const CALLOUT_TYPES: CalloutType[] = ['info', 'warning', 'tip', 'error'];

// ============================================================================
// CalloutView Component
// ============================================================================

export function CalloutView({ node, updateAttributes }: NodeViewProps) {
  const calloutType = (node.attrs['calloutType'] as CalloutType) || 'info';
  const config = CALLOUT_CONFIGS[calloutType];
  const Icon = config.icon;

  const handleTypeChange = React.useCallback(
    (newType: CalloutType) => {
      updateAttributes({ calloutType: newType });
    },
    [updateAttributes]
  );

  return (
    <NodeViewWrapper className="callout-wrapper my-2">
      <div
        className={cn(
          'callout',
          'rounded-l-none rounded-r-md overflow-hidden',
          'border-l-4',
          config.className
        )}
        data-callout-type={calloutType}
      >
        {/* Header with icon and type selector */}
        <div
          className={cn('callout-header', 'flex items-center gap-2', 'px-3 pt-3 pb-1')}
          contentEditable={false}
        >
          {/* Type selector dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'callout-type-trigger',
                  'flex items-center gap-1 px-1.5 py-0.5 -ml-1.5 rounded',
                  'hover:bg-black/5 dark:hover:bg-white/10',
                  'transition-colors duration-150',
                  'text-sm font-medium'
                )}
                type="button"
              >
                <Icon className="h-4 w-4 callout-icon" weight="fill" />
                <span className="callout-label">{config.label}</span>
                <CaretDown className="h-3 w-3 opacity-50" weight="bold" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {CALLOUT_TYPES.map((type, index) => {
                const typeConfig = CALLOUT_CONFIGS[type];
                const TypeIcon = typeConfig.icon;
                return (
                  <React.Fragment key={type}>
                    {index > 0 && type === 'error' && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                      onClick={() => handleTypeChange(type)}
                      className={cn('flex items-center gap-2', calloutType === type && 'bg-muted')}
                    >
                      <TypeIcon
                        className={cn('h-4 w-4', `callout-dropdown-icon-${type}`)}
                        weight="fill"
                      />
                      <span>{typeConfig.label}</span>
                    </DropdownMenuItem>
                  </React.Fragment>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Editable content area */}
        <NodeViewContent
          className={cn(
            'callout-content',
            'px-3 pb-3',
            // Reduce top padding since header already has bottom padding
            'pt-0'
          )}
        />
      </div>
    </NodeViewWrapper>
  );
}

CalloutView.displayName = 'CalloutView';
