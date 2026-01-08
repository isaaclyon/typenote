/**
 * ObjectType API schema tests.
 *
 * Tests for object type inheritance and metadata fields.
 */

import { describe, expect, it } from 'vitest';
import {
  BuiltInTypeKeySchema,
  CreateObjectTypeInputSchema,
  ListObjectTypesOptionsSchema,
  ObjectTypeErrorCodeSchema,
  ObjectTypeSchema,
  PropertyDefinitionSchema,
  PropertyTypeSchema,
  TypeSchemaSchema,
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

// ============================================================================
// BuiltInTypeKeySchema Tests
// ============================================================================

describe('BuiltInTypeKeySchema', () => {
  it('should contain expected built-in type keys', () => {
    expect(BuiltInTypeKeySchema.options).toContain('DailyNote');
    expect(BuiltInTypeKeySchema.options).toContain('Page');
    expect(BuiltInTypeKeySchema.options).toContain('Person');
    expect(BuiltInTypeKeySchema.options).toContain('Event');
    expect(BuiltInTypeKeySchema.options).toContain('Place');
    expect(BuiltInTypeKeySchema.options).toContain('Task');
  });

  it('should have at least 6 built-in types', () => {
    expect(BuiltInTypeKeySchema.options.length).toBeGreaterThanOrEqual(6);
  });
});

// ============================================================================
// PropertyTypeSchema Tests
// ============================================================================

describe('PropertyTypeSchema', () => {
  it('should contain expected property types', () => {
    expect(PropertyTypeSchema.options).toContain('text');
    expect(PropertyTypeSchema.options).toContain('richtext');
    expect(PropertyTypeSchema.options).toContain('number');
    expect(PropertyTypeSchema.options).toContain('boolean');
    expect(PropertyTypeSchema.options).toContain('date');
    expect(PropertyTypeSchema.options).toContain('datetime');
    expect(PropertyTypeSchema.options).toContain('select');
    expect(PropertyTypeSchema.options).toContain('multiselect');
    expect(PropertyTypeSchema.options).toContain('ref');
    expect(PropertyTypeSchema.options).toContain('refs');
  });

  it('should have at least 10 property types', () => {
    expect(PropertyTypeSchema.options.length).toBeGreaterThanOrEqual(10);
  });
});

// ============================================================================
// PropertyDefinitionSchema Tests
// ============================================================================

describe('PropertyDefinitionSchema', () => {
  const validBase = {
    key: 'mykey',
    name: 'My Key',
    type: 'text',
  };

  describe('key regex validation', () => {
    it('should reject key starting with number', () => {
      const result = PropertyDefinitionSchema.safeParse({
        ...validBase,
        key: '9abc',
      });
      expect(result.success).toBe(false);
    });

    it('should reject key with trailing special character', () => {
      const result = PropertyDefinitionSchema.safeParse({
        ...validBase,
        key: 'abc!',
      });
      expect(result.success).toBe(false);
    });

    it('should reject key starting with uppercase', () => {
      const result = PropertyDefinitionSchema.safeParse({
        ...validBase,
        key: 'Abc',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid lowercase key with underscores', () => {
      const result = PropertyDefinitionSchema.safeParse({
        ...validBase,
        key: 'my_key_123',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('length validation', () => {
    it('should reject key exceeding max length (64)', () => {
      const result = PropertyDefinitionSchema.safeParse({
        ...validBase,
        key: 'a'.repeat(65),
      });
      expect(result.success).toBe(false);
    });

    it('should accept key at max length (64)', () => {
      const result = PropertyDefinitionSchema.safeParse({
        ...validBase,
        key: 'a'.repeat(64),
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty key', () => {
      const result = PropertyDefinitionSchema.safeParse({
        ...validBase,
        key: '',
      });
      expect(result.success).toBe(false);
    });

    it('should reject name exceeding max length (128)', () => {
      const result = PropertyDefinitionSchema.safeParse({
        ...validBase,
        name: 'a'.repeat(129),
      });
      expect(result.success).toBe(false);
    });

    it('should accept name at max length (128)', () => {
      const result = PropertyDefinitionSchema.safeParse({
        ...validBase,
        name: 'a'.repeat(128),
      });
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const result = PropertyDefinitionSchema.safeParse({
        ...validBase,
        name: '',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('required field default', () => {
    it('should default required to false when not provided', () => {
      const result = PropertyDefinitionSchema.safeParse(validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.required).toBe(false);
      }
    });

    it('should accept explicit required true', () => {
      const result = PropertyDefinitionSchema.safeParse({
        ...validBase,
        required: true,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.required).toBe(true);
      }
    });
  });

  describe('missing required fields', () => {
    it('should reject missing key', () => {
      const result = PropertyDefinitionSchema.safeParse({
        name: 'My Name',
        type: 'text',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing name', () => {
      const result = PropertyDefinitionSchema.safeParse({
        key: 'mykey',
        type: 'text',
      });
      expect(result.success).toBe(false);
    });

    it('should reject missing type', () => {
      const result = PropertyDefinitionSchema.safeParse({
        key: 'mykey',
        name: 'My Name',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty object', () => {
      const result = PropertyDefinitionSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});

// ============================================================================
// TypeSchemaSchema Tests
// ============================================================================

describe('TypeSchemaSchema', () => {
  it('should reject missing properties field', () => {
    const result = TypeSchemaSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should accept empty properties array', () => {
    const result = TypeSchemaSchema.safeParse({ properties: [] });
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// Hex Color Regex Tests
// ============================================================================

describe('ObjectTypeSchema color regex', () => {
  const validBase = {
    id: '01HZXTEST00000000000000001',
    key: 'Book',
    name: 'Book',
    icon: null,
    schema: null,
    builtIn: false,
    parentTypeId: null,
    pluralName: null,
    description: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('should reject color with prefix junk', () => {
    const result = ObjectTypeSchema.safeParse({
      ...validBase,
      color: 'x#FF0000',
    });
    expect(result.success).toBe(false);
  });

  it('should reject color with suffix junk', () => {
    const result = ObjectTypeSchema.safeParse({
      ...validBase,
      color: '#FF0000x',
    });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// CreateObjectTypeInputSchema Additional Tests
// ============================================================================

describe('CreateObjectTypeInputSchema key regex', () => {
  it('should reject key starting with lowercase', () => {
    const result = CreateObjectTypeInputSchema.safeParse({
      key: 'book',
      name: 'Book',
    });
    expect(result.success).toBe(false);
  });

  it('should reject key with underscore', () => {
    const result = CreateObjectTypeInputSchema.safeParse({
      key: 'My_Book',
      name: 'My Book',
    });
    expect(result.success).toBe(false);
  });

  it('should accept valid PascalCase key', () => {
    const result = CreateObjectTypeInputSchema.safeParse({
      key: 'MyBook123',
      name: 'My Book',
    });
    expect(result.success).toBe(true);
  });

  it('should reject key exceeding max length (64)', () => {
    const result = CreateObjectTypeInputSchema.safeParse({
      key: 'A'.repeat(65),
      name: 'Book',
    });
    expect(result.success).toBe(false);
  });

  it('should accept key at max length (64)', () => {
    const result = CreateObjectTypeInputSchema.safeParse({
      key: 'A'.repeat(64),
      name: 'Book',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty key', () => {
    const result = CreateObjectTypeInputSchema.safeParse({
      key: '',
      name: 'Book',
    });
    expect(result.success).toBe(false);
  });

  it('should reject name exceeding max length (128)', () => {
    const result = CreateObjectTypeInputSchema.safeParse({
      key: 'Book',
      name: 'a'.repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it('should accept name at max length (128)', () => {
    const result = CreateObjectTypeInputSchema.safeParse({
      key: 'Book',
      name: 'a'.repeat(128),
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = CreateObjectTypeInputSchema.safeParse({
      key: 'Book',
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject missing required fields', () => {
    const result = CreateObjectTypeInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// UpdateObjectTypeInputSchema Additional Tests
// ============================================================================

describe('UpdateObjectTypeInputSchema length validation', () => {
  it('should reject name exceeding max length (128)', () => {
    const result = UpdateObjectTypeInputSchema.safeParse({
      name: 'a'.repeat(129),
    });
    expect(result.success).toBe(false);
  });

  it('should accept name at max length (128)', () => {
    const result = UpdateObjectTypeInputSchema.safeParse({
      name: 'a'.repeat(128),
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty name', () => {
    const result = UpdateObjectTypeInputSchema.safeParse({
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject icon exceeding max length (64)', () => {
    const result = UpdateObjectTypeInputSchema.safeParse({
      icon: 'a'.repeat(65),
    });
    expect(result.success).toBe(false);
  });

  it('should accept icon at max length (64)', () => {
    const result = UpdateObjectTypeInputSchema.safeParse({
      icon: 'a'.repeat(64),
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty object (no updates)', () => {
    const result = UpdateObjectTypeInputSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

// ============================================================================
// ListObjectTypesOptionsSchema Tests
// ============================================================================

describe('ListObjectTypesOptionsSchema', () => {
  it('should reject missing required fields by accepting empty object', () => {
    const result = ListObjectTypesOptionsSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept builtInOnly option', () => {
    const result = ListObjectTypesOptionsSchema.safeParse({ builtInOnly: true });
    expect(result.success).toBe(true);
  });

  it('should accept customOnly option', () => {
    const result = ListObjectTypesOptionsSchema.safeParse({ customOnly: true });
    expect(result.success).toBe(true);
  });
});
