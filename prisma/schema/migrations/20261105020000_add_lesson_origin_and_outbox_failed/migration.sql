-- AlterTable
ALTER TABLE `outbox_messages` MODIFY COLUMN `status` ENUM('PENDING', 'PROCESSED', 'FAILED') NOT NULL;

-- AlterTable
ALTER TABLE `lessons` ADD COLUMN `origin` ENUM('RECURRING_GENERATION', 'ONE_OFF') NOT NULL DEFAULT 'RECURRING_GENERATION';

-- Update existing one-off lessons
UPDATE `lessons` SET `origin` = 'ONE_OFF' WHERE `isRecurring` = false;
