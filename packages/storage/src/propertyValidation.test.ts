import { describe, it, expect } from 'vitest';
import type { TypeSchema } from '@typenote/api';
import {
  validateProperties,
  getDefaultProperties,
  mergeWithDefaults,
} from './propertyValidation.js';

describe('propertyValidation', () => {
  describe('validateProperties', () => {
    describe('with null/empty schema', () => {
      it('returns valid for null schema', () => {
        const result = validateProperties({ anything: 'goes' }, null);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('returns valid for empty properties array', () => {
        const schema: TypeSchema = { properties: [] };
        const result = validateProperties({ anything: 'goes' }, schema);
        expect(result.valid).toBe(true);
      });

      it('returns valid for null properties', () => {
        const result = validateProperties(null, null);
        expect(result.valid).toBe(true);
      });
    });

    describe('text property type', () => {
      const schema: TypeSchema = {
        properties: [{ key: 'name', name: 'Name', type: 'text', required: false }],
      };

      it('validates string value', () => {
        const result = validateProperties({ name: 'Test' }, schema);
        expect(result.valid).toBe(true);
      });

      it('rejects non-string value', () => {
        const result = validateProperties({ name: 123 }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.propertyKey).toBe('name');
        expect(result.errors[0]?.message).toContain('must be a string');
      });

      it('allows undefined for optional property', () => {
        const result = validateProperties({}, schema);
        expect(result.valid).toBe(true);
      });
    });

    describe('number property type', () => {
      const schema: TypeSchema = {
        properties: [{ key: 'count', name: 'Count', type: 'number', required: false }],
      };

      it('validates number value', () => {
        const result = validateProperties({ count: 42 }, schema);
        expect(result.valid).toBe(true);
      });

      it('validates zero', () => {
        const result = validateProperties({ count: 0 }, schema);
        expect(result.valid).toBe(true);
      });

      it('validates negative numbers', () => {
        const result = validateProperties({ count: -10 }, schema);
        expect(result.valid).toBe(true);
      });

      it('rejects string value', () => {
        const result = validateProperties({ count: '42' }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('must be a number');
      });

      it('rejects NaN', () => {
        const result = validateProperties({ count: NaN }, schema);
        expect(result.valid).toBe(false);
      });
    });

    describe('boolean property type', () => {
      const schema: TypeSchema = {
        properties: [{ key: 'active', name: 'Active', type: 'boolean', required: false }],
      };

      it('validates true', () => {
        const result = validateProperties({ active: true }, schema);
        expect(result.valid).toBe(true);
      });

      it('validates false', () => {
        const result = validateProperties({ active: false }, schema);
        expect(result.valid).toBe(true);
      });

      it('rejects string "true"', () => {
        const result = validateProperties({ active: 'true' }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('must be a boolean');
      });
    });

    describe('date property type', () => {
      const schema: TypeSchema = {
        properties: [{ key: 'due_date', name: 'Due Date', type: 'date', required: false }],
      };

      it('validates YYYY-MM-DD format', () => {
        const result = validateProperties({ due_date: '2026-01-15' }, schema);
        expect(result.valid).toBe(true);
      });

      it('rejects datetime format', () => {
        const result = validateProperties({ due_date: '2026-01-15T10:30:00Z' }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('YYYY-MM-DD');
      });

      it('rejects invalid date format', () => {
        const result = validateProperties({ due_date: '15-01-2026' }, schema);
        expect(result.valid).toBe(false);
      });

      it('rejects Date object', () => {
        const result = validateProperties({ due_date: new Date() }, schema);
        expect(result.valid).toBe(false);
      });
    });

    describe('datetime property type', () => {
      const schema: TypeSchema = {
        properties: [{ key: 'timestamp', name: 'Timestamp', type: 'datetime', required: false }],
      };

      it('validates ISO datetime string', () => {
        const result = validateProperties({ timestamp: '2026-01-15T10:30:00Z' }, schema);
        expect(result.valid).toBe(true);
      });

      it('validates date-only string', () => {
        const result = validateProperties({ timestamp: '2026-01-15' }, schema);
        expect(result.valid).toBe(true);
      });

      it('rejects invalid datetime', () => {
        const result = validateProperties({ timestamp: 'not-a-date' }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('ISO datetime');
      });
    });

    describe('select property type', () => {
      const schema: TypeSchema = {
        properties: [
          {
            key: 'status',
            name: 'Status',
            type: 'select',
            required: false,
            options: ['draft', 'published', 'archived'],
          },
        ],
      };

      it('validates value in options', () => {
        const result = validateProperties({ status: 'published' }, schema);
        expect(result.valid).toBe(true);
      });

      it('rejects value not in options', () => {
        const result = validateProperties({ status: 'deleted' }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('must be one of');
      });

      it('rejects non-string value', () => {
        const result = validateProperties({ status: 1 }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('must be a string');
      });
    });

    describe('multiselect property type', () => {
      const schema: TypeSchema = {
        properties: [
          {
            key: 'tags',
            name: 'Tags',
            type: 'multiselect',
            required: false,
            options: ['work', 'personal', 'urgent'],
          },
        ],
      };

      it('validates array of valid options', () => {
        const result = validateProperties({ tags: ['work', 'urgent'] }, schema);
        expect(result.valid).toBe(true);
      });

      it('validates empty array', () => {
        const result = validateProperties({ tags: [] }, schema);
        expect(result.valid).toBe(true);
      });

      it('rejects non-array value', () => {
        const result = validateProperties({ tags: 'work' }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('must be an array');
      });

      it('rejects invalid option in array', () => {
        const result = validateProperties({ tags: ['work', 'invalid'] }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('invalid option');
      });

      it('rejects non-string items in array', () => {
        const result = validateProperties({ tags: ['work', 123] }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('must be strings');
      });
    });

    describe('ref property type', () => {
      const schema: TypeSchema = {
        properties: [{ key: 'author', name: 'Author', type: 'ref', required: false }],
      };

      it('validates ULID string', () => {
        // ULID must be exactly 26 characters
        const result = validateProperties({ author: '01HZXYZ1234567890ABCDEFGHI' }, schema);
        expect(result.valid).toBe(true);
      });

      it('rejects non-ULID string', () => {
        const result = validateProperties({ author: 'not-a-ulid' }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('ULID');
      });

      it('rejects non-string', () => {
        const result = validateProperties({ author: 12345 }, schema);
        expect(result.valid).toBe(false);
      });
    });

    describe('refs property type', () => {
      const schema: TypeSchema = {
        properties: [{ key: 'participants', name: 'Participants', type: 'refs', required: false }],
      };

      it('validates array of ULIDs', () => {
        // ULIDs must be exactly 26 characters each
        const result = validateProperties(
          {
            participants: ['01HZXYZ1234567890ABCDEFGHI', '01HZXYZ1234567890ABCDEFGHJ'],
          },
          schema
        );
        expect(result.valid).toBe(true);
      });

      it('validates empty array', () => {
        const result = validateProperties({ participants: [] }, schema);
        expect(result.valid).toBe(true);
      });

      it('rejects non-array', () => {
        const result = validateProperties({ participants: '01HZXYZ1234567890ABCDEFGHI' }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('array of object IDs');
      });

      it('rejects invalid ULID in array', () => {
        const result = validateProperties(
          { participants: ['01HZXYZ1234567890ABCDEFGHI', 'invalid'] },
          schema
        );
        expect(result.valid).toBe(false);
        expect(result.errors[0]?.message).toContain('invalid object ID');
      });
    });

    describe('required properties', () => {
      const schema: TypeSchema = {
        properties: [
          { key: 'title', name: 'Title', type: 'text', required: true },
          { key: 'count', name: 'Count', type: 'number', required: true },
        ],
      };

      it('fails when required property is missing', () => {
        const result = validateProperties({ title: 'Test' }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0]?.propertyKey).toBe('count');
        expect(result.errors[0]?.message).toContain('Required');
      });

      it('fails when required property is null', () => {
        const result = validateProperties({ title: 'Test', count: null }, schema);
        expect(result.valid).toBe(false);
      });

      it('passes when all required properties are present', () => {
        const result = validateProperties({ title: 'Test', count: 5 }, schema);
        expect(result.valid).toBe(true);
      });
    });

    describe('multiple errors', () => {
      const schema: TypeSchema = {
        properties: [
          { key: 'name', name: 'Name', type: 'text', required: true },
          { key: 'age', name: 'Age', type: 'number', required: true },
        ],
      };

      it('collects all validation errors', () => {
        const result = validateProperties({ name: 123, age: 'twenty' }, schema);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(2);
      });
    });
  });

  describe('getDefaultProperties', () => {
    it('returns empty object for null schema', () => {
      const result = getDefaultProperties(null);
      expect(result).toEqual({});
    });

    it('returns empty object for schema without defaults', () => {
      const schema: TypeSchema = {
        properties: [{ key: 'name', name: 'Name', type: 'text', required: false }],
      };
      const result = getDefaultProperties(schema);
      expect(result).toEqual({});
    });

    it('returns default values from schema', () => {
      const schema: TypeSchema = {
        properties: [
          { key: 'status', name: 'Status', type: 'select', required: false, defaultValue: 'draft' },
          { key: 'count', name: 'Count', type: 'number', required: false, defaultValue: 0 },
          { key: 'name', name: 'Name', type: 'text', required: false },
        ],
      };
      const result = getDefaultProperties(schema);
      expect(result).toEqual({ status: 'draft', count: 0 });
    });
  });

  describe('mergeWithDefaults', () => {
    const schema: TypeSchema = {
      properties: [
        { key: 'status', name: 'Status', type: 'select', required: false, defaultValue: 'draft' },
        { key: 'count', name: 'Count', type: 'number', required: false, defaultValue: 0 },
      ],
    };

    it('fills in missing properties with defaults', () => {
      const result = mergeWithDefaults({}, schema);
      expect(result).toEqual({ status: 'draft', count: 0 });
    });

    it('preserves provided properties', () => {
      const result = mergeWithDefaults({ status: 'published' }, schema);
      expect(result).toEqual({ status: 'published', count: 0 });
    });

    it('handles null properties', () => {
      const result = mergeWithDefaults(null, schema);
      expect(result).toEqual({ status: 'draft', count: 0 });
    });

    it('handles null schema', () => {
      const result = mergeWithDefaults({ custom: 'value' }, null);
      expect(result).toEqual({ custom: 'value' });
    });
  });
});
