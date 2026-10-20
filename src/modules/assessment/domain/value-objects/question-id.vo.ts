import { BaseEntityId } from '@modules/shared';

class QuestionId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): QuestionId {
    return new QuestionId(this.nextValue());
  }

  public static from(value: string): QuestionId {
    return new QuestionId(value);
  }
}

export { QuestionId };
