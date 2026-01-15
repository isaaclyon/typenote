export { CalloutNode } from './CalloutNode.js';
export {
  SlashCommand,
  SlashCommandExtension,
  SlashCommandMenu,
  SlashCommandPopup,
  createSlashCommandSuggestion,
  useSlashCommand,
  executeSlashCommand,
} from './SlashCommand/index.js';
export type {
  SlashCommandOptions,
  SlashCommandSuggestionProps,
  SlashCommandMenuProps,
  SlashCommandMenuRef,
  SlashCommandPopupProps,
  SlashCommandState,
  SlashCommandStateCallback,
  UseSlashCommandState,
  UseSlashCommandReturn,
} from './SlashCommand/index.js';

// RefNode - Wiki-link references
export {
  RefNode,
  RefSuggestion,
  RefSuggestionExtension,
  RefSuggestionMenu,
  RefSuggestionPopup,
  RefNodeView,
  useRefSuggestion,
  isCreateNewItem,
} from './RefNode/index.js';
export type {
  RefNodeAttributes,
  RefNodeOptions,
  RefSuggestionOptions,
  RefSuggestionMenuProps,
  RefSuggestionMenuRef,
  RefSuggestionPopupProps,
  UseRefSuggestionState,
  UseRefSuggestionReturn,
  RefSuggestionItem,
} from './RefNode/index.js';

// TagNode - Tag references
export {
  TagNode,
  TagSuggestion,
  TagSuggestionExtension,
  TagSuggestionMenu,
  TagSuggestionPopup,
  TagNodeView,
  useTagSuggestion,
} from './TagNode/index.js';
export type {
  TagNodeAttributes,
  TagSuggestionOptions,
  TagSuggestionMenuProps,
  TagSuggestionMenuRef,
  TagSuggestionPopupProps,
  UseTagSuggestionState,
  UseTagSuggestionReturn,
} from './TagNode/index.js';

// Math extensions
export { MathBlock } from './MathBlock.js';
export { MathInline } from './MathInline.js';

// Highlight mark extension
export { Highlight } from './Highlight.js';

// Line navigation extension
export { LineNavigation } from './LineNavigation.js';

// AttachmentNode - Image attachments
export { AttachmentNode, ResizeHandle } from './AttachmentNode/index.js';
export type { AttachmentNodeOptions, ResizeHandleProps } from './AttachmentNode/index.js';
