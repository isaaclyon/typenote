CREATE TABLE `blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`object_id` text NOT NULL,
	`parent_block_id` text,
	`order_key` text NOT NULL,
	`block_type` text NOT NULL,
	`content` text NOT NULL,
	`meta` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`object_id`) REFERENCES `objects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `blocks_object_id_idx` ON `blocks` (`object_id`);--> statement-breakpoint
CREATE INDEX `blocks_parent_block_id_idx` ON `blocks` (`parent_block_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `blocks_object_parent_order_idx` ON `blocks` (`object_id`,`parent_block_id`,`order_key`);--> statement-breakpoint
CREATE INDEX `blocks_deleted_at_idx` ON `blocks` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `idempotency` (
	`object_id` text NOT NULL,
	`key` text NOT NULL,
	`result_json` text NOT NULL,
	`created_at` integer NOT NULL,
	PRIMARY KEY(`object_id`, `key`),
	FOREIGN KEY (`object_id`) REFERENCES `objects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `object_types` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`icon` text,
	`schema` text,
	`built_in` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `object_types_key_unique` ON `object_types` (`key`);--> statement-breakpoint
CREATE INDEX `object_types_key_idx` ON `object_types` (`key`);--> statement-breakpoint
CREATE TABLE `objects` (
	`id` text PRIMARY KEY NOT NULL,
	`type_id` text NOT NULL,
	`title` text NOT NULL,
	`properties` text,
	`doc_version` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`type_id`) REFERENCES `object_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `objects_type_id_idx` ON `objects` (`type_id`);--> statement-breakpoint
CREATE INDEX `objects_deleted_at_idx` ON `objects` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `refs` (
	`id` text PRIMARY KEY NOT NULL,
	`source_block_id` text NOT NULL,
	`source_object_id` text NOT NULL,
	`target_object_id` text NOT NULL,
	`target_block_id` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`source_block_id`) REFERENCES `blocks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_object_id`) REFERENCES `objects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`target_object_id`) REFERENCES `objects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `refs_source_block_id_idx` ON `refs` (`source_block_id`);--> statement-breakpoint
CREATE INDEX `refs_source_object_id_idx` ON `refs` (`source_object_id`);--> statement-breakpoint
CREATE INDEX `refs_target_object_id_idx` ON `refs` (`target_object_id`);--> statement-breakpoint
CREATE INDEX `refs_target_block_id_idx` ON `refs` (`target_block_id`);--> statement-breakpoint
CREATE VIRTUAL TABLE IF NOT EXISTS fts_blocks USING fts5(
  block_id UNINDEXED,
  object_id UNINDEXED,
  content_text
);