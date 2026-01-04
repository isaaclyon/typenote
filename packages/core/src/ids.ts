import { ulid, decodeTime } from 'ulid';

/**
 * ULID character set: Crockford's Base32 (excludes I, L, O, U)
 */
const ULID_REGEX = /^[0-9A-HJKMNP-TV-Z]{26}$/;

/**
 * Generate a new ULID.
 */
export function generateId(): string {
  return ulid();
}

/**
 * Check if a string is a valid ULID.
 */
export function isValidUlid(id: string): boolean {
  return ULID_REGEX.test(id);
}

/**
 * Parse a ULID and extract its components.
 * @throws Error if ULID is invalid
 */
export function parseUlid(id: string): { timestamp: Date } {
  if (!isValidUlid(id)) {
    throw new Error(`Invalid ULID: ${id}`);
  }

  const timestamp = decodeTime(id);
  return { timestamp: new Date(timestamp) };
}
