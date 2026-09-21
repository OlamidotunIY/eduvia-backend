import { BaseEntityId } from '../../../shared/domain/value-object/base-entity-id.vo';

class ParentProfileId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): ParentProfileId {
    return new ParentProfileId(this.nextValue());
  }

  public static from(value: string): ParentProfileId {
    return new ParentProfileId(value);
  }
}

export { ParentProfileId };
