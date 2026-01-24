/**
 * Settings API contract tests.
 *
 * Following TDD: Write tests first, then implement schemas.
 */

import { describe, it, expect } from 'vitest';
import {
  ColorModeSchema,
  WeekStartDaySchema,
  DateFormatSchema,
  TimeFormatSchema,
  SettingKeySchema,
  SettingValueSchema,
  UpdateSettingsInputSchema,
  SettingKeyValueSchema,
  UpdateSettingInputSchema,
  UserSettingsSchema,
  type UserSettings,
} from './settings.js';

// ============================================================================
// ColorModeSchema
// ============================================================================

describe('ColorModeSchema', () => {
  it('validates light mode', () => {
    const result = ColorModeSchema.safeParse('light');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('light');
    }
  });

  it('validates dark mode', () => {
    const result = ColorModeSchema.safeParse('dark');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('dark');
    }
  });

  it('validates system mode', () => {
    const result = ColorModeSchema.safeParse('system');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('system');
    }
  });

  it('rejects invalid mode', () => {
    const result = ColorModeSchema.safeParse('auto');
    expect(result.success).toBe(false);
  });

  it('rejects uppercase', () => {
    const result = ColorModeSchema.safeParse('Light');
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// WeekStartDaySchema
// ============================================================================

describe('WeekStartDaySchema', () => {
  it('validates sunday', () => {
    const result = WeekStartDaySchema.safeParse('sunday');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('sunday');
    }
  });

  it('validates monday', () => {
    const result = WeekStartDaySchema.safeParse('monday');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('monday');
    }
  });

  it('rejects other days', () => {
    const result = WeekStartDaySchema.safeParse('tuesday');
    expect(result.success).toBe(false);
  });

  it('rejects uppercase', () => {
    const result = WeekStartDaySchema.safeParse('Sunday');
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// DateFormatSchema
// ============================================================================

describe('DateFormatSchema', () => {
  it('validates iso format', () => {
    const result = DateFormatSchema.safeParse('iso');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('iso');
    }
  });

  it('validates us format', () => {
    const result = DateFormatSchema.safeParse('us');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('us');
    }
  });

  it('validates eu format', () => {
    const result = DateFormatSchema.safeParse('eu');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('eu');
    }
  });

  it('rejects invalid format', () => {
    const result = DateFormatSchema.safeParse('custom');
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// TimeFormatSchema
// ============================================================================

describe('TimeFormatSchema', () => {
  it('validates 12h format', () => {
    const result = TimeFormatSchema.safeParse('12h');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('12h');
    }
  });

  it('validates 24h format', () => {
    const result = TimeFormatSchema.safeParse('24h');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('24h');
    }
  });

  it('rejects invalid format', () => {
    const result = TimeFormatSchema.safeParse('am/pm');
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// UserSettingsSchema
// ============================================================================

describe('UserSettingsSchema', () => {
  it('validates complete settings', () => {
    const settings: UserSettings = {
      colorMode: 'dark',
      weekStartDay: 'monday',
      spellcheck: false,
      dateFormat: 'eu',
      timeFormat: '24h',
    };
    const result = UserSettingsSchema.safeParse(settings);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.colorMode).toBe('dark');
      expect(result.data.weekStartDay).toBe('monday');
      expect(result.data.spellcheck).toBe(false);
      expect(result.data.dateFormat).toBe('eu');
      expect(result.data.timeFormat).toBe('24h');
    }
  });

  it('applies defaults for empty object', () => {
    const result = UserSettingsSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.colorMode).toBe('system');
      expect(result.data.weekStartDay).toBe('sunday');
      expect(result.data.spellcheck).toBe(true);
      expect(result.data.dateFormat).toBe('iso');
      expect(result.data.timeFormat).toBe('12h');
    }
  });

  it('applies defaults for partial settings', () => {
    const settings = {
      colorMode: 'dark',
    };
    const result = UserSettingsSchema.safeParse(settings);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.colorMode).toBe('dark');
      expect(result.data.weekStartDay).toBe('sunday'); // default
      expect(result.data.spellcheck).toBe(true); // default
    }
  });

  it('rejects invalid colorMode', () => {
    const settings = {
      colorMode: 'invalid',
    };
    const result = UserSettingsSchema.safeParse(settings);
    expect(result.success).toBe(false);
  });

  it('rejects invalid weekStartDay', () => {
    const settings = {
      weekStartDay: 'friday',
    };
    const result = UserSettingsSchema.safeParse(settings);
    expect(result.success).toBe(false);
  });

  it('rejects non-boolean spellcheck', () => {
    const settings = {
      spellcheck: 'yes',
    };
    const result = UserSettingsSchema.safeParse(settings);
    expect(result.success).toBe(false);
  });

  it('rejects invalid dateFormat', () => {
    const settings = {
      dateFormat: 'yyyy-mm-dd',
    };
    const result = UserSettingsSchema.safeParse(settings);
    expect(result.success).toBe(false);
  });

  it('rejects invalid timeFormat', () => {
    const settings = {
      timeFormat: 'military',
    };
    const result = UserSettingsSchema.safeParse(settings);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// SettingKeySchema
// ============================================================================

describe('SettingKeySchema', () => {
  it('includes expected keys', () => {
    expect(SettingKeySchema.options).toContain('colorMode');
    expect(SettingKeySchema.options).toContain('weekStartDay');
    expect(SettingKeySchema.options).toContain('spellcheck');
    expect(SettingKeySchema.options).toContain('dateFormat');
    expect(SettingKeySchema.options).toContain('timeFormat');
  });

  it('rejects unknown keys', () => {
    const result = SettingKeySchema.safeParse('unknown');
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// SettingValueSchema
// ============================================================================

describe('SettingValueSchema', () => {
  it('accepts valid setting values', () => {
    expect(SettingValueSchema.safeParse('dark').success).toBe(true);
    expect(SettingValueSchema.safeParse('monday').success).toBe(true);
    expect(SettingValueSchema.safeParse(true).success).toBe(true);
    expect(SettingValueSchema.safeParse('iso').success).toBe(true);
    expect(SettingValueSchema.safeParse('24h').success).toBe(true);
  });

  it('rejects invalid setting values', () => {
    expect(SettingValueSchema.safeParse('invalid').success).toBe(false);
    expect(SettingValueSchema.safeParse(123).success).toBe(false);
  });
});

// ============================================================================
// UpdateSettingsInputSchema
// ============================================================================

describe('UpdateSettingsInputSchema', () => {
  it('accepts partial settings', () => {
    const result = UpdateSettingsInputSchema.safeParse({ colorMode: 'dark' });
    expect(result.success).toBe(true);
  });

  it('rejects empty input', () => {
    const result = UpdateSettingsInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects unknown keys', () => {
    const result = UpdateSettingsInputSchema.safeParse({ unknown: 'value' });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// SettingKeyValueSchema
// ============================================================================

describe('SettingKeyValueSchema', () => {
  it('accepts valid key/value pairs', () => {
    const result = SettingKeyValueSchema.safeParse({ key: 'colorMode', value: 'dark' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid values', () => {
    const result = SettingKeyValueSchema.safeParse({ key: 'colorMode', value: 'invalid' });
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// UpdateSettingInputSchema
// ============================================================================

describe('UpdateSettingInputSchema', () => {
  it('accepts valid value payload', () => {
    const result = UpdateSettingInputSchema.safeParse({ value: 'dark' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid value payload', () => {
    const result = UpdateSettingInputSchema.safeParse({ value: 'invalid' });
    expect(result.success).toBe(false);
  });
});
