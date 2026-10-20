export class GenerateNextLessonSuggestionRequestDto {
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

  provider?: string;
  model?: string;
}
