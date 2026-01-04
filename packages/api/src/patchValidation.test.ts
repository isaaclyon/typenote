import { describe, expect, it } from 'vitest';
import { validatePatchInput, validateBlockContent } from './patchValidation.js';
import type { ApplyBlockPatchInput } from './blockPatch.js';

const VALID_ULID = '01ARZ3NDEKTSV4RRFFQ69G5FAV';
const VALID_ULID_2 = '01ARZ3NDEKTSV4RRFFQ69G5FAW';

describe('validatePatchInput', () => {
  describe('valid patches', () => {
    it('accepts empty ops array', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: VALID_ULID,
        ops: [],
      };

      const result = validatePatchInput(input);
      expect(result.valid).toBe(true);
    });

    it('accepts single insert op with paragraph content', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: VALID_ULID,
        ops: [
          {
            op: 'block.insert',
            blockId: VALID_ULID_2,
            parentBlockId: null,
            place: { where: 'end' },
            blockType: 'paragraph',
            content: { inline: [{ t: 'text', text: 'Hello' }] },
          },
        ],
      };

      const result = validatePatchInput(input);
      expect(result.valid).toBe(true);
    });

    it('accepts multiple ops of different types', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: VALID_ULID,
        baseDocVersion: 5,
        ops: [
          {
            op: 'block.insert',
            blockId: VALID_ULID_2,
            parentBlockId: null,
            blockType: 'heading',
            content: { level: 1, inline: [{ t: 'text', text: 'Title' }] },
          },
          {
            op: 'block.update',
            blockId: VALID_ULID,
            patch: { content: { inline: [] } },
          },
          {
            op: 'block.delete',
            blockId: VALID_ULID,
          },
        ],
      };

      const result = validatePatchInput(input);
      expect(result.valid).toBe(true);
    });

    it('accepts insert with all block types', () => {
      const blockTypes = [
        { type: 'paragraph', content: { inline: [] } },
        { type: 'heading', content: { level: 2, inline: [] } },
        { type: 'list', content: { kind: 'bullet' } },
        { type: 'list_item', content: { inline: [] } },
        { type: 'blockquote', content: {} },
        { type: 'callout', content: { kind: 'NOTE' } },
        { type: 'code_block', content: { code: 'const x = 1;' } },
        { type: 'thematic_break', content: {} },
        { type: 'table', content: { rows: [] } },
        { type: 'math_block', content: { latex: 'x^2' } },
        { type: 'footnote_def', content: { key: '1' } },
      ];

      for (const { type, content } of blockTypes) {
        const input: ApplyBlockPatchInput = {
          apiVersion: 'v1',
          objectId: VALID_ULID,
          ops: [
            {
              op: 'block.insert',
              blockId: VALID_ULID_2,
              parentBlockId: null,
              blockType: type,
              content,
            },
          ],
        };

        const result = validatePatchInput(input);
        expect(result.valid).toBe(true);
      }
    });
  });

  describe('invalid patches', () => {
    it('rejects wrong apiVersion', () => {
      const input = {
        apiVersion: 'v2',
        objectId: VALID_ULID,
        ops: [],
      };

      const result = validatePatchInput(input as ApplyBlockPatchInput);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]?.path).toContain('apiVersion');
      }
    });

    it('rejects invalid objectId', () => {
      const input = {
        apiVersion: 'v1',
        objectId: 'short',
        ops: [],
      };

      const result = validatePatchInput(input as ApplyBlockPatchInput);
      expect(result.valid).toBe(false);
    });

    it('rejects negative baseDocVersion', () => {
      const input = {
        apiVersion: 'v1',
        objectId: VALID_ULID,
        baseDocVersion: -1,
        ops: [],
      };

      const result = validatePatchInput(input as ApplyBlockPatchInput);
      expect(result.valid).toBe(false);
    });

    it('rejects insert with invalid blockId', () => {
      const input: ApplyBlockPatchInput = {
        apiVersion: 'v1',
        objectId: VALID_ULID,
        ops: [
          {
            op: 'block.insert',
            blockId: 'short',
            parentBlockId: null,
            blockType: 'paragraph',
            content: { inline: [] },
          } as ApplyBlockPatchInput['ops'][0],
        ],
      };

      const result = validatePatchInput(input);
      expect(result.valid).toBe(false);
    });

    it('rejects unknown op type', () => {
      const input = {
        apiVersion: 'v1',
        objectId: VALID_ULID,
        ops: [
          {
            op: 'block.unknown',
            blockId: VALID_ULID,
          },
        ],
      };

      const result = validatePatchInput(input as ApplyBlockPatchInput);
      expect(result.valid).toBe(false);
    });
  });
});

describe('validateBlockContent', () => {
  describe('paragraph', () => {
    it('accepts valid paragraph content', () => {
      const result = validateBlockContent('paragraph', { inline: [] });
      expect(result.valid).toBe(true);
    });

    it('accepts paragraph with text nodes', () => {
      const result = validateBlockContent('paragraph', {
        inline: [
          { t: 'text', text: 'Hello ' },
          { t: 'text', text: 'world', marks: ['strong'] },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it('rejects paragraph without inline array', () => {
      const result = validateBlockContent('paragraph', { text: 'Hello' });
      expect(result.valid).toBe(false);
    });
  });

  describe('heading', () => {
    it('accepts valid heading content', () => {
      const result = validateBlockContent('heading', {
        level: 1,
        inline: [{ t: 'text', text: 'Title' }],
      });
      expect(result.valid).toBe(true);
    });

    it('rejects heading with invalid level', () => {
      const result = validateBlockContent('heading', {
        level: 7,
        inline: [],
      });
      expect(result.valid).toBe(false);
    });

    it('rejects heading without level', () => {
      const result = validateBlockContent('heading', {
        inline: [],
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('list', () => {
    it('accepts bullet list', () => {
      const result = validateBlockContent('list', { kind: 'bullet' });
      expect(result.valid).toBe(true);
    });

    it('accepts ordered list with start', () => {
      const result = validateBlockContent('list', { kind: 'ordered', start: 5 });
      expect(result.valid).toBe(true);
    });

    it('rejects list without kind', () => {
      const result = validateBlockContent('list', {});
      expect(result.valid).toBe(false);
    });
  });

  describe('code_block', () => {
    it('accepts code block with language', () => {
      const result = validateBlockContent('code_block', {
        language: 'typescript',
        code: 'const x = 1;',
      });
      expect(result.valid).toBe(true);
    });

    it('rejects code block without code', () => {
      const result = validateBlockContent('code_block', {
        language: 'typescript',
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('inline node validation', () => {
    it('accepts paragraph with ref node', () => {
      const result = validateBlockContent('paragraph', {
        inline: [
          {
            t: 'ref',
            mode: 'link',
            target: { kind: 'object', objectId: VALID_ULID },
          },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it('accepts paragraph with block ref', () => {
      const result = validateBlockContent('paragraph', {
        inline: [
          {
            t: 'ref',
            mode: 'embed',
            target: { kind: 'block', objectId: VALID_ULID, blockId: VALID_ULID_2 },
            alias: 'My Block',
          },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it('accepts paragraph with link containing marked text', () => {
      const result = validateBlockContent('paragraph', {
        inline: [
          {
            t: 'link',
            href: 'https://example.com',
            children: [{ t: 'text', text: 'Bold link', marks: ['strong'] }],
          },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it('rejects paragraph with invalid inline node type', () => {
      const result = validateBlockContent('paragraph', {
        inline: [{ t: 'unknown', value: 'test' }],
      });
      expect(result.valid).toBe(false);
    });

    it('rejects paragraph with invalid mark', () => {
      const result = validateBlockContent('paragraph', {
        inline: [{ t: 'text', text: 'Test', marks: ['invalid_mark'] }],
      });
      expect(result.valid).toBe(false);
    });
  });

  describe('table', () => {
    it('accepts table with inline content in cells', () => {
      const result = validateBlockContent('table', {
        align: ['left', 'center', 'right'],
        rows: [
          { cells: [[{ t: 'text', text: 'A' }], [{ t: 'text', text: 'B' }], []] },
          { cells: [[{ t: 'text', text: '1' }], [{ t: 'text', text: '2' }], []] },
        ],
      });
      expect(result.valid).toBe(true);
    });

    it('accepts empty table', () => {
      const result = validateBlockContent('table', { rows: [] });
      expect(result.valid).toBe(true);
    });
  });
});
