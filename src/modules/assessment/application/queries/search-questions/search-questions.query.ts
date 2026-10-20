import { QuestionFilter } from '../../../domain';

export class SearchQuestionsQuery {
  constructor(
    public readonly filter: QuestionFilter,
    public readonly orgId?: string,
    public readonly teacherId?: string,
    public readonly pagination?: { skip?: number; take?: number },
  ) {}
}
