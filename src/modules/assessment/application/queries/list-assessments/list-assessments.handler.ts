import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListAssessmentsQuery } from './list-assessments.query';
import { ListAssessmentsDto } from './list-assessments.dto';
import { IAssessmentRepository } from '../../../domain';

@QueryHandler(ListAssessmentsQuery)
export class ListAssessmentsHandler
  implements IQueryHandler<ListAssessmentsQuery, ListAssessmentsDto>
{
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(query: ListAssessmentsQuery): Promise<ListAssessmentsDto> {
    const assessments = await this.assessmentRepository.findByOrgId(
      query.orgId,
      query.filter,
      query.pagination,
    );

    return {
      items: assessments.map((assessment) => ({
        id: assessment.id.unpack(),
        orgId: assessment.orgId,
        lessonId: assessment.lessonId,
        boardId: assessment.boardId,
        studentId: assessment.studentId,
        status: assessment.status,
        totalMaxMarks: assessment.totalMaxMarks,
        totalMarksAwarded: assessment.totalMarksAwarded,
        scorePercent: assessment.scorePercent,
        autoMarkedCount: assessment.autoMarkedCount,
        teacherMarkedCount: assessment.teacherMarkedCount,
        pendingMarkCount: assessment.pendingMarkCount,
        markingItems: assessment.markingItems.map((item) => ({
          id: item.id.unpack(),
          assessmentId: item.assessmentId,
          boardQuestionId: item.boardQuestionId,
          studentResponseId: item.studentResponseId,
          questionType: item.questionType,
          maxMarks: item.maxMarks,
          autoMarked: item.autoMarked,
          marksAwarded: item.marksAwarded,
          feedback: item.feedback,
          markedBy: item.markedBy,
          markedAt: item.markedAt,
          status: item.status,
        })),
        createdAt: assessment.createdAt,
        updatedAt: assessment.updatedAt,
      })),
      total: assessments.length,
    };
  }
}
