-- AlterTable
ALTER TABLE `conversations` MODIFY COLUMN `type` ENUM('student_teacher', 'parent_admin', 'classroom_group') NOT NULL;
ALTER TABLE `conversations` ADD COLUMN `classroom_id` VARCHAR(191) NULL;
CREATE INDEX `conversations_classroom_id_idx` ON `conversations`(`classroom_id`);
