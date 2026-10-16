import { BaseEntityId } from '@modules/shared';

class LearningBoardId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): LearningBoardId {
    return new LearningBoardId(this.nextValue());
  }

  public static from(value: string): LearningBoardId {
    return new LearningBoardId(value);
  }
}

export { LearningBoardId };
