import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetQuestionSummaryQuery } from './get-question-summary.query';
import { QuestionSummaryResultDto } from './get-question-summary.dto';
import { IQuestionRepository } from '../../../domain';

@QueryHandler(GetQuestionSummaryQuery)
export class GetQuestionSummaryHandler
  implements IQueryHandler<GetQuestionSummaryQuery, QuestionSummaryResultDto>
{
  constructor(private readonly questionRepository: IQuestionRepository) {}

  async execute(query: GetQuestionSummaryQuery): Promise<QuestionSummaryResultDto> {
    return this.questionRepository.getSummaryForOrg(query.orgId, query.teacherId);
  }
}
