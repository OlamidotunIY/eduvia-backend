import { QuestionMode } from '../../domain';

export class AttachQuestionDto {
  questionId: string;
  position?: number;
  mode?: QuestionMode;
  maxMarks: number;
  showOptions?: boolean;
  dueAt?: string;
}
