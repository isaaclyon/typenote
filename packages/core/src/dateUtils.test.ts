/**
 * Date Utilities Tests
 *
 * Tests for pure date arithmetic functions used in daily note navigation.
 * All functions operate on date keys in YYYY-MM-DD format.
 */

import { describe, it, expect } from 'vitest';
import {
  isValidDateKey,
  getPreviousDate,
  getNextDate,
  getTodayDateKey,
  formatDateForDisplay,
} from './dateUtils.js';

describe('dateUtils', () => {
  describe('isValidDateKey', () => {
    it('returns true for valid YYYY-MM-DD format', () => {
      expect(isValidDateKey('2024-01-15')).toBe(true);
      expect(isValidDateKey('2023-12-31')).toBe(true);
      expect(isValidDateKey('2025-06-01')).toBe(true);
    });

    it('returns false for MM-DD-YYYY format', () => {
      expect(isValidDateKey('01-15-2024')).toBe(false);
    });

    it('returns false for slash-separated format', () => {
      expect(isValidDateKey('2024/01/15')).toBe(false);
    });

    it('returns false for invalid strings', () => {
      expect(isValidDateKey('invalid')).toBe(false);
      expect(isValidDateKey('')).toBe(false);
      expect(isValidDateKey('2024-1-15')).toBe(false); // Missing leading zero
    });
  });

  describe('getPreviousDate', () => {
    it('returns previous day for mid-month date', () => {
      expect(getPreviousDate('2024-01-15')).toBe('2024-01-14');
    });

    it('handles month boundary (first of month)', () => {
      expect(getPreviousDate('2024-02-01')).toBe('2024-01-31');
      expect(getPreviousDate('2024-03-01')).toBe('2024-02-29'); // Leap year
      expect(getPreviousDate('2023-03-01')).toBe('2023-02-28'); // Non-leap year
    });

    it('handles year boundary', () => {
      expect(getPreviousDate('2024-01-01')).toBe('2023-12-31');
    });
  });

  describe('getNextDate', () => {
    it('returns next day for mid-month date', () => {
      expect(getNextDate('2024-01-15')).toBe('2024-01-16');
    });

    it('handles month boundary (last of month)', () => {
      expect(getNextDate('2024-01-31')).toBe('2024-02-01');
      expect(getNextDate('2024-02-29')).toBe('2024-03-01'); // Leap year
      expect(getNextDate('2023-02-28')).toBe('2023-03-01'); // Non-leap year
    });

    it('handles year boundary', () => {
      expect(getNextDate('2023-12-31')).toBe('2024-01-01');
    });
  });

  describe('getTodayDateKey', () => {
    it('returns date in YYYY-MM-DD format', () => {
      const today = getTodayDateKey();
      expect(isValidDateKey(today)).toBe(true);
    });

    it('matches current date', () => {
      const today = getTodayDateKey();
      const expected = new Date().toISOString().slice(0, 10);
      expect(today).toBe(expected);
    });
  });

  describe('formatDateForDisplay', () => {
    it('formats date for human-readable display', () => {
      const result = formatDateForDisplay('2024-01-15');
      // Should contain month, day, and year in some format
      expect(result).toMatch(/Jan.*15.*2024/);
    });

    it('handles different months correctly', () => {
      expect(formatDateForDisplay('2024-06-01')).toMatch(/Jun.*1.*2024/);
      expect(formatDateForDisplay('2024-12-25')).toMatch(/Dec.*25.*2024/);
    });
  });
});
