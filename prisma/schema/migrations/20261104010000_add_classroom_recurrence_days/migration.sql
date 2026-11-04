ALTER TABLE `classrooms` ADD COLUMN `recurrenceDaysOfWeek` JSON NULL;

UPDATE `classrooms`
SET `recurrenceDaysOfWeek` = JSON_ARRAY(`recurrenceDayOfWeek`)
WHERE `recurrenceDaysOfWeek` IS NULL;
