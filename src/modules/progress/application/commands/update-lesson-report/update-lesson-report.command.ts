import { AttendanceStatus } from '../../../domain';

export interface UpdateLessonReportPayload {
  reportId: string;
  teacherNarrative?: string;
  topicNodeIds?: string[];
  attendanceStatus?: AttendanceStatus;
  homeworkSet?: string | null;
  nextSteps?: string | null;
  overallRating?: number | null;
}

export class UpdateLessonReportCommand {
  constructor(public readonly payload: UpdateLessonReportPayload) {}
}
