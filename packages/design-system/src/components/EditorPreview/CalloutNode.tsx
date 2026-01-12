import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { CALLOUT_CONFIG, type CalloutKind } from '../../constants/editorConfig.js';

interface CalloutNodeProps {
  kind: CalloutKind;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

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
