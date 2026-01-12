import { KeyboardKey } from '../../KeyboardKey/KeyboardKey.js';
import { cn } from '../../../utils/cn.js';

interface ShortcutHint {
  keys: string[];
  action: string;
}

interface ShortcutHintsProps {
  hints: ShortcutHint[];
  className?: string;
}

/**
 * Shows keyboard shortcuts as visual hints in stories.
 */
export function ShortcutHints({ hints, className }: ShortcutHintsProps) {
  return (
    <div className={cn('bg-gray-50 rounded-lg p-3 text-xs', className)}>
      <div className="font-medium mb-2 text-gray-500">Shortcuts</div>
      <div className="space-y-1.5">
        {hints.map((hint, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {hint.keys.map((key, j) => (
                <KeyboardKey key={j}>{key}</KeyboardKey>
              ))}
            </div>
            <span className="text-gray-600">{hint.action}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
