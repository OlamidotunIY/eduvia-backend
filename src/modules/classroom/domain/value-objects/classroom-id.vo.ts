import { BaseEntityId } from '@modules/shared';

class ClassroomId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): ClassroomId {
    return new ClassroomId(this.nextValue());
  }

  public static from(value: string): ClassroomId {
    return new ClassroomId(value);
  }
}

export { ClassroomId };
