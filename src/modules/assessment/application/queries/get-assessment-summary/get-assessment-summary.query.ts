import { Query } from '@nestjs/cqrs';
import { GetAssessmentSummaryPayload, AssessmentSummaryDto } from './get-assessment-summary.payload';

export class GetAssessmentSummaryQuery extends Query<AssessmentSummaryDto> {
  constructor(public readonly payload: GetAssessmentSummaryPayload) {
    super();
  }
}
