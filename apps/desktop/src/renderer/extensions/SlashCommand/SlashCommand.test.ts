/**
 * SlashCommand Extension Tests
 *
 * Basic tests for the SlashCommand extension.
 * Note: Complex trigger/popup behavior is better tested via E2E tests
 * due to JSDOM limitations with ProseMirror's DOM APIs.
 */

import { describe, test, expect } from 'vitest';
import { SlashCommand, slashCommandPluginKey } from './SlashCommand.js';
import { PluginKey } from '@tiptap/pm/state';

describe('SlashCommand Extension', () => {
  test('exports plugin key as PluginKey instance', () => {
    expect(slashCommandPluginKey).toBeInstanceOf(PluginKey);
  });

  test('has correct extension name', () => {
    const extension = SlashCommand;
    expect(extension.name).toBe('slashCommand');
  });
});
