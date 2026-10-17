import { AttendanceStatus } from '../../domain';

export class CreateLessonReportDto {
  lessonId!: string;
  classroomId!: string;
  teacherId!: string;
  studentId!: string;
  topicNodeIds?: string[];
  attendanceStatus?: AttendanceStatus;
  teacherNarrative?: string;
  homeworkSet?: string;
  nextSteps?: string;
  overallRating?: number;
}
