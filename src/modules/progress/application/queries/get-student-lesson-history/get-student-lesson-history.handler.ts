import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetStudentLessonHistoryQuery } from './get-student-lesson-history.query';
import { LessonReportDto } from '../get-lesson-report/lesson-report.dto';
import { ILessonReportRepository } from '../../../domain';

@QueryHandler(GetStudentLessonHistoryQuery)
export class GetStudentLessonHistoryHandler
  implements IQueryHandler<GetStudentLessonHistoryQuery, LessonReportDto[]>
{
  constructor(private readonly reportRepository: ILessonReportRepository) {}

  async execute(
    query: GetStudentLessonHistoryQuery,
  ): Promise<LessonReportDto[]> {
    const reports = await this.reportRepository.findSubmittedByStudent(
      query.studentId,
      query.orgId,
      query.pagination,
    );

    return reports.map((report) => ({
      id: report.id.unpack(),
      lessonId: report.lessonId,
      orgId: report.orgId,
      classroomId: report.classroomId,
      teacherId: report.teacherId,
      studentId: report.studentId,
      status: report.status,
      topicNodeIds: [...report.topicNodeIds],
      attendanceStatus: report.attendanceStatus,
      teacherNarrative: report.teacherNarrative,
      aiGeneratedSummary: report.aiGeneratedSummary,
      teacherApprovedAiSummary: report.teacherApprovedAiSummary,
      homeworkSet: report.homeworkSet,
      nextSteps: report.nextSteps,
      overallRating: report.overallRating,
      parentCanView: report.parentCanView,
      assessmentSummary: report.assessmentSummary.toJSON(),
      comments: report.comments.map((c) => ({
        id: c.id.unpack(),
        reportId: c.reportId,
        authorId: c.authorId,
        authorRole: c.authorRole,
        content: c.content,
        parentCommentId: c.parentCommentId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      submittedAt: report.submittedAt,
      archivedAt: report.archivedAt,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
    }));
  }
}
