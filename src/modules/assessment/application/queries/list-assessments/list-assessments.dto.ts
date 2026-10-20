import { AssessmentDetailDto } from '../get-assessment-by-id/get-assessment-by-id.dto';

export interface ListAssessmentsDto {
  items: AssessmentDetailDto[];
  total: number;
}
