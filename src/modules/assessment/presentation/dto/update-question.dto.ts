import { QuestionOptionDto } from './create-question.dto';

export class UpdateQuestionDto {
  stem?: string;
  options?: QuestionOptionDto[];
  correctOptionKey?: string | null;
  markScheme?: string | null;
  maxMarks?: number;
}
