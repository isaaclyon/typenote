/**
 * Image Utilities
 *
 * Validation and encoding helpers for image uploads.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supported image MIME types for upload.
 * SVG and BMP are intentionally excluded for security and compatibility.
 */
export const SUPPORTED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
] as const;

export type SupportedImageType = (typeof SUPPORTED_IMAGE_TYPES)[number];

/**
 * Maximum file size in bytes (10MB).
 */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// ─────────────────────────────────────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────────────────────────────────────

type ValidationSuccess = { valid: true };
type ValidationError = { valid: false; error: string };
type ValidationResult = ValidationSuccess | ValidationError;

/**
 * Validates that a file is a supported image type under the size limit.
 * Size is checked first, then type.
 */
export function validateImageFile(file: File): ValidationResult {
  // Check size first
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Image exceeds 10MB limit' };
  }

  // Check type
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as SupportedImageType)) {
    return { valid: false, error: 'Unsupported image type' };
  }

  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Encoding
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts a File to a base64-encoded string.
 * Returns the raw base64 string (no data: prefix).
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        // Strip the data:type;base64, prefix if present
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        if (!base64) {
          reject(new Error('Failed to encode image as base64'));
          return;
        }
        resolve(base64);
      } else {
        reject(new Error('FileReader returned unexpected result type'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
