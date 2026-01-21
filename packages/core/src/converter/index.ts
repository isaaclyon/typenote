/**
 * NotateDoc ↔ TipTap converters.
 *
 * These converters transform between the editor-agnostic NotateDoc format
 * (used for persistence) and TipTap's JSONContent format (used for editing).
 */

export type { TiptapNode, TiptapMark, TiptapDoc } from './types.js';
export type { ConvertedBlock } from './tiptapToNotateDoc.js';
export { tiptapToNotateDoc } from './tiptapToNotateDoc.js';
export { notateDocToTiptap, defaultRefResolver, type RefResolver } from './notateDocToTiptap.js';
