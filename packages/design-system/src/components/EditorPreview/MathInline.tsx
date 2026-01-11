import { cn } from '../../utils/cn.js';

interface MathInlineProps {
  latex: string;
  className?: string;
}

/**
 * MathInline preview - inline LaTeX styled like code.
 */
export function MathInline({ latex, className }: MathInlineProps) {
  return (
    <code
      className={cn('rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-700', className)}
      title="Inline math (LaTeX)"
    >
      {latex}
    </code>
  );
}
