CREATE TABLE `flight_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`company` text NOT NULL,
	`email` text NOT NULL,
	`location` text NOT NULL,
	`service` text NOT NULL,
	`timeline` text NOT NULL,
	`notes` text NOT NULL,
	`created_at` text NOT NULL
);
