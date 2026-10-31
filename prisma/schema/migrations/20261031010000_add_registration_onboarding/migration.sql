CREATE TABLE `registration_requests` (
  `_id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `firstName` VARCHAR(191) NOT NULL,
  `lastName` VARCHAR(191) NOT NULL,
  `imageUrl` VARCHAR(191) NULL,
  `emailVerified` BOOLEAN NOT NULL,
  `timezone` VARCHAR(191) NOT NULL,
  `providerId` VARCHAR(191) NOT NULL,
  `providerAccountId` VARCHAR(191) NULL,
  `passwordHash` VARCHAR(191) NULL,
  `status` ENUM('pending', 'user_created', 'completed', 'failed') NOT NULL,
  `userId` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `users`
  MODIFY `userType` ENUM('pending', 'student', 'teacher', 'admin', 'parent') NOT NULL,
  ADD COLUMN `onboardingStatus` ENUM('pending', 'completed') NOT NULL DEFAULT 'pending';

UPDATE `users` SET `onboardingStatus` = 'completed';
