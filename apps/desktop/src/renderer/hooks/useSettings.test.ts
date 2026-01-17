/**
 * Tests for useSettings hook
 *
 * TDD: Tests verify hook behavior with IPC mocking.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import type { UserSettings } from '@typenote/api';
import { useSettings } from './useSettings.js';
import { createQueryWrapper } from '../test-utils.js';

describe('useSettings', () => {
  beforeEach(() => {
    // Setup window.typenoteAPI mock
    if (!window.typenoteAPI) {
      window.typenoteAPI = {} as typeof window.typenoteAPI;
    }

    // Reset mocks before each test
    vi.clearAllMocks();
  });

  const mockDefaultSettings: UserSettings = {
    colorMode: 'system',
    weekStartDay: 'sunday',
    spellcheck: true,
    dateFormat: 'iso',
    timeFormat: '12h',
  };

  const mockCustomSettings: UserSettings = {
    colorMode: 'dark',
    weekStartDay: 'monday',
    spellcheck: false,
    dateFormat: 'eu',
    timeFormat: '24h',
  };

  // ============================================================================
  // Initial Load
  // ============================================================================

  it('should load settings on mount', async () => {
    // Mock successful IPC response
    window.typenoteAPI.getSettings = vi.fn().mockResolvedValue({
      success: true,
      result: mockCustomSettings,
    });

    const { result } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    // Initially loading with defaults
    expect(result.current.isLoading).toBe(true);
    expect(result.current.settings).toEqual(mockDefaultSettings);
    expect(result.current.error).toBeNull();

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should have loaded settings
    expect(result.current.settings).toEqual(mockCustomSettings);
    expect(result.current.error).toBeNull();
    expect(window.typenoteAPI.getSettings).toHaveBeenCalledTimes(1);
  });

  it('should return defaults when backend returns defaults', async () => {
    // Mock backend returning defaults (no settings set yet)
    window.typenoteAPI.getSettings = vi.fn().mockResolvedValue({
      success: true,
      result: mockDefaultSettings,
    });

    const { result } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.settings).toEqual(mockDefaultSettings);
    expect(result.current.error).toBeNull();
  });

  it('should handle IPC error response on load', async () => {
    // Mock IPC error
    window.typenoteAPI.getSettings = vi.fn().mockResolvedValue({
      success: false,
      error: { code: 'INTERNAL', message: 'Database error' },
    });

    const { result } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should keep defaults and show error
    expect(result.current.settings).toEqual(mockDefaultSettings);
    expect(result.current.error).toBe('Database error');
  });

  it('should handle IPC exception on load', async () => {
    // Mock IPC throwing exception
    window.typenoteAPI.getSettings = vi.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.settings).toEqual(mockDefaultSettings);
    expect(result.current.error).toBe('Network error');
  });

  // ============================================================================
  // updateSettings
  // ============================================================================

  it('should update settings with optimistic update', async () => {
    // Mock initial load
    window.typenoteAPI.getSettings = vi.fn().mockResolvedValue({
      success: true,
      result: mockDefaultSettings,
    });

    // Mock successful update
    window.typenoteAPI.updateSettings = vi.fn().mockResolvedValue({
      success: true,
      result: undefined,
    });

    const { result } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Update colorMode
    await act(async () => {
      await result.current.updateSettings({ colorMode: 'dark' });
    });

    // Wait for optimistic update to be reflected
    await waitFor(() => {
      expect(result.current.settings.colorMode).toBe('dark');
    });
    expect(window.typenoteAPI.updateSettings).toHaveBeenCalledWith({ colorMode: 'dark' });
  });

  it('should update multiple settings at once', async () => {
    window.typenoteAPI.getSettings = vi.fn().mockResolvedValue({
      success: true,
      result: mockDefaultSettings,
    });

    window.typenoteAPI.updateSettings = vi.fn().mockResolvedValue({
      success: true,
      result: undefined,
    });

    const { result } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Update multiple settings
    await act(async () => {
      await result.current.updateSettings({
        colorMode: 'dark',
        weekStartDay: 'monday',
        spellcheck: false,
      });
    });

    // Wait for optimistic update
    await waitFor(() => {
      expect(result.current.settings.colorMode).toBe('dark');
    });
    expect(result.current.settings.weekStartDay).toBe('monday');
    expect(result.current.settings.spellcheck).toBe(false);
    // Unchanged settings should remain
    expect(result.current.settings.dateFormat).toBe('iso');
  });

  it('should revert on IPC error during update', async () => {
    window.typenoteAPI.getSettings = vi.fn().mockResolvedValue({
      success: true,
      result: mockDefaultSettings,
    });

    // Mock update failure
    window.typenoteAPI.updateSettings = vi.fn().mockResolvedValue({
      success: false,
      error: { code: 'VALIDATION', message: 'Invalid color mode' },
    });

    const { result } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const originalSettings = result.current.settings;

    // Attempt update
    await act(async () => {
      await result.current.updateSettings({ colorMode: 'invalid' as 'dark' });
    });

    // Wait for error state to propagate
    await waitFor(() => {
      expect(result.current.error).toBe('Invalid color mode');
    });
    // Should have reverted to original
    expect(result.current.settings).toEqual(originalSettings);
  });

  it('should revert on IPC exception during update', async () => {
    window.typenoteAPI.getSettings = vi.fn().mockResolvedValue({
      success: true,
      result: mockDefaultSettings,
    });

    // Mock update throwing exception
    window.typenoteAPI.updateSettings = vi.fn().mockRejectedValue(new Error('Network timeout'));

    const { result } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const originalSettings = result.current.settings;

    // Attempt update
    await act(async () => {
      await result.current.updateSettings({ colorMode: 'dark' });
    });

    // Wait for error state to propagate
    await waitFor(() => {
      expect(result.current.error).toBe('Network timeout');
    });
    // Should have reverted
    expect(result.current.settings).toEqual(originalSettings);
  });

  // ============================================================================
  // resetSettings
  // ============================================================================

  it('should reset settings to defaults', async () => {
    // Mock initial load with custom settings
    window.typenoteAPI.getSettings = vi.fn().mockResolvedValue({
      success: true,
      result: mockCustomSettings,
    });

    // Mock successful reset
    window.typenoteAPI.resetSettings = vi.fn().mockResolvedValue({
      success: true,
      result: undefined,
    });

    const { result } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify loaded custom settings
    expect(result.current.settings).toEqual(mockCustomSettings);

    // Reset
    await act(async () => {
      await result.current.resetSettings();
    });

    // Wait for optimistic update to reset
    await waitFor(() => {
      expect(result.current.settings).toEqual(mockDefaultSettings);
    });
    expect(window.typenoteAPI.resetSettings).toHaveBeenCalledTimes(1);
  });

  it('should revert on IPC error during reset', async () => {
    window.typenoteAPI.getSettings = vi.fn().mockResolvedValue({
      success: true,
      result: mockCustomSettings,
    });

    // Mock reset failure
    window.typenoteAPI.resetSettings = vi.fn().mockResolvedValue({
      success: false,
      error: { code: 'INTERNAL', message: 'Database locked' },
    });

    const { result } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const originalSettings = result.current.settings;

    // Attempt reset
    await act(async () => {
      await result.current.resetSettings();
    });

    // Wait for error state to propagate
    await waitFor(() => {
      expect(result.current.error).toBe('Database locked');
    });
    // Should have reverted to original custom settings
    expect(result.current.settings).toEqual(originalSettings);
  });

  it('should revert on IPC exception during reset', async () => {
    window.typenoteAPI.getSettings = vi.fn().mockResolvedValue({
      success: true,
      result: mockCustomSettings,
    });

    // Mock reset throwing exception
    window.typenoteAPI.resetSettings = vi.fn().mockRejectedValue(new Error('Connection lost'));

    const { result } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const originalSettings = result.current.settings;

    // Attempt reset
    await act(async () => {
      await result.current.resetSettings();
    });

    // Wait for error state to propagate
    await waitFor(() => {
      expect(result.current.error).toBe('Connection lost');
    });
    // Should have reverted
    expect(result.current.settings).toEqual(originalSettings);
  });

  // ============================================================================
  // Cleanup
  // ============================================================================

  it('should not update state after unmount', async () => {
    window.typenoteAPI.getSettings = vi.fn().mockResolvedValue({
      success: true,
      result: mockDefaultSettings,
    });

    const { unmount } = renderHook(() => useSettings(), { wrapper: createQueryWrapper() });

    // Unmount immediately (before fetch completes)
    unmount();

    // Wait a bit to let any async operations complete
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Should not throw warning about state update after unmount
    // (This is verified by Vitest not throwing errors)
  });
});
