-- Add templates table for object type templates
-- Templates define initial content (blocks) that auto-apply when creating new objects

CREATE TABLE `templates` (
	`id` text PRIMARY KEY NOT NULL,
	`object_type_id` text NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`is_default` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`object_type_id`) REFERENCES `object_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `templates_object_type_id_idx` ON `templates` (`object_type_id`);
