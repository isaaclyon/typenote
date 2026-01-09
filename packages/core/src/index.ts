// TypeNote Core - Pure domain logic

export const CORE_VERSION = '0.1.0';

// IDs
export { generateId, isValidUlid, parseUlid } from './ids.js';

// Date utilities (for daily note navigation)
export {
  isValidDateKey,
  getPreviousDate,
  getNextDate,
  getTodayDateKey,
  formatDateForDisplay,
} from './dateUtils.js';

// Calendar date utilities (for calendar grid generation)
export {
  getMonthGridDates,
  getMonthDateRange,
  formatMonthYear,
  addMonths,
  getCalendarTodayDateKey,
} from './calendarDateUtils.js';

// Template placeholders
export { substitutePlaceholders, type PlaceholderContext } from './templatePlaceholders.js';

// Re-export content schemas from api for convenience
// (Core can import from api per the architecture)
export {
  // Marks
  MarkSchema,
  type Mark,
  // Reference targets
  ObjectRefTargetSchema,
  BlockRefTargetSchema,
  RefTargetSchema,
  type RefTarget,
  // Inline nodes
  TextNodeSchema,
  HardBreakNodeSchema,
  LinkNodeSchema,
  RefNodeSchema,
  TagNodeSchema,
  MathInlineNodeSchema,
  FootnoteRefNodeSchema,
  InlineNodeSchema,
  type InlineNode,
  // Block types
  BlockTypeSchema,
  type BlockType,
  // Block content schemas
  ParagraphContentSchema,
  HeadingContentSchema,
  ListContentSchema,
  ListItemContentSchema,
  BlockquoteContentSchema,
  CalloutContentSchema,
  CodeBlockContentSchema,
  ThematicBreakContentSchema,
  TableContentSchema,
  MathBlockContentSchema,
  FootnoteDefContentSchema,
  type ParagraphContent,
  type HeadingContent,
  type ListContent,
  type ListItemContent,
  type BlockquoteContent,
  type CalloutContent,
  type CodeBlockContent,
  type ThematicBreakContent,
  type TableContent,
  type MathBlockContent,
  type FootnoteDefContent,
  // Utility
  getContentSchemaForBlockType,
} from '@typenote/api';
