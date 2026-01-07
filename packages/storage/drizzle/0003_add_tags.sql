-- Add tags and object_tags tables for global tagging system
-- Tags are rich entities with metadata (color, icon, description)
-- object_tags is a junction table for many-to-many relationships

CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`color` text,
	`icon` text,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);
--> statement-breakpoint
CREATE INDEX `tags_slug_idx` ON `tags` (`slug`);
--> statement-breakpoint
CREATE TABLE `object_tags` (
	`object_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`object_id`, `tag_id`),
	FOREIGN KEY (`object_id`) REFERENCES `objects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `object_tags_tag_id_idx` ON `object_tags` (`tag_id`);
