import { CreateLessonReportHandler } from './create-lesson-report';
import { AttachAiSummaryHandler } from './attach-ai-summary';
import { ApproveAiSummaryHandler } from './approve-ai-summary';
import { UpdateLessonReportHandler } from './update-lesson-report';
import { SubmitLessonReportHandler } from './submit-lesson-report';
import { ArchiveLessonReportHandler } from './archive-lesson-report';
import { AddReportCommentHandler } from './add-report-comment';
import { UpdateStudentProgressSummaryHandler } from './update-student-progress-summary';
import { GenerateOrgAnalyticsSnapshotHandler } from './generate-org-analytics-snapshot';

export * from './create-lesson-report';
export * from './attach-ai-summary';
export * from './approve-ai-summary';
export * from './update-lesson-report';
export * from './submit-lesson-report';
export * from './archive-lesson-report';
export * from './add-report-comment';
export * from './update-student-progress-summary';
export * from './generate-org-analytics-snapshot';

export const COMMAND_HANDLERS = [
  CreateLessonReportHandler,
  AttachAiSummaryHandler,
  ApproveAiSummaryHandler,
  UpdateLessonReportHandler,
  SubmitLessonReportHandler,
  ArchiveLessonReportHandler,
  AddReportCommentHandler,
  UpdateStudentProgressSummaryHandler,
  GenerateOrgAnalyticsSnapshotHandler,
];
