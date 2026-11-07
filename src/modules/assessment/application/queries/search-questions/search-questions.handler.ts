import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchQuestionsQuery } from './search-questions.query';
import { SearchQuestionsResultDto } from './search-questions.dto';
import { IQuestionRepository } from '../../../domain';

@QueryHandler(SearchQuestionsQuery)
export class SearchQuestionsHandler
  implements IQueryHandler<SearchQuestionsQuery, SearchQuestionsResultDto>
{
  constructor(private readonly questionRepository: IQuestionRepository) {}

  async execute(query: SearchQuestionsQuery): Promise<SearchQuestionsResultDto> {
    const isLearner = query.userRole === 'STUDENT' || query.userRole === 'LEARNER';
    const effectiveFilter = isLearner
      ? { ...query.filter, isPublished: true }
      : query.filter;

    const [questions, total] = query.orgId
      ? await Promise.all([
          this.questionRepository.findForOrg(
            query.orgId,
            query.teacherId,
            effectiveFilter,
            query.pagination,
          ),
          this.questionRepository.countForOrg(
            query.orgId,
            query.teacherId,
            effectiveFilter,
          ),
        ])
      : [
          await this.questionRepository.search(effectiveFilter, query.pagination),
          questionsCount(await this.questionRepository.search(effectiveFilter)),
        ];

    return {
      items: questions.map((question) => ({
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
      })),
      total,
    };
  }
}

function questionsCount(items: unknown[]): number {
  return items.length;
}
