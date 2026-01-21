import { describe, expect, it } from 'vitest';

import {
  IMAGE_OVERSIZE_BYTES,
  IMAGE_OVERSIZE_WARNING,
  createImageUploadId,
  getImageUploadWarning,
  isRasterImageFile,
  isValidImageUrl,
  normalizeImageMeta,
} from './image-utils.js';

describe('image-utils', () => {
  describe('isRasterImageFile', () => {
    it('accepts supported raster image types', () => {
      expect(isRasterImageFile({ type: 'image/png' } as File)).toBe(true);
      expect(isRasterImageFile({ type: 'image/jpeg' } as File)).toBe(true);
      expect(isRasterImageFile({ type: 'image/webp' } as File)).toBe(true);
      expect(isRasterImageFile({ type: 'image/gif' } as File)).toBe(true);
    });

    it('rejects unsupported types', () => {
      expect(isRasterImageFile({ type: 'image/svg+xml' } as File)).toBe(false);
      expect(isRasterImageFile({ type: 'text/plain' } as File)).toBe(false);
    });
  });

  describe('normalizeImageMeta', () => {
    it('trims alt and caption fields', () => {
      expect(normalizeImageMeta({ alt: '  Alt ', caption: ' Caption  ' })).toEqual({
        alt: 'Alt',
        caption: 'Caption',
      });
    });

    it('converts empty values to null', () => {
      expect(normalizeImageMeta({ alt: '   ', caption: '' })).toEqual({
        alt: null,
        caption: null,
      });
    });
  });

  describe('isValidImageUrl', () => {
    it('accepts http URLs and data/blob URLs', () => {
      expect(isValidImageUrl('https://example.com/image.png')).toBe(true);
      expect(isValidImageUrl('data:image/png;base64,abc')).toBe(true);
      expect(isValidImageUrl('blob:local-image')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(isValidImageUrl('not a url')).toBe(false);
    });
  });

  describe('getImageUploadWarning', () => {
    it('returns warning when size exceeds threshold', () => {
      const file = { size: IMAGE_OVERSIZE_BYTES + 1 } as File;
      expect(getImageUploadWarning(file)).toBe(IMAGE_OVERSIZE_WARNING);
    });

    it('returns null when size is within threshold', () => {
      const file = { size: IMAGE_OVERSIZE_BYTES - 1 } as File;
      expect(getImageUploadWarning(file)).toBeNull();
    });
  });

  describe('createImageUploadId', () => {
    it('returns a non-empty id', () => {
      expect(createImageUploadId()).toMatch(/^[a-z0-9]{8,}$/);
    });
  });
});
