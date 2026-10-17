import { GetLessonReportHandler } from './get-lesson-report';
import { GetLessonReportByLessonHandler } from './get-lesson-report-by-lesson';
import { GetStudentProgressHandler } from './get-student-progress';
import { GetStudentLessonHistoryHandler } from './get-student-lesson-history';
import { GetOrgAnalyticsHandler } from './get-org-analytics';
import { GetStudentChurnRiskHandler } from './get-student-churn-risk';
import { GetTeacherPerformanceHandler } from './get-teacher-performance';

export * from './get-lesson-report';
export * from './get-lesson-report-by-lesson';
export * from './get-student-progress';
export * from './get-student-lesson-history';
export * from './get-org-analytics';
export * from './get-student-churn-risk';
export * from './get-teacher-performance';

export const QUERY_HANDLERS = [
  GetLessonReportHandler,
  GetLessonReportByLessonHandler,
  GetStudentProgressHandler,
  GetStudentLessonHistoryHandler,
  GetOrgAnalyticsHandler,
  GetStudentChurnRiskHandler,
  GetTeacherPerformanceHandler,
];
