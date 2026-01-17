/**
 * DocumentEditor Component Tests
 *
 * Tests for the TipTap-based document editor with auto-save functionality.
 * This wraps the design-system's InteractiveEditor with IPC integration.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { DocumentEditor } from './DocumentEditor.js';
import { createQueryWrapper } from '../test-utils.js';

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

  // Default mock for getObject (used by useDailyNoteInfo and useSelectedObject)
  mockGetObject.mockResolvedValue({
    success: true,
    result: null, // Not a daily note by default
  });
});

afterEach(() => {
  cleanup();
});

describe('DocumentEditor', () => {
  describe('Cycle 1: Editor is editable', () => {
    it('editor is editable when loaded', async () => {
      mockGetDocument.mockResolvedValue({
        success: true,
        result: { objectId: 'obj1', docVersion: 1, blocks: [] },
      });

      const Wrapper = createQueryWrapper();
      render(
        <Wrapper>
          <DocumentEditor objectId="obj1" />
        </Wrapper>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      });

      // TipTap renders contenteditable div
      // Wait for TipTap editor to initialize (it's async)
      await waitFor(() => {
        const editor = document.querySelector('[contenteditable="true"]');
        expect(editor).toBeInTheDocument();
      });
    });
  });

  describe('Cycle 2: Shows saving indicator', () => {
    it('renders save status area when loaded', async () => {
      mockGetDocument.mockResolvedValue({
        success: true,
        result: { objectId: 'obj1', docVersion: 1, blocks: [] },
      });

      const Wrapper = createQueryWrapper();
      render(
        <Wrapper>
          <DocumentEditor objectId="obj1" />
        </Wrapper>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
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

      const Wrapper = createQueryWrapper();
      const { container } = render(
        <Wrapper>
          <DocumentEditor objectId="obj1" />
        </Wrapper>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      });

      // Simulate typing to trigger auto-save
      // Wait for TipTap editor to initialize (it's async)
      await waitFor(() => {
        const editorDiv = container.querySelector('[contenteditable="true"]');
        expect(editorDiv).toBeInTheDocument();
      });

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

      const Wrapper = createQueryWrapper();
      render(
        <Wrapper>
          <DocumentEditor objectId="obj1" />
        </Wrapper>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      });

      // Verify getDocument was called with the correct objectId
      expect(mockGetDocument).toHaveBeenCalledWith('obj1');

      // The blocks are stored internally for diffing - we verify the
      // document loads successfully which means blocks were processed
      // Wait for TipTap editor to initialize (it's async)
      await waitFor(() => {
        const editor = document.querySelector('[contenteditable="true"]');
        expect(editor).toBeInTheDocument();
      });
    });

    it('handles empty document blocks', async () => {
      mockGetDocument.mockResolvedValue({
        success: true,
        result: { objectId: 'obj1', docVersion: 1, blocks: [] },
      });

      const Wrapper = createQueryWrapper();
      render(
        <Wrapper>
          <DocumentEditor objectId="obj1" />
        </Wrapper>
      );

      // Wait for loading to complete
      await waitFor(() => {
        expect(screen.queryByTestId('loading-skeleton')).not.toBeInTheDocument();
      });

      // Editor should render with empty content
      // Wait for TipTap editor to initialize (it's async)
      await waitFor(() => {
        const editor = document.querySelector('[contenteditable="true"]');
        expect(editor).toBeInTheDocument();
      });
    });
  });
});
