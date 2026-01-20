/**
 * RefSuggestionList Component
 *
 * Dropdown UI for the reference suggestion popup.
 * Supports three modes:
 * - OBJECT: Search objects by title (default)
 * - HEADING: Search headings within an object
 * - BLOCK: Search blocks within an object
 */

import * as React from 'react';
import { File } from '@phosphor-icons/react/dist/ssr/File';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Calendar } from '@phosphor-icons/react/dist/ssr/Calendar';
import { MapPin } from '@phosphor-icons/react/dist/ssr/MapPin';
import { CalendarBlank } from '@phosphor-icons/react/dist/ssr/CalendarBlank';
import { CheckSquare } from '@phosphor-icons/react/dist/ssr/CheckSquare';
import { TextH } from '@phosphor-icons/react/dist/ssr/TextH';
import { Paragraph } from '@phosphor-icons/react/dist/ssr/Paragraph';
import { Quotes } from '@phosphor-icons/react/dist/ssr/Quotes';
import { ListBullets } from '@phosphor-icons/react/dist/ssr/ListBullets';
import { Code } from '@phosphor-icons/react/dist/ssr/Code';
import type { Icon as PhosphorIcon } from '@phosphor-icons/react';

import { cn } from '../../../lib/utils.js';
import type {
  RefSuggestionItem,
  HeadingSuggestionItem,
  BlockSuggestionItem,
  AnySuggestionItem,
  SuggestionMode,
} from './RefSuggestion.js';
import { isRefItem, isHeadingItem, isBlockItem } from './RefSuggestion.js';

// ============================================================================
// Constants
// ============================================================================

// Default colors for built-in object types
const TYPE_COLORS: Record<string, string> = {
  Page: '#6366F1',
  DailyNote: '#F59E0B',
  Person: '#EC4899',
  Event: '#8B5CF6',
  Place: '#10B981',
  Task: '#EF4444',
};

// Icons for built-in object types
const TYPE_ICONS: Record<string, PhosphorIcon> = {
  Page: File,
  DailyNote: CalendarBlank,
  Person: User,
  Event: Calendar,
  Place: MapPin,
  Task: CheckSquare,
};

// Icons for block types
const BLOCK_TYPE_ICONS: Record<string, PhosphorIcon> = {
  paragraph: Paragraph,
  heading: TextH,
  blockquote: Quotes,
  bullet_list: ListBullets,
  ordered_list: ListBullets,
  list_item: ListBullets,
  task_list: CheckSquare,
  task_item: CheckSquare,
  code_block: Code,
};

// ============================================================================
// Types
// ============================================================================

export interface AliasMode {
  targetItem: RefSuggestionItem;
  alias: string;
}

export interface RefSuggestionListProps {
  /** The current suggestion mode */
  mode: SuggestionMode;
  /** Items to display (type depends on mode) */
  items: AnySuggestionItem[];
  /** The current search query */
  query: string;
  /** Index of the selected item */
  selectedIndex: number;
  /** Callback when an item is selected */
  onSelect: (item: AnySuggestionItem) => void;
  /** Callback to create a new object (only in object mode) */
  onCreate: ((title: string) => void) | undefined;
  /** When set, shows alias mode UI with single item + preview */
  aliasMode: AliasMode | null;
  /** The selected object (for heading/block modes) */
  selectedObject?: RefSuggestionItem;
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Render a single object item.
 */
function ObjectItem({
  item,
  isSelected,
  onSelect,
}: {
  item: RefSuggestionItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const color = item.color ?? TYPE_COLORS[item.objectType] ?? '#71717A';
  const Icon = TYPE_ICONS[item.objectType] ?? File;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
        'outline-none transition-colors',
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" weight="regular" style={{ color }} />
      <span className="truncate">{item.title || 'Untitled'}</span>
      <span className="ml-auto shrink-0 text-xs text-muted-foreground">{item.objectType}</span>
    </button>
  );
}

/**
 * Render a single heading item.
 */
function HeadingItem({
  item,
  isSelected,
  onSelect,
}: {
  item: HeadingSuggestionItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
        'outline-none transition-colors',
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
      )}
    >
      {/* Heading level indicator */}
      <span
        className={cn(
          'shrink-0 w-6 text-center font-mono text-xs',
          'text-muted-foreground bg-muted rounded px-1'
        )}
      >
        H{item.level}
      </span>
      {/* Heading text */}
      <span className="truncate">{item.text}</span>
    </button>
  );
}

/**
 * Render a single block item.
 */
function BlockItem({
  item,
  isSelected,
  onSelect,
}: {
  item: BlockSuggestionItem;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const Icon = BLOCK_TYPE_ICONS[item.blockType] ?? Paragraph;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
        'outline-none transition-colors',
        isSelected ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
      )}
    >
      {/* Block type icon */}
      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" weight="regular" />
      {/* Block preview */}
      <span className="truncate flex-1">{item.preview || '(empty)'}</span>
      {/* Existing alias badge */}
      {item.alias && (
        <span className="shrink-0 text-xs font-mono text-muted-foreground bg-muted rounded px-1">
          ^{item.alias}
        </span>
      )}
    </button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export const RefSuggestionList = React.forwardRef<HTMLDivElement, RefSuggestionListProps>(
  ({ mode, items, query, selectedIndex, onSelect, onCreate, aliasMode, selectedObject }, ref) => {
    // Alias mode: show single item with preview (only in object mode)
    if (aliasMode) {
      const { targetItem, alias } = aliasMode;
      const color = targetItem.color ?? TYPE_COLORS[targetItem.objectType] ?? '#71717A';
      const Icon = TYPE_ICONS[targetItem.objectType] ?? File;

      return (
        <div
          ref={ref}
          className={cn(
            'overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md',
            'min-w-[200px] max-w-[300px]'
          )}
        >
          {/* Target item (always selected) */}
          <button
            type="button"
            onClick={() => onSelect(targetItem)}
            className={cn(
              'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
              'outline-none transition-colors',
              'bg-accent text-accent-foreground'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" weight="regular" style={{ color }} />
            <span className="truncate">{targetItem.title || 'Untitled'}</span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">
              {targetItem.objectType}
            </span>
          </button>

          {/* Alias preview */}
          <div className="mt-1 border-t border-border pt-1">
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              <span className="opacity-70">→ displays as </span>
              <span className="text-foreground">
                &ldquo;{alias || <span className="opacity-50 italic">empty</span>}&rdquo;
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Determine if we show the create option (only in object mode)
    const showCreate = mode === 'object' && onCreate && query.trim().length > 0;
    const totalItems = items.length + (showCreate ? 1 : 0);

    // Empty state
    if (totalItems === 0) {
      const emptyMessage =
        mode === 'heading'
          ? 'No headings found'
          : mode === 'block'
            ? 'No blocks found'
            : 'No results found';

      return (
        <div
          ref={ref}
          className={cn(
            'overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md',
            'min-w-[200px] max-w-[300px]'
          )}
        >
          <div className="px-2 py-1.5 text-sm text-muted-foreground">{emptyMessage}</div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'overflow-hidden rounded-md border border-border bg-popover p-1 shadow-md',
          'min-w-[200px] max-w-[300px]',
          'max-h-[300px] overflow-y-auto'
        )}
      >
        {/* Mode header for heading/block modes */}
        {(mode === 'heading' || mode === 'block') && selectedObject && (
          <div className="px-2 py-1 text-xs text-muted-foreground border-b border-border mb-1">
            {mode === 'heading' ? 'Headings in ' : 'Blocks in '}
            <span className="font-medium text-foreground">{selectedObject.title}</span>
          </div>
        )}

        {/* Render items based on mode */}
        {items.map((item, index) => {
          const isSelected = index === selectedIndex;
          const key = isRefItem(item)
            ? item.objectId
            : isHeadingItem(item)
              ? `h${item.level}-${item.text}`
              : (item as BlockSuggestionItem).ksuid;

          if (isRefItem(item)) {
            return (
              <ObjectItem
                key={key}
                item={item}
                isSelected={isSelected}
                onSelect={() => onSelect(item)}
              />
            );
          }

          if (isHeadingItem(item)) {
            return (
              <HeadingItem
                key={key}
                item={item}
                isSelected={isSelected}
                onSelect={() => onSelect(item)}
              />
            );
          }

          if (isBlockItem(item)) {
            return (
              <BlockItem
                key={key}
                item={item}
                isSelected={isSelected}
                onSelect={() => onSelect(item)}
              />
            );
          }

          return null;
        })}

        {/* Create new option (object mode only) */}
        {showCreate && (
          <>
            {items.length > 0 && <div className="my-1 h-px bg-border" />}
            <button
              type="button"
              onClick={() => onCreate(query.trim())}
              className={cn(
                'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm',
                'outline-none transition-colors',
                selectedIndex === items.length
                  ? 'bg-accent text-accent-foreground'
                  : 'hover:bg-accent/50'
              )}
            >
              <span className="text-muted-foreground">Create</span>
              <span className="font-medium">&ldquo;{query.trim()}&rdquo;</span>
            </button>
          </>
        )}
      </div>
    );
  }
);

RefSuggestionList.displayName = 'RefSuggestionList';
