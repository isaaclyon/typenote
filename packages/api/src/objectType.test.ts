/**
 * ObjectType API schema tests.
 *
 * Tests for object type inheritance and metadata fields.
 */

import { describe, expect, it } from 'vitest';
import {
  CreateObjectTypeInputSchema,
  ObjectTypeErrorCodeSchema,
  ObjectTypeSchema,
  UpdateObjectTypeInputSchema,
} from './objectType.js';

// ============================================================================
// ObjectTypeSchema Tests
// ============================================================================

describe('ObjectTypeSchema', () => {
  const validBase = {
    id: '01HZXTEST00000000000000001',
    key: 'Book',
    name: 'Book',
    icon: null,
    schema: null,
    builtIn: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('parentTypeId', () => {
    it('should accept null parentTypeId', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: null,
        color: null,
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid ULID parentTypeId', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: '01HZXPARENT000000000000001',
        pluralName: null,
        color: null,
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it('should reject parentTypeId with wrong length', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: 'too-short',
        pluralName: null,
        color: null,
        description: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('pluralName', () => {
    it('should accept null pluralName', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: null,
        color: null,
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid pluralName', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: 'Books',
        color: null,
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it('should reject pluralName exceeding max length', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: 'a'.repeat(129), // max is 128
        color: null,
        description: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('color', () => {
    it('should accept null color', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: null,
        color: null,
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid hex color', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: null,
        color: '#3B82F6',
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept lowercase hex color', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: null,
        color: '#ff5733',
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid color format (no hash)', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: null,
        color: '3B82F6',
        description: null,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid color format (wrong length)', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: null,
        color: '#FFF',
        description: null,
      });
      expect(result.success).toBe(false);
    });

    it('should reject invalid color format (not hex)', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: null,
        color: '#GGGGGG',
        description: null,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('description', () => {
    it('should accept null description', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: null,
        color: null,
        description: null,
      });
      expect(result.success).toBe(true);
    });

    it('should accept valid description', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: null,
        color: null,
        description: 'A type for tracking books in your library',
      });
      expect(result.success).toBe(true);
    });

    it('should reject description exceeding max length', () => {
      const result = ObjectTypeSchema.safeParse({
        ...validBase,
        parentTypeId: null,
        pluralName: null,
        color: null,
        description: 'a'.repeat(1025), // max is 1024
      });
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// CreateObjectTypeInputSchema Tests
// ============================================================================

describe('CreateObjectTypeInputSchema', () => {
  const validBase = {
    key: 'Book',
    name: 'Book',
  };

  describe('parentTypeId', () => {
    it('should accept input without parentTypeId', () => {
      const result = CreateObjectTypeInputSchema.safeParse(validBase);
      expect(result.success).toBe(true);
    });

    it('should accept valid ULID parentTypeId', () => {
      const result = CreateObjectTypeInputSchema.safeParse({
        ...validBase,
        parentTypeId: '01HZXMEDIA0000000000000001',
      });
      expect(result.success).toBe(true);
    });

    it('should reject parentTypeId with wrong length', () => {
      const result = CreateObjectTypeInputSchema.safeParse({
        ...validBase,
        parentTypeId: 'invalid',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('pluralName', () => {
    it('should accept pluralName', () => {
      const result = CreateObjectTypeInputSchema.safeParse({
        ...validBase,
        pluralName: 'Books',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('color', () => {
    it('should accept valid hex color', () => {
      const result = CreateObjectTypeInputSchema.safeParse({
        ...validBase,
        color: '#3B82F6',
      });
      expect(result.success).toBe(true);
    });

    it('should reject invalid color format', () => {
      const result = CreateObjectTypeInputSchema.safeParse({
        ...validBase,
        color: 'red',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('description', () => {
    it('should accept description', () => {
      const result = CreateObjectTypeInputSchema.safeParse({
        ...validBase,
        description: 'A type for books',
      });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// UpdateObjectTypeInputSchema Tests
// ============================================================================

describe('UpdateObjectTypeInputSchema', () => {
  describe('parentTypeId', () => {
    it('should accept parentTypeId update', () => {
      const result = UpdateObjectTypeInputSchema.safeParse({
        parentTypeId: '01HZXNEWPARENT000000000001',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null parentTypeId (remove parent)', () => {
      const result = UpdateObjectTypeInputSchema.safeParse({
        parentTypeId: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('pluralName', () => {
    it('should accept pluralName update', () => {
      const result = UpdateObjectTypeInputSchema.safeParse({
        pluralName: 'Books',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null pluralName', () => {
      const result = UpdateObjectTypeInputSchema.safeParse({
        pluralName: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('color', () => {
    it('should accept color update', () => {
      const result = UpdateObjectTypeInputSchema.safeParse({
        color: '#FF5733',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null color', () => {
      const result = UpdateObjectTypeInputSchema.safeParse({
        color: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('description', () => {
    it('should accept description update', () => {
      const result = UpdateObjectTypeInputSchema.safeParse({
        description: 'Updated description',
      });
      expect(result.success).toBe(true);
    });

    it('should accept null description', () => {
      const result = UpdateObjectTypeInputSchema.safeParse({
        description: null,
      });
      expect(result.success).toBe(true);
    });
  });
});

// ============================================================================
// ObjectTypeErrorCodeSchema Tests
// ============================================================================

describe('ObjectTypeErrorCodeSchema', () => {
  it('should include TYPE_INHERITANCE_CYCLE error code', () => {
    const result = ObjectTypeErrorCodeSchema.safeParse('TYPE_INHERITANCE_CYCLE');
    expect(result.success).toBe(true);
  });

  it('should include TYPE_INHERITANCE_DEPTH error code', () => {
    const result = ObjectTypeErrorCodeSchema.safeParse('TYPE_INHERITANCE_DEPTH');
    expect(result.success).toBe(true);
  });

  it('should include TYPE_HAS_CHILDREN error code', () => {
    const result = ObjectTypeErrorCodeSchema.safeParse('TYPE_HAS_CHILDREN');
    expect(result.success).toBe(true);
  });

  it('should reject unknown error codes', () => {
    const result = ObjectTypeErrorCodeSchema.safeParse('UNKNOWN_ERROR');
    expect(result.success).toBe(false);
  });
});
