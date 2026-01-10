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
export { AttachmentNode } from './AttachmentNode/index.js';
export { CalloutNode } from './CalloutNode.js';
export { MathBlock } from './MathBlock.js';

// Marks
export { Highlight } from './Highlight.js';

// Plugins
export { RefSuggestion } from './RefSuggestion.js';
export { SlashCommand } from './SlashCommand/index.js';

// Behavior extensions
export { LineNavigation } from './LineNavigation.js';
