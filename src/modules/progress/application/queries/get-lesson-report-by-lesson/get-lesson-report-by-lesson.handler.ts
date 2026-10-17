import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLessonReportByLessonQuery } from './get-lesson-report-by-lesson.query';
import { LessonReportDto } from '../get-lesson-report/lesson-report.dto';
import {
  ILessonReportRepository,
  LessonReportNotFoundError,
  LessonReportNotSubmittedError,
} from '../../../domain';

@QueryHandler(GetLessonReportByLessonQuery)
export class GetLessonReportByLessonHandler
  implements IQueryHandler<GetLessonReportByLessonQuery, LessonReportDto>
{
  constructor(private readonly reportRepository: ILessonReportRepository) {}

  async execute(query: GetLessonReportByLessonQuery): Promise<LessonReportDto> {
    const report = await this.reportRepository.findByLessonId(query.lessonId);
    if (!report) {
      throw new LessonReportNotFoundError(`for lesson ${query.lessonId}`);
    }

    if (query.requesterRole === 'parent' && !report.parentCanView) {
      throw new LessonReportNotSubmittedError(report.id.unpack(), 'viewReport');
    }

    return {
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
    };
  }
}
