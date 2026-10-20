import { QuestionOwnerType, QuestionType } from '../../domain';

export class SearchQuestionsDto {
  subject?: string;
  curriculumNodeId?: string;
  difficultyLevel?: number;
  type?: QuestionType;
  ownerType?: QuestionOwnerType;
  ownerId?: string;
  orgId?: string;
  isPublished?: boolean;
  search?: string;
  skip?: number;
  take?: number;
}
