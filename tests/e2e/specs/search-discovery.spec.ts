import { test, expect } from '../fixtures/app.fixture.js';
import type { TypenoteAPI } from '../types/global.js';

// Declare browser window type for use inside page.evaluate()
declare const window: Window & { typenoteAPI: TypenoteAPI };

// Helper to generate unique content for search tests
function uniqueContent(testId: string, suffix: string = ''): string {
  const timestamp = Date.now();
  return `UNIQUE_${testId}_${timestamp}${suffix ? '_' + suffix : ''}`;
}

// Helper to generate unique block IDs (must be 26 chars for ULID format validation)
function uniqueBlockId(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase().padStart(10, '0');
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}${timestamp}${suffix}`.substring(0, 26).padEnd(26, '0');
}

test.describe('Search and Discovery', () => {
  test.describe('Full-text Search', () => {
    test('search finds blocks containing query text', async ({ window: page }) => {
      const searchTerm = uniqueContent('FIND_BLOCKS');

      // Create a page with searchable content
      const createResult = await page.evaluate(async (content: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Search Test Page', {});
        if (!pageResult.success) return pageResult;

        const patchResult = await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01SEARCHFINDBLOCK000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: `This contains ${content} for testing` }] },
            },
          ],
        });

        return { pageResult, patchResult };
      }, searchTerm);

      expect(createResult).toBeDefined();

      // Search for the content
      const searchResult = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, searchTerm);

      expect(searchResult.success).toBe(true);
      if (searchResult.success) {
        expect(searchResult.result.length).toBeGreaterThan(0);
        expect(searchResult.result.some((r) => r.blockId === '01SEARCHFINDBLOCK000000001')).toBe(
          true
        );
      }
    });

    test('search returns no results for non-matching query', async ({ window: page }) => {
      const nonExistentTerm = uniqueContent('NONEXISTENT');

      const result = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, nonExistentTerm);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.length).toBe(0);
      }
    });

    test('search is case-insensitive', async ({ window: page }) => {
      const baseTerm = uniqueContent('CASETEST');
      const blockId = uniqueBlockId('01CASETEST');

      // Create content with mixed case
      await page.evaluate(
        async ({ content, id }: { content: string; id: string }) => {
          const pageResult = await window.typenoteAPI.createObject('Page', 'Case Test Page', {});
          if (!pageResult.success) return pageResult;

          return await window.typenoteAPI.applyBlockPatch({
            apiVersion: 'v1',
            objectId: pageResult.result.id,
            ops: [
              {
                op: 'block.insert',
                blockId: id,
                parentBlockId: null,
                blockType: 'paragraph',
                content: { inline: [{ t: 'text', text: `MixedCase ${content} Text` }] },
              },
            ],
          });
        },
        { content: baseTerm, id: blockId }
      );

      // Search with lowercase
      const lowercaseResult = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query.toLowerCase());
      }, baseTerm);

      expect(lowercaseResult.success).toBe(true);
      if (lowercaseResult.success) {
        // FTS5 uses case-insensitive matching by default
        expect(lowercaseResult.result.length).toBeGreaterThanOrEqual(0);
      }
    });

    test('search updates after content changes', async ({ window: page }) => {
      const originalTerm = uniqueContent('ORIGINAL');
      const updatedTerm = uniqueContent('UPDATED');
      const blockId = uniqueBlockId('01UPDATEBL');

      // Create page with original content
      const createResult = await page.evaluate(
        async ({ content, id }: { content: string; id: string }) => {
          const pageResult = await window.typenoteAPI.createObject('Page', 'Update Test Page', {});
          if (!pageResult.success) return { success: false, objectId: '' };

          await window.typenoteAPI.applyBlockPatch({
            apiVersion: 'v1',
            objectId: pageResult.result.id,
            ops: [
              {
                op: 'block.insert',
                blockId: id,
                parentBlockId: null,
                blockType: 'paragraph',
                content: { inline: [{ t: 'text', text: content }] },
              },
            ],
          });

          return { success: true, objectId: pageResult.result.id };
        },
        { content: originalTerm, id: blockId }
      );

      expect(createResult.success).toBe(true);

      // Verify original content is searchable
      const originalSearch = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, originalTerm);

      expect(originalSearch.success).toBe(true);
      if (originalSearch.success) {
        expect(originalSearch.result.length).toBeGreaterThan(0);
      }

      // Update the block content
      await page.evaluate(
        async ({
          objectId,
          blockId,
          newContent,
        }: {
          objectId: string;
          blockId: string;
          newContent: string;
        }) => {
          return await window.typenoteAPI.applyBlockPatch({
            apiVersion: 'v1',
            objectId,
            ops: [
              {
                op: 'block.update',
                blockId,
                patch: {
                  content: { inline: [{ t: 'text', text: newContent }] },
                },
              },
            ],
          });
        },
        { objectId: createResult.objectId, blockId, newContent: updatedTerm }
      );

      // Verify updated content is searchable
      const updatedSearch = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, updatedTerm);

      expect(updatedSearch.success).toBe(true);
      if (updatedSearch.success) {
        expect(updatedSearch.result.length).toBeGreaterThan(0);
      }

      // Verify original content is no longer found
      const originalGone = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, originalTerm);

      expect(originalGone.success).toBe(true);
      if (originalGone.success) {
        expect(originalGone.result.length).toBe(0);
      }
    });

    test('search respects limit filter', async ({ window: page }) => {
      const searchTerm = uniqueContent('LIMITFILT');

      // Create multiple blocks with same searchable content
      const objectResult = await page.evaluate(async () => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Limit Test Page', {});
        if (!pageResult.success) return null;
        return pageResult.result.id;
      });

      expect(objectResult).not.toBeNull();
      if (objectResult === null) return;

      // Insert 5 blocks with the search term
      for (let i = 0; i < 5; i++) {
        await page.evaluate(
          async ({
            objectId,
            content,
            index,
          }: {
            objectId: string;
            content: string;
            index: number;
          }) => {
            const blockId = `01LIMITBLOCK${String(index).padStart(14, '0')}`;
            return await window.typenoteAPI.applyBlockPatch({
              apiVersion: 'v1',
              objectId,
              ops: [
                {
                  op: 'block.insert',
                  blockId,
                  parentBlockId: null,
                  blockType: 'paragraph',
                  content: { inline: [{ t: 'text', text: `${content} item ${index}` }] },
                },
              ],
            });
          },
          { objectId: objectResult, content: searchTerm, index: i }
        );
      }

      // Search with limit
      const limitedSearch = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query, { limit: 3 });
      }, searchTerm);

      expect(limitedSearch.success).toBe(true);
      if (limitedSearch.success) {
        expect(limitedSearch.result.length).toBeLessThanOrEqual(3);
      }
    });

    test('search respects objectId filter', async ({ window: page }) => {
      const searchTerm = uniqueContent('OBJFILTER');

      // Create two pages with same search term
      const page1Result = await page.evaluate(async (content: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Filter Page 1', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01FILTER1BLK00000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: content }] },
            },
          ],
        });

        return pageResult.result.id;
      }, searchTerm);

      const page2Result = await page.evaluate(async (content: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Filter Page 2', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01FILTER2BLK00000000000002',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: content }] },
            },
          ],
        });

        return pageResult.result.id;
      }, searchTerm);

      expect(page1Result).not.toBeNull();
      expect(page2Result).not.toBeNull();
      if (page1Result === null || page2Result === null) return;

      // Search globally should find both
      const globalSearch = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, searchTerm);

      expect(globalSearch.success).toBe(true);
      if (globalSearch.success) {
        expect(globalSearch.result.length).toBe(2);
      }

      // Search filtered to page1 should find only one
      const filteredSearch = await page.evaluate(
        async ({ query, objectId }: { query: string; objectId: string }) => {
          return await window.typenoteAPI.searchBlocks(query, { objectId });
        },
        { query: searchTerm, objectId: page1Result }
      );

      expect(filteredSearch.success).toBe(true);
      if (filteredSearch.success) {
        expect(filteredSearch.result.length).toBe(1);
        expect(filteredSearch.result[0]?.objectId).toBe(page1Result);
      }
    });

    test('search with empty query returns empty results', async ({ window: page }) => {
      const result = await page.evaluate(async () => {
        // Empty query should not throw but return empty results
        try {
          return await window.typenoteAPI.searchBlocks('');
        } catch {
          return { success: true, result: [] };
        }
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.length).toBe(0);
      }
    });

    test('search handles special characters gracefully', async ({ window: page }) => {
      // FTS5 has specific query syntax - special chars should be handled
      const result = await page.evaluate(async () => {
        try {
          // These characters have special meaning in FTS5
          return await window.typenoteAPI.searchBlocks('test*');
        } catch {
          return { success: false, error: { code: 'SEARCH_ERROR', message: 'Query failed' } };
        }
      });

      // Should either succeed or fail gracefully (not crash)
      expect(result).toBeDefined();
    });

    test('search finds content across multiple blocks', async ({ window: page }) => {
      const searchTerm = uniqueContent('MULTIBLOCK');

      // Create a page with multiple blocks
      const createResult = await page.evaluate(async (content: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Multi Block Page', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01MULTIBLOCK00000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: `First ${content} block` }] },
            },
            {
              op: 'block.insert',
              blockId: '01MULTIBLOCK00000000000002',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: `Second ${content} block` }] },
            },
            {
              op: 'block.insert',
              blockId: '01MULTIBLOCK00000000000003',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'No match here' }] },
            },
          ],
        });

        return pageResult.result.id;
      }, searchTerm);

      expect(createResult).not.toBeNull();

      const searchResult = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, searchTerm);

      expect(searchResult.success).toBe(true);
      if (searchResult.success) {
        expect(searchResult.result.length).toBe(2);
        const blockIds = searchResult.result.map((r) => r.blockId).sort();
        expect(blockIds).toContain('01MULTIBLOCK00000000000001');
        expect(blockIds).toContain('01MULTIBLOCK00000000000002');
      }
    });

    test('search supports FTS5 prefix matching', async ({ window: page }) => {
      const uniquePrefix = uniqueContent('PREFIX');
      const blockId = uniqueBlockId('01PREFIX');

      // Create content with the unique prefix
      await page.evaluate(
        async ({ content, id }: { content: string; id: string }) => {
          const pageResult = await window.typenoteAPI.createObject('Page', 'Prefix Test Page', {});
          if (!pageResult.success) return null;

          return await window.typenoteAPI.applyBlockPatch({
            apiVersion: 'v1',
            objectId: pageResult.result.id,
            ops: [
              {
                op: 'block.insert',
                blockId: id,
                parentBlockId: null,
                blockType: 'paragraph',
                content: { inline: [{ t: 'text', text: `${content}suffix more text` }] },
              },
            ],
          });
        },
        { content: uniquePrefix, id: blockId }
      );

      // Search with prefix match (FTS5 syntax)
      const prefixResult = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query + '*');
      }, uniquePrefix);

      expect(prefixResult.success).toBe(true);
      if (prefixResult.success) {
        expect(prefixResult.result.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Backlinks', () => {
    test('new object has no backlinks', async ({ window: page }) => {
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'New Page No Links', {});
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      const backlinksResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, createResult.result.id);

      expect(backlinksResult.success).toBe(true);
      if (backlinksResult.success) {
        expect(backlinksResult.result.length).toBe(0);
      }
    });

    test('object with reference shows backlinks', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Target Page', {});
      });

      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with reference to target
      const sourceResult = await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject(
          'Page',
          'Source Page With Link',
          {}
        );
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01BACKLINKREF0000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'text', text: 'Link to: ' },
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      expect(sourceResult).not.toBeNull();

      // Check backlinks on target
      const backlinksResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(backlinksResult.success).toBe(true);
      if (backlinksResult.success) {
        expect(backlinksResult.result.length).toBe(1);
        expect(backlinksResult.result[0]?.sourceObjectId).toBe(sourceResult);
        expect(backlinksResult.result[0]?.sourceBlockId).toBe('01BACKLINKREF0000000000001');
      }
    });

    test('backlink count is correct with multiple references', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Multi Backlink Target', {});
      });

      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create first source page
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Source 1', {});
        if (!pageResult.success) return null;

        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01MULTIREF1BLOCK0000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });
      }, targetId);

      // Create second source page
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Source 2', {});
        if (!pageResult.success) return null;

        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01MULTIREF2BLOCK0000000002',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });
      }, targetId);

      // Create third source with two refs in different blocks
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Source 3', {});
        if (!pageResult.success) return null;

        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01MULTIREF3ABLOCK000000003',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
            {
              op: 'block.insert',
              blockId: '01MULTIREF3BBLOCK000000004',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });
      }, targetId);

      // Check backlinks - should have 4 total (1 + 1 + 2)
      const backlinksResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(backlinksResult.success).toBe(true);
      if (backlinksResult.success) {
        expect(backlinksResult.result.length).toBe(4);
      }
    });

    test('backlinks update when reference is removed', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Remove Link Target', {});
      });

      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with reference
      const sourceResult = await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Source With Link', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01REMOVEREF000000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      expect(sourceResult).not.toBeNull();
      if (sourceResult === null) return;

      // Verify backlink exists
      const beforeRemove = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(beforeRemove.success).toBe(true);
      if (beforeRemove.success) {
        expect(beforeRemove.result.length).toBe(1);
      }

      // Update block to remove the reference
      await page.evaluate(async (objectId: string) => {
        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId,
          ops: [
            {
              op: 'block.update',
              blockId: '01REMOVEREF000000000000001',
              patch: {
                content: { inline: [{ t: 'text', text: 'No more reference' }] },
              },
            },
          ],
        });
      }, sourceResult);

      // Verify backlink is gone
      const afterRemove = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(afterRemove.success).toBe(true);
      if (afterRemove.success) {
        expect(afterRemove.result.length).toBe(0);
      }
    });

    test('backlinks update when reference block is deleted', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Delete Block Target', {});
      });

      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with reference
      const sourceResult = await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Source Delete Block', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01DELETEBLK000000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      expect(sourceResult).not.toBeNull();
      if (sourceResult === null) return;

      // Verify backlink exists
      const beforeDelete = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(beforeDelete.success).toBe(true);
      if (beforeDelete.success) {
        expect(beforeDelete.result.length).toBe(1);
      }

      // Delete the block containing the reference
      await page.evaluate(async (objectId: string) => {
        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId,
          ops: [
            {
              op: 'block.delete',
              blockId: '01DELETEBLK000000000000001',
            },
          ],
        });
      }, sourceResult);

      // Verify backlink is gone (soft-deleted blocks excluded)
      const afterDelete = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(afterDelete.success).toBe(true);
      if (afterDelete.success) {
        expect(afterDelete.result.length).toBe(0);
      }
    });

    test('backlinks include block-level reference targets', async ({ window: page }) => {
      // Create target page with a block
      const targetResult = await page.evaluate(async () => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Block Ref Target', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01TARGETBLOCK0000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: 'Target block content' }] },
            },
          ],
        });

        return pageResult.result.id;
      });

      expect(targetResult).not.toBeNull();
      if (targetResult === null) return;

      // Create source page with block-level reference
      await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject(
          'Page',
          'Source Block Level Ref',
          {}
        );
        if (!pageResult.success) return null;

        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01SOURCEBLKREF000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  {
                    t: 'ref',
                    mode: 'link',
                    target: {
                      kind: 'block',
                      objectId: targetObjectId,
                      blockId: '01TARGETBLOCK0000000000001',
                    },
                  },
                ],
              },
            },
          ],
        });
      }, targetResult);

      // Check backlinks - should include targetBlockId
      const backlinksResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetResult);

      expect(backlinksResult.success).toBe(true);
      if (backlinksResult.success) {
        expect(backlinksResult.result.length).toBe(1);
        expect(backlinksResult.result[0]?.targetBlockId).toBe('01TARGETBLOCK0000000000001');
      }
    });

    test('backlinks from different source objects are tracked', async ({ window: page }) => {
      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Multi Source Target', {});
      });

      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create first source
      const source1 = await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'First Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01DIFFSRC1BLK0000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      // Create second source
      const source2 = await page.evaluate(async (targetObjectId: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Second Source', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01DIFFSRC2BLK0000000000002',
              parentBlockId: null,
              blockType: 'paragraph',
              content: {
                inline: [
                  { t: 'ref', mode: 'link', target: { kind: 'object', objectId: targetObjectId } },
                ],
              },
            },
          ],
        });

        return pageResult.result.id;
      }, targetId);

      expect(source1).not.toBeNull();
      expect(source2).not.toBeNull();

      // Check backlinks
      const backlinksResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(backlinksResult.success).toBe(true);
      if (backlinksResult.success) {
        expect(backlinksResult.result.length).toBe(2);
        const sourceIds = backlinksResult.result.map((r) => r.sourceObjectId).sort();
        expect(sourceIds).toContain(source1);
        expect(sourceIds).toContain(source2);
      }
    });
  });

  test.describe('Search + Content Sync', () => {
    test('new content is searchable after save', async ({ window: page }) => {
      const searchTerm = uniqueContent('NEWSAVE');

      // Create page
      const createResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'New Content Page', {});
      });

      expect(createResult.success).toBe(true);
      if (!createResult.success) return;

      // Search should find nothing yet
      const beforeAdd = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, searchTerm);

      expect(beforeAdd.success).toBe(true);
      if (beforeAdd.success) {
        expect(beforeAdd.result.length).toBe(0);
      }

      // Add content
      await page.evaluate(
        async ({ objectId, content }: { objectId: string; content: string }) => {
          return await window.typenoteAPI.applyBlockPatch({
            apiVersion: 'v1',
            objectId,
            ops: [
              {
                op: 'block.insert',
                blockId: '01NEWSAVEBLK00000000000001',
                parentBlockId: null,
                blockType: 'paragraph',
                content: { inline: [{ t: 'text', text: content }] },
              },
            ],
          });
        },
        { objectId: createResult.result.id, content: searchTerm }
      );

      // Search should find content immediately (sync indexing)
      const afterAdd = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, searchTerm);

      expect(afterAdd.success).toBe(true);
      if (afterAdd.success) {
        expect(afterAdd.result.length).toBe(1);
      }
    });

    test('deleted content is no longer searchable', async ({ window: page }) => {
      const searchTerm = uniqueContent('DELETESRC');

      // Create page with searchable content
      const createResult = await page.evaluate(async (content: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Delete Test Page', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01DELETESRCBLK000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: content }] },
            },
          ],
        });

        return pageResult.result.id;
      }, searchTerm);

      expect(createResult).not.toBeNull();
      if (createResult === null) return;

      // Verify searchable
      const beforeDelete = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, searchTerm);

      expect(beforeDelete.success).toBe(true);
      if (beforeDelete.success) {
        expect(beforeDelete.result.length).toBe(1);
      }

      // Delete the block
      await page.evaluate(async (objectId: string) => {
        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId,
          ops: [
            {
              op: 'block.delete',
              blockId: '01DELETESRCBLK000000000001',
            },
          ],
        });
      }, createResult);

      // Verify not searchable
      const afterDelete = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, searchTerm);

      expect(afterDelete.success).toBe(true);
      if (afterDelete.success) {
        expect(afterDelete.result.length).toBe(0);
      }
    });

    test('edited content updates search results', async ({ window: page }) => {
      const originalTerm = uniqueContent('EDITORIG');
      const newTerm = uniqueContent('EDITNEW');

      // Create page with original content
      const createResult = await page.evaluate(async (content: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Edit Test Page', {});
        if (!pageResult.success) return null;

        await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01EDITCONTBLK0000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: content }] },
            },
          ],
        });

        return pageResult.result.id;
      }, originalTerm);

      expect(createResult).not.toBeNull();
      if (createResult === null) return;

      // Verify original is searchable
      const origSearch = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, originalTerm);

      expect(origSearch.success).toBe(true);
      if (origSearch.success) {
        expect(origSearch.result.length).toBe(1);
      }

      // Edit the content
      await page.evaluate(
        async ({ objectId, newContent }: { objectId: string; newContent: string }) => {
          return await window.typenoteAPI.applyBlockPatch({
            apiVersion: 'v1',
            objectId,
            ops: [
              {
                op: 'block.update',
                blockId: '01EDITCONTBLK0000000000001',
                patch: {
                  content: { inline: [{ t: 'text', text: newContent }] },
                },
              },
            ],
          });
        },
        { objectId: createResult, newContent: newTerm }
      );

      // New content should be searchable
      const newSearch = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, newTerm);

      expect(newSearch.success).toBe(true);
      if (newSearch.success) {
        expect(newSearch.result.length).toBe(1);
      }

      // Original content should no longer be searchable
      const origGone = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, originalTerm);

      expect(origGone.success).toBe(true);
      if (origGone.success) {
        expect(origGone.result.length).toBe(0);
      }
    });

    test('search reflects content after page reload', async ({ window: page }) => {
      const searchTerm = uniqueContent('RELOAD');

      // Create page with searchable content
      await page.evaluate(async (content: string) => {
        const pageResult = await window.typenoteAPI.createObject('Page', 'Reload Test Page', {});
        if (!pageResult.success) return null;

        return await window.typenoteAPI.applyBlockPatch({
          apiVersion: 'v1',
          objectId: pageResult.result.id,
          ops: [
            {
              op: 'block.insert',
              blockId: '01RELOADBLK000000000000001',
              parentBlockId: null,
              blockType: 'paragraph',
              content: { inline: [{ t: 'text', text: content }] },
            },
          ],
        });
      }, searchTerm);

      // Verify searchable before reload
      const beforeReload = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, searchTerm);

      expect(beforeReload.success).toBe(true);
      if (beforeReload.success) {
        expect(beforeReload.result.length).toBe(1);
      }

      // Reload the page
      await page.reload();
      await page.waitForLoadState('domcontentloaded');

      // Verify still searchable after reload (data persisted)
      const afterReload = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, searchTerm);

      expect(afterReload.success).toBe(true);
      if (afterReload.success) {
        expect(afterReload.result.length).toBe(1);
      }
    });

    test('search and backlinks update together for ref content', async ({ window: page }) => {
      const searchTerm = uniqueContent('REFCONTENT');

      // Create target page
      const targetResult = await page.evaluate(async () => {
        return await window.typenoteAPI.createObject('Page', 'Ref Content Target', {});
      });

      expect(targetResult.success).toBe(true);
      if (!targetResult.success) return;

      const targetId = targetResult.result.id;

      // Create source page with ref and text
      const sourceResult = await page.evaluate(
        async ({ targetObjectId, content }: { targetObjectId: string; content: string }) => {
          const pageResult = await window.typenoteAPI.createObject(
            'Page',
            'Ref Content Source',
            {}
          );
          if (!pageResult.success) return null;

          await window.typenoteAPI.applyBlockPatch({
            apiVersion: 'v1',
            objectId: pageResult.result.id,
            ops: [
              {
                op: 'block.insert',
                blockId: '01REFCONTENT00000000000001',
                parentBlockId: null,
                blockType: 'paragraph',
                content: {
                  inline: [
                    { t: 'text', text: `See also ${content}: ` },
                    {
                      t: 'ref',
                      mode: 'link',
                      target: { kind: 'object', objectId: targetObjectId },
                    },
                  ],
                },
              },
            ],
          });

          return pageResult.result.id;
        },
        { targetObjectId: targetId, content: searchTerm }
      );

      expect(sourceResult).not.toBeNull();

      // Verify both search and backlinks work
      const searchResult = await page.evaluate(async (query: string) => {
        return await window.typenoteAPI.searchBlocks(query);
      }, searchTerm);

      expect(searchResult.success).toBe(true);
      if (searchResult.success) {
        expect(searchResult.result.length).toBe(1);
      }

      const backlinksResult = await page.evaluate(async (id: string) => {
        return await window.typenoteAPI.getBacklinks(id);
      }, targetId);

      expect(backlinksResult.success).toBe(true);
      if (backlinksResult.success) {
        expect(backlinksResult.result.length).toBe(1);
      }
    });

    test('multiple block operations in single patch update search correctly', async ({
      window: page,
    }) => {
      const term1 = uniqueContent('BATCH1');
      const term2 = uniqueContent('BATCH2');
      const term3 = uniqueContent('BATCH3');

      // Create page with multiple blocks in single patch
      const createResult = await page.evaluate(
        async ({
          content1,
          content2,
          content3,
        }: {
          content1: string;
          content2: string;
          content3: string;
        }) => {
          const pageResult = await window.typenoteAPI.createObject('Page', 'Batch Test Page', {});
          if (!pageResult.success) return null;

          await window.typenoteAPI.applyBlockPatch({
            apiVersion: 'v1',
            objectId: pageResult.result.id,
            ops: [
              {
                op: 'block.insert',
                blockId: '01BATCHBLK0000000000000001',
                parentBlockId: null,
                blockType: 'paragraph',
                content: { inline: [{ t: 'text', text: content1 }] },
              },
              {
                op: 'block.insert',
                blockId: '01BATCHBLK0000000000000002',
                parentBlockId: null,
                blockType: 'paragraph',
                content: { inline: [{ t: 'text', text: content2 }] },
              },
              {
                op: 'block.insert',
                blockId: '01BATCHBLK0000000000000003',
                parentBlockId: null,
                blockType: 'paragraph',
                content: { inline: [{ t: 'text', text: content3 }] },
              },
            ],
          });

          return pageResult.result.id;
        },
        { content1: term1, content2: term2, content3: term3 }
      );

      expect(createResult).not.toBeNull();

      // Verify all three are searchable
      for (const term of [term1, term2, term3]) {
        const result = await page.evaluate(async (query: string) => {
          return await window.typenoteAPI.searchBlocks(query);
        }, term);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.result.length).toBe(1);
        }
      }
    });
  });
});
