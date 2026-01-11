-- Add recent_objects table for LRU tracking of viewed objects
-- Migration: 0007_add_recent_objects

CREATE TABLE `recent_objects` (
	`object_id` text PRIMARY KEY NOT NULL,
	`viewed_at` integer NOT NULL,
	FOREIGN KEY (`object_id`) REFERENCES `objects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `recent_objects_viewed_at_idx` ON `recent_objects` (`viewed_at`);
