-- Add deleted_at column to templates
ALTER TABLE `templates` ADD COLUMN `deleted_at` integer;
--> statement-breakpoint
CREATE INDEX `templates_deleted_at_idx` ON `templates` (`deleted_at`);
