CREATE TABLE `attendance` (
	`id` text PRIMARY KEY NOT NULL,
	`rehearsal_id` text NOT NULL,
	`user_id` text NOT NULL,
	`check_in_time` text,
	`check_out_time` text,
	`distance_meters` real,
	`status` text NOT NULL,
	`is_manual_adjustment` integer DEFAULT false NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`rehearsal_id`) REFERENCES `rehearsals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`entity` text NOT NULL,
	`entity_id` text NOT NULL,
	`old_value` text,
	`new_value` text,
	`reason` text,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `excuse_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`rehearsal_id` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`reason` text NOT NULL,
	`expected_delay_minutes` integer,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`reviewed_by` text,
	`reviewed_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`rehearsal_id`) REFERENCES `rehearsals`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `point_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`quarter_id` text NOT NULL,
	`rule_type` text NOT NULL,
	`occurrence_start` integer DEFAULT 1 NOT NULL,
	`occurrence_end` integer,
	`points_delta` integer NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`quarter_id`) REFERENCES `quarters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `point_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`quarter_id` text NOT NULL,
	`rehearsal_id` text,
	`points_delta` integer NOT NULL,
	`transaction_type` text NOT NULL,
	`reason` text NOT NULL,
	`created_by` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`quarter_id`) REFERENCES `quarters`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `quarters` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`status` text DEFAULT 'UPCOMING' NOT NULL,
	`settings_json` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `rehearsals` (
	`id` text PRIMARY KEY NOT NULL,
	`quarter_id` text NOT NULL,
	`title` text NOT NULL,
	`date` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`location_name` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`radius_meters` integer DEFAULT 100 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`quarter_id`) REFERENCES `quarters`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `roles_name_unique` ON `roles` (`name`);--> statement-breakpoint
CREATE TABLE `subscription_charges` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`month_year` text NOT NULL,
	`amount_due` real NOT NULL,
	`is_waived` integer DEFAULT false NOT NULL,
	`waived_reason` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `subscription_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`charge_id` text,
	`amount_paid` real NOT NULL,
	`payment_method` text DEFAULT 'CASH',
	`payment_date` text NOT NULL,
	`notes` text,
	`recorded_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`charge_id`) REFERENCES `subscription_charges`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`assigned_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`assigned_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`full_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`voice_part` text,
	`tier` text DEFAULT 'WORKING',
	`profile_photo_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_phone_unique` ON `users` (`phone`);