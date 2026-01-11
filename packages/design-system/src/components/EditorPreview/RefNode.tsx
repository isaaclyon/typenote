import * as React from 'react';
import { FileText, Folder, User, BookOpen, CheckSquare } from 'lucide-react';
import { cn } from '../../utils/cn.js';

type ObjectType = 'note' | 'project' | 'person' | 'resource' | 'task';

interface RefNodeProps {
  type: ObjectType;
  label: string;
  className?: string;
}

const TYPE_CONFIG: Record<
  ObjectType,
  {
    icon: React.ComponentType<{ className?: string }>;
    colorClass: string;
    decorationClass: string;
  }
> = {
  note: {
    icon: FileText,
    colorClass: 'text-accent-500',
    decorationClass: 'decoration-accent-500',
  },
  task: {
    icon: CheckSquare,
    colorClass: 'text-success',
    decorationClass: 'decoration-success',
  },
  project: {
    icon: Folder,
    colorClass: 'text-error',
    decorationClass: 'decoration-error',
  },
  person: {
    icon: User,
    colorClass: 'text-warning',
    decorationClass: 'decoration-warning',
  },
  resource: {
    icon: BookOpen,
    colorClass: 'text-accent-300',
    decorationClass: 'decoration-accent-300',
  },
};

/**
 * RefNode preview - type-aware wiki-link styling.
 * Shows icon + underlined text in type's color.
 */
export function RefNode({ type, label, className }: RefNodeProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 cursor-pointer transition-colors', className)}
    >
      <Icon className={cn('h-3.5 w-3.5', config.colorClass)} />
      <span className={cn('underline text-gray-700 hover:text-gray-900', config.decorationClass)}>
        {label}
      </span>
    </span>
  );
}
