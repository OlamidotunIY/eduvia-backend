export interface UpdateQuestionContentPayload {
  questionId: string;
  stem?: string;
  options?: Array<{ key: string; text: string; imageUrl?: string | null }>;
  correctOptionKey?: string | null;
  markScheme?: string | null;
  maxMarks?: number;
  actor?: {
    role: string;
    userId?: string;
    orgId?: string;
  };
}

export class UpdateQuestionContentCommand {
  constructor(public readonly payload: UpdateQuestionContentPayload) {}
}
