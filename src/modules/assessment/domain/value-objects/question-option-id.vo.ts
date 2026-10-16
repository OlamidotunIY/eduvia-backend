import { BaseEntityId } from '@modules/shared';

export class QuestionOptionId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): QuestionOptionId {
    return new QuestionOptionId(this.nextValue());
  }

  public static from(value: string): QuestionOptionId {
    return new QuestionOptionId(value);
  }
}
