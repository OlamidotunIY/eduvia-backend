import { AttendanceStatus } from '../../domain';

export class UpdateLessonReportDto {
  teacherNarrative?: string;
  topicNodeIds?: string[];
  attendanceStatus?: AttendanceStatus;
  homeworkSet?: string | null;
  nextSteps?: string | null;
  overallRating?: number | null;
}
