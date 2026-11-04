-- CreateTable
CREATE TABLE `organization_roles` (
    `_id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `permissions` JSON NOT NULL,
    `isSystem` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `organization_roles_orgId_key_key`(`orgId`, `key`),
    UNIQUE INDEX `organization_roles_orgId_name_key`(`orgId`, `name`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Preserve the legacy role enum during the staged migration. New authorization
-- code will use this nullable identifier once a role is provisioned per org.
ALTER TABLE `organization_memberships` ADD COLUMN `roleId` VARCHAR(191) NULL;
