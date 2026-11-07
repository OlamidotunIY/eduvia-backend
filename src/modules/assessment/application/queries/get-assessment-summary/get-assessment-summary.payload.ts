import { AssessmentFilter } from '../../../domain';

export interface GetAssessmentSummaryPayload {
  orgId: string;
  filter?: AssessmentFilter;
}

export interface AssessmentSummaryDto {
  total: number;
  pendingMarking: number;
  partiallyMarked: number;
  fullyMarked: number;
  averageScorePercent: number | null;
}
