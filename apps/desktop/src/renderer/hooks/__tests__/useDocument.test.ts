import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useDocument } from '../useDocument.js';
import { renderHookWithClient, createMockTypenoteAPI, setupMockAPI } from './test-utils.js';

describe('useDocument', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const listObjectTypesMock = vi.fn().mockResolvedValue({
      success: true as const,
      result: [],
    });
    const listObjectsMock = vi.fn().mockResolvedValue({
      success: true as const,
      result: [],
    });
    const getDocumentMock = vi.fn().mockResolvedValue({
      success: true as const,
      result: {
        objectId: 'obj1',
        docVersion: 1,
        blocks: [],
      },
    });

    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        listObjectTypes: listObjectTypesMock,
        listObjects: listObjectsMock,
        getDocument: getDocumentMock,
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('requests built-in types for ref resolution', async () => {
    const { result } = renderHookWithClient(() => useDocument('obj1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(window.typenoteAPI.listObjectTypes).toHaveBeenCalledWith({ builtInOnly: true });
  });
});
