-- Add inheritance and metadata columns to object_types table
-- parent_type_id enables type hierarchy (max 2 levels: parent -> child)
-- pluralName, color, description provide rich type metadata

ALTER TABLE `object_types` ADD COLUMN `parent_type_id` text REFERENCES `object_types`(`id`);
--> statement-breakpoint
ALTER TABLE `object_types` ADD COLUMN `plural_name` text;
--> statement-breakpoint
ALTER TABLE `object_types` ADD COLUMN `color` text;
--> statement-breakpoint
ALTER TABLE `object_types` ADD COLUMN `description` text;
--> statement-breakpoint
CREATE INDEX `object_types_parent_type_id_idx` ON `object_types` (`parent_type_id`);
