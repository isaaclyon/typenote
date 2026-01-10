/**
 * Mark Mapping - Single Source of Truth
 *
 * Defines the bidirectional mapping between NotateDoc marks and TipTap marks.
 * Both converter modules import from here to prevent desynchronization bugs.
 */

import type { Mark } from '@typenote/api';

/**
 * Bidirectional mark mapping definition.
 * Each entry maps a NotateDoc mark to its TipTap equivalent.
 */
const MARK_MAPPINGS: ReadonlyArray<readonly [Mark, string]> = [
  ['em', 'italic'],
  ['strong', 'bold'],
  ['code', 'code'],
  ['strike', 'strike'],
  ['highlight', 'highlight'],
] as const;

/**
 * Maps NotateDoc mark names to TipTap mark names.
 * Used by notateToTiptap.ts when converting documents for the editor.
 */
export const NOTATE_TO_TIPTAP: Record<Mark, string> = Object.fromEntries(
  MARK_MAPPINGS.map(([notate, tiptap]) => [notate, tiptap])
) as Record<Mark, string>;

/**
 * Maps TipTap mark names to NotateDoc mark names.
 * Used by tiptapToNotate.ts when converting editor content for storage.
 */
export const TIPTAP_TO_NOTATE: Record<string, Mark> = Object.fromEntries(
  MARK_MAPPINGS.map(([notate, tiptap]) => [tiptap, notate])
) as Record<string, Mark>;
