import { QuestionDetailDto } from '../get-question-by-id/get-question-by-id.dto';

export interface SearchQuestionsResultDto {
  items: QuestionDetailDto[];
  total: number;
}
