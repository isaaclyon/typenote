import * as React from 'react';
import { cn } from '../../../lib/utils.js';

export interface TextEditorProps {
  value: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  type?: 'text' | 'number';
  placeholder?: string | undefined;
  className?: string | undefined;
}

const TextEditor = React.forwardRef<HTMLInputElement, TextEditorProps>(
  ({ value, onSave, onCancel, type = 'text', placeholder, className }, ref) => {
    const [localValue, setLocalValue] = React.useState(value);
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Merge refs - return inputRef.current with null check
    React.useImperativeHandle(ref, () => {
      if (inputRef.current === null) {
        throw new Error('TextEditor inputRef is null - this should not happen');
      }
      return inputRef.current;
    });

    // Auto-focus and select on mount
    React.useEffect(() => {
      const input = inputRef.current;
      if (input) {
        input.focus();
        input.select();
      }
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onSave(localValue);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    const handleBlur = () => {
      onSave(localValue);
    };

    return (
      <input
        ref={inputRef}
        type={type}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={cn(
          'w-full bg-transparent text-sm text-foreground',
          'border-b border-accent-500 outline-none',
          'focus:border-accent-600',
          'placeholder:text-fg-tertiary placeholder:italic',
          className
        )}
      />
    );
  }
);

TextEditor.displayName = 'TextEditor';

export { TextEditor };
