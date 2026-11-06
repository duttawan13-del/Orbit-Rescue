CREATE TABLE `flights` (
	`token` text PRIMARY KEY NOT NULL,
	`student` text NOT NULL,
	`full_name` text NOT NULL,
	`team` text NOT NULL,
	`nick` text NOT NULL,
	`started` integer NOT NULL,
	`ended` integer,
	`seconds` integer DEFAULT 0 NOT NULL,
	`deck` text NOT NULL,
	`answers` text DEFAULT '[]' NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`maximum` integer DEFAULT 120 NOT NULL,
	`correct` integer DEFAULT 0 NOT NULL,
	`wrong` integer DEFAULT 0 NOT NULL,
	`stages` integer DEFAULT 0 NOT NULL,
	`medal` text,
	`status` text DEFAULT 'playing' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `flights_student` ON `flights` (`student`);