/**
 * RefSuggestion Extension Tests
 *
 * Basic tests for the RefSuggestion extension.
 * Note: Complex trigger/popup behavior is better tested via E2E tests
 * due to JSDOM limitations with ProseMirror's DOM APIs.
 */

import { describe, it, expect } from 'vitest';
import { RefSuggestion } from './RefSuggestion.js';

describe('RefSuggestion', () => {
  describe('extension configuration', () => {
    it('can be created with default options', () => {
      const extension = RefSuggestion.configure({});
      expect(extension.name).toBe('refSuggestion');
    });

    it('can be created with custom onSearch handler', () => {
      const onSearch = async () => [];
      const extension = RefSuggestion.configure({ onSearch });
      expect(extension.name).toBe('refSuggestion');
    });

    it('can be created with custom onCreate handler', () => {
      const onCreate = async () => null;
      const extension = RefSuggestion.configure({ onCreate });
      expect(extension.name).toBe('refSuggestion');
    });

    it('has default options that return empty results', async () => {
      const extension = RefSuggestion.configure({});
      // Access the options via the extension
      expect(extension.options.onSearch).toBeDefined();
      expect(extension.options.onCreate).toBeDefined();

      // Default search returns empty array
      const searchResult = await extension.options.onSearch('test');
      expect(searchResult).toEqual([]);

      // Default create returns null
      const createResult = await extension.options.onCreate('test');
      expect(createResult).toBeNull();
    });
  });
});
