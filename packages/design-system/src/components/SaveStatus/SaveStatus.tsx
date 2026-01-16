import * as React from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import type { SaveStatusProps } from './types.js';

const SaveStatus = React.forwardRef<HTMLDivElement, SaveStatusProps>(
  (
    {
      state,
      className,
      savingText = 'Saving...',
      savedText = 'Saved',
      errorText = 'Failed to save',
      autoDismissMs = 2000,
    },
    ref
  ) => {
    const [visible, setVisible] = React.useState(true);

    // Auto-dismiss 'saved' state after delay
    React.useEffect(() => {
      if (state === 'saved' && autoDismissMs > 0) {
        setVisible(true); // Show immediately
        const timer = setTimeout(() => {
          setVisible(false);
        }, autoDismissMs);
        return () => clearTimeout(timer);
      } else {
        setVisible(true); // Always visible for other states
      }
    }, [state, autoDismissMs]);

    if (state === 'idle' || (state === 'saved' && !visible)) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-1.5 text-xs text-gray-500',
          'transition-opacity duration-300',
          state === 'saved' && !visible && 'opacity-0',
          className
        )}
        role="status"
        aria-live="polite"
      >
        {state === 'saving' && (
          <>
            <span
              className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-[pulse_1.5s_ease-in-out_infinite]"
              aria-hidden="true"
            />
            <span>{savingText}</span>
          </>
        )}

        {state === 'saved' && (
          <>
            <Check className="h-3 w-3 text-success" aria-hidden="true" />
            <span className="text-success">{savedText}</span>
          </>
        )}

        {state === 'error' && (
          <>
            <X className="h-3 w-3 text-error" aria-hidden="true" />
            <span className="text-error">{errorText}</span>
          </>
        )}
      </div>
    );
  }
);

SaveStatus.displayName = 'SaveStatus';

export { SaveStatus };
