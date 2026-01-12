/**
 * Settings Service tests.
 *
 * Following TDD: Write tests first, then implement.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb, closeDb, type TypenoteDb } from './db.js';
import {
  getSettings,
  getSetting,
  updateSettings,
  updateSetting,
  resetSettings,
} from './settingsService.js';
import type { UserSettings } from '@typenote/api';

describe('SettingsService', () => {
  let db: TypenoteDb;

  beforeEach(() => {
    db = createTestDb();
  });

  afterEach(() => {
    closeDb(db);
  });

  // ============================================================================
  // getSettings
  // ============================================================================

  describe('getSettings', () => {
    it('returns defaults when no settings exist', () => {
      const settings = getSettings(db);

      expect(settings.colorMode).toBe('system');
      expect(settings.weekStartDay).toBe('sunday');
      expect(settings.spellcheck).toBe(true);
      expect(settings.dateFormat).toBe('iso');
      expect(settings.timeFormat).toBe('12h');
    });

    it('returns stored settings merged with defaults', () => {
      // Store one setting
      updateSetting(db, 'colorMode', 'dark');

      const settings = getSettings(db);

      // Stored value
      expect(settings.colorMode).toBe('dark');
      // Defaults for unset
      expect(settings.weekStartDay).toBe('sunday');
      expect(settings.spellcheck).toBe(true);
    });

    it('returns all stored settings when fully set', () => {
      const fullSettings: UserSettings = {
        colorMode: 'light',
        weekStartDay: 'monday',
        spellcheck: false,
        dateFormat: 'eu',
        timeFormat: '24h',
      };
      updateSettings(db, fullSettings);

      const settings = getSettings(db);

      expect(settings).toEqual(fullSettings);
    });
  });

  // ============================================================================
  // getSetting
  // ============================================================================

  describe('getSetting', () => {
    it('returns default for unset colorMode', () => {
      expect(getSetting(db, 'colorMode')).toBe('system');
    });

    it('returns default for unset weekStartDay', () => {
      expect(getSetting(db, 'weekStartDay')).toBe('sunday');
    });

    it('returns default for unset spellcheck', () => {
      expect(getSetting(db, 'spellcheck')).toBe(true);
    });

    it('returns default for unset dateFormat', () => {
      expect(getSetting(db, 'dateFormat')).toBe('iso');
    });

    it('returns default for unset timeFormat', () => {
      expect(getSetting(db, 'timeFormat')).toBe('12h');
    });

    it('returns stored value when set', () => {
      updateSetting(db, 'colorMode', 'dark');
      expect(getSetting(db, 'colorMode')).toBe('dark');
    });
  });

  // ============================================================================
  // updateSettings
  // ============================================================================

  describe('updateSettings', () => {
    it('updates multiple settings at once', () => {
      updateSettings(db, {
        colorMode: 'dark',
        weekStartDay: 'monday',
      });

      expect(getSetting(db, 'colorMode')).toBe('dark');
      expect(getSetting(db, 'weekStartDay')).toBe('monday');
      // Unchanged settings keep defaults
      expect(getSetting(db, 'spellcheck')).toBe(true);
    });

    it('overwrites existing settings', () => {
      updateSettings(db, { colorMode: 'dark' });
      expect(getSetting(db, 'colorMode')).toBe('dark');

      updateSettings(db, { colorMode: 'light' });
      expect(getSetting(db, 'colorMode')).toBe('light');
    });

    it('handles empty update gracefully', () => {
      // Should not throw
      updateSettings(db, {});

      // Defaults still work
      const settings = getSettings(db);
      expect(settings.colorMode).toBe('system');
    });
  });

  // ============================================================================
  // updateSetting
  // ============================================================================

  describe('updateSetting', () => {
    it('updates colorMode', () => {
      updateSetting(db, 'colorMode', 'dark');
      expect(getSetting(db, 'colorMode')).toBe('dark');
    });

    it('updates weekStartDay', () => {
      updateSetting(db, 'weekStartDay', 'monday');
      expect(getSetting(db, 'weekStartDay')).toBe('monday');
    });

    it('updates spellcheck', () => {
      updateSetting(db, 'spellcheck', false);
      expect(getSetting(db, 'spellcheck')).toBe(false);
    });

    it('updates dateFormat', () => {
      updateSetting(db, 'dateFormat', 'us');
      expect(getSetting(db, 'dateFormat')).toBe('us');
    });

    it('updates timeFormat', () => {
      updateSetting(db, 'timeFormat', '24h');
      expect(getSetting(db, 'timeFormat')).toBe('24h');
    });

    it('overwrites existing setting', () => {
      updateSetting(db, 'colorMode', 'dark');
      updateSetting(db, 'colorMode', 'system');
      expect(getSetting(db, 'colorMode')).toBe('system');
    });
  });

  // ============================================================================
  // resetSettings
  // ============================================================================

  describe('resetSettings', () => {
    it('resets all settings to defaults', () => {
      // Set non-default values
      updateSettings(db, {
        colorMode: 'dark',
        weekStartDay: 'monday',
        spellcheck: false,
        dateFormat: 'eu',
        timeFormat: '24h',
      });

      // Reset
      resetSettings(db);

      // All should be back to defaults
      const settings = getSettings(db);
      expect(settings.colorMode).toBe('system');
      expect(settings.weekStartDay).toBe('sunday');
      expect(settings.spellcheck).toBe(true);
      expect(settings.dateFormat).toBe('iso');
      expect(settings.timeFormat).toBe('12h');
    });

    it('is idempotent when called multiple times', () => {
      resetSettings(db);
      resetSettings(db);

      // Should not throw and defaults should work
      expect(getSettings(db).colorMode).toBe('system');
    });
  });
});
