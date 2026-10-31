export class StudentRefDto {
  id: string;
  name: string;
  gradeLevel?: string;
  countryCode?: string;
}

export class CurriculumRefDto {
  name: string;
  shortCode?: string;
}

export class MasteryNodeItemDto {
  nodeName: string;
  nodeCode: string;
  masteryLevel: number;
  assessmentCount?: number;
  lastAssessedAt?: Date | string;
}

export class RecentLessonItemDto {
  topicsCovered: string[];
  scorePercent?: number;
  teacherNarrative?: string;
}

export class GenerateNextLessonSuggestionRequestDto {
  student: StudentRefDto;
  curriculum: CurriculumRefDto;
  subject: string;
  masteryGraph: MasteryNodeItemDto[];
  recentLessons?: RecentLessonItemDto[];
  provider?: string;
  model?: string;
}
