import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor, act } from '@testing-library/react';
import { useCommandPalette } from '../useCommandPalette.js';
import {
  renderHookWithClient,
  createMockTypenoteAPI,
  createMockRecentObject,
  createMockObjectType,
  setupMockAPI,
} from './test-utils.js';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('useCommandPalette', () => {
  let cleanup: () => void;
  let createObjectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockNavigate.mockClear();
    createObjectMock = vi.fn().mockResolvedValue({
      success: true as const,
      result: {
        id: '01CREATED123',
        typeId: '01TYPE123',
        typeKey: 'Page',
        title: 'Untitled',
        properties: {},
        docVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const recentPage = createMockRecentObject({
      id: '01ABC123456789DEFGHIJK0001',
      title: 'Recent Page',
      typeKey: 'Page',
      typeId: '01ABC123456789DEFGHIJK0011',
    });

    const pageType = createMockObjectType({
      id: '01ABC123456789DEFGHIJK0011',
      key: 'Page',
      name: 'Page',
      icon: 'file-text',
      color: '#6B7280',
    });

    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        getRecentObjects: async () => ({
          success: true as const,
          result: [recentPage],
        }),
        createObject: createObjectMock,
        searchBlocks: async (query) => ({
          success: true as const,
          result:
            query === 'meeting'
              ? [
                  {
                    blockId: '01ABC123456789DEFGHIJK0002',
                    objectId: '01ABC123456789DEFGHIJK0003',
                    objectTitle: 'Meeting Notes',
                    typeKey: 'Page',
                    typeIcon: 'file-text',
                    typeColor: '#6B7280',
                  },
                ]
              : [],
        }),
        listObjectTypes: async () => ({
          success: true as const,
          result: [pageType],
        }),
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('provides initial state', () => {
    const { result } = renderHookWithClient(() => useCommandPalette());

    expect(result.current.isOpen).toBe(false);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.recentItems).toEqual([]);
    expect(result.current.searchResultsItems).toEqual([]);
    expect(result.current.actions).toHaveLength(3); // new-page, new-daily, settings
  });

  it('opens and closes command palette', () => {
    const { result } = renderHookWithClient(() => useCommandPalette());

    act(() => {
      result.current.setIsOpen(true);
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.setIsOpen(false);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('loads recent items', async () => {
    const { result } = renderHookWithClient(() => useCommandPalette());

    await waitFor(() => {
      expect(result.current.recentItems).toHaveLength(1);
    });

    expect(result.current.recentItems[0]?.title).toBe('Recent Page');
    expect(result.current.recentItems[0]?.type).toBe('object');
  });

  it('updates search query', () => {
    const { result } = renderHookWithClient(() => useCommandPalette());

    act(() => {
      result.current.handleSearchChange('test query');
    });

    expect(result.current.searchQuery).toBe('test query');
  });

  it('debounces search query', async () => {
    const { result } = renderHookWithClient(() => useCommandPalette());

    // Type quickly
    act(() => {
      result.current.handleSearchChange('m');
    });
    act(() => {
      result.current.handleSearchChange('me');
    });
    act(() => {
      result.current.handleSearchChange('mee');
    });
    act(() => {
      result.current.handleSearchChange('meeting');
    });

    // Search results should not be immediate
    expect(result.current.searchResultsItems).toEqual([]);

    // Wait for debounce (300ms)
    await waitFor(
      () => {
        expect(result.current.searchResultsItems).toHaveLength(1);
      },
      { timeout: 500 }
    );
  });

  it('navigates to object on select', () => {
    const { result } = renderHookWithClient(() => useCommandPalette());

    act(() => {
      result.current.setIsOpen(true);
    });

    act(() => {
      result.current.handleSelect({
        type: 'object',
        id: '01ABC123456789DEFGHIJK0001',
        icon: () => null,
        title: 'Test Object',
        objectType: 'Page',
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/notes/01ABC123456789DEFGHIJK0001');
    expect(result.current.isOpen).toBe(false);
  });

  it('handles action selection', () => {
    const { result } = renderHookWithClient(() => useCommandPalette());

    act(() => {
      result.current.handleSelect({
        type: 'action',
        id: 'settings',
        icon: () => null,
        title: 'Settings',
      });
    });

    // Settings action just logs for now
    expect(result.current.isOpen).toBe(false);
  });

  it('creates a Page on new-page action', async () => {
    const { result } = renderHookWithClient(() => useCommandPalette());

    act(() => {
      result.current.handleSelect({
        type: 'action',
        id: 'new-page',
        icon: () => null,
        title: 'New Page',
      });
    });

    await waitFor(() => {
      expect(createObjectMock).toHaveBeenCalledWith('Page', 'Untitled', {});
    });
  });
});
