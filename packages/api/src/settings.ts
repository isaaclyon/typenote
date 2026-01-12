/**
 * User Settings Schema
 *
 * Defines the shape of user preferences that persist across sessions.
 */

import { z } from 'zod';

// ============================================================================
// Individual Setting Schemas
// ============================================================================

/**
 * Color mode preference for the application theme.
 */
export const ColorModeSchema = z.enum(['light', 'dark', 'system']);
export type ColorMode = z.infer<typeof ColorModeSchema>;

/**
 * Which day the week starts on in calendar views.
 */
export const WeekStartDaySchema = z.enum(['sunday', 'monday']);
export type WeekStartDay = z.infer<typeof WeekStartDaySchema>;

/**
 * Date display format preference.
 * - iso: 2024-01-15
 * - us: 01/15/2024
 * - eu: 15/01/2024
 */
export const DateFormatSchema = z.enum(['iso', 'us', 'eu']);
export type DateFormat = z.infer<typeof DateFormatSchema>;

/**
 * Time display format preference.
 */
export const TimeFormatSchema = z.enum(['12h', '24h']);
export type TimeFormat = z.infer<typeof TimeFormatSchema>;

// ============================================================================
// Combined Settings Schema
// ============================================================================

/**
 * Complete user settings object with defaults.
 */
export const UserSettingsSchema = z.object({
  colorMode: ColorModeSchema.default('system'),
  weekStartDay: WeekStartDaySchema.default('sunday'),
  spellcheck: z.boolean().default(true),
  dateFormat: DateFormatSchema.default('iso'),
  timeFormat: TimeFormatSchema.default('12h'),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

/**
 * Setting keys for type-safe key access.
 */
export const SettingKeys = [
  'colorMode',
  'weekStartDay',
  'spellcheck',
  'dateFormat',
  'timeFormat',
] as const;

export type SettingKey = (typeof SettingKeys)[number];
