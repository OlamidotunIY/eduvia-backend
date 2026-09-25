import { BaseEntityId } from '../../../shared/domain/value-object/base-entity-id.vo';

class TeacherProfileId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): TeacherProfileId {
    return new TeacherProfileId(this.nextValue());
  }

  public static from(value: string): TeacherProfileId {
    return new TeacherProfileId(value);
  }
}

export { TeacherProfileId };
