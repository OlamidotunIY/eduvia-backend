import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLessonReportQuery } from './get-lesson-report.query';
import { LessonReportDto } from './lesson-report.dto';
import {
  ILessonReportRepository,
  LessonReportId,
  LessonReportNotFoundError,
  LessonReportNotSubmittedError,
} from '../../../domain';

@QueryHandler(GetLessonReportQuery)
export class GetLessonReportHandler
  implements IQueryHandler<GetLessonReportQuery, LessonReportDto>
{
  constructor(private readonly reportRepository: ILessonReportRepository) {}

  async execute(query: GetLessonReportQuery): Promise<LessonReportDto> {
    const report = await this.reportRepository.findById(
      LessonReportId.from(query.reportId),
    );
    if (!report) {
      throw new LessonReportNotFoundError(query.reportId);
    }

    if (query.requesterRole === 'parent' && !report.parentCanView) {
      throw new LessonReportNotSubmittedError(query.reportId, 'viewReport');
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
