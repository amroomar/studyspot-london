CREATE TABLE `admin_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('new_review','new_submission','new_report') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`referenceId` int,
	`referenceType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_notifications_id` PRIMARY KEY(`id`)
);
