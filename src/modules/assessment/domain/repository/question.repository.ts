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

export interface QuestionSummaryDto {
  totalAccessible: number;
  platformQuestions: number;
  orgQuestions: number;
  publishedOrgQuestions: number;
}

export abstract class IQuestionRepository extends BaseRepository<Question, QuestionId> {
  public abstract findForOrg(
    orgId: string,
    currentTeacherId?: string,
    filter?: QuestionFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<Question[]>;

  public abstract countForOrg(
    orgId: string,
    currentTeacherId?: string,
    filter?: QuestionFilter,
  ): Promise<number>;

  public abstract getSummaryForOrg(
    orgId: string,
    currentTeacherId?: string,
  ): Promise<QuestionSummaryDto>;

  public abstract findPlatformQuestions(
    filter?: QuestionFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<Question[]>;

  public abstract search(
    filter: QuestionFilter,
    pagination?: { skip?: number; take?: number },
  ): Promise<Question[]>;
}
