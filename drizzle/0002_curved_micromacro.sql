CREATE TABLE `location_confirmations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `location_confirmations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `location_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`submissionId` int NOT NULL,
	`userId` int NOT NULL,
	`reason` enum('fake_location','unsafe_location','incorrect_information','not_a_study_spot') NOT NULL,
	`details` text,
	`status` enum('pending','reviewed','dismissed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `location_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `community_submissions` ADD `verificationStatus` enum('unverified','verified','community_verified','pending_verification','flagged') DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE `community_submissions` ADD `googlePlaceId` varchar(255);--> statement-breakpoint
ALTER TABLE `community_submissions` ADD `confirmationCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `community_submissions` ADD `reportCount` int DEFAULT 0 NOT NULL;