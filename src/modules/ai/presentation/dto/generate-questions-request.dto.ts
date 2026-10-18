export class GenerateQuestionsRequestDto {
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
  provider?: string;
  model?: string;
}
