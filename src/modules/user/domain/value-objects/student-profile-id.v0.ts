import { BaseEntityId } from '../../../shared/domain/value-object/base-entity-id.vo';

class StudentProfileId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): StudentProfileId {
    return new StudentProfileId(this.nextValue());
  }

  public static from(value: string): StudentProfileId {
    return new StudentProfileId(value);
  }
}

export { StudentProfileId };
