/**
 * Generic Service Error Factory.
 *
 * Creates typed error classes for storage services with consistent
 * code, message, and details properties.
 */

/**
 * Interface for service errors with typed error codes.
 */
export interface ServiceError<TCode extends string> extends Error {
  readonly code: TCode;
  readonly details?: Record<string, unknown> | undefined;
}

/**
 * Constructor type for service error classes.
 */
export interface ServiceErrorConstructor<TCode extends string> {
  new (code: TCode, message: string, details?: Record<string, unknown>): ServiceError<TCode>;
}

/**
 * Create a typed service error class.
 *
 * @param name - The error class name (e.g., 'TagServiceError')
 * @returns A constructor for the typed error class
 *
 * @example
 * ```typescript
 * type TagErrorCode = 'TAG_NOT_FOUND' | 'TAG_SLUG_EXISTS';
 * const TagServiceError = createServiceError<TagErrorCode>('TagServiceError');
 *
 * throw new TagServiceError('TAG_NOT_FOUND', 'Tag not found', { tagId: '123' });
 * ```
 */
export function createServiceError<TCode extends string>(
  name: string
): ServiceErrorConstructor<TCode> {
  return class extends Error implements ServiceError<TCode> {
    readonly code: TCode;
    readonly details?: Record<string, unknown> | undefined;

    constructor(code: TCode, message: string, details?: Record<string, unknown>) {
      super(message);
      this.name = name;
      this.code = code;
      if (details !== undefined) {
        this.details = details;
      }
    }
  } as ServiceErrorConstructor<TCode>;
}
