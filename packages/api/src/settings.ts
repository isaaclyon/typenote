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

const UserSettingsFields = {
  colorMode: ColorModeSchema,
  weekStartDay: WeekStartDaySchema,
  spellcheck: z.boolean(),
  dateFormat: DateFormatSchema,
  timeFormat: TimeFormatSchema,
} as const;

/**
 * Complete user settings object with defaults.
 */
export const UserSettingsSchema = z.object({
  colorMode: UserSettingsFields.colorMode.default('system'),
  weekStartDay: UserSettingsFields.weekStartDay.default('sunday'),
  spellcheck: UserSettingsFields.spellcheck.default(true),
  dateFormat: UserSettingsFields.dateFormat.default('iso'),
  timeFormat: UserSettingsFields.timeFormat.default('12h'),
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

export const SettingKeySchema = z.enum(SettingKeys);

export type SettingKey = z.infer<typeof SettingKeySchema>;

/**
 * Union of all possible setting values.
 */
export const SettingValueSchema = z.union([
  UserSettingsFields.colorMode,
  UserSettingsFields.weekStartDay,
  UserSettingsFields.spellcheck,
  UserSettingsFields.dateFormat,
  UserSettingsFields.timeFormat,
]);

export type SettingValue = z.infer<typeof SettingValueSchema>;

// ============================================================================
// API Operations
// ============================================================================

/**
 * Result for fetching all settings.
 */
export const GetSettingsResultSchema = UserSettingsSchema;

export type GetSettingsResult = z.infer<typeof GetSettingsResultSchema>;

/**
 * Result for fetching a single setting.
 */
export const SettingKeyValueSchema = z.object({
  key: SettingKeySchema,
  value: SettingValueSchema,
});

export type SettingKeyValue = z.infer<typeof SettingKeyValueSchema>;

export const GetSettingResultSchema = SettingKeyValueSchema;

export type GetSettingResult = z.infer<typeof GetSettingResultSchema>;

/**
 * Input for updating settings in bulk.
 */
export const UpdateSettingsInputSchema = z
  .object(UserSettingsFields)
  .partial()
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one setting must be provided',
  });

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsInputSchema>;

/**
 * Result for updating settings in bulk.
 */
export const UpdateSettingsResultSchema = UserSettingsSchema;

export type UpdateSettingsResult = z.infer<typeof UpdateSettingsResultSchema>;

/**
 * Input for updating a single setting.
 */
export const UpdateSettingInputSchema = z.object({
  value: SettingValueSchema,
});

export type UpdateSettingInput = z.infer<typeof UpdateSettingInputSchema>;

/**
 * Result for updating a single setting.
 */
export const UpdateSettingResultSchema = SettingKeyValueSchema;

export type UpdateSettingResult = z.infer<typeof UpdateSettingResultSchema>;

/**
 * Result for resetting settings to defaults.
 */
export const ResetSettingsResultSchema = UserSettingsSchema;

export type ResetSettingsResult = z.infer<typeof ResetSettingsResultSchema>;
