import { cn } from '../../utils/cn.js';

interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}

/**
 * CodeBlock preview - code block with optional language label.
 */
export function CodeBlock({ code, language, className }: CodeBlockProps) {
  return (
    <div className={cn('rounded bg-gray-100 p-4 my-2', className)}>
      {language && <div className="text-xs text-gray-500 mb-2 font-medium">{language}</div>}
      <pre className="overflow-x-auto">
        <code className="font-mono text-sm text-gray-700">{code}</code>
      </pre>
    </div>
  );
}
