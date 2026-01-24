import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useTypesMetadata } from '../useTypesMetadata.js';
import {
  renderHookWithClient,
  createMockTypenoteAPI,
  createMockObjectType,
  setupMockAPI,
} from './test-utils.js';

describe('useTypesMetadata', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const pageType = createMockObjectType({
      id: '01ABC123456789DEFGHIJK0001',
      key: 'Page',
      name: 'Page',
      pluralName: 'Pages',
      icon: 'file-text',
      color: '#6B7280',
      builtIn: true,
    });

    const listObjectTypesMock = vi.fn().mockResolvedValue({
      success: true as const,
      result: [pageType],
    });

    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        listObjectTypes: listObjectTypesMock,
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('requests built-in types only', async () => {
    const { result } = renderHookWithClient(() => useTypesMetadata());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(window.typenoteAPI.listObjectTypes).toHaveBeenCalledWith({ builtInOnly: true });
    expect(result.current.typesMetadata).toHaveLength(1);
  });
});
