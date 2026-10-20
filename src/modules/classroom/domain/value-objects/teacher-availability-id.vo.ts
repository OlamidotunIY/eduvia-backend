import { BaseEntityId } from '@modules/shared';

class TeacherAvailabilityId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): TeacherAvailabilityId {
    return new TeacherAvailabilityId(this.nextValue());
  }

  public static from(value: string): TeacherAvailabilityId {
    return new TeacherAvailabilityId(value);
  }
}

export { TeacherAvailabilityId };
