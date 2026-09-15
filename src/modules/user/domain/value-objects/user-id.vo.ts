import { BaseEntityId } from '../../../shared/domain/value-object/base-entity-id.vo';

class UserId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): UserId {
    return new UserId(this.nextValue());
  }

  public static from(value: string): UserId {
    return new UserId(value);
  }
}

export { UserId };
