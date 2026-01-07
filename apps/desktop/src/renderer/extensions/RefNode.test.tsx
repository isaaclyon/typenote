/**
 * RefNode Extension Tests
 *
 * Tests for the RefNode TipTap extension, particularly click-to-navigate behavior.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { RefNode } from './RefNode.js';

// Test component that wraps a TipTap editor with RefNode
function TestEditor({
  content,
  onNavigate,
}: {
  content: object;
  onNavigate?: (objectId: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      RefNode.configure({
        onNavigate,
      }),
    ],
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

describe('RefNode', () => {
  describe('click navigation', () => {
    it('calls onNavigate with objectId when clicking a ref node', async () => {
      const onNavigate = vi.fn();
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'See also: ' },
              {
                type: 'ref',
                attrs: {
                  mode: 'link',
                  target: { kind: 'object', objectId: 'test-object-123' },
                  alias: 'My Note',
                },
              },
            ],
          },
        ],
      };

      render(<TestEditor content={content} onNavigate={onNavigate} />);

      // Wait for editor to render
      const refNode = await screen.findByText('My Note');
      fireEvent.click(refNode);

      expect(onNavigate).toHaveBeenCalledWith('test-object-123');
    });

    it('does not call onNavigate when onNavigate is not provided', async () => {
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'ref',
                attrs: {
                  mode: 'link',
                  target: { kind: 'object', objectId: 'test-object-456' },
                  alias: 'Another Note',
                },
              },
            ],
          },
        ],
      };

      // Should not throw when clicking without onNavigate
      render(<TestEditor content={content} />);

      const refNode = await screen.findByText('Another Note');
      expect(() => fireEvent.click(refNode)).not.toThrow();
    });

    it('does not call onNavigate when target is null', async () => {
      const onNavigate = vi.fn();
      const content = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'ref',
                attrs: {
                  mode: 'link',
                  target: null,
                  alias: 'Broken Link',
                },
              },
            ],
          },
        ],
      };

      render(<TestEditor content={content} onNavigate={onNavigate} />);

      const refNode = await screen.findByText('Broken Link');
      fireEvent.click(refNode);

      expect(onNavigate).not.toHaveBeenCalled();
    });
  });
});
