import { BaseEntityId } from '@modules/shared';

class LessonId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): LessonId {
    return new LessonId(this.nextValue());
  }

  public static from(value: string): LessonId {
    return new LessonId(value);
  }
}

export { LessonId };
