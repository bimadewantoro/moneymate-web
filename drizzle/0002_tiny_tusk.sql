CREATE TABLE `goal` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`name` text NOT NULL,
	`currency` text DEFAULT 'IDR' NOT NULL,
	`targetAmount` integer NOT NULL,
	`currentAmount` integer DEFAULT 0 NOT NULL,
	`targetDate` integer NOT NULL,
	`icon` text,
	`createdAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	`updatedAt` integer DEFAULT (unixepoch() * 1000) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `transaction` ADD `currency` text DEFAULT 'IDR' NOT NULL;--> statement-breakpoint
ALTER TABLE `transaction` ADD `exchangeRate` text DEFAULT '1' NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `baseCurrency` text DEFAULT 'IDR' NOT NULL;