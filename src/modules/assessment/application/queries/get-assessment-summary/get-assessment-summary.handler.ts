import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetAssessmentSummaryQuery } from './get-assessment-summary.query';
import { AssessmentSummaryDto } from './get-assessment-summary.payload';
import { IAssessmentRepository } from '../../../domain/repository';

@QueryHandler(GetAssessmentSummaryQuery)
export class GetAssessmentSummaryHandler implements IQueryHandler<GetAssessmentSummaryQuery, AssessmentSummaryDto> {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
  ) {}

  async execute(query: GetAssessmentSummaryQuery): Promise<AssessmentSummaryDto> {
    const { payload } = query;

    return this.assessmentRepository.getSummaryByOrgId(
      payload.orgId,
      payload.filter,
    );
  }
}
