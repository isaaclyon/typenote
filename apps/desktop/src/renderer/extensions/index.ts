/**
 * Custom TipTap Extensions for TypeNote
 *
 * These extensions handle NotateDoc-specific node types that aren't
 * covered by TipTap's StarterKit or standard extensions.
 */

// Inline nodes
export { RefNode } from './RefNode.js';
export { TagNode } from './TagNode.js';
export { MathInline } from './MathInline.js';

// Block nodes
export { CalloutNode } from './CalloutNode.js';
export { MathBlock } from './MathBlock.js';

// Marks
export { Highlight } from './Highlight.js';

// Plugins
export { RefSuggestion } from './RefSuggestion.js';
