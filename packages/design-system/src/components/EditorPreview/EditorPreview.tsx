import * as React from 'react';
import { cn } from '../../utils/cn.js';

interface EditorPreviewProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Container for previewing editor content styling.
 * Provides the base .tiptap class context without TipTap.
 */
export function EditorPreview({ children, className }: EditorPreviewProps) {
  return (
    <div
      className={cn(
        'tiptap',
        'min-h-[200px] p-6 bg-white rounded border border-gray-200',
        className
      )}
    >
      {children}
    </div>
  );
}
