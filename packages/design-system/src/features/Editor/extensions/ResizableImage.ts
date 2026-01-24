/**
 * ResizableImage extension - Custom image extension with resize support.
 *
 * Extends the base TipTap image extension to add:
 * - width attribute for storing resize state
 * - Custom NodeView with resize handles
 * - Preserves markdown input rules (![alt](src))
 */

import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageNodeView } from './ImageNodeView.js';
import type { ResizableImageOptions } from './ResizableImage.types.js';

export type {
  ImageUploadStatus,
  ImageNodeAttributes,
  ResizableImageOptions,
} from './ResizableImage.types.js';

export const ResizableImage = Image.extend<ResizableImageOptions>({
  name: 'image',

  addOptions() {
    return {
      ...this.parent?.(),
      inline: false,
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      // Add width attribute for resize persistence
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const width = element.getAttribute('width');
          return width ? parseInt(width, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes['width']) {
            return {};
          }
          return {
            width: attributes['width'],
          };
        },
      },
      // Height is computed from aspect ratio, but can be stored
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const height = element.getAttribute('height');
          return height ? parseInt(height, 10) : null;
        },
        renderHTML: (attributes) => {
          if (!attributes['height']) {
            return {};
          }
          return {
            height: attributes['height'],
          };
        },
      },
      caption: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-caption'),
        renderHTML: (attributes) => {
          if (!attributes['caption']) return {};
          return {
            'data-caption': attributes['caption'],
          };
        },
      },
      uploadId: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-upload-id'),
        renderHTML: (attributes) => {
          if (!attributes['uploadId']) return {};
          return {
            'data-upload-id': attributes['uploadId'],
          };
        },
      },
      uploadStatus: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-upload-status'),
        renderHTML: (attributes) => {
          if (!attributes['uploadStatus']) return {};
          return {
            'data-upload-status': attributes['uploadStatus'],
          };
        },
      },
      uploadProgress: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const progress = element.getAttribute('data-upload-progress');
          return progress ? Number(progress) : null;
        },
        renderHTML: (attributes) => {
          if (attributes['uploadProgress'] === null || attributes['uploadProgress'] === undefined) {
            return {};
          }
          return {
            'data-upload-progress': attributes['uploadProgress'],
          };
        },
      },
      errorMessage: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-error-message'),
        renderHTML: (attributes) => {
          if (!attributes['errorMessage']) return {};
          return {
            'data-error-message': attributes['errorMessage'],
          };
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
