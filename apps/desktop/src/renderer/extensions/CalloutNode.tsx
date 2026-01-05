/**
 * CalloutNode Extension for TipTap
 *
 * Custom block node for Obsidian-style callouts/admonitions.
 * Renders with a colored left border and icon based on kind.
 */

import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Info, AlertTriangle, AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { cn } from '../lib/utils.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CalloutNodeAttrs {
  kind: string;
  title: string | null;
  collapsed: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Callout Kind Configuration
// ─────────────────────────────────────────────────────────────────────────────

type CalloutKindConfig = {
  icon: React.ComponentType<{ className?: string }>;
  borderClass: string;
  bgClass: string;
  iconClass: string;
};

const CALLOUT_KINDS: Record<string, CalloutKindConfig> = {
  info: {
    icon: Info,
    borderClass: 'border-l-blue-500',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    iconClass: 'text-blue-500',
  },
  note: {
    icon: Info,
    borderClass: 'border-l-blue-500',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    iconClass: 'text-blue-500',
  },
  warning: {
    icon: AlertTriangle,
    borderClass: 'border-l-yellow-500',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
    iconClass: 'text-yellow-500',
  },
  caution: {
    icon: AlertTriangle,
    borderClass: 'border-l-yellow-500',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950/30',
    iconClass: 'text-yellow-500',
  },
  error: {
    icon: AlertCircle,
    borderClass: 'border-l-red-500',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    iconClass: 'text-red-500',
  },
  danger: {
    icon: AlertCircle,
    borderClass: 'border-l-red-500',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    iconClass: 'text-red-500',
  },
  success: {
    icon: CheckCircle,
    borderClass: 'border-l-green-500',
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    iconClass: 'text-green-500',
  },
  tip: {
    icon: CheckCircle,
    borderClass: 'border-l-green-500',
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    iconClass: 'text-green-500',
  },
};

const DEFAULT_CONFIG: CalloutKindConfig = {
  icon: MessageSquare,
  borderClass: 'border-l-gray-500',
  bgClass: 'bg-gray-50 dark:bg-gray-950/30',
  iconClass: 'text-gray-500',
};

function getCalloutConfig(kind: string): CalloutKindConfig {
  return CALLOUT_KINDS[kind.toLowerCase()] ?? DEFAULT_CONFIG;
}

// ─────────────────────────────────────────────────────────────────────────────
// Node View Component
// ─────────────────────────────────────────────────────────────────────────────

function CalloutNodeView({ node }: NodeViewProps) {
  const attrs = node.attrs as CalloutNodeAttrs;
  const { kind, title, collapsed } = attrs;

  const config = getCalloutConfig(kind);
  const Icon = config.icon;

  // Display title: custom title, or capitalize the kind
  const displayTitle = title ?? kind.charAt(0).toUpperCase() + kind.slice(1).toLowerCase();

  return (
    <NodeViewWrapper className="my-2">
      <div className={cn('rounded-r border-l-4 p-4', config.borderClass, config.bgClass)}>
        <div className="flex items-center gap-2 font-medium mb-2">
          <Icon className={cn('h-4 w-4 shrink-0', config.iconClass)} />
          <span>{displayTitle}</span>
          {collapsed && <span className="text-xs text-muted-foreground">(collapsed)</span>}
        </div>
        {!collapsed && (
          <div className="pl-6">
            <NodeViewContent className="callout-content" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TipTap Extension
// ─────────────────────────────────────────────────────────────────────────────

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+', // Contains other blocks

  addAttributes() {
    return {
      kind: {
        default: 'note',
        parseHTML: (element: HTMLElement) => element.getAttribute('data-kind') ?? 'note',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-kind': attributes['kind'] as string,
        }),
      },
      title: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-title'),
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-title': attributes['title'] as string | undefined,
        }),
      },
      collapsed: {
        default: false,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-collapsed') === 'true',
        renderHTML: (attributes: Record<string, unknown>) => ({
          'data-collapsed': attributes['collapsed'] ? 'true' : undefined,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-callout]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-callout': '' }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },
});
