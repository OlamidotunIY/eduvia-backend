import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQuestionByIdQuery } from './get-question-by-id.query';
import { QuestionDetailDto } from './get-question-by-id.dto';
import {
  IQuestionRepository,
  QuestionNotFoundError,
  InsufficientQuestionPermissionError,
  QuestionOwnerType,
} from '../../../domain';

@QueryHandler(GetQuestionByIdQuery)
export class GetQuestionByIdHandler
  implements IQueryHandler<GetQuestionByIdQuery, QuestionDetailDto>
{
  constructor(private readonly questionRepository: IQuestionRepository) {}

  async execute(query: GetQuestionByIdQuery): Promise<QuestionDetailDto> {
    const question = await this.questionRepository.findById(query.questionId);
    if (!question) {
      throw new QuestionNotFoundError(query.questionId);
    }

    if (
      (question.ownerType === QuestionOwnerType.org ||
        question.ownerType === QuestionOwnerType.teacher) &&
      query.orgId &&
      question.orgId !== query.orgId
    ) {
      throw new InsufficientQuestionPermissionError(
        'Cannot access questions belonging to another organization.',
      );
    }

    const isLearner =
      query.userRole === 'STUDENT' || query.userRole === 'LEARNER';

    if (isLearner && !question.isPublished) {
      throw new QuestionNotFoundError(query.questionId);
    }

    return {
      id: question.id.unpack(),
      ownerType: question.ownerType,
      ownerId: question.ownerId,
      orgId: question.orgId,
      type: question.type,
      stem: question.stem,
      options: question.options.map((opt) => ({
        key: opt.key,
        text: opt.text,
        imageUrl: opt.imageUrl,
      })),
      correctOptionKey: isLearner ? null : question.correctOptionKey,
      markScheme: isLearner ? null : question.markScheme,
      maxMarks: question.maxMarks,
      difficultyLevel: question.difficultyLevel,
      subject: question.subject,
      curriculumNodeId: question.curriculumNodeId,
      examBoard: question.examBoard,
      yearGroup: question.yearGroup,
      tags: question.tags,
      provenance: question.provenance.toJSON(),
      isPublished: question.isPublished,
      usageCount: question.usageCount,
      avgScore: question.avgScore,
      correctRate: question.correctRate,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }
}
