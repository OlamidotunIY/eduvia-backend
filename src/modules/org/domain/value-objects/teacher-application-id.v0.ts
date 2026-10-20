import { BaseEntityId } from '@modules/shared';

class TeacherApplicationId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): TeacherApplicationId {
    return new TeacherApplicationId(this.nextValue());
  }

  public static from(value: string): TeacherApplicationId {
    return new TeacherApplicationId(value);
  }
}

export { TeacherApplicationId };