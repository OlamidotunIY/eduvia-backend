import { AssessmentFilter } from '../../../domain';

export class ListAssessmentsQuery {
  constructor(
    public readonly orgId: string,
    public readonly filter?: AssessmentFilter,
    public readonly pagination?: { skip?: number; take?: number },
  ) {}
}
