import { QuestionDetailDto } from '../get-question-by-id/get-question-by-id.dto';

export interface SearchQuestionsDto {
  items: QuestionDetailDto[];
  total: number;
}
