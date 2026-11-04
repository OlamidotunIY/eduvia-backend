-- CreateTable
CREATE TABLE `ai_jobs` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('report_summary', 'question_generation', 'next_lesson_suggestion') NOT NULL,
    `status` ENUM('queued', 'processing', 'completed', 'failed', 'cancelled') NOT NULL,
    `input_payload` JSON NOT NULL,
    `output_payload` JSON NULL,
    `provider` ENUM('openai', 'gemini') NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `prompt_version` VARCHAR(191) NOT NULL,
    `tokens_used` INTEGER NULL,
    `error_message` TEXT NULL,
    `related_entity_id` VARCHAR(191) NOT NULL,
    `related_entity_type` ENUM('lesson', 'curriculum_node', 'student') NOT NULL,
    `org_id` VARCHAR(191) NOT NULL,
    `requested_by` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ai_jobs_org_id_idx`(`org_id`),
    INDEX `ai_jobs_type_related_entity_id_status_idx`(`type`, `related_entity_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_prompt_templates` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('report_summary', 'question_generation', 'next_lesson_suggestion') NOT NULL,
    `version` VARCHAR(191) NOT NULL,
    `system_prompt` TEXT NOT NULL,
    `user_prompt_template` TEXT NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deprecated_at` DATETIME(3) NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `ai_prompt_templates_type_is_active_idx`(`type`, `is_active`),
    UNIQUE INDEX `ai_prompt_templates_type_version_key`(`type`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` VARCHAR(191) NOT NULL,
    `ownerType` ENUM('platform', 'org', 'teacher') NOT NULL,
    `ownerId` VARCHAR(191) NULL,
    `orgId` VARCHAR(191) NULL,
    `type` ENUM('mcq', 'short_answer', 'long_answer', 'image_upload') NOT NULL,
    `stem` TEXT NOT NULL,
    `correctOptionKey` VARCHAR(191) NULL,
    `markScheme` TEXT NULL,
    `maxMarks` INTEGER NOT NULL,
    `difficultyLevel` INTEGER NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `curriculumNodeId` VARCHAR(191) NULL,
    `examBoard` VARCHAR(191) NULL,
    `yearGroup` VARCHAR(191) NULL,
    `tags` JSON NOT NULL,
    `provenanceSource` ENUM('original', 'ai_generated', 'licensed', 'past_paper') NOT NULL,
    `provenanceCreatedBy` VARCHAR(191) NOT NULL,
    `provenanceAiModel` VARCHAR(191) NULL,
    `provenanceLicenseRef` VARCHAR(191) NULL,
    `provenancePaperRef` VARCHAR(191) NULL,
    `provenanceApprovedBy` VARCHAR(191) NULL,
    `provenanceApprovedAt` DATETIME(3) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `usageCount` INTEGER NOT NULL DEFAULT 0,
    `avgScore` DOUBLE NULL,
    `correctRate` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_options` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `text` TEXT NOT NULL,
    `imageUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `assessments` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `boardId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `status` ENUM('pending_marking', 'partially_marked', 'fully_marked') NOT NULL,
    `totalMaxMarks` INTEGER NOT NULL,
    `totalMarksAwarded` INTEGER NULL,
    `scorePercent` DOUBLE NULL,
    `autoMarkedCount` INTEGER NOT NULL DEFAULT 0,
    `teacherMarkedCount` INTEGER NOT NULL DEFAULT 0,
    `pendingMarkCount` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `marking_items` (
    `id` VARCHAR(191) NOT NULL,
    `assessmentId` VARCHAR(191) NOT NULL,
    `boardQuestionId` VARCHAR(191) NOT NULL,
    `studentResponseId` VARCHAR(191) NOT NULL,
    `questionType` ENUM('mcq', 'short_answer', 'long_answer', 'image_upload') NOT NULL,
    `maxMarks` INTEGER NOT NULL,
    `autoMarked` BOOLEAN NOT NULL DEFAULT false,
    `marksAwarded` INTEGER NULL,
    `feedback` TEXT NULL,
    `markedBy` VARCHAR(191) NULL,
    `markedAt` DATETIME(3) NULL,
    `status` ENUM('pending', 'auto_marked', 'teacher_marked') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mastery_records` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `curriculumNodeId` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `masteryLevel` DOUBLE NOT NULL,
    `teacherAssessedScore` DOUBLE NULL,
    `systemCalculatedScore` DOUBLE NULL,
    `assessmentCount` INTEGER NOT NULL DEFAULT 0,
    `lastUpdatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mastery_records_studentId_curriculumNodeId_orgId_key`(`studentId`, `curriculumNodeId`, `orgId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mastery_history_entries` (
    `id` VARCHAR(191) NOT NULL,
    `masteryRecordId` VARCHAR(191) NOT NULL,
    `masteryLevel` DOUBLE NOT NULL,
    `trigger` ENUM('assessment', 'teacher_override') NOT NULL,
    `lessonId` VARCHAR(191) NULL,
    `recordedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `_id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `providerId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `accessToken` VARCHAR(191) NULL,
    `refreshToken` VARCHAR(191) NULL,
    `idToken` VARCHAR(191) NULL,
    `accessTokenExpiresAt` DATETIME(3) NULL,
    `refreshTokenExpiresAt` DATETIME(3) NULL,
    `scope` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `_id` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `sessions_token_key`(`token`),
    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `two_factors` (
    `_id` VARCHAR(191) NOT NULL,
    `secret` VARCHAR(191) NOT NULL,
    `backupCodes` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `verifications` (
    `_id` VARCHAR(191) NOT NULL,
    `identifier` VARCHAR(191) NOT NULL,
    `valueHash` VARCHAR(191) NOT NULL,
    `verificationType` ENUM('email_verification', 'email_otp', 'password_reset', 'totp_setup') NOT NULL,
    `verificationStatus` ENUM('pending', 'verified', 'expired', 'max_attempts_exceeded') NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxAttempts` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `org_billing_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `org_id` VARCHAR(191) NOT NULL,
    `billing_model` ENUM('marketplace', 'saas') NOT NULL,
    `stripe_account_id` VARCHAR(191) NULL,
    `paypal_merchant_id` VARCHAR(191) NULL,
    `payment_provider` ENUM('stripe', 'paypal') NULL,
    `stripe_customer_id` VARCHAR(191) NULL,
    `seat_count` INTEGER NOT NULL DEFAULT 0,
    `free_tier_active` BOOLEAN NOT NULL DEFAULT true,
    `plan_tier` ENUM('free', 'starter', 'professional', 'enterprise') NOT NULL DEFAULT 'free',
    `current_period_end` DATETIME(3) NULL,
    `status` ENUM('active', 'suspended', 'past_due', 'cancelled') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `org_billing_accounts_org_id_key`(`org_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subscription_plans` (
    `id` VARCHAR(191) NOT NULL,
    `org_id` VARCHAR(191) NOT NULL,
    `subject_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price_amount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `billing_interval` ENUM('monthly', 'quarterly', 'annually') NOT NULL,
    `lessons_per_interval` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `stripe_price_id` VARCHAR(191) NULL,
    `paypal_plan_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `subscription_plans_org_id_idx`(`org_id`),
    INDEX `subscription_plans_subject_id_idx`(`subject_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plan_discounts` (
    `id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `type` ENUM('percentage', 'fixed_amount') NOT NULL,
    `amount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NULL,
    `scope` ENUM('all_parents', 'specific_parent') NOT NULL,
    `parent_id` VARCHAR(191) NULL,
    `expires_at` DATETIME(3) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `code` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `plan_discounts_plan_id_idx`(`plan_id`),
    INDEX `plan_discounts_code_idx`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parent_subscriptions` (
    `id` VARCHAR(191) NOT NULL,
    `org_id` VARCHAR(191) NOT NULL,
    `plan_id` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,
    `subject_id` VARCHAR(191) NOT NULL,
    `provider` ENUM('stripe', 'paypal') NOT NULL,
    `provider_subscription_id` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'past_due', 'cancelled', 'paused', 'trialing') NOT NULL,
    `discount_id` VARCHAR(191) NULL,
    `effective_price_amount` INTEGER NOT NULL,
    `current_period_start` DATETIME(3) NOT NULL,
    `current_period_end` DATETIME(3) NOT NULL,
    `cancelled_at` DATETIME(3) NULL,
    `cancel_reason` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `parent_subscriptions_parent_id_idx`(`parent_id`),
    INDEX `parent_subscriptions_student_id_idx`(`student_id`),
    INDEX `parent_subscriptions_org_id_idx`(`org_id`),
    INDEX `parent_subscriptions_provider_subscription_id_idx`(`provider_subscription_id`),
    UNIQUE INDEX `parent_subscriptions_parent_id_student_id_subject_id_org_id_key`(`parent_id`, `student_id`, `subject_id`, `org_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `billing_events` (
    `id` VARCHAR(191) NOT NULL,
    `org_id` VARCHAR(191) NOT NULL,
    `subscription_id` VARCHAR(191) NULL,
    `type` ENUM('subscription_created', 'subscription_renewed', 'payment_failed', 'subscription_cancelled', 'refund_issued') NOT NULL,
    `provider` ENUM('stripe', 'paypal') NOT NULL,
    `provider_event_id` VARCHAR(191) NOT NULL,
    `amount` INTEGER NULL,
    `currency` VARCHAR(191) NULL,
    `metadata` JSON NOT NULL,
    `occurred_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `billing_events_provider_event_id_key`(`provider_event_id`),
    INDEX `billing_events_org_id_idx`(`org_id`),
    INDEX `billing_events_subscription_id_idx`(`subscription_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `seat_usage_records` (
    `id` VARCHAR(191) NOT NULL,
    `org_id` VARCHAR(191) NOT NULL,
    `month` VARCHAR(191) NOT NULL,
    `seat_count` INTEGER NOT NULL DEFAULT 0,
    `tier_at_time` VARCHAR(191) NOT NULL,
    `invoiced_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `seat_usage_records_org_id_month_key`(`org_id`, `month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `learning_boards` (
    `id` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `mode` ENUM('teach', 'classwork', 'assignment', 'review', 'locked') NOT NULL,
    `isLocked` BOOLEAN NOT NULL DEFAULT false,
    `planObjectives` JSON NOT NULL,
    `planTopicNodeIds` JSON NOT NULL,
    `planNotes` VARCHAR(191) NULL,
    `planHomework` VARCHAR(191) NULL,
    `planComplete` BOOLEAN NOT NULL DEFAULT false,
    `planCompletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `learning_boards_lessonId_key`(`lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `board_sections` (
    `id` VARCHAR(191) NOT NULL,
    `boardId` VARCHAR(191) NOT NULL,
    `type` ENUM('text', 'image', 'questionBlock', 'divider') NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `isTeacherOnly` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `board_questions` (
    `id` VARCHAR(191) NOT NULL,
    `boardId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `position` INTEGER NOT NULL,
    `mode` ENUM('classwork', 'assignment') NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL,
    `dueAt` DATETIME(3) NULL,
    `showOptions` BOOLEAN NOT NULL DEFAULT true,
    `maxMarks` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_responses` (
    `id` VARCHAR(191) NOT NULL,
    `boardQuestionId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `responseType` ENUM('text', 'image_upload', 'mcq_choice') NOT NULL,
    `textContent` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,
    `selectedOption` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `autoIsCorrect` BOOLEAN NULL,
    `autoMarksAwarded` INTEGER NULL,
    `autoMarkedAt` DATETIME(3) NULL,
    `teacherMarksAwarded` INTEGER NULL,
    `teacherMaxMarks` INTEGER NULL,
    `teacherFeedback` VARCHAR(191) NULL,
    `teacherMarkedBy` VARCHAR(191) NULL,
    `teacherMarkedAt` DATETIME(3) NULL,

    UNIQUE INDEX `student_responses_boardQuestionId_studentId_key`(`boardQuestionId`, `studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `classrooms` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `subjectId` VARCHAR(191) NOT NULL,
    `primaryTeacherId` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'paused', 'closed') NOT NULL,
    `lessonDurationMins` INTEGER NOT NULL,
    `maxStudents` INTEGER NOT NULL DEFAULT 1,
    `recurrenceDayOfWeek` INTEGER NOT NULL,
    `recurrenceStartTime` VARCHAR(191) NOT NULL,
    `recurrenceTimezone` VARCHAR(191) NOT NULL,
    `recurrenceIntervalWeeks` INTEGER NOT NULL DEFAULT 1,
    `recurrenceEffectiveFrom` DATETIME(3) NOT NULL,
    `recurrenceEffectiveUntil` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_enrollments` (
    `id` VARCHAR(191) NOT NULL,
    `classroomId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'paused', 'removed') NOT NULL,
    `enrolledAt` DATETIME(3) NOT NULL,
    `removedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lessons` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `classroomId` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `coverTeacherId` VARCHAR(191) NULL,
    `scheduledAt` DATETIME(3) NOT NULL,
    `durationMins` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'SCHEDULED', 'LIVE', 'COMPLETED', 'MARKING', 'REPORTED', 'ARCHIVED', 'CANCELLED', 'STUDENT_NO_SHOW', 'TEACHER_NO_SHOW') NOT NULL,
    `meetingId` VARCHAR(191) NULL,
    `videoProvider` ENUM('zoom', 'google_meet') NULL,
    `meetLink` VARCHAR(191) NULL,
    `cancelledReason` VARCHAR(191) NULL,
    `cancelledBy` VARCHAR(191) NULL,
    `noShowAt` DATETIME(3) NULL,
    `noShowType` ENUM('student', 'teacher') NULL,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `markedAt` DATETIME(3) NULL,
    `reportedAt` DATETIME(3) NULL,
    `archivedAt` DATETIME(3) NULL,
    `isRecurring` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher_availabilities` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `availability_slots` (
    `id` VARCHAR(191) NOT NULL,
    `availabilityId` VARCHAR(191) NOT NULL,
    `dayOfWeek` INTEGER NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `availability_exceptions` (
    `id` VARCHAR(191) NOT NULL,
    `availabilityId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `type` ENUM('blocked', 'added') NOT NULL,
    `startTime` VARCHAR(191) NULL,
    `endTime` VARCHAR(191) NULL,
    `reason` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `shortCode` VARCHAR(191) NOT NULL,
    `countryCode` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `authority` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `version` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `curriculum_profiles_shortCode_key`(`shortCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `curriculum_nodes` (
    `id` VARCHAR(191) NOT NULL,
    `curriculumId` VARCHAR(191) NOT NULL,
    `parentNodeId` VARCHAR(191) NULL,
    `nodeType` ENUM('keystage', 'subject', 'strand', 'topic', 'learning_objective') NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `gradeLevel` VARCHAR(191) NULL,
    `depth` INTEGER NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `isLeaf` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `curriculum_nodes_curriculumId_depth_idx`(`curriculumId`, `depth`),
    INDEX `curriculum_nodes_path_idx`(`path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_subjects` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `shortCode` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `platform_subjects_shortCode_key`(`shortCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `subject_curriculum_mappings` (
    `id` VARCHAR(191) NOT NULL,
    `platformSubjectId` VARCHAR(191) NOT NULL,
    `curriculumId` VARCHAR(191) NOT NULL,
    `subjectNodeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `subject_curriculum_mappings_platformSubjectId_curriculumId_key`(`platformSubjectId`, `curriculumId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `recipient_id` VARCHAR(191) NOT NULL,
    `type` ENUM('lesson_scheduled', 'lesson_reminder_24h', 'lesson_reminder_1h', 'lesson_started', 'lesson_cancelled', 'lesson_rescheduled', 'lesson_no_show', 'report_submitted', 'report_ai_draft_ready', 'marking_pending', 'teacher_application_received', 'teacher_application_result', 'org_invitation_sent', 'org_approved', 'subscription_created', 'subscription_renewed', 'subscription_payment_failed', 'subscription_cancelled', 'new_message', 'account_verification', 'password_reset') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `data` JSON NOT NULL,
    `channel` ENUM('in_app', 'push', 'email', 'all') NOT NULL DEFAULT 'in_app',
    `status` ENUM('unread', 'read') NOT NULL DEFAULT 'unread',
    `delivered_at` DATETIME(3) NULL,
    `read_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notifications_recipient_id_status_idx`(`recipient_id`, `status`),
    INDEX `notifications_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `device_tokens` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `token` VARCHAR(512) NOT NULL,
    `platform` ENUM('ios', 'android') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `device_tokens_user_id_is_active_idx`(`user_id`, `is_active`),
    UNIQUE INDEX `device_tokens_user_id_token_key`(`user_id`, `token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` VARCHAR(191) NOT NULL,
    `org_id` VARCHAR(191) NOT NULL,
    `type` ENUM('student_teacher', 'parent_admin') NOT NULL,
    `participants` JSON NOT NULL,
    `student_id` VARCHAR(191) NULL,
    `parent_id` VARCHAR(191) NULL,
    `subject` VARCHAR(191) NULL,
    `status` ENUM('active', 'closed') NOT NULL DEFAULT 'active',
    `last_message_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `conversations_org_id_idx`(`org_id`),
    INDEX `conversations_student_id_idx`(`student_id`),
    INDEX `conversations_parent_id_idx`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` VARCHAR(191) NOT NULL,
    `conversation_id` VARCHAR(191) NOT NULL,
    `sender_id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `attachment_url` VARCHAR(191) NULL,
    `status` ENUM('sent', 'delivered', 'read') NOT NULL DEFAULT 'sent',
    `sent_at` DATETIME(3) NOT NULL,
    `delivered_at` DATETIME(3) NULL,
    `read_at` DATETIME(3) NULL,

    INDEX `messages_conversation_id_sent_at_idx`(`conversation_id`, `sent_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization_invitations` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `inviterUserId` VARCHAR(191) NOT NULL,
    `inviteeEmail` VARCHAR(191) NOT NULL,
    `role` ENUM('Teacher', 'TeachingAssistant', 'parent') NOT NULL,
    `subjects` JSON NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `status` ENUM('pending', 'accepted', 'expired', 'revoked') NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `acceptedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization_memberships` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('OrgOwner', 'OrgAdmin', 'LeadTeacher', 'Teacher', 'TeachingAssistant') NOT NULL,
    `subjects` JSON NOT NULL,
    `status` ENUM('active', 'inactive', 'suspended') NOT NULL,
    `joinedAt` DATETIME(3) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organization_subjects` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `platformSubjectId` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `organizations` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `websiteUrl` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(191) NOT NULL,
    `contactPhone` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,
    `status` ENUM('pending_approval', 'active', 'suspended', 'rejected') NOT NULL,
    `marketplaceListed` BOOLEAN NOT NULL DEFAULT false,
    `acceptingTeachers` BOOLEAN NOT NULL DEFAULT false,
    `acceptingTeachersFor` JSON NOT NULL,
    `minimumBookingNoticeHours` INTEGER NOT NULL,
    `cancellationWindowHours` INTEGER NOT NULL,
    `noShowWaitMinutes` INTEGER NOT NULL,
    `autoRescheduleOnNoShow` BOOLEAN NOT NULL,
    `lessonPlanRequired` BOOLEAN NOT NULL,
    `reportRequiredWithinHours` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `organizations_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outbox_messages` (
    `id` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `payload` JSON NOT NULL,
    `aggregateType` VARCHAR(191) NOT NULL,
    `aggregateId` VARCHAR(191) NOT NULL,
    `correlationId` VARCHAR(191) NOT NULL,
    `occurredAt` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'PROCESSED') NOT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `processedAt` DATETIME(3) NULL,
    `lastError` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `outbox_messages_eventId_key`(`eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parent_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `parent_profiles_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_admins` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role` ENUM('PlatformSuperAdmin', 'CurriculumEditor', 'PlatformSupport') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `platform_admins_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `platform_announcements` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `target_roles` JSON NOT NULL,
    `status` ENUM('draft', 'scheduled', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `scheduled_at` DATETIME(3) NULL,
    `published_at` DATETIME(3) NULL,
    `archived_at` DATETIME(3) NULL,
    `created_by` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `platform_announcements_status_idx`(`status`),
    INDEX `platform_announcements_scheduled_at_idx`(`scheduled_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `org_approval_records` (
    `id` VARCHAR(191) NOT NULL,
    `org_id` VARCHAR(191) NOT NULL,
    `reviewed_by` VARCHAR(191) NOT NULL,
    `decision` ENUM('approved', 'rejected', 'suspended', 'reactivated') NOT NULL,
    `reason` TEXT NULL,
    `reviewed_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `org_approval_records_org_id_idx`(`org_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lesson_reports` (
    `id` VARCHAR(191) NOT NULL,
    `lessonId` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `classroomId` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `status` ENUM('draft', 'ai_draft', 'teacher_reviewing', 'submitted', 'archived') NOT NULL,
    `topicNodeIds` JSON NOT NULL,
    `attendanceStatus` ENUM('attended', 'absent', 'late', 'no_show') NOT NULL,
    `teacherNarrative` TEXT NULL,
    `aiGeneratedSummary` TEXT NULL,
    `teacherApprovedAiSummary` TEXT NULL,
    `homeworkSet` TEXT NULL,
    `nextSteps` TEXT NULL,
    `overallRating` INTEGER NULL,
    `parentCanView` BOOLEAN NOT NULL DEFAULT false,
    `totalQuestionsAttempted` INTEGER NOT NULL DEFAULT 0,
    `totalQuestionsCorrect` INTEGER NOT NULL DEFAULT 0,
    `totalMarksAwarded` INTEGER NULL,
    `totalMaxMarks` INTEGER NOT NULL DEFAULT 0,
    `scorePercent` DOUBLE NULL,
    `questionBreakdown` JSON NULL,
    `submittedAt` DATETIME(3) NULL,
    `archivedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lesson_reports_lessonId_key`(`lessonId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_comments` (
    `id` VARCHAR(191) NOT NULL,
    `reportId` VARCHAR(191) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,
    `authorRole` ENUM('parent', 'admin') NOT NULL,
    `content` TEXT NOT NULL,
    `parentCommentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_progress_summaries` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `subjectId` VARCHAR(191) NOT NULL,
    `totalLessonsAttended` INTEGER NOT NULL DEFAULT 0,
    `totalLessonsMissed` INTEGER NOT NULL DEFAULT 0,
    `totalAssessments` INTEGER NOT NULL DEFAULT 0,
    `averageScorePercent` DOUBLE NULL,
    `masteredTopicsCount` INTEGER NOT NULL DEFAULT 0,
    `inProgressTopicsCount` INTEGER NOT NULL DEFAULT 0,
    `notStartedTopicsCount` INTEGER NOT NULL DEFAULT 0,
    `overallMasteryLevel` DOUBLE NULL,
    `lastLessonAt` DATETIME(3) NULL,
    `lastUpdatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `student_progress_summaries_studentId_orgId_subjectId_key`(`studentId`, `orgId`, `subjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `org_analytics_snapshots` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `snapshotDate` DATETIME(3) NOT NULL,
    `totalActiveStudents` INTEGER NOT NULL,
    `totalActiveTeachers` INTEGER NOT NULL,
    `totalLessonsThisMonth` INTEGER NOT NULL,
    `totalLessonsLastMonth` INTEGER NOT NULL,
    `avgLessonCompletionRate` DOUBLE NOT NULL,
    `avgReportSubmissionTimeHours` DOUBLE NOT NULL,
    `teacherPerformance` JSON NOT NULL,
    `studentChurnRisk` JSON NOT NULL,
    `funnelStats` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `org_analytics_snapshots_orgId_snapshotDate_key`(`orgId`, `snapshotDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `student_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NOT NULL,
    `dateOfBirth` DATETIME(3) NOT NULL,
    `countryCode` VARCHAR(191) NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,
    `gradeLevel` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `student_profiles_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher_applications` (
    `id` VARCHAR(191) NOT NULL,
    `orgId` VARCHAR(191) NOT NULL,
    `applicantUserId` VARCHAR(191) NOT NULL,
    `appliedSubjects` JSON NOT NULL,
    `status` ENUM('pending_review', 'auto_rejected', 'approved', 'rejected') NOT NULL,
    `rejectionReason` VARCHAR(191) NULL,
    `reviewedBy` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `coverLetter` VARCHAR(191) NULL,
    `qualifications` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `teacher_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bio` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `qualification` VARCHAR(191) NOT NULL,
    `yearOfExperience` INTEGER NOT NULL,
    `subjects` JSON NOT NULL,
    `activeOrganizationId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `teacher_profiles_userId_key`(`userId`),
    INDEX `teacher_profiles_activeOrganizationId_idx`(`activeOrganizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `userType` ENUM('student', 'teacher', 'admin', 'parent') NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `emailVerified` BOOLEAN NOT NULL,
    `twoFactorEnabled` BOOLEAN NULL,
    `status` ENUM('active', 'suspended') NOT NULL,
    `timezone` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `question_options` ADD CONSTRAINT `question_options_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `marking_items` ADD CONSTRAINT `marking_items_assessmentId_fkey` FOREIGN KEY (`assessmentId`) REFERENCES `assessments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mastery_history_entries` ADD CONSTRAINT `mastery_history_entries_masteryRecordId_fkey` FOREIGN KEY (`masteryRecordId`) REFERENCES `mastery_records`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plan_discounts` ADD CONSTRAINT `plan_discounts_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `parent_subscriptions` ADD CONSTRAINT `parent_subscriptions_plan_id_fkey` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `board_sections` ADD CONSTRAINT `board_sections_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `learning_boards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `board_questions` ADD CONSTRAINT `board_questions_boardId_fkey` FOREIGN KEY (`boardId`) REFERENCES `learning_boards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_responses` ADD CONSTRAINT `student_responses_boardQuestionId_fkey` FOREIGN KEY (`boardQuestionId`) REFERENCES `board_questions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_enrollments` ADD CONSTRAINT `student_enrollments_classroomId_fkey` FOREIGN KEY (`classroomId`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lessons` ADD CONSTRAINT `lessons_classroomId_fkey` FOREIGN KEY (`classroomId`) REFERENCES `classrooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `availability_slots` ADD CONSTRAINT `availability_slots_availabilityId_fkey` FOREIGN KEY (`availabilityId`) REFERENCES `teacher_availabilities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `availability_exceptions` ADD CONSTRAINT `availability_exceptions_availabilityId_fkey` FOREIGN KEY (`availabilityId`) REFERENCES `teacher_availabilities`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_nodes` ADD CONSTRAINT `curriculum_nodes_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `curriculum_nodes` ADD CONSTRAINT `curriculum_nodes_parentNodeId_fkey` FOREIGN KEY (`parentNodeId`) REFERENCES `curriculum_nodes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject_curriculum_mappings` ADD CONSTRAINT `subject_curriculum_mappings_platformSubjectId_fkey` FOREIGN KEY (`platformSubjectId`) REFERENCES `platform_subjects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subject_curriculum_mappings` ADD CONSTRAINT `subject_curriculum_mappings_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `curriculum_profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_comments` ADD CONSTRAINT `report_comments_reportId_fkey` FOREIGN KEY (`reportId`) REFERENCES `lesson_reports`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report_comments` ADD CONSTRAINT `report_comments_parentCommentId_fkey` FOREIGN KEY (`parentCommentId`) REFERENCES `report_comments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
