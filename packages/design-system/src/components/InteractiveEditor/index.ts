export { InteractiveEditor } from './InteractiveEditor.js';
export type {
  InteractiveEditorProps,
  InteractiveEditorRef,
  WikiLinkProvider,
  WikiLinkItem,
  TagProvider,
  TagItem,
  MockNote,
  MockTag,
  ObjectType,
} from './types.js';

// Components
export { SuggestionPopover } from './components/SuggestionPopover.js';
export type { SuggestionPopoverProps } from './components/SuggestionPopover.js';
export { WikiLinkMenu } from './components/WikiLinkMenu.js';
export type { WikiLinkMenuProps } from './components/WikiLinkMenu.js';

// Extensions (for advanced customization)
export { RefNode } from './extensions/RefNode.js';
export type { RefNodeOptions, RefNodeAttributes } from './extensions/RefNode.js';
export { RefSuggestion } from './extensions/RefSuggestion.js';
export type { RefSuggestionOptions, RefSuggestionRenderProps } from './extensions/RefSuggestion.js';

// Mocks for Ladle stories
export {
  mockNotes,
  mockTags,
  mockWikiLinkProvider,
  mockEmptyContent,
  mockBasicContent,
} from './mocks/index.js';
