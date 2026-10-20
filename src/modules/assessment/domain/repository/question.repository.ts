import { BaseRepository } from '@modules/shared';
import { QuestionId, QuestionOwnerType, QuestionType } from '../value-objects';
import { Question } from '../model/Question';

export interface QuestionFilter {
  subject?: string;
  curriculumNodeId?: string;
  difficultyLevel?: number;
  type?: QuestionType;
  ownerType?: QuestionOwnerType;
  ownerId?: string;
  orgId?: string;
  isPublished?: boolean;
  search?: string;
}

export abstract class IQuestionRepository extends BaseRepository<Question, QuestionId> {
  public abstract findForOrg(
    orgId: string,
    currentTeacherId?: string,
    filter?: QuestionFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<Question[]>;

  public abstract findPlatformQuestions(
    filter?: QuestionFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<Question[]>;

  public abstract search(
    filter: QuestionFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<Question[]>;
}
