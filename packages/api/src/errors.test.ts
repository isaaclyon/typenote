import { describe, expect, it } from 'vitest';
import {
  ApiErrorCodeSchema,
  ApiErrorSchema,
  notFoundObject,
  notFoundBlock,
  validationError,
  versionConflict,
  orderingConflict,
  cycleError,
  crossObjectError,
  parentDeletedError,
  idempotencyConflict,
  internalError,
  notFoundTag,
  tagSlugConflict,
  tagInUse,
  type ApiError,
  type ApiErrorCode,
} from './errors.js';

describe('ApiErrorCodeSchema', () => {
  const validCodes: ApiErrorCode[] = [
    'NOT_FOUND_OBJECT',
    'NOT_FOUND_BLOCK',
    'NOT_FOUND_TAG',
    'VALIDATION',
    'CONFLICT_VERSION',
    'CONFLICT_ORDERING',
    'CONFLICT_TAG_SLUG',
    'INVARIANT_CYCLE',
    'INVARIANT_CROSS_OBJECT',
    'INVARIANT_PARENT_DELETED',
    'INVARIANT_TAG_IN_USE',
    'IDEMPOTENCY_CONFLICT',
    'INTERNAL',
  ];

  it.each(validCodes)('accepts valid code: %s', (code) => {
    const result = ApiErrorCodeSchema.safeParse(code);
    expect(result.success).toBe(true);
  });

  it('rejects invalid code', () => {
    const result = ApiErrorCodeSchema.safeParse('INVALID_CODE');
    expect(result.success).toBe(false);
  });
});

describe('ApiErrorSchema', () => {
  it('validates a complete error object', () => {
    const error: ApiError = {
      apiVersion: 'v1',
      code: 'NOT_FOUND_OBJECT',
      message: 'Object not found',
      details: { objectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV' },
    };

    const result = ApiErrorSchema.safeParse(error);
    expect(result.success).toBe(true);
  });

  it('validates error without details', () => {
    const error = {
      apiVersion: 'v1',
      code: 'INTERNAL',
      message: 'Something went wrong',
    };

    const result = ApiErrorSchema.safeParse(error);
    expect(result.success).toBe(true);
  });

  it('rejects wrong apiVersion', () => {
    const error = {
      apiVersion: 'v2',
      code: 'INTERNAL',
      message: 'Something went wrong',
    };

    const result = ApiErrorSchema.safeParse(error);
    expect(result.success).toBe(false);
  });
});

describe('Error factory functions', () => {
  describe('notFoundObject', () => {
    it('creates NOT_FOUND_OBJECT error', () => {
      const error = notFoundObject('01ARZ3NDEKTSV4RRFFQ69G5FAV');

      expect(error.apiVersion).toBe('v1');
      expect(error.code).toBe('NOT_FOUND_OBJECT');
      expect(error.message).toContain('01ARZ3NDEKTSV4RRFFQ69G5FAV');
      expect(error.details).toEqual({ objectId: '01ARZ3NDEKTSV4RRFFQ69G5FAV' });
    });
  });

  describe('notFoundBlock', () => {
    it('creates NOT_FOUND_BLOCK error', () => {
      const error = notFoundBlock('01ARZ3NDEKTSV4RRFFQ69G5FAV');

      expect(error.code).toBe('NOT_FOUND_BLOCK');
      expect(error.details).toEqual({ blockId: '01ARZ3NDEKTSV4RRFFQ69G5FAV' });
    });
  });

  describe('validationError', () => {
    it('creates VALIDATION error', () => {
      const error = validationError('content', 'Invalid heading level');

      expect(error.code).toBe('VALIDATION');
      expect(error.message).toContain('Invalid heading level');
      expect(error.details).toEqual({ field: 'content', reason: 'Invalid heading level' });
    });
  });

  describe('versionConflict', () => {
    it('creates CONFLICT_VERSION error', () => {
      const error = versionConflict(5, 7);

      expect(error.code).toBe('CONFLICT_VERSION');
      expect(error.message).toContain('5');
      expect(error.message).toContain('7');
      expect(error.details).toEqual({ expected: 5, actual: 7 });
    });
  });

  describe('cycleError', () => {
    it('creates INVARIANT_CYCLE error', () => {
      const error = cycleError('block1', 'block2');

      expect(error.code).toBe('INVARIANT_CYCLE');
      expect(error.details).toEqual({ blockId: 'block1', wouldBeUnder: 'block2' });
    });
  });

  describe('crossObjectError', () => {
    it('creates INVARIANT_CROSS_OBJECT error', () => {
      const error = crossObjectError('obj1', 'obj2');

      expect(error.code).toBe('INVARIANT_CROSS_OBJECT');
      expect(error.details).toEqual({ blockObjectId: 'obj1', parentObjectId: 'obj2' });
    });
  });

  describe('parentDeletedError', () => {
    it('creates INVARIANT_PARENT_DELETED error', () => {
      const error = parentDeletedError('parent123');

      expect(error.code).toBe('INVARIANT_PARENT_DELETED');
      expect(error.details).toEqual({ parentBlockId: 'parent123' });
    });
  });

  describe('idempotencyConflict', () => {
    it('creates IDEMPOTENCY_CONFLICT error', () => {
      const error = idempotencyConflict('key123');

      expect(error.code).toBe('IDEMPOTENCY_CONFLICT');
      expect(error.details).toEqual({ idempotencyKey: 'key123' });
    });
  });

  describe('internalError', () => {
    it('creates INTERNAL error', () => {
      const error = internalError('req-123');

      expect(error.code).toBe('INTERNAL');
      expect(error.details).toEqual({ requestId: 'req-123' });
    });
  });

  describe('orderingConflict', () => {
    it('creates CONFLICT_ORDERING error', () => {
      const error = orderingConflict('aaa', 'parent123');

      expect(error.code).toBe('CONFLICT_ORDERING');
      expect(error.details).toEqual({ orderKey: 'aaa', parentBlockId: 'parent123' });
    });

    it('creates CONFLICT_ORDERING error with null parent', () => {
      const error = orderingConflict('bbb', null);

      expect(error.code).toBe('CONFLICT_ORDERING');
      expect(error.details).toEqual({ orderKey: 'bbb', parentBlockId: null });
    });
  });

  describe('notFoundTag', () => {
    it('creates NOT_FOUND_TAG error', () => {
      const error = notFoundTag('01ARZ3NDEKTSV4RRFFQ69G5FAV');

      expect(error.apiVersion).toBe('v1');
      expect(error.code).toBe('NOT_FOUND_TAG');
      expect(error.message).toContain('01ARZ3NDEKTSV4RRFFQ69G5FAV');
      expect(error.details).toEqual({ tagId: '01ARZ3NDEKTSV4RRFFQ69G5FAV' });
    });
  });

  describe('tagSlugConflict', () => {
    it('creates CONFLICT_TAG_SLUG error', () => {
      const error = tagSlugConflict('typescript', '01ARZ3NDEKTSV4RRFFQ69G5FAV');

      expect(error.apiVersion).toBe('v1');
      expect(error.code).toBe('CONFLICT_TAG_SLUG');
      expect(error.message).toContain('typescript');
      expect(error.details).toEqual({
        slug: 'typescript',
        existingTagId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
      });
    });
  });

  describe('tagInUse', () => {
    it('creates INVARIANT_TAG_IN_USE error', () => {
      const error = tagInUse('01ARZ3NDEKTSV4RRFFQ69G5FAV', 5);

      expect(error.apiVersion).toBe('v1');
      expect(error.code).toBe('INVARIANT_TAG_IN_USE');
      expect(error.message).toContain('5');
      expect(error.details).toEqual({
        tagId: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
        usageCount: 5,
      });
    });
  });
});
