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

export interface ResizableImageOptions {
  /**
   * Whether to allow inline images (false = block-level only).
   * @default false
   */
  inline?: boolean;

  /**
   * HTML attributes to add to the image element.
   */
  HTMLAttributes?: Record<string, unknown>;
}

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
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView);
  },
});
