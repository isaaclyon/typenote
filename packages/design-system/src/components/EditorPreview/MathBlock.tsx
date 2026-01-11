import { cn } from '../../utils/cn.js';

interface MathBlockProps {
  latex: string;
  className?: string;
}

/**
 * MathBlock preview - display math in neutral container.
 */
export function MathBlock({ latex, className }: MathBlockProps) {
  return (
    <div
      className={cn(
        'rounded border border-gray-200 bg-gray-100 p-4 my-4',
        'flex flex-col items-center',
        className
      )}
    >
      <div className="text-xs text-gray-500 mb-2 self-start">Display Math</div>
      <pre className="font-mono text-sm text-center whitespace-pre-wrap w-full">{latex}</pre>
    </div>
  );
}
