import { BaseEntityId } from '../../../shared/domain/value-object/base-entity-id.vo';

class AuthAccountId extends BaseEntityId {
  private constructor(value: string) {
    super(value);
  }

  public static create(): AuthAccountId {
    return new AuthAccountId(this.nextValue());
  }

  public static from(value: string): AuthAccountId {
    return new AuthAccountId(value);
  }
}

export { AuthAccountId };
