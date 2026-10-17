import { BaseRepository } from '@modules/shared/domain';
import { AiPromptTemplateId, AiJobType } from '../value-objects';
import { AiPromptTemplate } from '../model/AiPromptTemplate';

export interface PromptTemplateFilter {
  type?: AiJobType;
  isActive?: boolean;
}

export abstract class IAiPromptTemplateRepository extends BaseRepository<
  AiPromptTemplate,
  AiPromptTemplateId
> {
  public abstract findActiveByType(
    type: AiJobType,
  ): Promise<AiPromptTemplate | null>;

  public abstract findByTypeAndVersion(
    type: AiJobType,
    version: string,
  ): Promise<AiPromptTemplate | null>;

  public abstract findFiltered(
    filter?: PromptTemplateFilter,
  ): Promise<AiPromptTemplate[]>;
}
