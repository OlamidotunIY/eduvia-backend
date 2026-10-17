import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SearchQuestionsQuery } from './search-questions.query';
import { SearchQuestionsDto } from './search-questions.dto';
import { IQuestionRepository } from '../../../domain';

@QueryHandler(SearchQuestionsQuery)
export class SearchQuestionsHandler
  implements IQueryHandler<SearchQuestionsQuery, SearchQuestionsDto>
{
  constructor(private readonly questionRepository: IQuestionRepository) {}

  async execute(query: SearchQuestionsQuery): Promise<SearchQuestionsDto> {
    const questions = query.orgId
      ? await this.questionRepository.findForOrg(
          query.orgId,
          query.teacherId,
          query.filter,
          query.pagination,
        )
      : await this.questionRepository.search(query.filter, query.pagination);

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
        correctOptionKey: question.correctOptionKey,
        markScheme: question.markScheme,
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
      total: questions.length,
    };
  }
}
