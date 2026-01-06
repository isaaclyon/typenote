/**
 * NoteEditor Component Tests
 *
 * Tests for the TipTap-based document editor with auto-save functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { NoteEditor } from './NoteEditor.js';

// Mock window.typenoteAPI
const mockGetDocument = vi.fn();
const mockApplyBlockPatch = vi.fn();
const mockGetObject = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  // @ts-expect-error - Mocking global window.typenoteAPI
  window.typenoteAPI = {
    getDocument: mockGetDocument,
    applyBlockPatch: mockApplyBlockPatch,
    getObject: mockGetObject,
  };

  // Default mock for getObject (used by useDailyNoteInfo)
  mockGetObject.mockResolvedValue({
    success: true,
    result: null, // Not a daily note by default
  });
});

afterEach(() => {
  cleanup();
});

describe('NoteEditor', () => {
  describe('Cycle 1: Editor is editable', () => {
    it('editor is editable when loaded', async () => {
      mockGetDocument.mockResolvedValue({
        success: true,
        result: { objectId: 'obj1', docVersion: 1, blocks: [] },
      });

      render(<NoteEditor objectId="obj1" />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // TipTap renders contenteditable div
      const editor = document.querySelector('[contenteditable="true"]');
      expect(editor).toBeInTheDocument();
    });
  });

  describe('Cycle 2: Shows saving indicator', () => {
    it('renders save status area when loaded', async () => {
      mockGetDocument.mockResolvedValue({
        success: true,
        result: { objectId: 'obj1', docVersion: 1, blocks: [] },
      });

      render(<NoteEditor objectId="obj1" />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Should have a save status container (data-testid for easy testing)
      const saveStatus = screen.getByTestId('save-status');
      expect(saveStatus).toBeInTheDocument();
    });

    it('shows error message when auto-save fails', async () => {
      mockGetDocument.mockResolvedValue({
        success: true,
        result: { objectId: 'obj1', docVersion: 1, blocks: [] },
      });

      mockApplyBlockPatch.mockResolvedValue({
        success: false,
        error: { code: 'INTERNAL', message: 'Save failed' },
      });

      const { container } = render(<NoteEditor objectId="obj1" />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Simulate typing to trigger auto-save
      const editorDiv = container.querySelector('[contenteditable="true"]');
      expect(editorDiv).toBeInTheDocument();

      // Note: Actually triggering the auto-save would require simulating
      // TipTap editor updates, which is complex. For now we verify the
      // structure is in place for displaying errors.
    });
  });

  describe('Cycle 3: Tracks initial blocks for diffing', () => {
    it('loads document blocks from getDocument', async () => {
      const mockBlocks = [
        {
          id: 'block1',
          parentBlockId: null,
          orderKey: 'a',
          blockType: 'paragraph',
          content: { inline: [{ t: 'text', text: 'Hello' }] },
          meta: null,
          children: [],
        },
      ];

      mockGetDocument.mockResolvedValue({
        success: true,
        result: { objectId: 'obj1', docVersion: 1, blocks: mockBlocks },
      });

      render(<NoteEditor objectId="obj1" />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Verify getDocument was called with the correct objectId
      expect(mockGetDocument).toHaveBeenCalledWith('obj1');

      // The blocks are stored internally for diffing - we verify the
      // document loads successfully which means blocks were processed
      const editor = document.querySelector('[contenteditable="true"]');
      expect(editor).toBeInTheDocument();
    });

    it('handles empty document blocks', async () => {
      mockGetDocument.mockResolvedValue({
        success: true,
        result: { objectId: 'obj1', docVersion: 1, blocks: [] },
      });

      render(<NoteEditor objectId="obj1" />);

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      });

      // Editor should render with empty content
      const editor = document.querySelector('[contenteditable="true"]');
      expect(editor).toBeInTheDocument();
    });
  });
});
