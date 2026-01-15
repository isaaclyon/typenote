-- Add pinned_objects table for user-pinned objects
-- Migration: 0009_add_pinned_objects

CREATE TABLE `pinned_objects` (
	`object_id` text PRIMARY KEY NOT NULL,
	`pinned_at` integer NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`object_id`) REFERENCES `objects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pinned_objects_order_idx` ON `pinned_objects` (`order`);
