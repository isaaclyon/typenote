import * as React from 'react';
import { cn } from '../../utils/cn.js';
import { EditableTitle } from './EditableTitle.js';
import type { DocumentHeaderProps } from './types.js';

/**
 * Formats a date key into full date (e.g., "January 16, 2026")
 */
function formatFullDate(dateKey: string): string {
  const date = new Date(dateKey + 'T00:00:00');
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * DocumentHeader - Universal header for all document types.
 *
 * For regular notes (Page, Task, etc.):
 * - Shows type label above editable title
 * - Click title to edit inline
 *
 * For Daily Notes:
 * - Shows day name as type label
 * - Shows formatted date as immutable title
 *
 * Visual structure:
 * ```
 * Page                           ← Type label (small, muted)
 * My Document Title              ← Title (editable or immutable)
 * ───────────────────────────────← Divider line
 * ```
 */
export function DocumentHeader({
  title,
  typeLabel,
  onTitleChange,
  dailyNoteDateKey,
  className,
}: DocumentHeaderProps): React.ReactElement {
  // Daily Note mode: immutable formatted date
  const isDailyNote = dailyNoteDateKey !== undefined;
  const displayTitle = isDailyNote ? formatFullDate(dailyNoteDateKey) : title;

  return (
    <header className={cn('pb-4 mb-6 border-b border-gray-200', className)}>
      {/* Type label */}
      <div className="text-sm text-gray-400 font-normal mb-1">{typeLabel}</div>

      {/* Title */}
      {isDailyNote || onTitleChange === undefined ? (
        // Immutable title (Daily Notes or no onChange provided)
        <h1 className="text-3xl text-gray-900 font-semibold select-none">{displayTitle}</h1>
      ) : (
        // Editable title
        <EditableTitle value={title} onChange={onTitleChange} placeholder="Untitled" />
      )}
    </header>
  );
}

DocumentHeader.displayName = 'DocumentHeader';
