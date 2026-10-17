import { BaseEntityId } from '@modules/shared/domain';

export class AiPromptTemplateId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): AiPromptTemplateId {
    return new AiPromptTemplateId(this.nextValue());
  }

  public static from(value: string): AiPromptTemplateId {
    return new AiPromptTemplateId(value);
  }
}
