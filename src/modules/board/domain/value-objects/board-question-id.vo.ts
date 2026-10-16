import { BaseEntityId } from '@modules/shared';

class BoardQuestionId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): BoardQuestionId {
    return new BoardQuestionId(this.nextValue());
  }

  public static from(value: string): BoardQuestionId {
    return new BoardQuestionId(value);
  }
}

export { BoardQuestionId };
