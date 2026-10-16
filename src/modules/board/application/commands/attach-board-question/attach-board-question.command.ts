import { QuestionMode } from '../../../domain';

export interface AttachBoardQuestionPayload {
  boardId: string;
  questionId: string;
  position?: number;
  mode?: QuestionMode;
  maxMarks: number;
  showOptions?: boolean;
  dueAt?: Date | null;
  correlationId?: string;
}

export class AttachBoardQuestionCommand {
  constructor(public readonly payload: AttachBoardQuestionPayload) {}
}
