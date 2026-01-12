-- Add user_settings table for storing user preferences
-- Migration: 0008_add_user_settings

CREATE TABLE `user_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` integer NOT NULL
);
