CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationType` enum('curated','uni','community') NOT NULL,
	`locationId` int NOT NULL,
	`userId` int,
	`userName` varchar(255) NOT NULL,
	`quietness` int NOT NULL,
	`wifiQuality` int NOT NULL,
	`comfort` int NOT NULL,
	`lighting` int NOT NULL,
	`laptopFriendly` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
