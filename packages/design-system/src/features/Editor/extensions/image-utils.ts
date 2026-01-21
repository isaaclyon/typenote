export const IMAGE_OVERSIZE_BYTES = 10 * 1024 * 1024;
export const IMAGE_OVERSIZE_WARNING = 'Large images over 10MB may take longer to upload.';

const RASTER_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
]);

export function isRasterImageFile(file: File): boolean {
  const type = file.type.toLowerCase();
  return RASTER_IMAGE_TYPES.has(type);
}

export function normalizeImageMeta(meta?: { alt?: string | null; caption?: string | null }): {
  alt: string | null;
  caption: string | null;
} {
  const alt = meta?.alt?.trim() ?? '';
  const caption = meta?.caption?.trim() ?? '';
  return {
    alt: alt.length > 0 ? alt : null,
    caption: caption.length > 0 ? caption : null,
  };
}

export function isValidImageUrl(value: string): boolean {
  if (value.startsWith('data:') || value.startsWith('blob:')) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function getImageUploadWarning(file: File): string | null {
  if (file.size > IMAGE_OVERSIZE_BYTES) {
    return IMAGE_OVERSIZE_WARNING;
  }
  return null;
}

export function createImageUploadId(): string {
  let id = '';
  while (id.length < 8) {
    id += Math.random().toString(36).slice(2);
  }
  return id.slice(0, 10);
}
