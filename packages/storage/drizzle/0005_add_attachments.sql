-- Add attachments and block_attachments tables for content-addressed file storage
-- Attachments use SHA256 hashing for global deduplication
-- block_attachments is a junction table for block-attachment relationships

CREATE TABLE `attachments` (
	`id` text PRIMARY KEY NOT NULL,
	`sha256` text NOT NULL,
	`filename` text NOT NULL,
	`mime_type` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`last_referenced_at` integer NOT NULL,
	`orphaned_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `attachments_sha256_unique` ON `attachments` (`sha256`);
--> statement-breakpoint
CREATE INDEX `attachments_sha256_idx` ON `attachments` (`sha256`);
--> statement-breakpoint
CREATE TABLE `block_attachments` (
	`block_id` text NOT NULL,
	`attachment_id` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`block_id`, `attachment_id`),
	FOREIGN KEY (`block_id`) REFERENCES `blocks`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`attachment_id`) REFERENCES `attachments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `block_attachments_attachment_id_idx` ON `block_attachments` (`attachment_id`);
