-- Add calendar configuration columns to object_types table
-- show_in_calendar: whether objects of this type appear in calendar view
-- calendar_date_property: which date property to use for calendar positioning

ALTER TABLE `object_types` ADD COLUMN `show_in_calendar` integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE `object_types` ADD COLUMN `calendar_date_property` text;
--> statement-breakpoint
-- Update built-in types with calendar configuration
-- Event: show in calendar using start_date
UPDATE `object_types` SET `show_in_calendar` = 1, `calendar_date_property` = 'start_date' WHERE `key` = 'Event';
--> statement-breakpoint
-- Task: show in calendar using due_date
UPDATE `object_types` SET `show_in_calendar` = 1, `calendar_date_property` = 'due_date' WHERE `key` = 'Task';
--> statement-breakpoint
-- DailyNote: show in calendar using date_key
UPDATE `object_types` SET `show_in_calendar` = 1, `calendar_date_property` = 'date_key' WHERE `key` = 'DailyNote';
