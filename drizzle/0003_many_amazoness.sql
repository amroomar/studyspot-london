CREATE TABLE `location_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationType` enum('curated','uni') NOT NULL,
	`locationId` int NOT NULL,
	`imageUrl` text NOT NULL,
	`caption` varchar(500),
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `location_images_id` PRIMARY KEY(`id`)
);
