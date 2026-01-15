CREATE TABLE `ezdb` (
	`key` text NOT NULL,
	`type` text DEFAULT 'key' NOT NULL,
	`value` text,
	`member` text DEFAULT '' NOT NULL,
	`expiresAt` integer,
	`createdAt` integer DEFAULT (unixepoch()),
	`updatedAt` integer DEFAULT (unixepoch()),
	PRIMARY KEY(`key`, `type`, `member`)
);
--> statement-breakpoint
CREATE INDEX `idx_ezdb_expiresAt` ON `ezdb` (`expiresAt`) WHERE "ezdb"."expiresAt" IS NOT NULL;