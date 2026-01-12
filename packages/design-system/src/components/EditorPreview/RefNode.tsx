import { cn } from '../../utils/cn.js';
import { TYPE_CONFIG, type ObjectType } from '../../constants/editorConfig.js';

interface RefNodeProps {
  type: ObjectType;
  label: string;
  className?: string;
}

/**
 * RefNode preview - type-aware wiki-link styling.
 * Shows icon + underlined text in type's color.
 */
export function RefNode({ type, label, className }: RefNodeProps) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  return (
    <span
      className={cn('inline-flex items-center gap-1 cursor-pointer transition-colors', className)}
    >
      <Icon className={cn('h-3.5 w-3.5', config.colorClass)} />
      <span className={cn('underline text-gray-700 hover:text-gray-900', config.decorationClass)}>
        {label}
      </span>
    </span>
  );
}
