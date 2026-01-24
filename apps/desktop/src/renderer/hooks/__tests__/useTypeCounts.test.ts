import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useTypeCounts } from '../useTypeCounts.js';
import {
  renderHookWithClient,
  createMockTypenoteAPI,
  createMockObjectType,
  createMockObjectSummary,
  setupMockAPI,
} from './test-utils.js';

describe('useTypeCounts', () => {
  let cleanup: () => void;

  beforeEach(() => {
    const pageType = createMockObjectType({
      id: '01ABC123456789DEFGHIJK0001',
      key: 'Page',
      name: 'Page',
      pluralName: 'Pages',
      icon: 'file-text',
      color: '#6495ED',
      builtIn: true,
    });
    const personType = createMockObjectType({
      id: '01ABC123456789DEFGHIJK0002',
      key: 'Person',
      name: 'Person',
      pluralName: 'People',
      icon: 'user',
      color: '#32CD32',
      builtIn: false,
    });
    const testPageSummary = createMockObjectSummary({
      id: '01ABC123456789DEFGHIJK0003',
      title: 'Test Page',
      typeKey: 'Page',
      typeId: '01ABC123456789DEFGHIJK0001',
    });

    cleanup = setupMockAPI(
      createMockTypenoteAPI({
        listObjectTypes: async (options) => ({
          success: true as const,
          result: options?.builtInOnly ? [pageType] : [pageType, personType],
        }),
        listObjects: async (options) => ({
          success: true as const,
          result: options?.typeKey === 'Page' ? [testPageSummary] : [],
        }),
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  it('returns type counts from IPC', async () => {
    const { result } = renderHookWithClient(() => useTypeCounts());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual([
      {
        typeKey: 'Page',
        typeName: 'Pages',
        typeIcon: 'file-text',
        typeColor: '#6495ED',
        count: 1,
      },
    ]);
  });

  it('starts in loading state', () => {
    const { result } = renderHookWithClient(() => useTypeCounts());
    expect(result.current.isLoading).toBe(true);
  });
});
