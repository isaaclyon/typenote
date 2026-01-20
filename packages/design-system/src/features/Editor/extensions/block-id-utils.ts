/**
 * Block ID Utilities
 *
 * Functions for generating and validating block IDs.
 */

/**
 * Generate a random 6-character alphanumeric block ID.
 * Ensures uniqueness within the provided set of existing IDs.
 *
 * @param existingIds - Set of IDs already in use (to avoid collisions)
 * @returns A unique 6-character ID
 */
export function generateBlockId(existingIds: Set<string> = new Set()): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const idLength = 6;
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let id = '';
    for (let i = 0; i < idLength; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    if (!existingIds.has(id)) {
      return id;
    }
  }

  // Fallback: add timestamp suffix (extremely unlikely to reach here)
  return `${Date.now().toString(36).slice(-6)}`;
}

/**
 * Validate a block ID string.
 * - Must be 1-64 characters
 * - Must start with letter or underscore
 * - Can contain alphanumeric, hyphen, underscore
 *
 * @param id - The ID to validate
 * @returns true if valid
 */
export function isValidBlockId(id: string): boolean {
  if (!id || id.length > 64) return false;
  return /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(id);
}

/**
 * Normalize a block ID to lowercase.
 *
 * @param id - The ID to normalize
 * @returns Lowercase ID
 */
export function normalizeBlockId(id: string): string {
  return id.toLowerCase();
}
