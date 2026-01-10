/**
 * SlashCommand Extension
 *
 * Exports the slash command TipTap extension and related utilities.
 */

export { SlashCommand, slashCommandPluginKey } from './SlashCommand.js';
export { filterCommands, getCommandGroups } from './commandRegistry.js';
export type {
  SlashCommand as SlashCommandType,
  SlashCommandGroup,
  CommandSection,
} from './types.js';
