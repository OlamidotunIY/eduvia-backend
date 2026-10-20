import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAssessmentByIdQuery } from './get-assessment-by-id.query';
import { AssessmentDetailDto } from './get-assessment-by-id.dto';
import {
  IAssessmentRepository,
  AssessmentNotFoundError,
} from '../../../domain';

@QueryHandler(GetAssessmentByIdQuery)
export class GetAssessmentByIdHandler
  implements IQueryHandler<GetAssessmentByIdQuery, AssessmentDetailDto>
{
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(query: GetAssessmentByIdQuery): Promise<AssessmentDetailDto> {
    const assessment = await this.assessmentRepository.findById(
      query.assessmentId,
    );
    if (!assessment) {
      throw new AssessmentNotFoundError(query.assessmentId);
    }
    if (query.orgId && assessment.orgId !== query.orgId) {
      throw new AssessmentNotFoundError(query.assessmentId);
    }

    return {
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
    };
  }
}
