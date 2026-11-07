-- A curriculum is governed by an education jurisdiction, not merely a country.
ALTER TABLE `curriculum_profiles`
  ADD COLUMN `jurisdictionCode` VARCHAR(32) NULL,
  ADD COLUMN `sourceUrl` TEXT NULL;

-- Preserve existing records until the reviewed catalogue reset is explicitly run.
UPDATE `curriculum_profiles`
SET `jurisdictionCode` = CASE `countryCode`
  WHEN 'CA' THEN 'CA-ON'
  WHEN 'GB' THEN 'GB-ENG'
  ELSE `countryCode`
END
WHERE `jurisdictionCode` IS NULL;

ALTER TABLE `curriculum_profiles`
  MODIFY COLUMN `jurisdictionCode` VARCHAR(32) NOT NULL;

CREATE INDEX `curriculum_profiles_countryCode_jurisdictionCode_isActive_idx`
  ON `curriculum_profiles`(`countryCode`, `jurisdictionCode`, `isActive`);

-- Course codes (for example, Ontario MTH1W) are courses, not broad subjects.
ALTER TABLE `curriculum_nodes`
  MODIFY COLUMN `nodeType` ENUM(
    'keystage', 'discipline', 'course', 'subject', 'strand', 'topic', 'learning_objective'
  ) NOT NULL;
