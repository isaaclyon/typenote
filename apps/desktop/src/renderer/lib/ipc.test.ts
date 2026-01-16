/**
 * ipcCall Wrapper Tests
 *
 * Tests for the IPC error wrapper that shows toast notifications on failures.
 * Following strict TDD: RED -> GREEN -> REFACTOR for each cycle.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toast } from '@typenote/design-system';
import { ipcCall } from './ipc.js';

// Mock design-system's toast function
vi.mock('@typenote/design-system', () => ({
  toast: {
    error: vi.fn(),
  },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// TDD Cycle 1: Returns result on success without toasting
// ─────────────────────────────────────────────────────────────────────────────

describe('ipcCall', () => {
  describe('Cycle 1: successful calls', () => {
    it('returns result when operation succeeds', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'success' });

      const result = await ipcCall('Test operation', mockFn);

      expect(result).toEqual({ data: 'success' });
    });

    it('does not show toast on success', async () => {
      const mockFn = vi.fn().mockResolvedValue({ data: 'success' });

      await ipcCall('Test operation', mockFn);

      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TDD Cycle 2: Shows toast on error
  // ───────────────────────────────────────────────────────────────────────────

  describe('Cycle 2: error handling', () => {
    it('shows toast when operation throws Error', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('Network failure'));

      await expect(ipcCall('Save document', mockFn)).rejects.toThrow();

      expect(toast.error).toHaveBeenCalledWith('Save document failed', {
        description: 'Network failure',
      });
    });

    it('shows toast with "Unknown error" for non-Error throws', async () => {
      const mockFn = vi.fn().mockRejectedValue('string error');

      await expect(ipcCall('Load data', mockFn)).rejects.toThrow();

      expect(toast.error).toHaveBeenCalledWith('Load data failed', {
        description: 'Unknown error',
      });
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  // TDD Cycle 3: Re-throws error after toasting
  // ───────────────────────────────────────────────────────────────────────────

  describe('Cycle 3: re-throws error', () => {
    it('re-throws the original Error after toasting', async () => {
      const originalError = new Error('Database error');
      const mockFn = vi.fn().mockRejectedValue(originalError);

      await expect(ipcCall('Update record', mockFn)).rejects.toThrow(originalError);
    });

    it('wraps non-Error values in Error before throwing', async () => {
      const mockFn = vi.fn().mockRejectedValue('plain string');

      await expect(ipcCall('Sync', mockFn)).rejects.toThrow('plain string');
    });
  });
});
