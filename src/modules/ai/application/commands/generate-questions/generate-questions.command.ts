import { AiProvider } from '../../../domain';

export class GenerateQuestionsCommand {
  constructor(
    public readonly params: {
      curriculumNode: {
        id: string;
        name: string;
        code: string;
        description?: string;
        depth?: number;
        gradeLevel?: string;
      };
      curriculumProfile: {
        name: string;
        authority?: string;
      };
      subject: string;
      questionType: string;
      difficultyLevel: number;
      count: number;
      existingQuestions?: Array<{ stem: string }>;
      orgId: string;
      requestedBy?: string;
      provider?: AiProvider;
      model?: string;
      correlationId?: string;
    },
  ) {}
}
