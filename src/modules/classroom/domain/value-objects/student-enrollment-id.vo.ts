import { BaseEntityId } from '@modules/shared/domain';

class StudentEnrollmentId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): StudentEnrollmentId {
    return new StudentEnrollmentId(this.nextValue());
  }

  public static from(value: string): StudentEnrollmentId {
    return new StudentEnrollmentId(value);
  }
}

export { StudentEnrollmentId };
