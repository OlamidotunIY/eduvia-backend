import { AiProvider } from '../../../domain';

export class GenerateNextLessonSuggestionCommand {
  constructor(
    public readonly params: {
      student: {
        id: string;
        name: string;
        gradeLevel?: string;
        countryCode?: string;
      };
      curriculum: {
        name: string;
        shortCode?: string;
      };
      subject: string;
      masteryGraph: Array<{
        nodeName: string;
        nodeCode: string;
        masteryLevel: number;
        assessmentCount?: number;
        lastAssessedAt?: Date | string;
      }>;
      recentLessons?: Array<{
        topicsCovered: string[];
        scorePercent?: number;
        teacherNarrative?: string;
      }>;
      orgId: string;
      requestedBy?: string;
      provider?: AiProvider;
      model?: string;
      correlationId?: string;
    },
  ) {}
}
