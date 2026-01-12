/**
 * Settings Service
 *
 * Manages user preferences stored in the user_settings table.
 * Settings are stored as key-value pairs with JSON-serialized values.
 */

import { eq } from 'drizzle-orm';
import { UserSettingsSchema, SettingKeys, type UserSettings, type SettingKey } from '@typenote/api';
import type { TypenoteDb } from './db.js';
import { userSettings } from './schema.js';

/**
 * Default settings values (from Zod schema defaults).
 */
const DEFAULTS: UserSettings = UserSettingsSchema.parse({});

/**
 * Get all settings, merging stored values with defaults.
 */
export function getSettings(db: TypenoteDb): UserSettings {
  const rows = db.select().from(userSettings).all();

  // Build stored settings from DB rows
  const stored: Record<string, unknown> = {};
  for (const row of rows) {
    if (SettingKeys.includes(row.key as SettingKey)) {
      try {
        stored[row.key] = JSON.parse(row.value);
      } catch {
        // Invalid JSON, skip (use default)
      }
    }
  }

  // Merge with defaults and validate through schema
  return UserSettingsSchema.parse({ ...DEFAULTS, ...stored });
}

/**
 * Get a single setting value, returning default if not set.
 */
export function getSetting<K extends SettingKey>(db: TypenoteDb, key: K): UserSettings[K] {
  const row = db.select().from(userSettings).where(eq(userSettings.key, key)).get();

  if (!row) {
    return DEFAULTS[key];
  }

  try {
    return JSON.parse(row.value) as UserSettings[K];
  } catch {
    return DEFAULTS[key];
  }
}

/**
 * Update multiple settings at once.
 */
export function updateSettings(db: TypenoteDb, updates: Partial<UserSettings>): void {
  const now = new Date();

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;

    db.insert(userSettings)
      .values({
        key,
        value: JSON.stringify(value),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userSettings.key,
        set: {
          value: JSON.stringify(value),
          updatedAt: now,
        },
      })
      .run();
  }
}

/**
 * Update a single setting.
 */
export function updateSetting<K extends SettingKey>(
  db: TypenoteDb,
  key: K,
  value: UserSettings[K]
): void {
  const now = new Date();

  db.insert(userSettings)
    .values({
      key,
      value: JSON.stringify(value),
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: userSettings.key,
      set: {
        value: JSON.stringify(value),
        updatedAt: now,
      },
    })
    .run();
}

/**
 * Reset all settings to defaults by clearing the table.
 */
export function resetSettings(db: TypenoteDb): void {
  db.delete(userSettings).run();
}
