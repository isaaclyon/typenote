/**
 * AttachmentNode Extension Tests
 *
 * Tests for the AttachmentNode TipTap extension that renders image attachments.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { AttachmentNode } from './AttachmentNode.js';

// Test component that wraps a TipTap editor with AttachmentNode
function TestEditor({ content }: { content: object }) {
  const editor = useEditor({
    extensions: [StarterKit, AttachmentNode],
    content,
    immediatelyRender: false,
  });

  return <EditorContent editor={editor} />;
}

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  cleanup();
});

describe('AttachmentNode', () => {
  describe('rendering', () => {
    it('renders image with correct attachmentId data attribute', async () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'attachment',
            attrs: {
              attachmentId: 'test-attachment-123',
              width: 400,
              height: 300,
              alt: 'Test image',
            },
          },
        ],
      };

      render(<TestEditor content={content} />);

      // Wait for editor to render
      const image = await screen.findByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Test image');
      expect(image).toHaveAttribute('data-attachment-id', 'test-attachment-123');
    });

    it('renders with explicit width and height when provided', async () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'attachment',
            attrs: {
              attachmentId: 'test-attachment-456',
              width: 640,
              height: 480,
              alt: 'Sized image',
            },
          },
        ],
      };

      render(<TestEditor content={content} />);

      const image = await screen.findByRole('img');
      expect(image).toHaveAttribute('width', '640');
      expect(image).toHaveAttribute('height', '480');
    });

    it('renders with max-width when dimensions are null (auto sizing)', async () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'attachment',
            attrs: {
              attachmentId: 'test-attachment-auto',
              width: null,
              height: null,
              alt: 'Auto-sized image',
            },
          },
        ],
      };

      render(<TestEditor content={content} />);

      const image = await screen.findByRole('img');
      // Should not have explicit width/height attributes when null
      expect(image).not.toHaveAttribute('width');
      expect(image).not.toHaveAttribute('height');
    });
  });

  describe('placeholder state', () => {
    it('shows placeholder when attachmentId is null', async () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'attachment',
            attrs: {
              attachmentId: null,
              width: null,
              height: null,
              alt: '',
            },
          },
        ],
      };

      render(<TestEditor content={content} />);

      // Should show placeholder instead of image
      const placeholder = await screen.findByTestId('attachment-placeholder');
      expect(placeholder).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('handles missing attachment gracefully', async () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'attachment',
            attrs: {
              attachmentId: 'nonexistent-attachment',
              width: 200,
              height: 150,
              alt: 'Missing image',
            },
          },
        ],
      };

      // Should not throw when rendering
      expect(() => render(<TestEditor content={content} />)).not.toThrow();

      // Image should still render (even if src will fail to load)
      const image = await screen.findByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('alt', 'Missing image');
    });
  });

  describe('accessibility', () => {
    it('uses alt text for accessibility', async () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'attachment',
            attrs: {
              attachmentId: 'test-attachment-a11y',
              width: 300,
              height: 200,
              alt: 'A descriptive alt text for the image',
            },
          },
        ],
      };

      render(<TestEditor content={content} />);

      const image = await screen.findByAltText('A descriptive alt text for the image');
      expect(image).toBeInTheDocument();
    });

    it('uses empty string alt when not provided', async () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'attachment',
            attrs: {
              attachmentId: 'test-attachment-no-alt',
              width: 300,
              height: 200,
              alt: '',
            },
          },
        ],
      };

      render(<TestEditor content={content} />);

      // Wait for the attachment to render, then find the img element by data attribute
      // (empty alt images are not found by role="img" as they are considered presentational)
      const attachmentImage = await screen.findByTestId('attachment-image');
      expect(attachmentImage).toHaveAttribute('alt', '');
    });
  });
});
