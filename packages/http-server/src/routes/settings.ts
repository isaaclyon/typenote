import { Hono } from 'hono';
import { z } from 'zod';
import {
  UserSettingsSchema,
  SettingKeySchema,
  UpdateSettingsInputSchema,
  UpdateSettingInputSchema,
  type SettingKey,
  type UserSettings,
} from '@typenote/api';
import {
  getSettings,
  getSetting,
  updateSettings,
  updateSetting,
  resetSettings,
} from '@typenote/storage';
import type { ServerContext } from '../types.js';

const settings = new Hono<ServerContext>();

const settingValueSchemas = UserSettingsSchema.shape as Record<SettingKey, z.ZodTypeAny>;

function parseSettingKey(rawKey: string): SettingKey {
  const parsed = SettingKeySchema.safeParse(rawKey);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid setting key',
      details: parsed.error.flatten(),
    };
  }
  return parsed.data;
}

function parseSettingValue(key: SettingKey, value: unknown): UserSettings[SettingKey] {
  const schema = settingValueSchemas[key];
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: `Invalid value for setting "${key}"`,
      details: parsed.error.flatten(),
    };
  }
  return parsed.data as UserSettings[SettingKey];
}

/**
 * GET /settings - Fetch all settings (merged with defaults).
 */
settings.get('/', (c) => {
  const settingsResult = getSettings(c.var.db);
  return c.json({ success: true, data: settingsResult });
});

/**
 * GET /settings/:key - Fetch a single setting by key.
 */
settings.get('/:key', (c) => {
  const key = parseSettingKey(c.req.param('key'));
  const value = getSetting(c.var.db, key);
  return c.json({ success: true, data: { key, value } });
});

/**
 * PATCH /settings - Update multiple settings.
 */
settings.patch('/', async (c) => {
  const body: unknown = await c.req.json();
  const parsed = UpdateSettingsInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid settings update input',
      details: parsed.error.flatten(),
    };
  }

  const updates = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined)
  ) as Partial<UserSettings>;
  updateSettings(c.var.db, updates);
  const updated = getSettings(c.var.db);
  return c.json({ success: true, data: updated });
});

/**
 * PATCH /settings/:key - Update a single setting.
 */
settings.patch('/:key', async (c) => {
  const key = parseSettingKey(c.req.param('key'));
  const body: unknown = await c.req.json();
  const parsed = UpdateSettingInputSchema.safeParse(body);
  if (!parsed.success) {
    throw {
      code: 'VALIDATION',
      message: 'Invalid setting update input',
      details: parsed.error.flatten(),
    };
  }

  const value = parseSettingValue(key, parsed.data.value);
  updateSetting(c.var.db, key, value);
  return c.json({ success: true, data: { key, value } });
});

/**
 * POST /settings/reset - Reset all settings to defaults.
 */
settings.post('/reset', (c) => {
  resetSettings(c.var.db);
  const reset = getSettings(c.var.db);
  return c.json({ success: true, data: reset });
});

export { settings };
