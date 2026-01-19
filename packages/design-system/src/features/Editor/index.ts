export { Editor } from './Editor.js';
export type { EditorProps, EditorRef, RefNodeAttributes, RefSuggestionItem } from './types.js';

// Extensions (for advanced usage)
export { RefNode } from './extensions/RefNode.js';
export { RefSuggestionList } from './extensions/RefSuggestionList.js';
export { useRefSuggestion } from './extensions/useRefSuggestion.js';
export { getSlashCommandItems, filterSlashCommands } from './extensions/SlashCommand.js';
export type { SlashCommandItem } from './extensions/SlashCommand.js';
export { SlashCommandList } from './extensions/SlashCommandList.js';
