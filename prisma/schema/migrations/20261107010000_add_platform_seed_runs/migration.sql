-- Deployment-owned catalogue seeds are recorded only after their transaction succeeds.
CREATE TABLE `platform_seed_runs` (
    `_id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `platform_seed_runs_key_key`(`key`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
