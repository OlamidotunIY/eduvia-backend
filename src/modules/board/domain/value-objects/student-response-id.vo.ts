import { BaseEntityId } from '@modules/shared';

class StudentResponseId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): StudentResponseId {
    return new StudentResponseId(this.nextValue());
  }

  public static from(value: string): StudentResponseId {
    return new StudentResponseId(value);
  }
}

export { StudentResponseId };
