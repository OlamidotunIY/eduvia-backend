export class CurriculumNodeRefDto {
  id: string;
  name: string;
  code: string;
  description?: string;
  depth?: number;
  gradeLevel?: string;
}

export class CurriculumProfileRefDto {
  name: string;
  authority?: string;
}

export class ExistingQuestionStemDto {
  stem: string;
}

export class GenerateQuestionsRequestDto {
  curriculumNode: CurriculumNodeRefDto;
  curriculumProfile: CurriculumProfileRefDto;
  subject: string;
  questionType: string;
  difficultyLevel: number;
  count: number;
  existingQuestions?: ExistingQuestionStemDto[];
  provider?: string;
  model?: string;
}
