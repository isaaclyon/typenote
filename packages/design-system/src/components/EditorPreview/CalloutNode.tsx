import * as React from 'react';
import { Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn.js';

type CalloutKind = 'info' | 'success' | 'warning' | 'error';

interface CalloutNodeProps {
  kind: CalloutKind;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const CALLOUT_CONFIG: Record<
  CalloutKind,
  {
    icon: React.ComponentType<{ className?: string }>;
    bgClass: string;
    iconClass: string;
    defaultTitle: string;
  }
> = {
  info: {
    icon: Info,
    bgClass: 'bg-accent-50',
    iconClass: 'text-accent-700',
    defaultTitle: 'Note',
  },
  success: {
    icon: CheckCircle,
    bgClass: 'bg-green-50',
    iconClass: 'text-green-700',
    defaultTitle: 'Success',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-amber-50',
    iconClass: 'text-amber-700',
    defaultTitle: 'Warning',
  },
  error: {
    icon: AlertCircle,
    bgClass: 'bg-red-50',
    iconClass: 'text-red-700',
    defaultTitle: 'Error',
  },
};

/**
 * CalloutNode preview - semantic admonition blocks.
 */
export function CalloutNode({ kind, title, children, className }: CalloutNodeProps) {
  const config = CALLOUT_CONFIG[kind];
  const Icon = config.icon;
  const displayTitle = title ?? config.defaultTitle;

  return (
    <div className={cn('rounded p-4 my-2', config.bgClass, className)}>
      <div className="flex items-center gap-2 font-medium mb-2">
        <Icon className={cn('h-4 w-4', config.iconClass)} />
        <span>{displayTitle}</span>
      </div>
      <div className="pl-6">{children}</div>
    </div>
  );
}
